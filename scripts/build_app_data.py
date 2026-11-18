#!/usr/bin/env python3
"""
Convierte los centros oficiales procesados por el pipeline
(data/processed/schools_extracted.json) en el módulo TypeScript que consume la web:

  public/data/centros.json -> catálogo completo oficial (carga asíncrona cacheable)
  src/data/officialTea.ts  -> OFFICIAL_TEA_SOURCE, OFFICIAL_MUNICIPALITIES (metadatos ligeros)
"""

import csv
import json
import os

INPUT = "data/processed/schools_extracted.json"
MUNICIPIOS_CSV = "data/reference/municipios_madrid_centroides.csv"
OUTPUT = "src/data/officialTea.ts"
OUTPUT_JSON = "public/data/centros.json"

ETAPA_LABEL = {"PRIMARIA": "Primaria", "SECUNDARIA": "Secundaria", "MIXTA": "Mixta", "INFANTIL": "Infantil"}

DEFAULT_SERVICES = {
    "comedor": False,
    "transporte": False,
    "aula_matinal": False,
    "enfermeria": False,
    "actividades_extraescolares": False,
}

DEFAULT_ACCESSIBILITY = {
    "acceso_fisico": False,
    "ascensor": False,
    "bano_adaptado": False,
    "bucle_magnetico": False,
    "plano_podotactil": False,
}


def km(a, b):
    dlat = 0.017453292519943295 * (b["latitud"] - a["latitud"])
    dlng = 0.017453292519943295 * (b["longitud"] - a["longitud"])
    import math
    h = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(a["latitud"]))
        * math.cos(math.radians(b["latitud"]))
        * math.sin(dlng / 2) ** 2
    )
    return 6371 * 2 * math.asin(math.sqrt(h))


def zone(r):
    return (r["municipio"], r["distrito"])


def fecha_es(iso_date):
    y, m, d = iso_date.split("-")
    return f"{d}/{m}/{y}"


def continuity(r, tea_rows):
    need_id = r["need_id"]
    if need_id == "educacion_especial":
        return {
            "tipoContinuidad": "mismo_centro",
            "descripcion": (
                "Los Centros de Educación Especial (CEE) escolarizan de forma continuada etapas de "
                "Infantil, Educación Básica Obligatoria (EBO, equivalente en edad a Primaria y ESO) "
                "y Programas de Transición a la Vida Adulta (PTVA)."
            ),
            "apoyoEnSecundariaVerificado": True,
            "destinos": [],
        }
    if need_id == "salud_hospitalaria":
        return {
            "tipoContinuidad": "mismo_centro",
            "descripcion": (
                "Unidad escolar de atención temporal durante la hospitalización en todas las etapas obligatorias, "
                "coordinada con el centro ordinario o de referencia del alumno."
            ),
            "apoyoEnSecundariaVerificado": True,
            "destinos": [],
        }
    if need_id == "visual":
        return {
            "tipoContinuidad": "mismo_centro",
            "descripcion": (
                "La atención al alumnado con discapacidad visual acompaña toda la escolarización en cualquier centro "
                "ordinario mediante el profesorado itinerante del EOEP Específico y el convenio CAM–ONCE."
            ),
            "apoyoEnSecundariaVerificado": True,
            "destinos": [],
        }
    if need_id == "altas_capacidades":
        return {
            "tipoContinuidad": "mismo_centro",
            "descripcion": (
                "El alumnado permanece matriculado en su centro ordinario y accede mediante propuesta de orientación "
                "al enriquecimiento del programa PEAC (sábados, Primaria, ESO y Bachillerato) coordinado por CREACIM."
            ),
            "apoyoEnSecundariaVerificado": True,
            "destinos": [],
        }
    if need_id == "auditiva":
        return {
            "tipoContinuidad": "mismo_centro",
            "descripcion": (
                "El EOEP Específico de Deficiencias Auditivas orienta la escolarización y la continuidad en todas "
                "las etapas en centros ordinarios y centros preferentes auditivos de la Comunidad de Madrid."
            ),
            "apoyoEnSecundariaVerificado": True,
            "destinos": [],
        }
    if need_id == "motora":
        return {
            "tipoContinuidad": "mismo_centro",
            "descripcion": (
                "El EOEP Específico de Deficiencias Motóricas asesora la continuidad en todas las etapas obligatorias "
                "para dotación de fisioterapia, auxiliares técnicos educativos (ATU) y accesibilidad."
            ),
            "apoyoEnSecundariaVerificado": True,
            "destinos": [],
        }
    if need_id in ("tdah", "tel_lenguaje"):
        return {
            "tipoContinuidad": "mismo_centro",
            "descripcion": (
                "El EOEP Específico de Dificultades de Aprendizaje, Trastornos del Lenguaje y TDAH presta asesoramiento "
                "regional transversal a centros de Infantil, Primaria, Secundaria y Bachillerato."
            ),
            "apoyoEnSecundariaVerificado": True,
            "destinos": [],
        }
    if need_id == "compensatoria":
        if "eso" in r["etapas_con_apoyo"]:
            return {
                "tipoContinuidad": "mismo_centro",
                "descripcion": (
                    "Centro concertado autorizado con Aula de Enlace en Secundaria (o mixta Primaria–ESO) para el "
                    "curso 2026/2027. La incorporación al Aula de Enlace es temporal y simultánea a la "
                    "escolarización en el grupo ordinario del propio centro."
                ),
                "apoyoEnSecundariaVerificado": True,
                "destinos": [],
            }
        return {
            "tipoContinuidad": "zona",
            "descripcion": (
                "Aula de Enlace autorizada específicamente en etapa de Educación Primaria para el curso 2026/2027. "
                "La medida es temporal hasta la plena incorporación al grupo ordinario; para continuar en Secundaria "
                "con Aula de Enlace en caso necesario conviene consultar centros mixtos o el SAE correspondiente."
            ),
            "apoyoEnSecundariaVerificado": "no_verificado",
            "destinos": [],
        }

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
    candidates = [o for o in tea_rows if o is not r and zone(o) == zone(r) and "eso" in o["etapas_con_apoyo"]]
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
        "distanciaKm": round(km(r, o), 1),
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


def to_school(r, tea_rows, meta):
    need_id = r["need_id"]
    if need_id == "tea":
        etapa = ETAPA_LABEL.get(r["etapa_oficial"], r["etapa_oficial"])
        detalle = (
            "Centro de atención preferente para alumnado con TEA. Figura en la relación oficial de centros con "
            "plazas previsibles en el aula de apoyo extenso y especializado (aula TEA): menos de cinco alumnos "
            f"atendidos en el aula a {fecha_es(meta['fecha_informacion'])}. Etapa TEA en el listado: {etapa}. "
            "La situación puede haber cambiado desde entonces."
        )
        fecha_corte = f"Curso {meta['curso']} · información a {fecha_es(meta['fecha_informacion'])}"
        recursos = []
        id_prefix = "oficial-tea"
    elif need_id == "educacion_especial":
        detalle = (
            "Centro específico de Educación Especial inscrito en situación ALTA en el Portal de Datos Abiertos de la "
            "Comunidad de Madrid (CC BY 4.0). Escolariza alumnado con NEE permanentes según dictamen técnico de "
            "escolarización del EOEP y resolución de la DAT."
        )
        fecha_corte = f"Catálogo CKAN · copia {fecha_es(r['fecha_informacion'])}"
        recursos = [
            "Profesorado especialista en Pedagogía Terapéutica (PT) y Audición y Lenguaje (AL)",
            "Atención en Infantil Especial, Educación Básica Obligatoria (EBO) y PTVA según proyecto del centro",
        ]
        id_prefix = "oficial-cee"
    elif need_id == "salud_hospitalaria":
        sit = r.get("situacion_oficial", "ALTA")
        detalle = (
            f"Aula Hospitalaria registrada en el Portal de Datos Abiertos CAM (situación administrativa: {sit}) "
            "para garantizar la continuidad educativa del alumnado convaleciente durante la hospitalización."
        )
        fecha_corte = f"Catálogo CKAN ({sit}) · copia {fecha_es(r['fecha_informacion'])}"
        recursos = [
            "Atención educativa individualizada y coordinación con el centro de referencia del alumno",
        ]
        id_prefix = "oficial-hosp"
    elif need_id == "visual":
        if r["codigo"] == "28700738":
            detalle = (
                "Equipo de Orientación Educativa y Psicopedagógica (EOEP) Específico de Deficiencias Visuales de la "
                "Comunidad de Madrid. De ámbito regional: evalúa y asigna maestros itinerantes, adaptación Braille y "
                "tiflotecnología a cualquier colegio ordinario."
            )
            recursos = [
                "Asesoramiento psicopedagógico regional a centros ordinarios y familias",
                "Asignación de maestros itinerantes y tiflotecnología (convenio CAM–ONCE)",
            ]
        else:
            detalle = (
                "Centro de Recursos Educativos (CRE) «Antonio Vicente Mosquete» de la ONCE en Madrid para alumnado con "
                "ceguera, baja visión o sordoceguera (etapas Primaria y ESO, estancias temporales y soporte Braille)."
            )
            recursos = [
                "Atención educativa específica, tiflotecnología y transcripción Braille",
                "Programas de autonomía personal, orientación y movilidad y residencia escolar",
            ]
        fecha_corte = f"Catálogo CKAN · copia {fecha_es(r['fecha_informacion'])}"
        id_prefix = "oficial-vis"
    elif need_id == "auditiva":
        detalle = (
            "Equipo de Orientación Educativa y Psicopedagógica (EOEP) Específico de Deficiencias Auditivas "
            "(código oficial 28700741, situación ALTA). Equipo público de ámbito regional: evalúa e informa la "
            "escolarización con apoyos auditivos (LSE, audición y lenguaje y equipos FM) en centros de toda la CAM."
        )
        recursos = [
            "Valoración psicopedagógica especializada de ámbito regional en sordera e hipoacusia",
            "Orientación sobre centros preferentes auditivos, Lengua de Signos Española (LSE) y ayudas técnicas",
        ]
        fecha_corte = f"Catálogo CKAN · copia {fecha_es(r['fecha_informacion'])}"
        id_prefix = "oficial-aud"
    elif need_id == "motora":
        detalle = (
            "Equipo de Orientación Educativa y Psicopedagógica (EOEP) Específico de Deficiencias Motóricas "
            "(código oficial 28700763, situación ALTA). Equipo público regional que valora necesidades de acceso, "
            "fisioterapia y auxiliar técnico educativo (ATU) para la escolarización ordinaria y preferente motora."
        )
        recursos = [
            "Evaluación regional de movilidad, accesibilidad de acceso al currículo y adaptaciones",
            "Orientación sobre centros preferentes motóricos y dotación de fisioterapia y personal ATU",
        ]
        fecha_corte = f"Catálogo CKAN · copia {fecha_es(r['fecha_informacion'])}"
        id_prefix = "oficial-mot"
    elif need_id == "tdah":
        detalle = (
            "Equipo de Orientación Educativa y Psicopedagógica (EOEP) Específico de Dificultades de Aprendizaje, "
            "Trastornos del Lenguaje y TDAH (código oficial 28701214, situación ALTA). Presta asesoramiento técnico "
            "regional a orientadores, docentes y familias de toda la Comunidad de Madrid."
        )
        recursos = [
            "Asesoramiento regional especializado en TDAH, dislexia y dificultades de aprendizaje",
            "Orientación metodológica y de medidas ordinarias/específicas en Infantil, Primaria, ESO y Bachillerato",
        ]
        fecha_corte = f"Catálogo CKAN · copia {fecha_es(r['fecha_informacion'])}"
        id_prefix = "oficial-eoep"
    elif need_id == "compensatoria":
        info = r.get("aulas_enlace_info") or {}
        detalle = info.get("detalles") or (
            "Centro concertado autorizado con Aula de Enlace (Escuelas de Bienvenida) para el curso 2026/2027 "
            "según Resolución de la DG de Educación Concertada de 25/08/2026."
        )
        recursos = info.get("recursos") or [
            "Programa Escuelas de Bienvenida / Aula de Enlace (incorporación temporal y simultánea al grupo ordinario)",
        ]
        fecha_corte = (
            f"Curso {meta.get('aulas_enlace_curso', '2026/2027')} · resolución "
            f"{fecha_es(meta.get('aulas_enlace_fecha_informacion', '2026-08-25'))}"
        )
        id_prefix = "oficial-enlace"
    else:
        if r["codigo"] == "28701275":
            detalle = (
                "Centro Regional de Enriquecimiento Educativo para el Alumnado con Altas Capacidades Intelectuales "
                "(CREACIM). Coordina en exclusiva los recursos regionales y todas las sedes del programa PEAC."
            )
            recursos = [
                "Coordinación regional del Programa de Enriquecimiento Educativo (PEAC)",
                "Formación y asesoramiento especializado a equipos docentes",
            ]
        elif r["codigo"] == "28701202":
            detalle = (
                "Equipo de Orientación Educativa y Psicopedagógica (EOEP) Específico de Altas Capacidades. Ámbito "
                "regional: asesoramiento a orientadores, planes de enriquecimiento y medidas de flexibilización."
            )
            recursos = [
                "Evaluación psicopedagógica especializada de altas capacidades",
                "Asesoramiento para flexibilización de etapas y planes curriculares",
            ]
        else:
            detalle = (
                "Instituto público designado como sede territorial oficial del Programa de Enriquecimiento Educativo "
                "para Alumnado con Altas Capacidades (PEAC). Acoge sesiones los sábados alternos en Primaria, ESO y "
                "Bachillerato previa propuesta del orientador del centro ordinario."
            )
            recursos = [
                "Sesiones presenciales de enriquecimiento (sábados quincenales de octubre a mayo)",
                "Coordinación técnica del CREACIM en ámbitos científico, artístico y humanístico",
            ]
        fecha_corte = f"Catálogo CKAN · copia {fecha_es(r['fecha_informacion'])}"
        id_prefix = "oficial-aacc"

    servicios = dict(DEFAULT_SERVICES)
    if r.get("servicios_ayto"):
        servicios.update(r["servicios_ayto"])

    accesibilidad = dict(DEFAULT_ACCESSIBILITY)
    if r.get("accesibilidad_ayto"):
        accesibilidad.update(r["accesibilidad_ayto"])

    apoyos = [{
        "needId": need_id,
        "evidencia": r["evidencia"],
        "etapasConApoyo": r["etapas_con_apoyo"],
        "recursosOficiales": recursos,
        "fuenteOficial": r["fuente"],
        "fechaCorte": fecha_corte,
        "detallesResolucion": detalle,
    }]
    for extra in r.get("extra_apoyos", []):
        apoyos.append({
            "needId": extra["need_id"],
            "evidencia": extra["evidencia"],
            "etapasConApoyo": extra["etapas_con_apoyo"],
            "recursosOficiales": extra.get("recursos", []),
            "fuenteOficial": extra["fuente"],
            "fechaCorte": extra["fecha_corte"],
            "detallesResolucion": extra["detalles"],
        })

    school = {
        "id": f"{id_prefix}-{r['codigo']}",
        "codigo": r["codigo"],
        "nombre": r["nombre"],
        "titularidad": r["titularidad"],
        "tipo": r["tipo"],
        "modalidad": r["modalidad"],
        "municipio": r["municipio"],
        **({"distrito": r["distrito"]} if r["distrito"] else {}),
        **({"barrio": r["barrio"]} if r.get("barrio") else {}),
        "codigoPostal": r.get("codigo_postal", ""),
        "direccion": r.get("direccion", ""),
        "telefono": r.get("telefono", ""),
        "email": r.get("email", ""),
        **({"web": r["web"]} if r.get("web") else {}),
        "lat": r["latitud"],
        "lng": r["longitud"],
        "etapas": r["etapas_con_apoyo"],
        "apoyos": apoyos,
        "servicios": servicios,
        "accesibilidad": accesibilidad,
        "continuidad": continuity(r, tea_rows),
        "procedencia": "oficial",
        "ubicacionAproximada": bool(r.get("ubicacion_aproximada", False)),
        "fuenteUrl": r["fuente_url"],
        "nombreOficial": r["nombre_oficial"],
        "tipoOficial": r["tipo_oficial"],
        "situacionOficial": r.get("situacion_oficial", "ALTA"),
    }
    if r.get("tipo_general_oficial"):
        school["tipoGeneralOficial"] = r["tipo_general_oficial"]
    if r.get("fuente_datos_abiertos"):
        school["fuenteDatosAbiertos"] = r["fuente_datos_abiertos"]
    if r.get("transporte_publico"):
        school["transportePublico"] = r["transporte_publico"]
    if r.get("fuente_ayuntamiento"):
        school["fuenteAyuntamiento"] = r["fuente_ayuntamiento"]
    if r.get("servicios_confirmados_ayto"):
        school["serviciosConfirmadosAyto"] = True
    if r.get("accesibilidad_confirmada_ayto"):
        school["accesibilidadConfirmadaAyto"] = True
    if r.get("accesibilidad_codigo_ayto"):
        school["accesibilidadCodigoAyto"] = r["accesibilidad_codigo_ayto"]
    if r["observaciones"]:
        school["observacionesOficiales"] = " ".join(r["observaciones"])
    return school


def municipalities():
    out = []
    with open(MUNICIPIOS_CSV, encoding="utf-8") as f:
        for m in csv.DictReader(f):
            name = m["municipio"].strip()
            if name and name != "Madrid":
                out.append({"id": name, "nombre": name, "lat": float(m["lat"]), "lng": float(m["lng"])})
    out.sort(key=lambda item: item["nombre"])
    return out


def main():
    with open(INPUT, encoding="utf-8") as f:
        data = json.load(f)
    rows = data["rows"]
    meta = data["ingestion_metadata"]
    if any(r.get("es_demostracion") for r in rows):
        raise SystemExit("El fichero procesado contiene registros de demostración; no se genera el módulo oficial.")

    tea_rows = [r for r in rows if r["need_id"] == "tea"]
    schools_all = [to_school(r, tea_rows, meta) for r in rows]
    schools_tea = [s for s in schools_all if any(a["needId"] == "tea" for a in s["apoyos"])]
    compensatoria_count = sum(1 for s in schools_all if any(a["needId"] == "compensatoria" for a in s["apoyos"]))
    cee_count = sum(1 for s in schools_all if any(a["needId"] == "educacion_especial" for a in s["apoyos"]))
    hosp_count = sum(1 for s in schools_all if any(a["needId"] == "salud_hospitalaria" for a in s["apoyos"]))
    visual_count = sum(1 for s in schools_all if any(a["needId"] == "visual" for a in s["apoyos"]))
    aacc_count = sum(1 for s in schools_all if any(a["needId"] == "altas_capacidades" for a in s["apoyos"]))
    auditiva_count = sum(1 for s in schools_all if any(a["needId"] == "auditiva" for a in s["apoyos"]))
    motora_count = sum(1 for s in schools_all if any(a["needId"] == "motora" for a in s["apoyos"]))
    tdah_count = sum(1 for s in schools_all if any(a["needId"] == "tdah" for a in s["apoyos"]))
    tel_count = sum(1 for s in schools_all if any(a["needId"] == "tel_lenguaje" for a in s["apoyos"]))
    exact_count = sum(1 for s in schools_all if not s["ubicacionAproximada"])
    exact_tea = sum(1 for s in schools_tea if not s["ubicacionAproximada"])
    counts_meta = meta.get("counts", {})

    source = {
        "titulo": "Escolarización en centros de atención preferente para alumnado con TEA",
        "organismo": "Comunidad de Madrid · Consejería de Educación",
        "url": meta["url"],
        "aulasEnlaceUrl": meta.get("aulas_enlace_portal_url")
        or "https://site.educa.madrid.org/dg.concertada-becasyayudas/index.php/programas-educativos-2/atencion-a-las-diferencias-individuales/medidas-y-programas/aulas-de-enlace/",
        "aulasEnlaceResolucionUrl": meta.get("aulas_enlace_url")
        or "https://site.educa.madrid.org/dg.concertada-becasyayudas//wp-content/uploads/dg.concertada-becasyayudas/2026/10/2026.08_Resolucion_Aulas_Enlace_2026-27__62493703.pdf",
        "cursoAulasEnlace": meta.get("aulas_enlace_curso", "2026/2027"),
        "fechaAulasEnlace": fecha_es(meta.get("aulas_enlace_fecha_informacion", "2026-08-25")),
        "datosAbiertosTitulo": "Centros educativos de la Comunidad de Madrid",
        "datosAbiertosUrl": "https://datos.comunidad.madrid/catalogo/dataset/centros_educativos",
        "datosAbiertosLicencia": "CC BY 4.0",
        "ayuntamientoUrl": "https://datos.madrid.es/egob/catalogo/300614-0-centros-educativos.csv",
        "curso": meta["curso"],
        "fechaInformacion": fecha_es(meta["fecha_informacion"]),
        "fechaDatosAbiertos": fecha_es(meta.get("ckan_fecha_descarga", meta["fecha_informacion"])),
        "totalCentros": len(schools_tea),
        "totalCompensatoria": compensatoria_count,
        "totalCentrosCatalogo": len(schools_all),
        "totalCee": cee_count,
        "totalHospitalarias": hosp_count,
        "totalVisual": visual_count,
        "totalAltasCapacidades": aacc_count,
        "totalAuditiva": auditiva_count,
        "totalMotora": motora_count,
        "totalTdah": tdah_count,
        "totalTelLenguaje": tel_count,
        "totalConUbicacionExacta": exact_tea,
        "totalConUbicacionExactaCatalogo": exact_count,
        "totalConTransporteAyto": counts_meta.get("ayto_transit", 0),
        "totalConServiciosAyto": counts_meta.get("ayto_services", 0),
        "totalConAccesibilidadAyto": counts_meta.get("ayto_accessibility", 0),
        "estadoVerificacion": meta["status"],
        "estadoAulasEnlace": meta.get("aulas_enlace_status", "SNAPSHOT_VERSIONADO"),
        "estadoDatosAbiertos": meta.get("ckan_status", "SNAPSHOT_CKAN_VERSIONADO"),
        "estadoAyuntamiento": meta.get("ayto_status", "SNAPSHOT_AYTO_VERSIONADO"),
        "alcance": data.get("alcance", ""),
        "alcanceAulasEnlace": data.get("alcance_aulas_enlace", ""),
        "listadoCompletoUrl": "https://www.comunidad.madrid/servicios/educacion/"
                              "atencion-preferente-necesidades-educativas-especiales",
    }

    def js(obj):
        return json.dumps(obj, ensure_ascii=False, indent=2)

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as fj:
        json.dump(schools_all, fj, ensure_ascii=False, separators=(",", ":"))

    content = f"""/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ARCHIVO GENERADO AUTOMÁTICAMENTE por scripts/build_app_data.py — no editar a mano.
 * Los {len(schools_all)} registros completos se publican en public/data/centros.json para descarga
 * asíncrona e independiente de la caché del código JavaScript.
 *
 * Datos procedentes exclusivamente de fuentes públicas oficiales (con detección de conflictos en data/review/):
 * - {len(schools_tea)} centros de atención preferente TEA (Consejería de Educación CAM, {meta['curso']})
 * - {compensatoria_count} Escuelas de Bienvenida / Aulas de Enlace en centros concertados (Resolución CAM {meta.get('aulas_enlace_curso', '2026/2027')})
 * - {cee_count} Centros de Educación Especial (CEE) en situación ALTA (Datos Abiertos CAM, CC BY 4.0)
 * - {hosp_count} Aulas Hospitalarias no anuladas (Datos Abiertos CAM, CC BY 4.0)
 * - {visual_count} recursos oficiales para Discapacidad Visual (EOEP Visuales + CRE ONCE Madrid)
 * - {aacc_count} centros y sedes oficiales para Altas Capacidades (CREACIM + EOEP + 8 sedes PEAC)
 * - EOEP Específicos regionales en situación ALTA: Auditiva ({auditiva_count}), Motora ({motora_count}), TDAH ({tdah_count}) y Trastornos del Lenguaje ({tel_count})
 * - Enriquecimiento de Madrid capital (transporte público, barrio, equipamiento y códigos ACCESIBILIDAD 0..6): Ayuntamiento de Madrid (datos.madrid.es).
 */

import {{ MunicipalityOption }} from '../types';

export const OFFICIAL_TEA_SOURCE = {js(source)} as const;

export const OFFICIAL_MUNICIPALITIES: MunicipalityOption[] = {js(municipalities())};
"""
    with open(OUTPUT, "w", encoding="utf-8") as f:
        f.write(content)
    print(
        f"  ✓ {OUTPUT} y {OUTPUT_JSON} generados ({len(schools_all)} centros oficiales totales: "
        f"{len(schools_tea)} TEA + {compensatoria_count} Aulas de Enlace + {cee_count} CEE + {hosp_count} Hospitalaria + "
        f"{visual_count} Visual + {aacc_count} Altas Capacidades + "
        f"{auditiva_count} Auditiva + {motora_count} Motora + {tdah_count} TDAH + {tel_count} TEL)"
    )


if __name__ == "__main__":
    main()
