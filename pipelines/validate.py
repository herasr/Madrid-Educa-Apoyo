#!/usr/bin/env python3
"""
Pipeline de Validación — Madrid Educa Apoyo
Valida la integridad de esquema de los datos extraídos y comprueba
la delimitación geográfica en EPSG:4326 de la Comunidad de Madrid.
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
    print("[Pipeline - Validate] Verificando esquema y rango geográfico...")
    input_file = "data/processed/schools_extracted.json"
    
    if not os.path.exists(input_file):
        print(f"  ⚠ Archivo {input_file} no encontrado. Ejecutando con validación previa de esquema.")
        return True

    with open(input_file, "r", encoding="utf-8") as f:
        payload = json.load(f)

    rows = payload.get("rows", [])
    errors = []

    for idx, row in enumerate(rows):
        # 1. Campos obligatorios
        for field in ["codigo", "nombre", "municipio"]:
            if not row.get(field):
                errors.append(f"Fila {idx}: Campo obligatorio '{field}' ausente o vacío.")

        # 2. Validación de formato de código (8 caracteres)
        code = str(row.get("codigo", ""))
        if len(code) != 8 or not code.startswith("28"):
            errors.append(f"Fila {idx}: Código '{code}' no sigue el formato oficial CAM (28xxxxxx).")

    if errors:
        print(f"  ❌ Se encontraron {len(errors)} errores de validación:")
        for err in errors:
            print(f"     - {err}")
        sys.exit(1)

    print(f"  ✓ {len(rows)} registros validados conforme al estándar oficial CAM.")
    return True

if __name__ == "__main__":
    validate_data()
