"""Pruebas unitarias y de integridad del pipeline de ingesta (pipelines/ingest.py)."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from pipelines import ingest  # noqa: E402


def test_utm30n_to_wgs84_puerta_del_sol():
    lat, lng = ingest.utm30n_to_wgs84(440290.0, 4474270.0)
    assert abs(lat - 40.4168) < 0.002
    assert abs(lng - (-3.7038)) < 0.002


def test_conflict_detection_28020120_vs_28011258():
    snapshot_rows = [
        {
            "codigo_centro": "28020120",
            "tipo": "CPR INF-PRI-SEC",
            "centro": "AMOR MISERICORDIOSO",
            "distrito_o_localidad": "CHAMBERI",
            "dat": "DAT CAPITAL",
            "etapa": "PRIMARIA",
        },
        {
            "codigo_centro": "28011258",
            "tipo": "CPR INF-PRI-SEC",
            "centro": "CHAMBERI",
            "distrito_o_localidad": "USERA",
            "dat": "DAT CAPITAL",
            "etapa": "PRIMARIA",
        },
    ]
    ckan_by_code = {
        "28020120": {
            "CODIGO": "28020120",
            "CENTRO": "CHAMBERI",
            "TIPO_ABRV": "CPR INF-PRI-SEC",
            "TIPO_EXT": "CENTRO PRIVADO DE INFANTIL PRIMARIA Y SECUNDARIA",
            "SITUACIÓN": "ALTA",
            "TELEFONO": "914450001",
            "E_MAIL": "cc.chamberi.madrid@educa.madrid.org",
            "WEB": "maristaschamberi.com",
            "UTM_X": "440500",
            "UTM_Y": "4476500",
        },
        "28011258": {
            "CODIGO": "28011258",
            "CENTRO": "AMOR MISERICORDIOSO",
            "TIPO_ABRV": "CPR INF-PRI-SEC",
            "TIPO_EXT": "CENTRO PRIVADO DE INFANTIL PRIMARIA Y SECUNDARIA",
            "SITUACIÓN": "ALTA",
            "TELEFONO": "915000002",
            "E_MAIL": "amormisericordioso@educa.madrid.org",
            "WEB": "amormisericordioso.es",
            "UTM_X": "440600",
            "UTM_Y": "4471000",
        },
    }
    municipios, distritos = ingest.load_reference()
    conflicts = []
    dubious = []
    meta = {"url": "https://example.org/tea.pdf", "fecha_informacion": "2024-03-22", "curso": "2024/2025"}

    rows = ingest.normalise_tea_rows(
        snapshot_rows, meta, ckan_by_code, ([], {}, {}), municipios, distritos, conflicts, dubious
    )

    assert len(rows) == 2
    assert len(conflicts) == 2

    by_code = {r["codigo"]: r for r in rows}
    assert "Chamber" in by_code["28020120"]["nombre"]
    assert by_code["28020120"]["email"] == "cc.chamberi.madrid@educa.madrid.org"
    assert any("Amor Misericordioso" in obs for obs in by_code["28020120"]["observaciones"])

    assert "Amor Misericordioso" in by_code["28011258"]["nombre"]
    assert any("Chamber" in obs for obs in by_code["28011258"]["observaciones"])


def test_reject_false_ayuntamiento_phone_match_and_parse_accessibility_codes():
    ayto_rows = [
        {
            "NOMBRE": "Instituto de Educación Secundaria Doctor Quintero Lumbreras",
            "TELEFONO": "913581111",
            "EMAIL": "ies.quintero@educa.madrid.org",
            "CODIGO-POSTAL": "28035",
            "LATITUD": "40.48",
            "LONGITUD": "-3.71",
            "EQUIPAMIENTO": "Comedor - Transporte escolar",
            "ACCESIBILIDAD": "1",
        },
        {
            "NOMBRE": "Colegio Público Ciudad de Valencia",
            "TELEFONO": "917778888",
            "EMAIL": "cp.ciudaddevalencia.madrid@educa.madrid.org",
            "CODIGO-POSTAL": "28031",
            "LATITUD": "40.37",
            "LONGITUD": "-3.61",
            "BARRIO": "SANTA EUGENIA",
            "TRANSPORTE": "Metro: Villa de Vallecas",
            "EQUIPAMIENTO": "Comedor escolar",
            "ACCESIBILIDAD": "2,5,6",
        },
    ]
    index = ingest.build_ayto_index(ayto_rows)
    dubious = []

    false_match = ingest.match_ayuntamiento_record(
        "CEE Alenta",
        "28035",
        "913581111",
        "alenta@educa.madrid.org",
        40.48,
        -3.71,
        index,
        codigo="28012299",
        dubious_log=dubious,
    )
    assert false_match is None
    assert len(dubious) == 1
    assert dubious[0]["codigo"] == "28012299"
    assert dubious[0]["accion"] == "DESCARTADO_POR_SIN_COINCIDENCIA_NOMINAL"

    valid_match = ingest.match_ayuntamiento_record(
        "CEIP Ciudad de Valencia",
        "28031",
        "917778888",
        "cp.ciudaddevalencia.madrid@educa.madrid.org",
        40.37,
        -3.61,
        index,
        codigo="28020673",
        dubious_log=dubious,
    )
    assert valid_match is not None
    enriched = ingest.extract_ayto_enrichment(valid_match)
    assert enriched["accesibilidad_codigo_ayto"] == "2,5,6"
    assert enriched["accesibilidad"]["acceso_fisico"] is False
    assert enriched["accesibilidad"]["plano_podotactil"] is True
    assert enriched["accesibilidad"]["bucle_magnetico"] is True
    assert enriched["servicios"]["comedor"] is True


def test_processed_catalog_integrity():
    extracted_path = ROOT / "data" / "processed" / "schools_extracted.json"
    data = json.loads(extracted_path.read_text(encoding="utf-8"))
    rows = data["rows"]
    assert len(rows) == 470
    assert len({r["codigo"] for r in rows}) == 470
    assert all(not r.get("es_demostracion") for r in rows)
    exact_utm = sum(1 for r in rows if not r.get("ubicacion_aproximada"))
    assert exact_utm == 469


def test_aulas_enlace_catalog_integrity():
    extracted_path = ROOT / "data" / "processed" / "schools_extracted.json"
    data = json.loads(extracted_path.read_text(encoding="utf-8"))
    rows = data["rows"]

    def get_support_entries(row):
        primary = {
            "need_id": row.get("need_id"),
            "evidencia": row.get("evidencia"),
            "etapas": row.get("etapas_con_apoyo", []),
        }
        extras = [
            {
                "need_id": ex.get("need_id"),
                "evidencia": ex.get("evidencia"),
                "etapas": ex.get("etapas_con_apoyo", []),
            }
            for ex in row.get("extra_apoyos", [])
        ]
        return [primary, *extras]

    enlace_rows = [
        r for r in rows
        if any(a.get("need_id") == "compensatoria" for a in get_support_entries(r))
    ]
    assert len(enlace_rows) == 47
    assert all(r["titularidad"] == "concertado" for r in enlace_rows)

    dual_tea_enlace = [
        r for r in enlace_rows
        if any(a.get("need_id") == "tea" for a in get_support_entries(r))
    ]
    assert len(dual_tea_enlace) == 10
    assert any(r["codigo"] == "28014478" for r in dual_tea_enlace)

    by_code = {r["codigo"]: r for r in enlace_rows}
    central_enlace = next(a for a in get_support_entries(by_code["28011520"]) if a["need_id"] == "compensatoria")
    assert central_enlace["etapas"] == ["primaria"]
    assert central_enlace["evidencia"] == "A1"

    cpr_es_enlace = next(a for a in get_support_entries(by_code["28019300"]) if a["need_id"] == "compensatoria")
    assert cpr_es_enlace["etapas"] == ["eso"]
    assert cpr_es_enlace["evidencia"] == "A1"

    centros_path = ROOT / "public" / "data" / "centros.json"
    centros = json.loads(centros_path.read_text(encoding="utf-8"))
    assert len(centros) == 470
    centros_enlace = [
        c for c in centros
        if any(a.get("needId") == "compensatoria" for a in c.get("apoyos", []))
    ]
    assert len(centros_enlace) == 47
    assert all(c["titularidad"] == "concertado" for c in centros_enlace)


def test_official_snapshot_sha256_integrity():
    import hashlib

    pairs = [
        ("tea_preferentes_curso_2024-25.csv", "tea_preferentes_curso_2024-25.metadata.json"),
        ("aulas_enlace_concertados_curso_2026-27.csv", "aulas_enlace_concertados_curso_2026-27.metadata.json"),
        ("centros_educativos_datos_abiertos_cam.json", "centros_educativos_datos_abiertos_cam.metadata.json"),
        ("centros_educativos_datos_abiertos_tea.json", "centros_educativos_datos_abiertos_tea.metadata.json"),
        ("ayuntamiento_madrid_centros_300614.csv", "ayuntamiento_madrid_centros_300614.metadata.json"),
    ]
    official_dir = ROOT / "data" / "official"
    for data_file, meta_file in pairs:
        actual_sha = hashlib.sha256((official_dir / data_file).read_bytes()).hexdigest()
        meta = json.loads((official_dir / meta_file).read_text(encoding="utf-8"))
        assert meta.get("sha256_instantanea_repo") == actual_sha


def test_export_csv_bom_semicolon_and_formula_neutralization():
    from pipelines import export

    assert export.sanitize_csv_cell("=HYPERLINK(\"http://evil\")") == "'=HYPERLINK(\"http://evil\")"
    assert export.sanitize_csv_cell("+34914450001") == "'+34914450001"
    assert export.sanitize_csv_cell("-formula") == "'-formula"
    assert export.sanitize_csv_cell("@SUM(A1)") == "'@SUM(A1)"
    assert export.sanitize_csv_cell(-3.7038) == "-3.7038"
    assert export.sanitize_csv_cell("Colegio Chamberí") == "Colegio Chamberí"

    csv_path = ROOT / "data_products" / "centros_apoyo.csv"
    raw = csv_path.read_bytes()
    assert raw.startswith(b"\xef\xbb\xbf")
    first_line = raw.decode("utf-8-sig").splitlines()[0]
    assert ";" in first_line


def test_validate_exits_nonzero_when_processed_missing():
    import os
    import tempfile
    from pipelines import validate

    orig_cwd = os.getcwd()
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            os.chdir(tmpdir)
            try:
                validate.validate_data()
                assert False, "validate_data debía lanzar SystemExit(1) cuando falta el JSON"
            except SystemExit as exc:
                assert exc.code == 1
    finally:
        os.chdir(orig_cwd)

