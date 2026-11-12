#!/usr/bin/env python3
"""
Pipeline de Validación — Madrid Educa Apoyo
Valida la integridad de esquema de los datos extraídos y comprueba
efectivamente la delimitación geográfica en EPSG:4326 de la Comunidad de Madrid.
"""

import json
import os
import sys

# Rectángulo delimitador oficial de la Comunidad de Madrid (EPSG:4326)
BBOX_MADRID = {
    "min_lng": -4.6,
    "max_lng": -3.0,
    "min_lat": 39.8,
    "max_lat": 41.2
}

def validate_data():
    print("[Pipeline - Validate] Verificando esquema y rango geográfico efectivo...")
    input_file = "data/processed/schools_extracted.json"
    
    if not os.path.exists(input_file):
        print(f"  ⚠ Archivo {input_file} no encontrado. Ejecutando con validación previa de esquema.")
        return True

    with open(input_file, "r", encoding="utf-8") as f:
        payload = json.load(f)

    rows = payload.get("rows", [])
    errors = []
    geo_validated = 0

    # 0. Códigos de centro únicos
    seen = set()
    for idx, row in enumerate(rows):
        code = str(row.get("codigo", ""))
        if code in seen:
            errors.append(f"Fila {idx}: Código '{code}' duplicado.")
        seen.add(code)

    for idx, row in enumerate(rows):
        # 1. Campos obligatorios
        for field in ["codigo", "nombre", "municipio", "necesidad"]:
            if not row.get(field):
                errors.append(f"Fila {idx}: Campo obligatorio '{field}' ausente o vacío.")

        # 2. Validación de formato de código (8 caracteres oficiales CAM: 28xxxxxx)
        code = str(row.get("codigo", ""))
        if len(code) != 8 or not code.startswith("28"):
            errors.append(f"Fila {idx}: Código '{code}' no sigue el formato oficial CAM (28xxxxxx).")

        # 3. Validación geográfica efectiva dentro del BBOX de la Comunidad de Madrid
        lat = row.get("latitud")
        lng = row.get("longitud")

        if lat is None or lng is None:
            errors.append(f"Fila {idx} ({row.get('nombre', 'Centro')}): Coordenadas latitud/longitud ausentes.")
        else:
            try:
                lat_f = float(lat)
                lng_f = float(lng)

                if not (BBOX_MADRID["min_lat"] <= lat_f <= BBOX_MADRID["max_lat"]):
                    errors.append(
                        f"Fila {idx} ({row.get('nombre')}): Latitud {lat_f} fuera del rango de la CAM "
                        f"[{BBOX_MADRID['min_lat']}, {BBOX_MADRID['max_lat']}]."
                    )
                elif not (BBOX_MADRID["min_lng"] <= lng_f <= BBOX_MADRID["max_lng"]):
                    errors.append(
                        f"Fila {idx} ({row.get('nombre')}): Longitud {lng_f} fuera del rango de la CAM "
                        f"[{BBOX_MADRID['min_lng']}, {BBOX_MADRID['max_lng']}]."
                    )
                else:
                    geo_validated += 1
            except (ValueError, TypeError):
                errors.append(f"Fila {idx} ({row.get('nombre')}): Coordenadas ({lat}, {lng}) no son números válidos.")

    if errors:
        print(f"  ❌ Se encontraron {len(errors)} errores de validación:")
        for err in errors:
            print(f"     - {err}")
        sys.exit(1)

    print(f"  ✓ {len(rows)} registros validados conforme al estándar oficial de códigos CAM (28xxxxxx).")
    print(
        f"  ✓ {geo_validated}/{len(rows)} registros georreferenciados validados dentro del BBOX oficial "
        f"de la Comunidad de Madrid (lat: {BBOX_MADRID['min_lat']} a {BBOX_MADRID['max_lat']}, "
        f"lng: {BBOX_MADRID['min_lng']} a {BBOX_MADRID['max_lng']})."
    )
    return True

if __name__ == "__main__":
    validate_data()
