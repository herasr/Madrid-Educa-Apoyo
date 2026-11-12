#!/usr/bin/env python3
"""
Pipeline de Exportación — Madrid Educa Apoyo
Genera productos de datos abiertos a partir de los centros oficiales procesados:
- data_products/centros_apoyo.geojson (GeoJSON conforme a RFC 7946, sin miembro 'crs')
- data_products/centros_apoyo.csv
- data_products/export-summary.json (procedencia, alcance y estado de verificación)

Cada registro indica su fuente oficial, la fecha de la información y que su
ubicación es aproximada (el documento oficial no publica direcciones).
"""

import csv
import json
import os

OUTPUT_DIR = "data_products"
INPUT_PROCESSED = "data/processed/schools_extracted.json"

FIELDS = [
    "codigo", "nombre", "nombre_oficial", "tipo_oficial", "titularidad", "dat", "municipio", "distrito", "direccion",
    "necesidad", "etapa_oficial", "latitud", "longitud", "ubicacion_aproximada", "fuente", "fuente_url",
    "fecha_informacion", "es_demostracion",
]


def export_products():
    print("[Pipeline - Export] Generando productos de datos abiertos (GeoJSON RFC 7946, CSV, JSON)...")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    if not os.path.exists(INPUT_PROCESSED):
        print("  ℹ Sin datos procesados disponibles. Ejecute ingest.py primero.")
        return False
    with open(INPUT_PROCESSED, "r", encoding="utf-8") as f:
        data = json.load(f)
    rows = data.get("rows", [])
    if not rows:
        print("  ℹ Sin registros procesados.")
        return False

    features = []
    for r in rows:
        props = {k: r.get(k) for k in FIELDS if k not in ("latitud", "longitud")}
        props["etapas_con_apoyo"] = r.get("etapas_con_apoyo", [])
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [float(r["longitud"]), float(r["latitud"])]},
            "properties": props,
        })

    geojson_path = os.path.join(OUTPUT_DIR, "centros_apoyo.geojson")
    with open(geojson_path, "w", encoding="utf-8") as f:
        json.dump({"type": "FeatureCollection", "features": features}, f, indent=2, ensure_ascii=False)
    print(f"  ✓ GeoJSON RFC 7946 generado: {geojson_path} ({len(features)} entidades)")

    csv_path = os.path.join(OUTPUT_DIR, "centros_apoyo.csv")
    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS + ["etapas_con_apoyo"])
        writer.writeheader()
        for r in rows:
            out = {k: r.get(k) for k in FIELDS}
            out["distrito"] = out["distrito"] or ""
            out["etapas_con_apoyo"] = "|".join(r.get("etapas_con_apoyo", []))
            writer.writerow(out)
    print(f"  ✓ CSV generado: {csv_path} ({len(rows)} filas)")

    meta = data.get("ingestion_metadata", {})
    summary = {
        "dataset": "Madrid Educa Apoyo - Centros de atención preferente TEA (datos oficiales)",
        "total_records": len(rows),
        "products": [
            {"path": "data_products/centros_apoyo.geojson", "format": "GeoJSON (RFC 7946)", "features": len(features)},
            {"path": "data_products/centros_apoyo.csv", "format": "CSV", "rows": len(rows)},
            {"path": "data/processed/schools_extracted.json", "format": "JSON"},
        ],
        "fuente_url": meta.get("url"),
        "curso": meta.get("curso"),
        "fecha_informacion": meta.get("fecha_informacion"),
        "estado_verificacion": meta.get("status"),
        "alcance": data.get("alcance"),
        "ubicaciones": "Aproximadas (centroide del municipio o distrito). El documento oficial no publica direcciones.",
        "licence": "Datos: información pública de la Comunidad de Madrid (Ley 37/2007). Código: Apache-2.0",
        "rfc_7946_compliant": True,
    }
    summary_path = os.path.join(OUTPUT_DIR, "export-summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    print(f"  ✓ Resumen de trazabilidad exportado en {summary_path}")
    return True


if __name__ == "__main__":
    export_products()
