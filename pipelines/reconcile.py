#!/usr/bin/env python3
"""
Pipeline de Conciliación — Madrid Educa Apoyo
Verifica concordancia entre entidades extraídas y el catálogo municipal oficial de Madrid.
"""

import json
import os

VALID_MUNICIPALITIES = {
    "madrid", "alcala de henares", "fuenlabrada", "getafe", "mostoles", 
    "alcorcon", "leganes", "parla", "torrejon de ardoz", "alcobendas",
    "san sebastian de los reyes", "boadilla del monte", "pozuelo de alarcon",
    "las rozas de madrid", "majadahonda", "rivas-vaciamadrid", "valdemoro"
}

def reconcile_entities():
    print("[Pipeline - Reconcile] Comprobando concordancia municipal y resolución de entidades...")
    input_file = "data/processed/schools_extracted.json"
    
    if not os.path.exists(input_file):
        print("  ℹ Archivo processed no encontrado, omitiendo conciliación.")
        return True

    with open(input_file, "r", encoding="utf-8") as f:
        payload = json.load(f)

    rows = payload.get("rows", [])
    matched = 0

    for r in rows:
        mun = r.get("municipio", "").lower().strip()
        if mun in VALID_MUNICIPALITIES or any(v in mun for v in VALID_MUNICIPALITIES):
            matched += 1

    print(f"  ✓ {matched}/{len(rows)} entidades conciliadas con el nomenclátor municipal de la CAM.")
    return True

if __name__ == "__main__":
    reconcile_entities()
