#!/usr/bin/env python3
"""
Convierte los centros oficiales procesados por el pipeline
(data/processed/schools_extracted.json) en el módulo TypeScript que consume la web:

  src/data/officialTea.ts   -> OFFICIAL_TEA_SCHOOLS, OFFICIAL_TEA_SOURCE, OFFICIAL_MUNICIPALITIES

No añade ningún dato que no esté en la fuente: dirección, teléfono, servicios y
accesibilidad quedan vacíos y marcados como "sin datos en la fuente oficial".
La continuidad hacia Secundaria se deriva del propio listado (centros preferentes
TEA con etapa Secundaria en el mismo distrito o municipio) y se presenta como
"centros de la zona", nunca como adscripción.

Uso: python scripts/build_app_data.py
"""

import json
import math
import os

INPUT = "data/processed/schools_extracted.json"
MUNICIPIOS_CSV = "data/reference/municipios_madrid_centroides.csv"
OUTPUT = "src/data/officialTea.ts"

ETAPA_LABEL = {"PRIMARIA": "Primaria", "SECUNDARIA": "Secundaria", "MIXTA": "Mixta", "INFANTIL": "Infantil"}


def km(a, b):
    dlat = math.radians(b["latitud"] - a["latitud"])
    dlng = math.radians(b["longitud"] - a["longitud"])
    h = (math.sin(dlat / 2) ** 2 + math.cos(math.radians(a["latitud"])) * math.cos(math.radians(b["latitud"]))
         * math.sin(dlng / 2) ** 2)
    return 6371 * 2 * math.asin(math.sqrt(h))


def zone(r):
    return (r["municipio"], r["distrito"])


def continuity(r, rows):
    stages = r["etapas_con_apoyo"]
    zona = f"el distrito de {r['distrito']}" if r["distrito"] else f"{r['municipio']}"
    if "eso" in stages and len(stages) > 1:
        return {
            "tipoContinuidad": "mismo_centro",
            "descripcion": "El listado oficial indica la etapa «Mixta»: el apoyo TEA figura en más de una etapa "
                           "del propio centro.",
            "apoyoEnSecundariaVerificado": True,
            "destinos": [],
        }
    if stages == ["eso"]:
        return {
            "tipoContinuidad": "mismo_centro",
            "descripcion": "Centro de Secundaria con atención preferente TEA según el listado oficial.",
            "apoyoEnSecundariaVerificado": True,
            "destinos": [],
        }
    candidates = [o for o in rows if o is not r and zone(o) == zone(r) and "eso" in o["etapas_con_apoyo"]]
    candidates.sort(key=lambda o: (km(r, o), o["codigo"]))
    destinos = [{
        "codigo": o["codigo"],
        "nombre": o["nombre"],
        "etapa": "Secundaria (ESO)",
        "municipio": o["municipio"],
        **({"distrito": o["distrito"]} if o["distrito"] else {}),
        "tieneMismoApoyo": True,
        "detallesApoyo": "Centro preferente TEA con Secundaria en el mismo listado oficial. "
                         "No implica adscripción.",
        "lat": o["latitud"],
        "lng": o["longitud"],
    } for o in candidates[:4]]
    if destinos:
        n = len(candidates)
        quantity = "un centro preferente TEA" if n == 1 else f"{n} centros preferentes TEA"
        desc = (f"La fuente oficial no publica a qué instituto está adscrito este centro. En {zona} el listado "
                f"oficial incluye {quantity} con Secundaria.")
    else:
        desc = (f"La fuente oficial no publica a qué instituto está adscrito este centro, y en {zona} el listado "
                f"no incluye centros preferentes TEA con Secundaria con plazas previstas. Consulta el listado "
                f"completo o el Servicio de Apoyo a la Escolarización (SAE).")
    return {
        "tipoContinuidad": "zona",
        "descripcion": desc,
        "apoyoEnSecundariaVerificado": "no_verificado",
        "destinos": destinos,
    }


def to_school(r, rows, meta):
    etapa = ETAPA_LABEL.get(r["etapa_oficial"], r["etapa_oficial"])
    detalle = (
        "Centro de atención preferente para alumnado con TEA. Figura en la relación oficial de centros con "
        "plazas previsibles en el aula de apoyo extenso y especializado (aula TEA): menos de cinco alumnos "
        f"atendidos en el aula a {fecha_es(meta['fecha_informacion'])}. Etapa indicada en el listado: {etapa}. "
        "La situación puede haber cambiado desde entonces."
    )
    school = {
        "id": f"oficial-tea-{r['codigo']}",
        "codigo": r["codigo"],
        "nombre": r["nombre"],
        "titularidad": r["titularidad"],
        "tipo": r["tipo"],
        "modalidad": "preferente",
        "municipio": r["municipio"],
        **({"distrito": r["distrito"]} if r["distrito"] else {}),
        "codigoPostal": "",
        "direccion": "",
        "telefono": "",
        "email": "",
        "lat": r["latitud"],
        "lng": r["longitud"],
        "etapas": r["etapas_con_apoyo"],
        "apoyos": [{
            "needId": "tea",
            "evidencia": "A2",
            "etapasConApoyo": r["etapas_con_apoyo"],
            "recursosOficiales": [],
            "fuenteOficial": r["fuente"],
            "fechaCorte": f"Curso {meta['curso']} · información a {fecha_es(meta['fecha_informacion'])}",
            "detallesResolucion": detalle,
        }],
        "servicios": {k: False for k in ["comedor", "transporte", "aula_matinal", "enfermeria",
                                          "actividades_extraescolares"]},
        "accesibilidad": {k: False for k in ["acceso_fisico", "ascensor", "bano_adaptado", "bucle_magnetico",
                                              "plano_podotactil"]},
        "continuidad": continuity(r, rows),
        "procedencia": "oficial",
        "ubicacionAproximada": True,
        "fuenteUrl": r["fuente_url"],
        "nombreOficial": r["nombre_oficial"],
        "tipoOficial": r["tipo_oficial"],
    }
    if r["observaciones"]:
        school["observacionesOficiales"] = " ".join(r["observaciones"])
    return school


def fecha_es(iso_date):
    y, m, d = iso_date.split("-")
    return f"{d}/{m}/{y}"


def municipalities(rows):
    import csv
    ref = {}
    with open(MUNICIPIOS_CSV, encoding="utf-8") as f:
        for m in csv.DictReader(f):
            ref[m["municipio"]] = m
    out = []
    for name in sorted({r["municipio"] for r in rows if r["municipio"] != "Madrid"}):
        m = ref[name]
        out.append({"id": name, "nombre": name, "lat": float(m["lat"]), "lng": float(m["lng"])})
    return out


def main():
    with open(INPUT, encoding="utf-8") as f:
        data = json.load(f)
    rows = data["rows"]
    meta = data["ingestion_metadata"]
    if any(r.get("es_demostracion") for r in rows):
        raise SystemExit("El fichero procesado contiene registros de demostración; no se genera el módulo oficial.")

    schools = [to_school(r, rows, meta) for r in rows]
    source = {
        "titulo": "Escolarización en centros de atención preferente para alumnado con TEA",
        "organismo": "Comunidad de Madrid · Consejería de Educación",
        "url": meta["url"],
        "curso": meta["curso"],
        "fechaInformacion": fecha_es(meta["fecha_informacion"]),
        "totalCentros": len(schools),
        "estadoVerificacion": meta["status"],
        "alcance": data.get("alcance", ""),
        "listadoCompletoUrl": "https://www.comunidad.madrid/servicios/educacion/"
                              "atencion-preferente-necesidades-educativas-especiales",
    }

    def js(obj):
        return json.dumps(obj, ensure_ascii=False, indent=2)

    content = f"""/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ARCHIVO GENERADO AUTOMÁTICAMENTE por scripts/build_app_data.py — no editar a mano.
 *
 * Datos OFICIALES: relación de centros de atención preferente para alumnado con TEA
 * publicada por la Comunidad de Madrid (curso {meta['curso']}, información a {fecha_es(meta['fecha_informacion'])}).
 * Fuente: {meta['url']}
 *
 * Ubicaciones APROXIMADAS (centroide del municipio o distrito): el documento
 * oficial no publica direcciones. Servicios y accesibilidad: sin datos en la fuente.
 */

import {{ MunicipalityOption, School }} from '../types';

export const OFFICIAL_TEA_SOURCE = {js(source)} as const;

export const OFFICIAL_MUNICIPALITIES: MunicipalityOption[] = {js(municipalities(rows))};

export const OFFICIAL_TEA_SCHOOLS: School[] = {js(schools)};
"""
    with open(OUTPUT, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  ✓ {OUTPUT} generado ({len(schools)} centros oficiales)")


if __name__ == "__main__":
    main()
