#!/usr/bin/env python3
"""
Pipeline de Ingesta — Madrid Educa Apoyo (Prototipo)
Verifica disponibilidad de catálogo de datos abiertos de la Comunidad de Madrid.
"""

import json
import time
import os

def ingest_sources():
    print("[Pipeline - Ingest] Comprobando estructura de fuentes públicas (Prototipo)...")
    sources = [
        {"id": "preferred_support", "url": "https://www.comunidad.madrid/educacion/atencion-preferente-necesidades-educativas-especiales"},
        {"id": "education_centres", "url": "https://datos.comunidad.madrid/catalogo/dataset/centros_educativos"}
    ]
    
    os.makedirs("data/raw", exist_ok=True)
    results = []
    
    for s in sources:
        snapshot = {
            "source_id": s["id"],
            "url": s["url"],
            "retrieved_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "status": "PROTOTYPE_SIMULATION"
        }
        
        source_dir = os.path.join("data/raw", s["id"])
        os.makedirs(source_dir, exist_ok=True)
        with open(os.path.join(source_dir, "metadata.json"), "w", encoding="utf-8") as f:
            json.dump(snapshot, f, indent=2)
            
        results.append(snapshot)
        print(f"  ℹ Fuente {s['id']}: Registrada estructura de prueba.")
        
    return results

if __name__ == "__main__":
    ingest_sources()

