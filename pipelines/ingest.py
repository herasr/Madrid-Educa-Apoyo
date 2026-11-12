#!/usr/bin/env python3
"""
Pipeline de Ingesta — Madrid Educa Apoyo
=========================================

Carga DATOS OFICIALES REALES: la relación publicada por la Comunidad de Madrid de
centros de atención preferente para alumnado con TEA con plazas previsibles en el
aula TEA (curso 2024/2025, información a 22/03/2024).

Flujo:
  1. Lee la instantánea versionada del documento oficial
     (data/official/tea_preferentes_curso_2024-25.csv + .metadata.json).
  2. Intenta descargar el PDF oficial, calcula su SHA-256 y extrae los códigos de
     centro que contiene (pdfplumber). Compara esos códigos con la instantánea:
       - iguales            -> estado PDF_OFICIAL_VERIFICADO
       - diferentes         -> estado PDF_OFICIAL_CON_CAMBIOS y se escribe
                               data/review/tea_diferencias.json para revisión humana
                               (no se publica nada que no haya revisado una persona)
       - sin red / sin PDF  -> estado SNAPSHOT_VERSIONADO (se usa la instantánea)
  3. Normaliza cada fila (municipio y distrito canónicos, titularidad, tipo,
     etapas) y le asigna una ubicación APROXIMADA (centroide del municipio o del
     distrito, ver scripts/build_geo_reference.py), porque el documento oficial no
     publica direcciones ni coordenadas.
  4. Escribe data/processed/schools_extracted.json, que consumen el resto de fases.
"""

import csv
import datetime
import hashlib
import io
import json
import math
import os
import re
import shutil
import unicodedata
import urllib.request

OFFICIAL_DIR = "data/official"
SNAPSHOT_CSV = os.path.join(OFFICIAL_DIR, "tea_preferentes_curso_2024-25.csv")
SNAPSHOT_META = os.path.join(OFFICIAL_DIR, "tea_preferentes_curso_2024-25.metadata.json")
MUNICIPIOS_CSV = "data/reference/municipios_madrid_centroides.csv"
DISTRITOS_CSV = "data/reference/distritos_madrid_centroides.csv"

OUTPUT_RAW_DIR = "data/raw/educacion_cam"
OUTPUT_PROC_DIR = "data/processed"
REVIEW_DIR = "data/review"

CODE_RE = re.compile(r"(?<!\d)28\d{6}(?!\d)")  # admite códigos pegados a texto

# Abreviaturas de localidad usadas en el documento -> nombre oficial INE
LOCALIDAD_ALIAS = {
    "CABRERA": "La Cabrera",
    "COLMENAR": "Colmenar Viejo",
    "FUENTE EL SAZ": "Fuente el Saz de Jarama",
    "MANZANARES": "Manzanares el Real",
    "MIRAFLORES": "Miraflores de la Sierra",
    "S.S.REYES": "San Sebastián de los Reyes",
    "TALAMANCA": "Talamanca de Jarama",
    "VALDEOLMOS ALALPARDO": "Valdeolmos-Alalpardo",
    "MORALEJA": "Moraleja de Enmedio",
    "SERRANILLOS": "Serranillos del Valle",
    "FUENTIDUEÑA DEL TAJO": "Fuentidueña de Tajo",
    "PARACUELLOS DEL JARAMA": "Paracuellos de Jarama",
    "BOADILLA": "Boadilla del Monte",
    "LAS ROZAS": "Las Rozas de Madrid",
    "POZUELO": "Pozuelo de Alarcón",
}

# Distritos de Madrid capital tal como aparecen en el documento -> nombre oficial
DISTRITO_ALIAS = {
    "FUENCARRAL EL PARDO": "Fuencarral-El Pardo",
    "MONCLOA ARAVACA": "Moncloa-Aravaca",
    "SAN BLAS": "San Blas-Canillejas",
}

TIPO_INFO = {
    # tipo en documento: (tipo en la app, titularidad, etapas que imparte el centro, prefijo de nombre)
    "CP INF-PRI": ("CEIP", "publico", ["infantil", "primaria"], "CEIP"),
    "CP INF-PRI-SEC": ("CEIPSO", "publico", ["infantil", "primaria", "eso"], "CEIPSO"),
    "CPR INF": ("Colegio Concertado", "concertado", ["infantil"], "Colegio"),
    "CPR INF-PRI": ("Colegio Concertado", "concertado", ["infantil", "primaria"], "Colegio"),
    "CPR INF-PRI-SEC": ("Colegio Concertado", "concertado", ["infantil", "primaria", "eso"], "Colegio"),
    "IES": ("IES", "publico", ["eso"], "IES"),
    "SIES": ("IES", "publico", ["eso"], "SIES"),
}

KEEP_UPPER = {"CEU", "GSD", "FUHEM", "XXI", "II", "III", "XII", "SAFA"}
LOWER_WORDS = {"de", "del", "la", "las", "los", "el", "y", "e", "en"}


def strip_accents(text):
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def norm(text):
    return re.sub(r"\s+", " ", strip_accents(text or "").strip().lower())


def fecha_es(iso_date):
    y, m, d = iso_date.split("-")
    return f"{d}/{m}/{y}"


def sha256_bytes(data):
    return hashlib.sha256(data).hexdigest()


def title_es(raw):
    """Convierte 'NUESTRA SEÑORA DE LA MERCED' en 'Nuestra Señora de la Merced'."""
    text = raw.replace("--", "-").strip()
    if text == "PI I MARGALL":
        return "Pi i Margall"
    words = re.split(r"(\s+|-)", text)
    out = []
    first = True
    for w in words:
        if not w or w.isspace() or w == "-":
            out.append(w)
            continue
        if w.upper() in KEEP_UPPER or (w.upper() == "I" and not first):
            out.append(w.upper())
        elif w.lower() in LOWER_WORDS and not first:
            out.append(w.lower())
        elif w == "Mª":
            out.append("Mª")
        else:
            out.append(w[:1].upper() + w[1:].lower())
        first = False
    return "".join(out)


def load_reference():
    municipios = {}
    with open(MUNICIPIOS_CSV, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            municipios[norm(r["municipio"])] = r
    distritos = {}
    with open(DISTRITOS_CSV, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            distritos[norm(r["distrito"])] = r
    return municipios, distritos


def load_snapshot():
    with open(SNAPSHOT_CSV, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    with open(SNAPSHOT_META, encoding="utf-8") as f:
        meta = json.load(f)
    with open(SNAPSHOT_CSV, "rb") as f:
        csv_sha = sha256_bytes(f.read())
    return rows, meta, csv_sha


def download_pdf(url):
    req = urllib.request.Request(url, headers={"User-Agent": "MadridEducaApoyo-Pipeline/3.0 (DataMad; datos abiertos)"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def extract_codes_from_pdf(pdf_bytes):
    import pdfplumber  # dependencia declarada en pipelines/requirements.txt

    codes = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            codes.extend(CODE_RE.findall(page.extract_text() or ""))
    return codes


def verify_against_official(meta, snapshot_codes):
    """Descarga el PDF oficial y compara sus códigos con la instantánea versionada."""
    info = {"pdf_url": meta["url"], "pdf_sha256": None, "pdf_codigos": None}
    try:
        pdf_bytes = download_pdf(meta["url"])
    except Exception as e:  # sin red, URL retirada, etc.
        print(f"  ℹ No se pudo descargar el PDF oficial ({e}). Se usa la instantánea versionada.")
        return "SNAPSHOT_VERSIONADO", info

    info["pdf_sha256"] = sha256_bytes(pdf_bytes)
    os.makedirs(OUTPUT_RAW_DIR, exist_ok=True)
    with open(os.path.join(OUTPUT_RAW_DIR, "tea_preferentes_2024-25.pdf"), "wb") as f:
        f.write(pdf_bytes)
    print(f"  ✓ PDF oficial descargado ({len(pdf_bytes)} bytes, SHA-256 {info['pdf_sha256'][:16]}…)")

    try:
        pdf_codes = extract_codes_from_pdf(pdf_bytes)
    except Exception as e:
        print(f"  ⚠ PDF descargado pero no se pudo leer ({e}). Se usa la instantánea versionada.")
        return "SNAPSHOT_VERSIONADO", info

    info["pdf_codigos"] = len(pdf_codes)
    added = sorted(set(pdf_codes) - set(snapshot_codes))
    removed = sorted(set(snapshot_codes) - set(pdf_codes))
    if not added and not removed:
        print(f"  ✓ Los {len(set(pdf_codes))} códigos del PDF oficial coinciden con la instantánea versionada.")
        return "PDF_OFICIAL_VERIFICADO", info

    os.makedirs(REVIEW_DIR, exist_ok=True)
    review_path = os.path.join(REVIEW_DIR, "tea_diferencias.json")
    with open(review_path, "w", encoding="utf-8") as f:
        json.dump({
            "detectado": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "pdf_url": meta["url"],
            "pdf_sha256": info["pdf_sha256"],
            "codigos_nuevos_en_pdf": added,
            "codigos_que_ya_no_aparecen": removed,
            "accion": "Revisar a mano y actualizar data/official/tea_preferentes_curso_2024-25.csv",
        }, f, indent=2, ensure_ascii=False)
    print(f"  ⚡ El PDF oficial difiere de la instantánea (+{len(added)} / -{len(removed)} códigos). "
          f"Enviado a revisión: {review_path}")
    return "PDF_OFICIAL_CON_CAMBIOS", info


def resolve_place(raw_place, dat, municipios, distritos):
    """Devuelve (municipio, distrito, fila_de_referencia_para_coordenadas, nivel)."""
    if dat == "DAT CAPITAL":
        distrito = DISTRITO_ALIAS.get(raw_place, raw_place)
        ref = distritos.get(norm(distrito))
        if ref is None:
            raise ValueError(f"Distrito de Madrid no reconocido: {raw_place}")
        return "Madrid", ref["distrito"], ref, "distrito"
    municipio = LOCALIDAD_ALIAS.get(raw_place, raw_place)
    ref = municipios.get(norm(municipio))
    if ref is None:
        raise ValueError(f"Localidad no reconocida en el nomenclátor INE: {raw_place}")
    return ref["municipio"], None, ref, "municipio"


def stages_with_support(etapa, tipo):
    centre_stages = TIPO_INFO.get(tipo, (None, None, [], None))[2]
    if etapa == "PRIMARIA":
        return ["primaria"]
    if etapa == "SECUNDARIA":
        return ["eso"]
    if etapa == "INFANTIL":
        return ["infantil"]
    if etapa == "MIXTA":
        return ["primaria", "eso"] if "eso" in centre_stages else ["infantil", "primaria"]
    raise ValueError(f"Etapa no reconocida: {etapa}")


def spread(lat, lng, index):
    """Reparte los centros de un mismo municipio/distrito en una pequeña espiral
    (≈ 300 m entre anillos) para que no se solapen en el mapa. La posición sigue
    siendo APROXIMADA y así se indica en la interfaz."""
    if index == 0:
        return round(lat, 5), round(lng, 5)
    r_km = 0.3 * math.sqrt(index)
    angle = math.radians(index * 137.508)
    dlat = (r_km / 111.32) * math.cos(angle)
    dlng = (r_km / (111.32 * math.cos(math.radians(lat)))) * math.sin(angle)
    return round(lat + dlat, 5), round(lng + dlng, 5)


def normalise_rows(snapshot_rows, meta):
    municipios, distritos = load_reference()
    groups = {}
    out = []
    for r in snapshot_rows:
        tipo_doc = r["tipo"].strip()
        municipio, distrito, ref, nivel = resolve_place(r["distrito_o_localidad"].strip(), r["dat"].strip(),
                                                        municipios, distritos)
        key = (municipio, distrito)
        idx = groups.get(key, 0)
        groups[key] = idx + 1
        lat, lng = spread(float(ref["lat"]), float(ref["lng"]), idx)

        tipo_app, titularidad, _, prefijo = TIPO_INFO.get(tipo_doc, ("CEIP", "publico", [], ""))
        nombre_base = title_es(r["centro"])
        if prefijo and not nombre_base.lower().startswith(prefijo.lower()):
            nombre = f"{prefijo} {nombre_base}"
        else:
            nombre = nombre_base

        observaciones = []
        if not tipo_doc:
            observaciones.append("El listado oficial no indica el tipo ni la titularidad de este centro; "
                                 "se muestra como público pendiente de verificar.")
        elif tipo_doc not in TIPO_INFO:
            observaciones.append(f"Tipo de centro '{tipo_doc}' no definido en la leyenda del documento.")
        elif tipo_doc == "SIES":
            observaciones.append("'SIES' (Sección de IES) no figura en la leyenda del documento oficial.")

        out.append({
            "codigo": r["codigo_centro"].strip(),
            "nombre": nombre,
            "nombre_oficial": r["centro"].strip(),
            "tipo_oficial": tipo_doc,
            "tipo": tipo_app,
            "titularidad": titularidad,
            "dat": r["dat"].strip(),
            "municipio": municipio,
            "distrito": distrito,
            "direccion": f"Ubicación aproximada en {distrito or municipio} (sin dirección en fuente oficial)",
            "necesidad": "TEA",
            "etapa_oficial": r["etapa"].strip(),
            "etapas_con_apoyo": stages_with_support(r["etapa"].strip(), tipo_doc),
            "latitud": lat,
            "longitud": lng,
            "ubicacion_aproximada": True,
            "ubicacion_metodo": f"Centroide del {nivel} ({'IGN' if nivel == 'municipio' else 'barrios de Madrid'}) "
                                f"con separación visual; el documento oficial no publica direcciones.",
            "fuente": f"Comunidad de Madrid · Escolarización en centros de atención preferente TEA, "
                      f"curso {meta['curso']} (información a {fecha_es(meta['fecha_informacion'])})",
            "fuente_url": meta["url"],
            "fecha_informacion": meta["fecha_informacion"],
            "curso": meta["curso"],
            "observaciones": observaciones,
            "es_sintetico": False,
            "es_demostracion": False,
        })
    return out


def ingest_official_data():
    print("[Pipeline - Ingest] Cargando relación oficial de centros preferentes TEA (Comunidad de Madrid)...")
    os.makedirs(OUTPUT_RAW_DIR, exist_ok=True)
    os.makedirs(OUTPUT_PROC_DIR, exist_ok=True)

    snapshot_rows, snap_meta, csv_sha = load_snapshot()
    snapshot_codes = [r["codigo_centro"] for r in snapshot_rows]
    print(f"  ✓ Instantánea versionada: {len(snapshot_rows)} centros ({SNAPSHOT_CSV}, SHA-256 {csv_sha[:16]}…)")

    status, pdf_info = verify_against_official(snap_meta, snapshot_codes)

    meta_path = os.path.join(OUTPUT_RAW_DIR, "metadata.json")
    prev_meta_path = os.path.join(OUTPUT_RAW_DIR, "metadata_previous.json")
    if os.path.exists(meta_path):
        shutil.copyfile(meta_path, prev_meta_path)

    metadata = {
        "url": snap_meta["url"],
        "retrieved_at": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "sha256": csv_sha,
        "sha256_de": SNAPSHOT_CSV,
        "pdf_sha256": pdf_info["pdf_sha256"],
        "pdf_codigos_extraidos": pdf_info["pdf_codigos"],
        "status": status,
        "bytes": os.path.getsize(SNAPSHOT_CSV),
        "data_mode": "OFFICIAL_DATA",
        "fecha_informacion": snap_meta["fecha_informacion"],
        "curso": snap_meta["curso"],
    }
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    rows = normalise_rows(snapshot_rows, snap_meta)

    proc_path = os.path.join(OUTPUT_PROC_DIR, "schools_extracted.json")
    with open(proc_path, "w", encoding="utf-8") as f:
        json.dump({
            "ingestion_metadata": metadata,
            "total_records": len(rows),
            "is_demonstration_sample": False,
            "alcance": snap_meta["alcance"],
            "advertencia_oficial": snap_meta["advertencia_oficial"],
            "rows": rows,
        }, f, indent=2, ensure_ascii=False)

    print(f"  ✓ Ingesta completada ({status}). {len(rows)} centros oficiales normalizados en {proc_path}")
    return metadata


if __name__ == "__main__":
    ingest_official_data()
