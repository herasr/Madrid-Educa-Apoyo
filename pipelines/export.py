#!/usr/bin/env python3
"""
Pipeline de Exportación — Madrid Educa Apoyo
Genera productos de datos abiertos estructurados:
- data_products/centros_apoyo.geojson (GeoJSON conforme a RFC 7946, WGS 84 estricto sin miembro crs en desuso)
- data_products/centros_apoyo.csv (Tabular delimitado estándar)
- data_products/export-summary.json (Metadatos de gobernanza, trazabilidad y estado de demostración técnica)
"""

import json
import csv
import os

OUTPUT_DIR = "data_products"
INPUT_PROCESSED = "data/processed/schools_extracted.json"

# Coordenadas y metadatos de referencia para centros de demostración técnica
COORDS_MAP = {
    "28020941": {"lat": 40.4218, "lng": -3.6828, "direccion": "C/ Alcalá, 62", "tipo": "CEIP", "titularidad": "Público"},
    "28020965": {"lat": 40.4095, "lng": -3.7315, "direccion": "Paseo de Extremadura, 22", "tipo": "CEIP", "titularidad": "Público"},
    "28060238": {"lat": 40.2865, "lng": -3.7915, "direccion": "C/ Extremadura, 12", "tipo": "CEIP", "titularidad": "Público"},
    "28021155": {"lat": 40.4312, "lng": -3.6334, "direccion": "C/ Hermanos García Noblejas, 40", "tipo": "CEIP", "titularidad": "Público"}
}

def export_products():
    print("[Pipeline - Export] Generando productos de datos abiertos (GeoJSON RFC 7946, CSV, JSON)...")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    rows = []
    if os.path.exists(INPUT_PROCESSED):
        try:
            with open(INPUT_PROCESSED, "r", encoding="utf-8") as f:
                data = json.load(f)
                rows = data.get("rows", [])
        except Exception as e:
            print(f"  ⚠ Aviso leyendo processed data: {e}")

    if not rows:
        print("  ℹ Sin datos procesados disponibles. Ejecute ingest.py primero.")
        return False

    # 1. Generar GeoJSON conforme a RFC 7946 (WGS 84 implícito; miembro 'crs' omitido conforme al estándar)
    features = []
    for r in rows:
        code = str(r.get("codigo", ""))
        lat = r.get("latitud")
        lng = r.get("longitud")
        direccion = r.get("direccion", "")
        tipo = r.get("tipo", "CEIP")
        titularidad = r.get("titularidad", "Público")
        is_approx = False

        if lat is None or lng is None:
            if code in COORDS_MAP:
                geo = COORDS_MAP[code]
                lat = geo["lat"]
                lng = geo["lng"]
                direccion = geo.get("direccion", "")
                tipo = geo.get("tipo", "CEIP")
                titularidad = geo.get("titularidad", "Público")
            else:
                print(f"  ⚠ Advertencia: El centro [{code}] '{r.get('nombre')}' no cuenta con coordenadas geográficas específicas.")
                is_approx = True
                lat, lng = 40.4168, -3.7038  # Referencia central aproximada

        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [float(lng), float(lat)]
            },
            "properties": {
                "codigo": code,
                "nombre": r.get("nombre", ""),
                "municipio": r.get("municipio", ""),
                "direccion": direccion,
                "tipo": tipo,
                "titularidad": titularidad,
                "necesidad_apoyo": r.get("necesidad", ""),
                "fuente": r.get("fuente", "Muestra Técnica de Demostración (DataMad)"),
                "coordenada_aproximada": is_approx,
                "es_demostracion": True
            }
        }
        features.append(feature)

    # Nota RFC 7946, Sección 4: "GeoJSON text SHALL NOT contain a 'crs' member."
    geojson_data = {
        "type": "FeatureCollection",
        "features": features
    }

    geojson_path = os.path.join(OUTPUT_DIR, "centros_apoyo.geojson")
    with open(geojson_path, "w", encoding="utf-8") as f:
        json.dump(geojson_data, f, indent=2, ensure_ascii=False)
    print(f"  ✓ GeoJSON RFC 7946 generado (sin miembro 'crs' obsoleto): {geojson_path} ({len(features)} entidades)")

    # 2. Generar CSV
    csv_path = os.path.join(OUTPUT_DIR, "centros_apoyo.csv")
    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        fieldnames = [
            "codigo", "nombre", "municipio", "direccion", "tipo",
            "titularidad", "necesidad", "latitud", "longitud", "fuente", "es_demostracion"
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for f_item in features:
            props = f_item["properties"]
            coords = f_item["geometry"]["coordinates"]
            writer.writerow({
                "codigo": props["codigo"],
                "nombre": props["nombre"],
                "municipio": props["municipio"],
                "direccion": props["direccion"],
                "tipo": props["tipo"],
                "titularidad": props["titularidad"],
                "necesidad": props["necesidad_apoyo"],
                "latitud": coords[1],
                "longitud": coords[0],
                "fuente": props["fuente"],
                "es_demostracion": props["es_demostracion"]
            })
    print(f"  ✓ CSV generado: {csv_path} ({len(rows)} filas con rotulado honesto)")

    # 3. Resumen y trazabilidad
    summary = {
        "dataset": "Madrid Educa Apoyo - Entidades de Demostración Técnica (DataMad)",
        "total_records": len(rows),
        "products": [
            {"path": "data_products/centros_apoyo.geojson", "format": "GeoJSON (RFC 7946)", "features": len(features)},
            {"path": "data_products/centros_apoyo.csv", "format": "CSV", "rows": len(rows)},
            {"path": "data/processed/schools_extracted.json", "format": "JSON"}
        ],
        "licence": "Apache-2.0",
        "rfc_7946_compliant": True,
        "status": "TECHNICAL_DEMONSTRATION_ENVIRONMENT",
        "data_notice": "Entorno de demostración técnica para evaluación de plataforma. Centros con códigos de la red CAM y asignaciones sintéticas."
    }
    summary_path = os.path.join(OUTPUT_DIR, "export-summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    print(f"  ✓ Resumen de trazabilidad exportado en {summary_path}")
    return True

if __name__ == "__main__":
    export_products()
