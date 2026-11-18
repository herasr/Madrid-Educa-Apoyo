#!/usr/bin/env python3
"""
Pipeline de Ingesta — Madrid Educa Apoyo (v3.0)
================================================

Combina cuatro fuentes públicas oficiales con apoyo toponímico oficial y cola automática de revisión:
  1. Relación oficial de centros de atención preferente TEA con plazas previsibles
     (Consejería de Educación CAM, curso 2024/2025, información a 22/03/2024, 336 códigos).
  2. Resolución oficial de Escuelas de Bienvenida / Aulas de Enlace en centros concertados
     (DG de Educación Concertada CAM, curso 2026/2027, resolución de 25/08/2026, 47 códigos:
     10 coincidentes con TEA y 37 centros nuevos).
  3. Conjunto abierto «Centros educativos de la Comunidad de Madrid» del Portal de Datos Abiertos
     (https://datos.comunidad.madrid/catalogo/dataset/centros_educativos, licencia CC BY 4.0):
     - Enriquece denominación vigente, tipo actualizado (p. ej. CEIP -> CEIPSO), dirección postal,
       CP, teléfono, correo, web, distrito y coordenadas UTM (ETRS89 -> WGS84).
     - Incorpora todos los Centros de Educación Especial (CEE) en situación ALTA (69 centros).
     - Incorpora las Aulas Hospitalarias no anuladas (14 unidades: 4 ALTA y 10 EN TRÁMITE).
     - Incorpora los recursos y equipos específicos oficiales en situación ALTA para Discapacidad Visual
       (EOEP Visuales y C.R.E. Antonio Vicente Mosquete ONCE), Altas Capacidades (CREACIM, EOEP Específico
       y 8 sedes IES del PEAC), Discapacidad Auditiva (EOEP Auditivas 28700741), Discapacidad Motora
       (EOEP Motóricas 28700763) y TDAH / Trastornos del Lenguaje (EOEP Dificultades, Lenguaje y TDAH 28701214).
  4. Portal de Datos Abiertos del Ayuntamiento de Madrid (dataset 300614-0-centros-educativos):
     - Enriquecimiento externo exclusivo para Madrid capital (transporte público cercano,
       barrio, equipamiento declarado y códigos oficiales de ACCESIBILIDAD 0..6 según estructura_ds_conjuntodatos.pdf).

Las discrepancias nominales o cruces municipales dudosos se envían automáticamente a `data/review/`
para verificación manual sin inventar datos. Si algún centro carece de coordenadas UTM en CKAN
(actualmente 1 centro: CEE Duque de Ahumada), usa el centroide oficial INE/IGN del municipio marcado
con `ubicacion_aproximada = True`.
"""

import csv
import datetime
import hashlib
import html
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
ENLACE_CSV = os.path.join(OFFICIAL_DIR, "aulas_enlace_concertados_curso_2026-27.csv")
ENLACE_META = os.path.join(OFFICIAL_DIR, "aulas_enlace_concertados_curso_2026-27.metadata.json")
CKAN_SNAPSHOT_JSON = os.path.join(OFFICIAL_DIR, "centros_educativos_datos_abiertos_cam.json")
CKAN_TEA_FALLBACK_JSON = os.path.join(OFFICIAL_DIR, "centros_educativos_datos_abiertos_tea.json")
CKAN_SNAPSHOT_META = os.path.join(OFFICIAL_DIR, "centros_educativos_datos_abiertos_cam.metadata.json")
AYTO_SNAPSHOT_CSV = os.path.join(OFFICIAL_DIR, "ayuntamiento_madrid_centros_300614.csv")
AYTO_SNAPSHOT_META = os.path.join(OFFICIAL_DIR, "ayuntamiento_madrid_centros_300614.metadata.json")

MUNICIPIOS_CSV = "data/reference/municipios_madrid_centroides.csv"
DISTRITOS_CSV = "data/reference/distritos_madrid_centroides.csv"

OUTPUT_RAW_DIR = "data/raw/educacion_cam"
OUTPUT_PROC_DIR = "data/processed"
REVIEW_DIR = "data/review"

CODE_RE = re.compile(r"(?<!\d)28\d{6}(?!\d)")

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
    "ROZAS DE MADRID, LAS": "Las Rozas de Madrid",
    "POZUELO": "Pozuelo de Alarcón",
}

DISTRITO_ALIAS = {
    "FUENCARRAL EL PARDO": "Fuencarral-El Pardo",
    "MONCLOA ARAVACA": "Moncloa-Aravaca",
    "SAN BLAS": "San Blas-Canillejas",
}

TIPO_INFO = {
    "CP INF-PRI": ("CEIP", "publico", ["infantil", "primaria"], "CEIP"),
    "CP INF-PRI-SEC": ("CEIPSO", "publico", ["infantil", "primaria", "eso"], "CEIPSO"),
    "CPR INF": ("Colegio Concertado", "concertado", ["infantil"], "Colegio"),
    "CPR INF-PRI": ("Colegio Concertado", "concertado", ["infantil", "primaria"], "Colegio"),
    "CPR INF-PRI-SEC": ("Colegio Concertado", "concertado", ["infantil", "primaria", "eso"], "Colegio"),
    "CPR PRI-SEC": ("Colegio Concertado", "concertado", ["primaria", "eso"], "Colegio"),
    "CPR ES": ("Colegio Concertado", "concertado", ["eso"], "Colegio"),
    "IES": ("IES", "publico", ["eso"], "IES"),
    "SIES": ("IES", "publico", ["eso"], "SIES"),
}

VIA_LABELS = {
    "AVDA": "Avda.",
    "CALLE": "Calle",
    "CMNO": "Camino",
    "CTRA": "Ctra.",
    "GTA": "Glorieta",
    "PASEO": "Paseo",
    "PLAZA": "Plaza",
    "PRAJE": "Paraje",
    "RONDA": "Ronda",
    "TRVA": "Travesía",
}

KEEP_UPPER = {"CEU", "GSD", "FUHEM", "FESD", "XXI", "II", "III", "XII", "SAFA", "C.R.E.", "CRE", "CPEE", "CEE", "ONCE", "CREACIM", "EOEP", "PEAC", "IES"}
LOWER_WORDS = {"de", "del", "la", "las", "los", "el", "y", "e", "en", "al", "a"}
NAME_PREFIX_WORDS = {"COLEGIO", "ESCUELA", "INSTITUTO", "CENTRO", "HOSPITAL", "FUNDACION", "FUNDACIÓN", "AULA"}
STOP_NAME_TOKENS = {
    "colegio", "publico", "privado", "concertado", "instituto", "centro",
    "educacion", "especial", "infantil", "primaria", "secundaria", "hospital",
    "aula", "madrid", "san", "santa", "santo", "nuestra", "senora",
    "de", "la", "del", "los", "las", "el", "en", "y"
}


def strip_accents(text):
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def norm(text):
    return re.sub(r"\s+", " ", strip_accents(text or "").strip().lower())


def sig_tokens(text):
    return {w for w in re.findall(r"[a-z0-9]+", norm(text)) if len(w) >= 3 and w not in STOP_NAME_TOKENS}


def compact_alnum(text):
    return re.sub(r"[^a-z0-9]", "", norm(text))


def has_name_overlap(name_a, name_b):
    toks_a = sig_tokens(name_a)
    toks_b = sig_tokens(name_b)
    if toks_a and toks_b and (toks_a & toks_b):
        return True
    comp_a = compact_alnum(name_a)
    comp_b = compact_alnum(name_b)
    if len(comp_a) >= 5 and len(comp_b) >= 5 and (comp_a in comp_b or comp_b in comp_a):
        return True
    return False


def extract_phones(raw):
    out = []
    for part in re.split(r"[/,\-]", str(raw or "")):
        digits = re.sub(r"\D", "", part)
        if len(digits) >= 9:
            out.append(digits[-9:])
    return out


def fecha_es(iso_date):
    y, m, d = iso_date.split("-")
    return f"{d}/{m}/{y}"


def sha256_bytes(data):
    return hashlib.sha256(data).hexdigest()


def title_es(raw):
    text = (raw or "").replace("--", "-").strip()
    if not text:
        return ""
    if text == "PI I MARGALL":
        return "Pi i Margall"
    words = re.split(r"(\s+|-)", text)
    out = []
    first = True
    prev_word_upper = ""
    for w in words:
        if not w or w.isspace() or w == "-":
            out.append(w)
            continue
        upper = w.upper()
        lower = w.lower()
        keep_cap_article = prev_word_upper in NAME_PREFIX_WORDS and lower in {"la", "las", "los", "el"}
        if upper in KEEP_UPPER or (upper == "I" and not first):
            out.append(upper)
        elif lower in LOWER_WORDS and not first and not keep_cap_article:
            out.append(lower)
        elif w == "Mª":
            out.append("Mª")
        else:
            out.append(w[:1].upper() + w[1:].lower())
        first = False
        prev_word_upper = upper
    return "".join(out)


def utm30n_to_wgs84(easting, northing):
    """Convierte coordenadas ETRS89 UTM Huso 30N (EPSG:25830) a WGS84 (lat, lng)."""
    a = 6378137.0
    f = 1 / 298.257222101
    e2 = 2 * f - f * f
    e_prime2 = e2 / (1 - e2)
    k0 = 0.9996
    x = easting - 500000.0
    y = northing
    m_val = y / k0
    mu = m_val / (a * (1 - e2 / 4 - 3 * e2**2 / 64 - 5 * e2**3 / 256))
    e1 = (1 - math.sqrt(1 - e2)) / (1 + math.sqrt(1 - e2))
    phi1 = (
        mu
        + (3 * e1 / 2 - 27 * e1**3 / 32) * math.sin(2 * mu)
        + (21 * e1**2 / 16 - 55 * e1**4 / 32) * math.sin(4 * mu)
        + (151 * e1**3 / 96) * math.sin(6 * mu)
        + (1097 * e1**4 / 512) * math.sin(8 * mu)
    )
    c1 = e_prime2 * math.cos(phi1) ** 2
    t1 = math.tan(phi1) ** 2
    n1 = a / math.sqrt(1 - e2 * math.sin(phi1) ** 2)
    r1 = a * (1 - e2) / (1 - e2 * math.sin(phi1) ** 2) ** 1.5
    d = x / (n1 * k0)
    lat = phi1 - (n1 * math.tan(phi1) / r1) * (
        d**2 / 2
        - (5 + 3 * t1 + 10 * c1 - 4 * c1**2 - 9 * e_prime2) * d**4 / 24
        + (61 + 90 * t1 + 298 * c1 + 45 * t1**2 - 252 * e_prime2 - 3 * c1**2) * d**6 / 720
    )
    lon = -math.radians(3.0) + (
        d
        - (1 + 2 * t1 + c1) * d**3 / 6
        + (5 - 2 * c1 + 28 * t1 - 3 * c1**2 + 8 * e_prime2 + 24 * t1**2) * d**5 / 120
    ) / math.cos(phi1)
    return round(math.degrees(lat), 6), round(math.degrees(lon), 6)


def haversine_m(lat1, lon1, lat2, lon2):
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    h = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return 6371000.0 * 2 * math.asin(math.sqrt(h))


def format_address(ckan_rec):
    via = VIA_LABELS.get(str(ckan_rec.get("CDTPVIA", "")).strip(), title_es(str(ckan_rec.get("CDTPVIA", "")).strip()))
    dom = str(ckan_rec.get("DOMICILIO", "")).strip()
    num = str(ckan_rec.get("NMVIAL", "")).strip()
    street = " ".join(p for p in (via, dom) if p)
    if num and num.lower() not in {"s/n", "0", ""}:
        return f"{street}, {num}" if street else num
    if num.lower() == "s/n":
        return f"{street}, s/n" if street else ""
    return street


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


def load_aulas_enlace_snapshot():
    if not (os.path.exists(ENLACE_CSV) and os.path.exists(ENLACE_META)):
        return [], {}, None
    with open(ENLACE_CSV, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    with open(ENLACE_META, encoding="utf-8") as f:
        meta = json.load(f)
    with open(ENLACE_CSV, "rb") as f:
        csv_sha = sha256_bytes(f.read())
    return rows, meta, csv_sha


def load_ckan_all():
    """Carga todos los registros de 'Centros educativos de la Comunidad de Madrid' (CKAN CAM)."""
    ckan_meta = {}
    if os.path.exists(CKAN_SNAPSHOT_META):
        with open(CKAN_SNAPSHOT_META, encoding="utf-8") as f:
            ckan_meta = json.load(f)

    live_url = ckan_meta.get(
        "resource_json_url",
        "https://datos.comunidad.madrid/dataset/c750856d-3166-4dac-8e80-d1b824c968b5/resource/be2264df-c720-4619-ab79-aebad9b248e0/download/centros_educativos.json",
    )
    snap_date = str(ckan_meta.get("fecha_descarga", "2026-11-16") or "2026-11-16")[:10]
    live_date = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")

    try:
        req = urllib.request.Request(
            live_url,
            headers={"User-Agent": "MadridEducaApoyo-Pipeline/3.0 (DataMad; datos abiertos)"},
        )
        with urllib.request.urlopen(req, timeout=25) as resp:
            raw = resp.read()
        data = json.loads(raw.decode("utf-8-sig", "ignore"))
        rows = data.get("data", []) if isinstance(data, dict) else data
        by_code = {str(x.get("CODIGO", "")).strip(): x for x in rows if str(x.get("CODIGO", "")).strip()}
        if len(by_code) >= 7000:
            print(f"  ✓ Portal de Datos Abiertos CAM verificado en vivo ({len(by_code)} centros totales en catálogo)")
            return by_code, "CKAN_EN_VIVO", sha256_bytes(raw), ckan_meta.get("portal_url", "https://datos.comunidad.madrid/catalogo/dataset/centros_educativos"), live_date
    except Exception as e:
        print(f"  ℹ Portal de Datos Abiertos CAM offline ({e}). Se usa instantánea versionada ({snap_date}).")

    for snap_path in (CKAN_SNAPSHOT_JSON, CKAN_TEA_FALLBACK_JSON):
        if os.path.exists(snap_path):
            with open(snap_path, encoding="utf-8") as f:
                snap = json.load(f)
            by_code = snap.get("centros", {})
            with open(snap_path, "rb") as f:
                snap_sha = sha256_bytes(f.read())
            print(f"  ✓ Instantánea CKAN Datos Abiertos CAM cargada ({len(by_code)} centros en {snap_path}, descarga {snap_date})")
            return by_code, "SNAPSHOT_CKAN_VERSIONADO", snap_sha, ckan_meta.get("portal_url", "https://datos.comunidad.madrid/catalogo/dataset/centros_educativos"), snap_date

    return {}, "NO_DISPONIBLE", None, "https://datos.comunidad.madrid/catalogo/dataset/centros_educativos", snap_date


def load_ayuntamiento_centres():
    """Carga el catálogo de Centros Educativos del Ayuntamiento de Madrid (datos.madrid.es 300614-0)."""
    ayto_meta = {}
    if os.path.exists(AYTO_SNAPSHOT_META):
        with open(AYTO_SNAPSHOT_META, encoding="utf-8") as f:
            ayto_meta = json.load(f)
    snap_date = str(ayto_meta.get("fecha_descarga", "2026-11-16") or "2026-11-16")[:10]
    live_date = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")

    url = "https://datos.madrid.es/egob/catalogo/300614-0-centros-educativos.csv"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (MadridEducaApoyo/3.0)"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read()
        rows = list(csv.DictReader(raw.decode("latin-1").splitlines(), delimiter=";"))
        if len(rows) >= 1000:
            print(f"  ✓ Portal de Datos Abiertos Ayto. de Madrid verificado en vivo ({len(rows)} centros en capital)")
            return rows, "AYTO_MADRID_EN_VIVO", sha256_bytes(raw), live_date
    except Exception as e:
        print(f"  ℹ Portal Ayto. de Madrid no disponible en vivo ({e}). Se usa instantánea versionada ({snap_date}).")

    if os.path.exists(AYTO_SNAPSHOT_CSV):
        with open(AYTO_SNAPSHOT_CSV, encoding="utf-8") as f:
            rows = list(csv.DictReader(f, delimiter=";"))
        with open(AYTO_SNAPSHOT_CSV, "rb") as f:
            snap_sha = sha256_bytes(f.read())
        print(f"  ✓ Instantánea Ayto. de Madrid cargada ({len(rows)} filas de 300614-0, descarga {snap_date})")
        return rows, "SNAPSHOT_AYTO_VERSIONADO", snap_sha, snap_date

    return [], "NO_DISPONIBLE", None, snap_date


def build_ayto_index(ayto_rows):
    by_phone = {}
    by_email = {}
    for row in ayto_rows:
        for phone in extract_phones(row.get("TELEFONO", "")):
            by_phone.setdefault(phone, []).append(row)
        em = (row.get("EMAIL") or "").strip().lower()
        if em and "@" in em:
            by_email.setdefault(em, []).append(row)
    return ayto_rows, by_phone, by_email


def match_ayuntamiento_record(centro_name, codigo_postal, telefono, email, lat, lng, ayto_index, codigo=None, dubious_log=None):
    all_rows, by_phone, by_email = ayto_index
    if not all_rows:
        return None
    t_toks = sig_tokens(centro_name)

    def log_dubious(criterion, cand):
        if dubious_log is not None:
            dubious_log.append({
                "codigo": codigo or "",
                "nombre_cam": centro_name,
                "criterio_candidato": criterion,
                "candidato_ayto": cand.get("NOMBRE", ""),
                "telefono_candidato": cand.get("TELEFONO", ""),
                "email_candidato": cand.get("EMAIL", ""),
                "codigo_postal_candidato": cand.get("CODIGO-POSTAL", ""),
                "accion": "DESCARTADO_POR_SIN_COINCIDENCIA_NOMINAL",
            })

    for p in extract_phones(telefono):
        for cand in by_phone.get(p, []):
            if has_name_overlap(centro_name, cand.get("NOMBRE", "")):
                return cand
            log_dubious("telefono", cand)

    em = (email or "").strip().lower()
    if em and em in by_email:
        for cand in by_email[em]:
            if has_name_overlap(centro_name, cand.get("NOMBRE", "")):
                return cand
            log_dubious("email", cand)

    best = None
    for cand in all_rows:
        clat = str(cand.get("LATITUD", "")).strip()
        clng = str(cand.get("LONGITUD", "")).strip()
        if not clat or not clng:
            continue
        try:
            dist = haversine_m(lat, lng, float(clat), float(clng))
        except ValueError:
            continue
        if dist < 250.0:
            overlap = len(t_toks & sig_tokens(cand.get("NOMBRE", "")))
            if overlap >= 1:
                if not best or overlap > best[0] or (overlap == best[0] and dist < best[1]):
                    best = (overlap, dist, cand)
    return best[2] if best else None


def extract_ayto_enrichment(ayto_rec):
    if not ayto_rec:
        return {}
    tr_raw = html.unescape(str(ayto_rec.get("TRANSPORTE", "") or "")).strip()
    tr_raw = re.sub(r"\s+", " ", tr_raw)
    if tr_raw.lower().startswith("consulta los enlaces"):
        tr_raw = ""

    barrio_raw = html.unescape(str(ayto_rec.get("BARRIO", "") or "")).strip()
    barrio = title_es(barrio_raw) if barrio_raw else ""

    eq_raw = html.unescape(str(ayto_rec.get("EQUIPAMIENTO", "") or "")).strip()
    eq_l = norm(eq_raw)
    has_equip = bool(eq_raw)
    servicios = {
        "comedor": "comedor" in eq_l if has_equip else False,
        "transporte": "transporte" in eq_l if has_equip else False,
        "aula_matinal": ("horario ampliado" in eq_l or "aula matinal" in eq_l or "desayuno" in eq_l) if has_equip else False,
        "enfermeria": ("enfermer" in eq_l or "gabinete medico" in eq_l or "servicio sanitario" in eq_l) if has_equip else False,
        "actividades_extraescolares": "extraescolar" in eq_l if has_equip else False,
    }

    # Diccionario oficial (estructura_ds_conjuntodatos.pdf, Mayo 2019, Ayto. Madrid):
    # 0 = No accesible, 1 = Accesible, 2 = Parcialmente accesible PMR,
    # 3 = Sin información sobre accesibilidad PMR,
    # 4 = Lengua de signos, 5 = Señalización podotáctil, 6 = Bucle de inducción magnético.
    acc_tokens = set(re.findall(r"\d+", str(ayto_rec.get("ACCESIBILIDAD", "") or "")))
    acc_codigo = ",".join(sorted(acc_tokens, key=int)) if acc_tokens else ""
    acceso_fisico = "1" in acc_tokens

    return {
        "transporte_publico": tr_raw,
        "barrio": barrio,
        "servicios": servicios,
        "servicios_confirmados_ayto": has_equip,
        "accesibilidad_codigo_ayto": acc_codigo,
        "accesibilidad": {
            "acceso_fisico": acceso_fisico,
            "ascensor": False,
            "bano_adaptado": False,
            "bucle_magnetico": "6" in acc_tokens,
            "plano_podotactil": "5" in acc_tokens,
        },
        "accesibilidad_confirmada_ayto": acceso_fisico,
        "fuente_ayuntamiento": "Portal de Datos Abiertos del Ayuntamiento de Madrid · 300614-0",
    }


def download_pdf(url):
    req = urllib.request.Request(url, headers={"User-Agent": "MadridEducaApoyo-Pipeline/3.0 (DataMad; datos abiertos)"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def extract_codes_from_pdf(pdf_bytes):
    try:
        import pdfplumber
        codes = []
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                codes.extend(CODE_RE.findall(page.extract_text() or ""))
        return codes
    except ImportError:
        import zlib
        codes = []
        for m in re.finditer(rb"stream\r?\n(.*?)\r?\nendstream", pdf_bytes, re.S):
            chunk = m.group(1)
            try:
                text = zlib.decompress(chunk).decode("latin1", "ignore")
            except Exception:
                text = chunk.decode("latin1", "ignore")
            codes.extend(CODE_RE.findall(text))
        return codes


def write_tea_verification_log(meta, status, info, error_msg=None, added=None, removed=None):
    os.makedirs(REVIEW_DIR, exist_ok=True)
    log_path = os.path.join(REVIEW_DIR, "verificacion_tea_pdf.json")
    payload = {
        "ultima_comprobacion": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "pdf_url": meta["url"],
        "estado": status,
        "snapshot_csv": SNAPSHOT_CSV,
        "snapshot_fecha_informacion": meta.get("fecha_informacion"),
        "snapshot_total_codigos": len(load_snapshot()[0]),
        "pdf_sha256": info.get("pdf_sha256"),
        "pdf_codigos_extraidos": info.get("pdf_codigos"),
        "codigos_nuevos_en_pdf": added or [],
        "codigos_que_ya_no_aparecen": removed or [],
        "error_descarga_o_lectura": error_msg,
    }
    with open(log_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)


def verify_against_official(meta, snapshot_codes):
    """Descarga el PDF oficial y compara sus códigos con la instantánea versionada."""
    info = {"pdf_url": meta["url"], "pdf_sha256": None, "pdf_codigos": None}
    try:
        pdf_bytes = download_pdf(meta["url"])
    except Exception as e:
        print(f"  ℹ No se pudo descargar el PDF oficial ({e}). Se usa la instantánea versionada.")
        write_tea_verification_log(meta, "SNAPSHOT_VERSIONADO", info, error_msg=str(e))
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
        write_tea_verification_log(meta, "SNAPSHOT_VERSIONADO", info, error_msg=str(e))
        return "SNAPSHOT_VERSIONADO", info

    info["pdf_codigos"] = len(pdf_codes)
    added = sorted(set(pdf_codes) - set(snapshot_codes))
    removed = sorted(set(snapshot_codes) - set(pdf_codes))
    if not added and not removed:
        print(f"  ✓ Los {len(set(pdf_codes))} códigos del PDF oficial coinciden con la instantánea versionada.")
        write_tea_verification_log(meta, "PDF_OFICIAL_VERIFICADO", info)
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
    write_tea_verification_log(meta, "PDF_OFICIAL_CON_CAMBIOS", info, added=added, removed=removed)
    print(f"  ⚡ El PDF oficial difiere de la instantánea (+{len(added)} / -{len(removed)} códigos). "
          f"Enviado a revisión: {review_path}")
    return "PDF_OFICIAL_CON_CAMBIOS", info


def write_aulas_enlace_verification_log(meta, total_rows, status, info, error_msg=None, added=None, removed=None):
    os.makedirs(REVIEW_DIR, exist_ok=True)
    log_path = os.path.join(REVIEW_DIR, "verificacion_aulas_enlace_pdf.json")
    payload = {
        "ultima_comprobacion": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "pdf_url": meta.get("url"),
        "estado": status,
        "snapshot_csv": ENLACE_CSV,
        "snapshot_fecha_informacion": meta.get("fecha_informacion"),
        "snapshot_total_codigos": total_rows,
        "pdf_sha256": info.get("pdf_sha256"),
        "pdf_codigos_extraidos": info.get("pdf_codigos"),
        "codigos_nuevos_en_pdf": added or [],
        "codigos_que_ya_no_aparecen": removed or [],
        "error_descarga_o_lectura": error_msg,
    }
    with open(log_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)


def verify_aulas_enlace_against_official(meta, snapshot_codes):
    """Comprueba la Resolución oficial de Aulas de Enlace 2026-27 frente a la instantánea CSV."""
    info = {"pdf_url": meta.get("url"), "pdf_sha256": None, "pdf_codigos": None}
    if not meta.get("url"):
        return "SNAPSHOT_VERSIONADO", info
    try:
        pdf_bytes = download_pdf(meta["url"])
    except Exception as e:
        print(f"  ℹ No se pudo descargar la Resolución Aulas de Enlace ({e}). Se usa la instantánea versionada.")
        write_aulas_enlace_verification_log(meta, len(snapshot_codes), "SNAPSHOT_VERSIONADO", info, error_msg=str(e))
        return "SNAPSHOT_VERSIONADO", info

    info["pdf_sha256"] = sha256_bytes(pdf_bytes)
    os.makedirs(OUTPUT_RAW_DIR, exist_ok=True)
    with open(os.path.join(OUTPUT_RAW_DIR, "resolucion_aulas_enlace_2026-27.pdf"), "wb") as f:
        f.write(pdf_bytes)
    print(f"  ✓ Resolución Aulas de Enlace descargada ({len(pdf_bytes)} bytes, SHA-256 {info['pdf_sha256'][:16]}…)")

    try:
        pdf_codes = extract_codes_from_pdf(pdf_bytes)
    except Exception as e:
        print(f"  ⚠ Resolución Aulas de Enlace descargada pero no legible ({e}). Se usa instantánea versionada.")
        write_aulas_enlace_verification_log(meta, len(snapshot_codes), "SNAPSHOT_VERSIONADO", info, error_msg=str(e))
        return "SNAPSHOT_VERSIONADO", info

    info["pdf_codigos"] = len(pdf_codes)
    added = sorted(set(pdf_codes) - set(snapshot_codes))
    removed = sorted(set(snapshot_codes) - set(pdf_codes))
    if not added and not removed:
        print(f"  ✓ Los {len(set(pdf_codes))} códigos de la Resolución Aulas de Enlace coinciden con la instantánea.")
        write_aulas_enlace_verification_log(meta, len(snapshot_codes), "PDF_OFICIAL_VERIFICADO", info)
        return "PDF_OFICIAL_VERIFICADO", info

    os.makedirs(REVIEW_DIR, exist_ok=True)
    review_path = os.path.join(REVIEW_DIR, "aulas_enlace_diferencias.json")
    with open(review_path, "w", encoding="utf-8") as f:
        json.dump({
            "detectado": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "pdf_url": meta["url"],
            "pdf_sha256": info["pdf_sha256"],
            "codigos_nuevos_en_pdf": added,
            "codigos_que_ya_no_aparecen": removed,
            "accion": "Revisar a mano y actualizar data/official/aulas_enlace_concertados_curso_2026-27.csv",
        }, f, indent=2, ensure_ascii=False)
    write_aulas_enlace_verification_log(
        meta, len(snapshot_codes), "PDF_OFICIAL_CON_CAMBIOS", info, added=added, removed=removed
    )
    print(f"  ⚡ La Resolución Aulas de Enlace difiere (+{len(added)} / -{len(removed)}). Revisión: {review_path}")
    return "PDF_OFICIAL_CON_CAMBIOS", info


def resolve_place(raw_place, dat, municipios, distritos):
    if dat == "DAT CAPITAL":
        distrito = DISTRITO_ALIAS.get(raw_place, raw_place)
        ref = distritos.get(norm(distrito))
        if ref is None:
            raise ValueError(f"Distrito de Madrid no reconocido: {raw_place}")
        return "Madrid", ref["distrito"], ref, "distrito"
    municipio = LOCALIDAD_ALIAS.get(raw_place, LOCALIDAD_ALIAS.get(raw_place.upper(), raw_place))
    ref = municipios.get(norm(municipio))
    if ref is None:
        raise ValueError(f"Localidad no reconocida en el nomenclátor INE: {raw_place}")
    return ref["municipio"], None, ref, "municipio"


def resolve_ckan_place(mun_raw, dist_raw, municipios, distritos):
    mun_alias = LOCALIDAD_ALIAS.get(mun_raw, LOCALIDAD_ALIAS.get(mun_raw.upper(), mun_raw))
    ref_mun = municipios.get(norm(mun_alias))
    if ref_mun is None:
        raise ValueError(f"Municipio CKAN no reconocido en el nomenclátor INE: {mun_raw}")
    municipio = ref_mun["municipio"]
    distrito = None
    ref_geo = ref_mun
    nivel = "municipio"
    if municipio == "Madrid" and dist_raw:
        d_alias = DISTRITO_ALIAS.get(dist_raw.upper(), dist_raw)
        ref_dist = distritos.get(norm(d_alias))
        if ref_dist:
            distrito = ref_dist["distrito"]
            ref_geo = ref_dist
            nivel = "distrito"
    return municipio, distrito, ref_geo, nivel


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
    if index == 0:
        return round(lat, 5), round(lng, 5)
    r_km = 0.3 * math.sqrt(index)
    angle = math.radians(index * 137.508)
    dlat = (r_km / 111.32) * math.cos(angle)
    dlng = (r_km / (111.32 * math.cos(math.radians(lat)))) * math.sin(angle)
    return round(lat + dlat, 5), round(lng + dlng, 5)


def extract_contact(ckan_rec):
    if not ckan_rec:
        return "", "", "", "", ""
    direccion = format_address(ckan_rec)
    codigo_postal = str(ckan_rec.get("CDPOSTAL", "") or "").strip()
    if codigo_postal == "00000":
        codigo_postal = ""
    tel_raw = str(ckan_rec.get("TELEFONO", "") or "").strip()
    telefono = tel_raw if tel_raw and tel_raw != "0" else ""
    email = str(ckan_rec.get("E_MAIL", "") or "").strip()
    web = str(ckan_rec.get("WEB", "") or "").strip()
    if web and not web.startswith(("http://", "https://")):
        web = f"https://{web}"
    return direccion, codigo_postal, telefono, email, web


def normalise_tea_rows(snapshot_rows, meta, ckan_by_code, ayto_index, municipios, distritos, conflict_log, dubious_ayto_log):
    groups = {}
    out = []
    for r in snapshot_rows:
        codigo = r["codigo_centro"].strip()
        tipo_doc = r["tipo"].strip()
        tea_raw_name = r["centro"].strip()
        municipio, distrito, ref, nivel = resolve_place(
            r["distrito_o_localidad"].strip(), r["dat"].strip(), municipios, distritos
        )

        ckan_rec = ckan_by_code.get(codigo)
        utm_x = str(ckan_rec.get("UTM_X", "") or "").strip() if ckan_rec else ""
        utm_y = str(ckan_rec.get("UTM_Y", "") or "").strip() if ckan_rec else ""

        if ckan_rec and utm_x and utm_y:
            lat, lng = utm30n_to_wgs84(float(utm_x), float(utm_y))
            ubicacion_aprox = False
            ubicacion_metodo = (
                "Coordenadas oficiales UTM (ETRS89) del conjunto 'Centros educativos de la Comunidad de Madrid' "
                "(Portal de Datos Abiertos CAM, CC BY 4.0)."
            )
        else:
            key = (municipio, distrito)
            idx = groups.get(key, 0)
            groups[key] = idx + 1
            lat, lng = spread(float(ref["lat"]), float(ref["lng"]), idx)
            ubicacion_aprox = True
            ubicacion_metodo = (
                f"Centroide del {nivel} ({'IGN' if nivel == 'municipio' else 'barrios de Madrid'}) "
                "con separación visual."
            )

        direccion, codigo_postal, telefono, email, web = extract_contact(ckan_rec)
        tipo_general_ckan = str(ckan_rec.get("TIPO_EXT", "") or "").strip() if ckan_rec else ""
        ckan_tipo_abrv = str(ckan_rec.get("TIPO_ABRV", "") or "").strip() if ckan_rec else ""
        ckan_raw_name = str(ckan_rec.get("CENTRO", "") or "").strip() if ckan_rec else ""

        # Priorizar el tipo oficial vigente en CKAN cuando evoluciona (p. ej. CP INF-PRI -> CEIPSO, SIES -> IES)
        effective_tipo = ckan_tipo_abrv if (ckan_tipo_abrv in TIPO_INFO) else tipo_doc
        effective_raw_name = tea_raw_name

        observaciones = []
        # Detección automática de conflicto nominal real entre listado TEA y registro CKAN CAM
        has_name_conflict = bool(
            ckan_raw_name
            and compact_alnum(tea_raw_name) != compact_alnum(ckan_raw_name)
            and not has_name_overlap(tea_raw_name, ckan_raw_name)
        )
        if has_name_conflict:
            effective_raw_name = ckan_raw_name
            conflict_log.append({
                "codigo": codigo,
                "nombre_ckan_cam": ckan_raw_name,
                "nombre_listado_tea": tea_raw_name,
                "tipo_ckan_cam": ckan_tipo_abrv,
                "tipo_listado_tea": tipo_doc,
                "direccion_ckan": direccion,
                "telefono_ckan": telefono,
                "email_ckan": email,
                "web_ckan": web,
                "criterio_aplicado": "Se usa la denominación oficial del registro CAM (CKAN) y se añade aviso en observaciones.",
            })
            observaciones.append(
                f"Conflicto detectado en el código {codigo}: el registro oficial de Datos Abiertos CAM corresponde a «{title_es(ckan_raw_name)}», "
                f"mientras que el listado TEA 2024/25 asocia este código a «{title_es(tea_raw_name)}». "
                "Se muestran la denominación y el contacto del registro oficial CAM; conviene confirmar la asignación real de plaza TEA ante el SAE."
            )
        elif tipo_doc == "SIES" and ckan_tipo_abrv == "IES" and ckan_raw_name:
            effective_raw_name = ckan_raw_name
            observaciones.append(
                f"En el listado TEA 2024/25 figuraba como SIES «{title_es(tea_raw_name)}»; "
                f"el catálogo oficial Datos Abiertos CAM ya lo registra como IES «{title_es(ckan_raw_name)}»."
            )

        tipo_app, titularidad, centre_stages, prefijo = TIPO_INFO.get(effective_tipo, ("CEIP", "publico", [], ""))
        nombre_base = title_es(effective_raw_name)
        nombre = f"{prefijo} {nombre_base}" if prefijo and not nombre_base.lower().startswith(prefijo.lower()) else nombre_base

        if not tipo_doc:
            observaciones.append(
                "El listado TEA no indica el tipo ni la titularidad de este centro; "
                f"el catálogo general de Datos Abiertos CAM lo registra como centro público ({effective_tipo or 'CEIP'})."
            )
        elif ckan_tipo_abrv and ckan_tipo_abrv in TIPO_INFO and ckan_tipo_abrv != tipo_doc and tipo_doc != "SIES":
            observaciones.append(
                f"En el listado TEA 2024/25 figuraba como {tipo_doc}; el catálogo oficial Datos Abiertos CAM lo registra actualmente como {tipo_app} ({ckan_tipo_abrv})."
            )
        elif effective_tipo not in TIPO_INFO:
            observaciones.append(f"Tipo de centro '{effective_tipo}' no definido en la leyenda del documento TEA.")
        elif effective_tipo == "SIES":
            observaciones.append("'SIES' (Sección de IES) no figura en la leyenda del documento TEA.")

        ayto_info = {}
        if municipio == "Madrid":
            matched = match_ayuntamiento_record(
                effective_raw_name, codigo_postal, telefono, email, lat, lng, ayto_index, codigo=codigo, dubious_log=dubious_ayto_log
            )
            ayto_info = extract_ayto_enrichment(matched)

        observaciones_extra = list(observaciones)
        extra_apoyos = []
        if codigo == "28020910":
            extra_apoyos.append({
                "need_id": "altas_capacidades",
                "necesidad": "ALTAS_CAPACIDADES",
                "evidencia": "A2",
                "etapas_con_apoyo": ["primaria", "eso", "bachillerato"],
                "recursos": [
                    "Sede territorial del Programa de Enriquecimiento Educativo PEAC (sábados quincenales)",
                    "Coordinado institucionalmente por CREACIM · Madrid Capital",
                ],
                "fuente": (
                    "Comunidad de Madrid · Programa de Enriquecimiento Educativo (PEAC / CREACIM) "
                    "y Portal de Datos Abiertos CAM (CC BY 4.0)"
                ),
                "fecha_corte": f"Catálogo CKAN vigente · corte {fecha_es(meta['fecha_informacion'])}",
                "detalles": (
                    "Instituto público que además de centro preferente TEA en Secundaria actúa como sede "
                    "territorial oficial en Madrid capital del Programa de Enriquecimiento Educativo para "
                    "Alumnado con Altas Capacidades (PEAC, sábados quincenales en Primaria, ESO y Bachillerato)."
                ),
            })

        out.append({
            "codigo": codigo,
            "nombre": nombre,
            "nombre_oficial": ckan_raw_name if (has_name_conflict or (tipo_doc == "SIES" and ckan_tipo_abrv == "IES")) else tea_raw_name,
            "tipo_oficial": effective_tipo,
            "tipo_general_oficial": tipo_general_ckan,
            "tipo": tipo_app,
            "titularidad": titularidad,
            "modalidad": "preferente",
            "dat": r["dat"].strip(),
            "municipio": municipio,
            "distrito": distrito,
            "barrio": ayto_info.get("barrio", ""),
            "codigo_postal": codigo_postal,
            "direccion": direccion,
            "telefono": telefono,
            "email": email,
            "web": web,
            "necesidad": "TEA",
            "need_id": "tea",
            "evidencia": "A2",
            "situacion_oficial": str(ckan_rec.get("SITUACIÓN", "ALTA") or "ALTA").strip() if ckan_rec else "ALTA",
            "etapa_oficial": r["etapa"].strip(),
            "etapas_con_apoyo": stages_with_support(r["etapa"].strip(), effective_tipo),
            "etapas_generales_centro": centre_stages,
            "extra_apoyos": extra_apoyos,
            "latitud": lat,
            "longitud": lng,
            "ubicacion_aproximada": ubicacion_aprox,
            "ubicacion_metodo": ubicacion_metodo,
            "transporte_publico": ayto_info.get("transporte_publico", ""),
            "servicios_ayto": ayto_info.get("servicios", {}),
            "servicios_confirmados_ayto": ayto_info.get("servicios_confirmados_ayto", False),
            "accesibilidad_codigo_ayto": ayto_info.get("accesibilidad_codigo_ayto", ""),
            "accesibilidad_ayto": ayto_info.get("accesibilidad", {}),
            "accesibilidad_confirmada_ayto": ayto_info.get("accesibilidad_confirmada_ayto", False),
            "fuente_ayuntamiento": ayto_info.get("fuente_ayuntamiento", ""),
            "fuente": (
                f"Comunidad de Madrid · Escolarización en centros de atención preferente TEA, "
                f"curso {meta['curso']} (información a {fecha_es(meta['fecha_informacion'])})"
            ),
            "fuente_datos_abiertos": (
                "Portal de Datos Abiertos CAM · Centros educativos de la Comunidad de Madrid (CC BY 4.0)"
                if ckan_rec
                else ""
            ),
            "fuente_url": meta["url"],
            "fecha_informacion": meta["fecha_informacion"],
            "curso": meta["curso"],
            "observaciones": observaciones_extra,
            "es_sintetico": False,
            "es_demostracion": False,
        })
    return out


def normalise_cee_and_hospital_rows(ckan_by_code, existing_codes, ayto_index, municipios, distritos, retrieval_date, dubious_ayto_log):
    """Extrae 69 Centros de Educación Especial (ALTA) y 14 Aulas Hospitalarias (no anuladas)."""
    out = []
    groups = {}

    for codigo in sorted(ckan_by_code.keys()):
        if codigo in existing_codes:
            continue
        rec = ckan_by_code[codigo]
        tipo_ext = str(rec.get("TIPO_EXT", "") or "").strip()
        situacion = str(rec.get("SITUACIÓN", "") or "").strip()

        is_cee = tipo_ext in ("COLEGIO DE EDUCACIÓN ESPECIAL", "CENTRO PRIVADO DE EDUCACIÓN ESPECIAL") and situacion == "ALTA"
        is_hosp = "HOSPITALARIA" in tipo_ext and situacion != "ANULACIÓN"
        if not (is_cee or is_hosp):
            continue

        mun_raw = str(rec.get("MUNICIPIO", "") or "").strip()
        dist_raw = str(rec.get("DISTRITO", "") or "").strip()
        municipio, distrito, ref_geo, nivel = resolve_ckan_place(mun_raw, dist_raw, municipios, distritos)

        utm_x = str(rec.get("UTM_X", "") or "").strip()
        utm_y = str(rec.get("UTM_Y", "") or "").strip()
        if utm_x and utm_y:
            lat, lng = utm30n_to_wgs84(float(utm_x), float(utm_y))
            ubicacion_aprox = False
            ubicacion_metodo = (
                "Coordenadas oficiales UTM (ETRS89) del conjunto 'Centros educativos de la Comunidad de Madrid' "
                "(Portal de Datos Abiertos CAM, CC BY 4.0)."
            )
        else:
            key = (municipio, distrito)
            idx = groups.get(key, 0)
            groups[key] = idx + 1
            lat, lng = spread(float(ref_geo["lat"]), float(ref_geo["lng"]), idx)
            ubicacion_aprox = True
            ubicacion_metodo = (
                f"Centroide oficial del {nivel} (IGN) al no constar coordenadas UTM en el catálogo CKAN."
            )

        direccion, codigo_postal, telefono, email, web = extract_contact(rec)
        centro_raw = str(rec.get("CENTRO", "") or "").strip()
        tipo_abrv = str(rec.get("TIPO_ABRV", "") or "").strip()
        tit_raw = str(rec.get("TITULARIDAD", "") or "").strip()
        titularidad = "publico" if tit_raw == "PÚBLICO" else "concertado" if tit_raw == "PRIVADO CONCERTADO" else "privado"

        nombre_base = title_es(centro_raw)
        if is_cee:
            low = nombre_base.lower()
            if tipo_abrv == "CP EE":
                nombre = nombre_base if low.startswith(("cpee", "colegio", "centro")) else f"CPEE {nombre_base}"
            else:
                nombre = (
                    nombre_base
                    if low.startswith(("cee", "colegio", "centro", "escuela", "instituto", "fundación", "c.r.e"))
                    else f"CEE {nombre_base}"
                )
            need_id = "educacion_especial"
            necesidad_label = "EDUCACION_ESPECIAL"
            tipo_app = "CEE"
            evidencia = "A1"
            observaciones = []
            if ubicacion_aprox:
                observaciones.append("Las coordenadas exactas UTM no figuran aún en CKAN para este centro; se posiciona en el centroide oficial del municipio.")
            if titularidad == "privado":
                observaciones.append("Centro de titularidad privada no concertada inscrito en situación ALTA en Datos Abiertos CAM.")
        else:
            low = nombre_base.lower()
            nombre = nombre_base if low.startswith("aula hospitalaria") else f"Aula Hospitalaria {nombre_base}"
            need_id = "salud_hospitalaria"
            necesidad_label = "SALUD_HOSPITALARIA"
            tipo_app = "Aula Hospitalaria"
            evidencia = "A1" if situacion == "ALTA" else "A2"
            observaciones = []
            if situacion != "ALTA":
                observaciones.append(
                    f"Situación administrativa en Datos Abiertos CAM: {situacion}. Confirmar la operatividad actual de la unidad con el hospital o la DAT."
                )

        ayto_info = {}
        if municipio == "Madrid":
            matched = match_ayuntamiento_record(
                centro_raw, codigo_postal, telefono, email, lat, lng, ayto_index, codigo=codigo, dubious_log=dubious_ayto_log
            )
            ayto_info = extract_ayto_enrichment(matched)

        extra_apoyos = []
        if codigo == "28021070":
            extra_apoyos.append({
                "need_id": "visual",
                "necesidad": "VISUAL",
                "evidencia": "A1",
                "etapas_con_apoyo": ["infantil", "primaria", "eso"],
                "recursos": [
                    "Atención especializada en ceguera, baja visión y sordoceguera (convenio CAM-ONCE)",
                    "Tiflotecnología, transcripción Braille, orientación y movilidad y residencia escolar",
                ],
                "fuente": (
                    "Portal de Datos Abiertos CAM (CC BY 4.0) y Centro de Recursos Educativos (CRE) ONCE Madrid"
                ),
                "fecha_corte": f"Catálogo CKAN · copia {fecha_es(retrieval_date)}",
                "detalles": (
                    "Centro de Recursos Educativos (CRE) «Antonio Vicente Mosquete» de la ONCE en modalidad de "
                    "Educación Especial para discapacidad visual y sordoceguera. Atiende estancias temporales, "
                    "apoyo itinerante a colegios ordinarios y escolarización específica."
                ),
            })

        out.append({
            "codigo": codigo,
            "nombre": nombre,
            "nombre_oficial": centro_raw,
            "tipo_oficial": tipo_abrv,
            "tipo_general_oficial": tipo_ext,
            "tipo": tipo_app,
            "titularidad": titularidad,
            "modalidad": "especial",
            "dat": str(rec.get("DAT", "") or "").strip(),
            "municipio": municipio,
            "distrito": distrito,
            "barrio": ayto_info.get("barrio", ""),
            "codigo_postal": codigo_postal,
            "direccion": direccion,
            "telefono": telefono,
            "email": email,
            "web": web,
            "necesidad": necesidad_label,
            "need_id": need_id,
            "evidencia": evidencia,
            "situacion_oficial": situacion,
            "etapa_oficial": "EE" if is_cee else "HOSP",
            "etapas_con_apoyo": ["infantil", "primaria", "eso"],
            "etapas_generales_centro": ["infantil", "primaria", "eso"],
            "extra_apoyos": extra_apoyos,
            "latitud": lat,
            "longitud": lng,
            "ubicacion_aproximada": ubicacion_aprox,
            "ubicacion_metodo": ubicacion_metodo,
            "transporte_publico": ayto_info.get("transporte_publico", ""),
            "servicios_ayto": ayto_info.get("servicios", {}),
            "servicios_confirmados_ayto": ayto_info.get("servicios_confirmados_ayto", False),
            "accesibilidad_codigo_ayto": ayto_info.get("accesibilidad_codigo_ayto", ""),
            "accesibilidad_ayto": ayto_info.get("accesibilidad", {}),
            "accesibilidad_confirmada_ayto": ayto_info.get("accesibilidad_confirmada_ayto", False),
            "fuente_ayuntamiento": ayto_info.get("fuente_ayuntamiento", ""),
            "fuente": "Portal de Datos Abiertos CAM · Centros educativos de la Comunidad de Madrid (CC BY 4.0)",
            "fuente_datos_abiertos": "Portal de Datos Abiertos CAM · Centros educativos de la Comunidad de Madrid (CC BY 4.0)",
            "fuente_url": "https://datos.comunidad.madrid/catalogo/dataset/centros_educativos",
            "fecha_informacion": retrieval_date,
            "curso": "Catálogo vigente",
            "observaciones": observaciones,
            "es_sintetico": False,
            "es_demostracion": False,
        })

    return out


PEAC_SEDES_CODES = [
    ("28020892", "Madrid · Salamanca (Sede PEAC)"),
    ("28000522", "Alcalá de Henares (Sede PEAC)"),
    ("28072223", "Leganés (Sede PEAC)"),
    ("28028568", "Móstoles (Sede PEAC)"),
    ("28075510", "Las Rozas de Madrid (Sede PEAC)"),
    ("28023911", "Pozuelo de Alarcón (Sede PEAC)"),
    ("28024642", "San Sebastián de los Reyes (Sede PEAC)"),
]


def normalise_visual_and_aacc_rows(ckan_by_code, existing_codes, ayto_index, municipios, distritos, retrieval_date, dubious_ayto_log):
    """Extrae recursos y EOEP Específicos oficiales verificados (Visual, Altas Capacidades, Auditiva, Motora, TDAH/TEL)."""
    specs = [
        ("28700738", "visual"),
        ("28067501", "visual"),
        ("28701275", "altas_capacidades"),
        ("28701202", "altas_capacidades"),
        ("28700741", "auditiva"),
        ("28700763", "motora"),
        ("28701214", "tdah"),
    ] + [(code, "altas_capacidades") for code, _ in PEAC_SEDES_CODES]

    out = []
    for codigo, need_id in specs:
        if codigo in existing_codes or codigo not in ckan_by_code:
            continue
        rec = ckan_by_code[codigo]
        if str(rec.get("SITUACIÓN", "") or "").strip() != "ALTA":
            continue

        mun_raw = str(rec.get("MUNICIPIO", "") or "").strip()
        dist_raw = str(rec.get("DISTRITO", "") or "").strip()
        municipio, distrito, ref_geo, nivel = resolve_ckan_place(mun_raw, dist_raw, municipios, distritos)

        utm_x = str(rec.get("UTM_X", "") or "").strip()
        utm_y = str(rec.get("UTM_Y", "") or "").strip()
        if utm_x and utm_y:
            lat, lng = utm30n_to_wgs84(float(utm_x), float(utm_y))
            ubicacion_aprox = False
            ubicacion_metodo = (
                "Coordenadas oficiales UTM (ETRS89) del conjunto 'Centros educativos de la Comunidad de Madrid' "
                "(Portal de Datos Abiertos CAM, CC BY 4.0)."
            )
        else:
            lat, lng = float(ref_geo["lat"]), float(ref_geo["lng"])
            ubicacion_aprox = True
            ubicacion_metodo = f"Centroide oficial del {nivel} (IGN) al no constar coordenadas UTM en el catálogo CKAN."

        direccion, codigo_postal, telefono, email, web = extract_contact(rec)
        centro_raw = str(rec.get("CENTRO", "") or "").strip()
        tipo_abrv = str(rec.get("TIPO_ABRV", "") or "").strip()
        tipo_ext = str(rec.get("TIPO_EXT", "") or "").strip()
        tit_raw = str(rec.get("TITULARIDAD", "") or "").strip()
        titularidad = "publico" if tit_raw == "PÚBLICO" else "concertado" if tit_raw == "PRIVADO CONCERTADO" else "privado"

        extra_apoyos = []
        if codigo == "28700741":
            nombre = "EOEP Específico de Deficiencias Auditivas"
            tipo_app = "EOEP Específico"
            modalidad = "ordinaria"
            evidencia = "A1"
            etapas = ["infantil", "primaria", "eso"]
            etapa_oficial = "EOEP REGIONAL"
            necesidad_label = "AUDITIVA"
            observaciones = [
                "Equipo público de ámbito regional: evalúa necesidades de alumnado con sordera o hipoacusia, orienta la modalidad de escolarización (incluido recurso preferente auditivo/LSE) y asesora a centros y familias en toda la Comunidad de Madrid."
            ]
        elif codigo == "28700763":
            nombre = "EOEP Específico de Deficiencias Motóricas"
            tipo_app = "EOEP Específico"
            modalidad = "ordinaria"
            evidencia = "A1"
            etapas = ["infantil", "primaria", "eso"]
            etapa_oficial = "EOEP REGIONAL"
            necesidad_label = "MOTORA"
            observaciones = [
                "Equipo público de ámbito regional: valora necesidades derivadas de discapacidad motora, orienta la escolarización con apoyos (fisioterapia, ATU y adaptaciones de acceso) y asesora a centros educativos en toda la región."
            ]
        elif codigo == "28701214":
            nombre = "EOEP Específico de Dificultades de Aprendizaje, Lenguaje y TDAH"
            tipo_app = "EOEP Específico"
            modalidad = "ordinaria"
            evidencia = "A1"
            etapas = ["infantil", "primaria", "eso", "bachillerato"]
            etapa_oficial = "EOEP REGIONAL"
            necesidad_label = "TDAH"
            observaciones = [
                "Equipo público de ámbito regional para toda la Comunidad de Madrid: asesora a orientadores, colegios e institutos en Dificultades de Aprendizaje, Trastornos del Lenguaje (TDL/TEL) y Trastorno por Déficit de Atención e Hiperactividad (TDAH)."
            ]
            extra_apoyos.append({
                "need_id": "tel_lenguaje",
                "necesidad": "TEL_LENGUAJE",
                "evidencia": "A1",
                "etapas_con_apoyo": ["infantil", "primaria", "eso", "bachillerato"],
                "recursos": [
                    "Asesoramiento técnico regional en Trastornos del Desarrollo del Lenguaje (TDL/TEL)",
                    "Coordinación con los EOEP de sector, Departamentos de Orientación y profesorado de Audición y Lenguaje (AL)",
                ],
                "fuente": "Portal de Datos Abiertos CAM (CC BY 4.0) · Consejería de Educación (EOEP Específico Lenguaje y TDAH)",
                "fecha_corte": f"Catálogo CKAN · copia {fecha_es(retrieval_date)}",
                "detalles": (
                    "Equipo de Orientación Educativa y Psicopedagógica (EOEP) Específico de Dificultades de Aprendizaje, "
                    "Trastornos del Lenguaje y TDAH (código oficial 28701214, situación ALTA). Presta orientación técnica "
                    "regional sobre evaluación e intervención educativa en Trastorno del Lenguaje."
                ),
            })
        elif codigo == "28700738":
            nombre = "EOEP Específico de Deficiencias Visuales"
            tipo_app = "EOEP Específico"
            modalidad = "ordinaria"
            evidencia = "A1"
            etapas = ["infantil", "primaria", "eso"]
            etapa_oficial = "EOEP REGIONAL"
            necesidad_label = "VISUAL"
            observaciones = [
                "Equipo público de ámbito regional: no escolariza directamente, sino que evalúa y asigna maestros itinerantes y tiflotecnología a cualquier centro ordinario de la Comunidad de Madrid."
            ]
        elif codigo == "28067501":
            nombre = "C.R.E. Antonio Vicente Mosquete · ONCE (Primaria y ESO)"
            tipo_app = "CRE ONCE"
            modalidad = "especial"
            evidencia = "A1"
            etapas = ["primaria", "eso"]
            etapa_oficial = "PRI-SEC ONCE"
            necesidad_label = "VISUAL"
            observaciones = [
                "Centro de Recursos Educativos de la ONCE en Madrid para alumnado con discapacidad visual y sordoceguera (etapas Primaria y ESO, estancias temporales y soporte Braille/tiflotecnológico)."
            ]
        elif codigo == "28701275":
            nombre = "CREACIM · Centro Regional de Altas Capacidades"
            tipo_app = "CREACIM"
            modalidad = "ordinaria"
            evidencia = "A1"
            etapas = ["infantil", "primaria", "eso", "bachillerato"]
            etapa_oficial = "CENTRO REGIONAL"
            necesidad_label = "ALTAS_CAPACIDADES"
            observaciones = [
                "Centro público regional que coordina la formación docente, los recursos metodológicos y todas las sedes territoriales del programa PEAC en la Comunidad de Madrid."
            ]
        elif codigo == "28701202":
            nombre = "EOEP Específico de Altas Capacidades"
            tipo_app = "EOEP Específico"
            modalidad = "ordinaria"
            evidencia = "A1"
            etapas = ["infantil", "primaria", "eso", "bachillerato"]
            etapa_oficial = "EOEP REGIONAL"
            necesidad_label = "ALTAS_CAPACIDADES"
            observaciones = [
                "Equipo regional especializado en evaluación psicopedagógica, flexibilización de etapa y asesoramiento a colegios e institutos ordinarios en altas capacidades intelectuales."
            ]
        else:
            nombre = f"IES {title_es(centro_raw)} (Sede PEAC)"
            tipo_app = "IES (Sede PEAC)"
            modalidad = "ordinaria"
            evidencia = "A2"
            etapas = ["primaria", "eso", "bachillerato"]
            etapa_oficial = "SEDE PEAC"
            necesidad_label = "ALTAS_CAPACIDADES"
            observaciones = [
                "Sede territorial oficial del Programa de Enriquecimiento Educativo (PEAC) los sábados quincenales. El alumnado permanece matriculado entre semana en su centro ordinario."
            ]

        ayto_info = {}
        if municipio == "Madrid":
            matched = match_ayuntamiento_record(
                centro_raw, codigo_postal, telefono, email, lat, lng, ayto_index, codigo=codigo, dubious_log=dubious_ayto_log
            )
            ayto_info = extract_ayto_enrichment(matched)

        out.append({
            "codigo": codigo,
            "nombre": nombre,
            "nombre_oficial": centro_raw,
            "tipo_oficial": tipo_abrv,
            "tipo_general_oficial": tipo_ext,
            "tipo": tipo_app,
            "titularidad": titularidad,
            "modalidad": modalidad,
            "dat": str(rec.get("DAT", "") or "").strip(),
            "municipio": municipio,
            "distrito": distrito,
            "barrio": ayto_info.get("barrio", ""),
            "codigo_postal": codigo_postal,
            "direccion": direccion,
            "telefono": telefono,
            "email": email,
            "web": web,
            "necesidad": necesidad_label,
            "need_id": need_id,
            "evidencia": evidencia,
            "situacion_oficial": "ALTA",
            "etapa_oficial": etapa_oficial,
            "etapas_con_apoyo": etapas,
            "etapas_generales_centro": etapas,
            "extra_apoyos": extra_apoyos,
            "latitud": lat,
            "longitud": lng,
            "ubicacion_aproximada": ubicacion_aprox,
            "ubicacion_metodo": ubicacion_metodo,
            "transporte_publico": ayto_info.get("transporte_publico", ""),
            "servicios_ayto": ayto_info.get("servicios", {}),
            "servicios_confirmados_ayto": ayto_info.get("servicios_confirmados_ayto", False),
            "accesibilidad_codigo_ayto": ayto_info.get("accesibilidad_codigo_ayto", ""),
            "accesibilidad_ayto": ayto_info.get("accesibilidad", {}),
            "accesibilidad_confirmada_ayto": ayto_info.get("accesibilidad_confirmada_ayto", False),
            "fuente_ayuntamiento": ayto_info.get("fuente_ayuntamiento", ""),
            "fuente": (
                "Portal de Datos Abiertos CAM (CC BY 4.0) · CRE ONCE Madrid"
                if need_id == "visual" and codigo == "28067501"
                else "Portal de Datos Abiertos CAM (CC BY 4.0) · Consejería de Educación (EOEP Visuales)"
                if need_id == "visual"
                else "Portal de Datos Abiertos CAM (CC BY 4.0) · Consejería de Educación (EOEP Auditivas)"
                if need_id == "auditiva"
                else "Portal de Datos Abiertos CAM (CC BY 4.0) · Consejería de Educación (EOEP Motóricas)"
                if need_id == "motora"
                else "Portal de Datos Abiertos CAM (CC BY 4.0) · Consejería de Educación (EOEP TDAH y Lenguaje)"
                if need_id == "tdah"
                else "Portal de Datos Abiertos CAM (CC BY 4.0) · Consejería de Educación (CREACIM / PEAC)"
            ),
            "fuente_datos_abiertos": "Portal de Datos Abiertos CAM · Centros educativos de la Comunidad de Madrid (CC BY 4.0)",
            "fuente_url": "https://datos.comunidad.madrid/catalogo/dataset/centros_educativos",
            "fecha_informacion": retrieval_date,
            "curso": "Catálogo vigente",
            "observaciones": observaciones,
            "es_sintetico": False,
            "es_demostracion": False,
        })

    return out


def stages_for_aula_enlace(aulas_raw):
    val = (aulas_raw or "").strip().lower()
    if "primaria" in val:
        return ["primaria"], "PRIMARIA"
    if "secundaria" in val:
        return ["eso"], "SECUNDARIA"
    if "mixta" in val:
        return ["primaria", "eso"], "MIXTA"
    raise ValueError(f"Tipo de aula de enlace no reconocido: {aulas_raw}")


def normalise_aulas_enlace_rows(
    enlace_rows,
    enlace_meta,
    tea_rows,
    ckan_by_code,
    ayto_index,
    municipios,
    distritos,
    conflict_log,
    dubious_ayto_log,
):
    """
    Integra las 47 Escuelas de Bienvenida / Aulas de Enlace autorizadas para el curso 2026-2027
    en centros privados concertados (Resolución de 25/08/2026, DG de Educación Concertada CAM):
    - Si el centro ya figura en TEA (10 casos), añade 'compensatoria' en `extra_apoyos`.
    - Si el centro es nuevo (37 casos), crea la entidad normalizada y georreferenciada con CKAN + Ayto.
    """
    tea_by_code = {r["codigo"]: r for r in tea_rows}
    fecha_str = fecha_es(enlace_meta.get("fecha_informacion", "2026-08-25"))
    curso = enlace_meta.get("curso", "2026/2027")
    fuente_texto = (
        f"Comunidad de Madrid · Resolución de Aulas de Enlace en centros sostenidos con fondos públicos, "
        f"curso {curso} (resolución de {fecha_str})"
    )
    fecha_corte_texto = f"Curso {curso} · resolución {fecha_str}"

    new_rows = []
    overlap_count = 0

    for r in enlace_rows:
        codigo = r["codigo_centro"].strip()
        enlace_raw_name = r["centro"].strip()
        aulas_raw = r["aulas"].strip()
        ratio_raw = r["ratio_profesores"].strip()
        etapas_enlace, etapa_oficial = stages_for_aula_enlace(aulas_raw)

        recursos = [
            f"Aula de Enlace autorizada ({aulas_raw}) · ratio {ratio_raw} profesor(es) en curso {curso}",
            "Programa Escuelas de Bienvenida para alumnado de incorporación tardía con desconocimiento del español",
            "Acogida lingüística e integración progresiva en el grupo ordinario (Decreto 23/2023)",
        ]
        detalles = (
            f"Centro autorizado con Aula de Enlace (Escuelas de Bienvenida) para el curso {curso} mediante "
            f"Resolución de la Dirección General de Educación Concertada de {fecha_str}. "
            f"Dotación autorizada: {aulas_raw} (ratio {ratio_raw} profesor/es). Dirigido a alumnado de "
            "incorporación tardía desde 3.º de Educación Primaria o cursos siguientes con desconocimiento de la "
            "lengua española, mediante acogida lingüística y coordinación con su grupo ordinario."
        )

        ckan_rec = ckan_by_code.get(codigo)
        ckan_raw_name = str(ckan_rec.get("CENTRO", "") or "").strip() if ckan_rec else ""
        if ckan_raw_name and compact_alnum(enlace_raw_name) != compact_alnum(ckan_raw_name) and not has_name_overlap(enlace_raw_name, ckan_raw_name):
            conflict_log.append({
                "codigo": codigo,
                "fuente_secundaria": "Aulas de Enlace 2026/27",
                "nombre_ckan_cam": ckan_raw_name,
                "nombre_resolucion_enlace": enlace_raw_name,
                "criterio_aplicado": "Se usa la denominación oficial del registro CAM (CKAN).",
            })

        if codigo in tea_by_code:
            overlap_count += 1
            existing = tea_by_code[codigo]
            existing.setdefault("extra_apoyos", []).append({
                "need_id": "compensatoria",
                "necesidad": "COMPENSATORIA",
                "evidencia": "A1",
                "etapas_con_apoyo": etapas_enlace,
                "recursos": recursos,
                "fuente": fuente_texto,
                "fecha_corte": fecha_corte_texto,
                "detalles": detalles,
            })
            existing.setdefault("observaciones", []).append(
                f"Autorizado también como Escuela de Bienvenida (Aula de Enlace) para el curso {curso} "
                f"({aulas_raw}, ratio {ratio_raw} profesor/es según Resolución de {fecha_str})."
            )
            continue

        if ckan_rec:
            mun_raw = str(ckan_rec.get("MUNICIPIO", "") or "").strip()
            dist_raw = str(ckan_rec.get("DISTRITO", "") or "").strip()
            municipio, distrito, ref_geo, nivel = resolve_ckan_place(mun_raw, dist_raw, municipios, distritos)
        else:
            dat_key = "DAT CAPITAL" if "CAPITAL" in r["dat"].upper() else r["dat"].strip()
            municipio, distrito, ref_geo, nivel = resolve_place(
                r["municipio_o_distrito"].strip(), dat_key, municipios, distritos
            )

        utm_x = str(ckan_rec.get("UTM_X", "") or "").strip() if ckan_rec else ""
        utm_y = str(ckan_rec.get("UTM_Y", "") or "").strip() if ckan_rec else ""
        if ckan_rec and utm_x and utm_y:
            lat, lng = utm30n_to_wgs84(float(utm_x), float(utm_y))
            ubicacion_aprox = False
            ubicacion_metodo = (
                "Coordenadas oficiales UTM (ETRS89) del conjunto 'Centros educativos de la Comunidad de Madrid' "
                "(Portal de Datos Abiertos CAM, CC BY 4.0)."
            )
        else:
            lat, lng = float(ref_geo["lat"]), float(ref_geo["lng"])
            ubicacion_aprox = True
            ubicacion_metodo = f"Centroide oficial del {nivel} (IGN) al no constar coordenadas UTM en CKAN."

        direccion, codigo_postal, telefono, email, web = extract_contact(ckan_rec)
        tipo_general_ckan = str(ckan_rec.get("TIPO_EXT", "") or "").strip() if ckan_rec else ""
        ckan_tipo_abrv = str(ckan_rec.get("TIPO_ABRV", "") or "").strip() if ckan_rec else ""
        raw_name = ckan_raw_name or enlace_raw_name

        tipo_app, titularidad, centre_stages, prefijo = TIPO_INFO.get(
            ckan_tipo_abrv, ("Colegio Concertado", "concertado", etapas_enlace, "Colegio")
        )
        nombre_base = title_es(raw_name)
        lower_base = nombre_base.lower()
        if prefijo and not lower_base.startswith(("colegio", "real colegio", "agrupación escolar", "instituto", "ciudadescuela")):
            nombre = f"{prefijo} {nombre_base}"
        else:
            nombre = nombre_base

        ayto_info = {}
        if municipio == "Madrid":
            matched = match_ayuntamiento_record(
                raw_name, codigo_postal, telefono, email, lat, lng, ayto_index, codigo=codigo, dubious_log=dubious_ayto_log
            )
            ayto_info = extract_ayto_enrichment(matched)

        observaciones = [
            f"Escuela de Bienvenida (Aula de Enlace) autorizada para el curso {curso}: {aulas_raw}, ratio {ratio_raw} profesor/es."
        ]

        new_rows.append({
            "codigo": codigo,
            "nombre": nombre,
            "nombre_oficial": raw_name,
            "tipo_oficial": ckan_tipo_abrv or "CPR",
            "tipo_general_oficial": tipo_general_ckan or "CENTRO PRIVADO CONCERTADO",
            "tipo": tipo_app,
            "titularidad": titularidad,
            "modalidad": "preferente",
            "dat": str(ckan_rec.get("DAT", "") or r["dat"]).strip() if ckan_rec else r["dat"].strip(),
            "municipio": municipio,
            "distrito": distrito,
            "barrio": ayto_info.get("barrio", ""),
            "codigo_postal": codigo_postal,
            "direccion": direccion,
            "telefono": telefono,
            "email": email,
            "web": web,
            "necesidad": "COMPENSATORIA",
            "need_id": "compensatoria",
            "evidencia": "A1",
            "situacion_oficial": str(ckan_rec.get("SITUACIÓN", "ALTA") or "ALTA").strip() if ckan_rec else "ALTA",
            "etapa_oficial": etapa_oficial,
            "etapas_con_apoyo": etapas_enlace,
            "etapas_generales_centro": centre_stages or etapas_enlace,
            "extra_apoyos": [],
            "aulas_enlace_info": {
                "aulas": aulas_raw,
                "ratio_profesores": ratio_raw,
                "curso": curso,
                "fecha_resolucion": enlace_meta.get("fecha_informacion", "2026-08-25"),
                "recursos": recursos,
                "detalles": detalles,
            },
            "latitud": lat,
            "longitud": lng,
            "ubicacion_aproximada": ubicacion_aprox,
            "ubicacion_metodo": ubicacion_metodo,
            "transporte_publico": ayto_info.get("transporte_publico", ""),
            "servicios_ayto": ayto_info.get("servicios", {}),
            "servicios_confirmados_ayto": ayto_info.get("servicios_confirmados_ayto", False),
            "accesibilidad_codigo_ayto": ayto_info.get("accesibilidad_codigo_ayto", ""),
            "accesibilidad_ayto": ayto_info.get("accesibilidad", {}),
            "accesibilidad_confirmada_ayto": ayto_info.get("accesibilidad_confirmada_ayto", False),
            "fuente_ayuntamiento": ayto_info.get("fuente_ayuntamiento", ""),
            "fuente": fuente_texto,
            "fuente_datos_abiertos": (
                "Portal de Datos Abiertos CAM · Centros educativos de la Comunidad de Madrid (CC BY 4.0)"
                if ckan_rec
                else ""
            ),
            "fuente_url": enlace_meta.get("url", ""),
            "fecha_informacion": enlace_meta.get("fecha_informacion", "2026-08-25"),
            "curso": curso,
            "observaciones": observaciones,
            "es_sintetico": False,
            "es_demostracion": False,
        })

    return new_rows, overlap_count


def ingest_official_data():
    print("[Pipeline - Ingest] Cargando relación TEA, Aulas de Enlace 2026/27, Datos Abiertos CAM y Ayto. de Madrid...")
    os.makedirs(OUTPUT_RAW_DIR, exist_ok=True)
    os.makedirs(OUTPUT_PROC_DIR, exist_ok=True)
    os.makedirs(REVIEW_DIR, exist_ok=True)

    municipios, distritos = load_reference()
    snapshot_rows, snap_meta, csv_sha = load_snapshot()
    snapshot_codes = [r["codigo_centro"].strip() for r in snapshot_rows]
    print(f"  ✓ Instantánea TEA versionada: {len(snapshot_rows)} centros ({SNAPSHOT_CSV}, SHA-256 {csv_sha[:16]}…)")

    enlace_rows, enlace_meta, enlace_sha = load_aulas_enlace_snapshot()
    enlace_codes = [r["codigo_centro"].strip() for r in enlace_rows]
    if enlace_rows:
        print(
            f"  ✓ Instantánea Aulas de Enlace 2026/27: {len(enlace_rows)} centros concertados "
            f"({ENLACE_CSV}, SHA-256 {enlace_sha[:16]}…)"
        )

    status, pdf_info = verify_against_official(snap_meta, snapshot_codes)
    enlace_status, enlace_pdf_info = verify_aulas_enlace_against_official(enlace_meta, enlace_codes)
    ckan_by_code, ckan_status, ckan_sha, ckan_url, ckan_date = load_ckan_all()
    ayto_rows, ayto_status, ayto_sha, ayto_date = load_ayuntamiento_centres()
    ayto_index = build_ayto_index(ayto_rows)

    meta_path = os.path.join(OUTPUT_RAW_DIR, "metadata.json")
    prev_meta_path = os.path.join(OUTPUT_RAW_DIR, "metadata_previous.json")
    if os.path.exists(meta_path):
        shutil.copyfile(meta_path, prev_meta_path)

    retrieved_at = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    conflict_log = []
    dubious_ayto_log = []

    tea_rows = normalise_tea_rows(
        snapshot_rows, snap_meta, ckan_by_code, ayto_index, municipios, distritos, conflict_log, dubious_ayto_log
    )
    enlace_new_rows, enlace_overlap_count = normalise_aulas_enlace_rows(
        enlace_rows, enlace_meta, tea_rows, ckan_by_code, ayto_index, municipios, distritos, conflict_log, dubious_ayto_log
    )
    seen_codes = {r["codigo"] for r in tea_rows} | {r["codigo"] for r in enlace_new_rows}
    extra_rows = normalise_cee_and_hospital_rows(
        ckan_by_code, seen_codes, ayto_index, municipios, distritos, ckan_date, dubious_ayto_log
    )
    seen_codes.update(r["codigo"] for r in extra_rows)
    visual_aacc_rows = normalise_visual_and_aacc_rows(
        ckan_by_code, seen_codes, ayto_index, municipios, distritos, ckan_date, dubious_ayto_log
    )

    conflicts_path = os.path.join(REVIEW_DIR, "conflictos_nombres.json")
    with open(conflicts_path, "w", encoding="utf-8") as f:
        json.dump({
            "detectado": retrieved_at,
            "total_conflictos": len(conflict_log),
            "conflictos": conflict_log,
        }, f, indent=2, ensure_ascii=False)
    print(f"  ✓ Revisión nominal automática: {len(conflict_log)} conflictos registrados en {conflicts_path}")

    dubious_path = os.path.join(REVIEW_DIR, "ayto_matches_dudosos.json")
    with open(dubious_path, "w", encoding="utf-8") as f:
        json.dump({
            "detectado": retrieved_at,
            "total_descartados": len(dubious_ayto_log),
            "candidatos": dubious_ayto_log,
        }, f, indent=2, ensure_ascii=False)
    print(f"  ✓ Revisión de cruces Ayto. Madrid: {len(dubious_ayto_log)} candidatos descartados registrados en {dubious_path}")

    rows = tea_rows + enlace_new_rows + extra_rows + visual_aacc_rows
    cee_count = sum(1 for r in rows if r["need_id"] == "educacion_especial")
    hosp_count = sum(1 for r in rows if r["need_id"] == "salud_hospitalaria")
    enlace_count = sum(
        1 for r in rows
        if r["need_id"] == "compensatoria" or any(a.get("need_id") == "compensatoria" for a in r.get("extra_apoyos", []))
    )
    visual_count = sum(
        1 for r in rows
        if r["need_id"] == "visual" or any(a.get("need_id") == "visual" for a in r.get("extra_apoyos", []))
    )
    aacc_count = sum(
        1 for r in rows
        if r["need_id"] == "altas_capacidades"
        or any(a.get("need_id") == "altas_capacidades" for a in r.get("extra_apoyos", []))
    )
    auditiva_count = sum(1 for r in rows if r["need_id"] == "auditiva" or any(a.get("need_id") == "auditiva" for a in r.get("extra_apoyos", [])))
    motora_count = sum(1 for r in rows if r["need_id"] == "motora" or any(a.get("need_id") == "motora" for a in r.get("extra_apoyos", [])))
    tdah_count = sum(1 for r in rows if r["need_id"] == "tdah" or any(a.get("need_id") == "tdah" for a in r.get("extra_apoyos", [])))
    tel_count = sum(1 for r in rows if r["need_id"] == "tel_lenguaje" or any(a.get("need_id") == "tel_lenguaje" for a in r.get("extra_apoyos", [])))
    exact_count = sum(1 for r in rows if not r["ubicacion_aproximada"])
    ayto_matched_count = sum(1 for r in rows if r.get("fuente_ayuntamiento"))
    ayto_transit_count = sum(1 for r in rows if r.get("transporte_publico"))
    ayto_services_count = sum(1 for r in rows if r.get("servicios_confirmados_ayto"))
    ayto_acc_count = sum(1 for r in rows if r.get("accesibilidad_confirmada_ayto"))

    metadata = {
        "url": snap_meta["url"],
        "aulas_enlace_url": enlace_meta.get("url"),
        "aulas_enlace_portal_url": enlace_meta.get("portal_url"),
        "aulas_enlace_curso": enlace_meta.get("curso"),
        "aulas_enlace_fecha_informacion": enlace_meta.get("fecha_informacion"),
        "aulas_enlace_status": enlace_status,
        "aulas_enlace_sha256": enlace_sha,
        "aulas_enlace_pdf_sha256": enlace_pdf_info.get("pdf_sha256"),
        "aulas_enlace_solapamientos_tea": enlace_overlap_count,
        "ckan_dataset_url": ckan_url,
        "ayto_dataset_url": "https://datos.madrid.es/egob/catalogo/300614-0-centros-educativos.csv",
        "retrieved_at": retrieved_at,
        "sha256": csv_sha,
        "sha256_de": SNAPSHOT_CSV,
        "pdf_sha256": pdf_info["pdf_sha256"],
        "pdf_codigos_extraidos": pdf_info["pdf_codigos"],
        "status": status,
        "ckan_status": ckan_status,
        "ckan_sha256": ckan_sha,
        "ckan_fecha_descarga": ckan_date,
        "ayto_status": ayto_status,
        "ayto_sha256": ayto_sha,
        "ayto_fecha_descarga": ayto_date,
        "conflictos_nominales": len(conflict_log),
        "cruces_ayto_descartados": len(dubious_ayto_log),
        "bytes": os.path.getsize(SNAPSHOT_CSV),
        "data_mode": "OFFICIAL_DATA",
        "fecha_informacion": snap_meta["fecha_informacion"],
        "curso": snap_meta["curso"],
        "counts": {
            "total": len(rows),
            "tea": len(tea_rows),
            "compensatoria": enlace_count,
            "educacion_especial": cee_count,
            "salud_hospitalaria": hosp_count,
            "visual": visual_count,
            "altas_capacidades": aacc_count,
            "auditiva": auditiva_count,
            "motora": motora_count,
            "tdah": tdah_count,
            "tel_lenguaje": tel_count,
            "exact_location": exact_count,
            "ayto_matched": ayto_matched_count,
            "ayto_transit": ayto_transit_count,
            "ayto_services": ayto_services_count,
            "ayto_accessibility": ayto_acc_count,
        },
    }
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    proc_path = os.path.join(OUTPUT_PROC_DIR, "schools_extracted.json")
    with open(proc_path, "w", encoding="utf-8") as f:
        json.dump({
            "ingestion_metadata": metadata,
            "total_records": len(rows),
            "exact_location_records": exact_count,
            "is_demonstration_sample": False,
            "alcance": snap_meta["alcance"],
            "alcance_aulas_enlace": enlace_meta.get("alcance", ""),
            "advertencia_oficial": snap_meta["advertencia_oficial"],
            "rows": rows,
        }, f, indent=2, ensure_ascii=False)

    print(
        f"  ✓ Ingesta completada ({status} | Enlace: {enlace_status} | {ckan_status} ({ckan_date}) | {ayto_status} ({ayto_date})). "
        f"{len(rows)} centros reales normalizados (TEA: {len(tea_rows)}, Aulas de Enlace: {enlace_count} "
        f"[{len(enlace_new_rows)} nuevos + {enlace_overlap_count} con TEA], CEE: {cee_count}, Hospitalaria: {hosp_count}, "
        f"Visual: {visual_count}, Altas Capacidades: {aacc_count}, Auditiva: {auditiva_count}, "
        f"Motora: {motora_count}, TDAH: {tdah_count}, TEL: {tel_count}; "
        f"{exact_count} coordenadas exactas, {ayto_matched_count} enriquecidos con Ayto. Madrid)."
    )
    return metadata


if __name__ == "__main__":
    ingest_official_data()
