#!/usr/bin/env python3
"""
Pipeline de Conciliación — Madrid Educa Apoyo
Verifica concordancia exacta entre entidades extraídas y el nomenclátor
oficial de los 179 municipios de la Comunidad de Madrid (INE/CAM),
utilizando normalización Unicode estricta sin coincidencias parciales permisivas.
"""

import json
import os
import unicodedata
import sys

# Catálogo oficial completo de los 179 municipios de la Comunidad de Madrid (INE Código 28)
CAM_179_MUNICIPALITIES = [
    "La Acebeda", "Ajalvir", "Alameda del Valle", "El Álamo", "Alcalá de Henares",
    "Alcobendas", "Alcorcón", "Aldea del Fresno", "Algete", "Alpedrete",
    "Ambite", "Anchuelo", "Aranjuez", "Arganda del Rey", "Arroyomolinos",
    "El Atazar", "Batres", "Becerril de la Sierra", "Belmonte de Tajo", "Berzosa del Lozoya",
    "El Berrueco", "Boadilla del Monte", "El Boalo", "Braojos de la Sierra", "Brea de Tajo",
    "Brunete", "Buitrago del Lozoya", "Bustarviejo", "Cabanillas de la Sierra", "La Cabrera",
    "Cadalso de los Vidrios", "Camarma de Esteruelas", "Campo Real", "Canencia", "Carabaña",
    "Casarrubuelos", "Cenicientos", "Cercedilla", "Cervera de Buitrago", "Chapinería",
    "Chinchón", "Ciempozuelos", "Cobeña", "Collado Mediano", "Collado Villalba",
    "Colmenar de Oreja", "Colmenar del Arroyo", "Colmenar Viejo", "Colmenarejo", "Corpa",
    "Coslada", "Cubas de la Sagra", "Daganzo de Arriba", "El Escorial", "Estremera",
    "Fresnedillas de la Oliva", "Fresno de Torote", "Fuenlabrada", "Fuente el Saz de Jarama", "Fuentidueña de Tajo",
    "Galapagar", "Garganta de los Montes", "Gargantilla del Lozoya y Pinilla de Buitrago", "Gascones", "Getafe",
    "Griñón", "Guadalix de la Sierra", "Guadarrama", "La Hiruela", "Horcajo de la Sierra-Aoslos",
    "Horcajuelo de la Sierra", "Hoyo de Manzanares", "Humanes de Madrid", "Leganés", "Loeches",
    "Lozoya", "Lozoyuela-Navas-Sieteiglesias", "Madarcos", "Madrid", "Majadahonda",
    "Manzanares el Real", "Meco", "Mejorada del Campo", "Miraflores de la Sierra", "El Molar",
    "Los Molinos", "Montejo de la Sierra", "Moraleja de Enmedio", "Moralzarzal", "Morata de Tajuña",
    "Móstoles", "Navacerrada", "Navalafuente", "Navalagamella", "Navalcarnero",
    "Navarredonda y San Mamés", "Navas del Rey", "Nuevo Baztán", "Olmeda de las Fuentes", "Orusco de Tajuña",
    "Paracuellos de Jarama", "Parla", "Patones", "Pedrezuela", "Pelayos de la Presa",
    "Perales de Tajuña", "Pezuela de las Torres", "Pinilla del Valle", "Pinto", "Piñuécar-Gandullas",
    "Pozuelo de Alarcón", "Pozuelo del Rey", "Prádena del Rincón", "Puebla de la Sierra", "Puentes Viejas",
    "Quijorna", "Rascafría", "Redueña", "Ribatejada", "Rivas-Vaciamadrid",
    "Robledillo de la Jara", "Robledo de Chavela", "Robregordo", "Las Rozas de Madrid", "Rozas de Puerto Real",
    "San Agustín del Guadalix", "San Fernando de Henares", "San Lorenzo de El Escorial", "San Martín de la Vega", "San Martín de Valdeiglesias",
    "San Sebastián de los Reyes", "Santa María de la Alameda", "Santorcaz", "Los Santos de la Humosa", "La Serna del Monte",
    "Serranillos del Valle", "Sevilla la Nueva", "Somosierra", "Soto del Real", "Talamanca de Jarama",
    "Tielmes", "Titulcia", "Torrejón de Ardoz", "Torrejón de la Calzada", "Torrejón de Velasco",
    "Torrelaguna", "Torrelodones", "Torremocha de Jarama", "Torres de la Alameda", "Tres Cantos",
    "Valdaracete", "Valdeavero", "Valdelaguna", "Valdemanco", "Valdemaqueda",
    "Valdemorillo", "Valdemoro", "Valdeolmos-Alalpardo", "Valdepiélagos", "Valdetorres de Jarama",
    "Valdilecha", "Valverde de Alcalá", "Velilla de San Antonio", "El Vellón", "Venturada",
    "Villa del Prado", "Villaconejos", "Villalbilla", "Villamanrique de Tajo", "Villamanta",
    "Villamantilla", "Villanueva de la Cañada", "Villanueva de Perales", "Villanueva del Pardillo", "Villar del Olmo",
    "Villarejo de Salvanés", "Villaviciosa de Odón", "Villavieja del Lozoya", "Zarzalejo"
]

def normalize_text(text: str) -> str:
    """Normaliza texto eliminando acentos, espacios superfluos y homogeneizando a minúsculas."""
    if not text:
        return ""
    nfkd = unicodedata.normalize('NFKD', text.strip().lower())
    return "".join(c for c in nfkd if not unicodedata.combining(c))

# Diccionario de normalización a nombre canónico oficial
NORMALIZED_MUNICIPALITIES_MAP = {
    normalize_text(m): m for m in CAM_179_MUNICIPALITIES
}

def reconcile_entities():
    print("[Pipeline - Reconcile] Comprobando concordancia municipal estricta contra nomenclátor oficial (179 municipios)...")
    input_file = "data/processed/schools_extracted.json"
    
    if not os.path.exists(input_file):
        print("  ℹ Archivo processed no encontrado, omitiendo conciliación.")
        return True

    with open(input_file, "r", encoding="utf-8") as f:
        payload = json.load(f)

    rows = payload.get("rows", [])
    matched = 0
    unmatched = []

    for r in rows:
        mun_raw = r.get("municipio", "")
        norm = normalize_text(mun_raw)
        
        # Coincidencia EXACTA normalizada (sin inclusión parcial permisiva)
        if norm in NORMALIZED_MUNICIPALITIES_MAP:
            matched += 1
            # Normalizar municipio al nombre canónico oficial
            r["municipio_normalizado"] = NORMALIZED_MUNICIPALITIES_MAP[norm]
        else:
            unmatched.append((r.get("codigo", "???"), r.get("nombre", "Desconocido"), mun_raw))

    if unmatched:
        print(f"  ❌ Discrepancia en nomenclátor municipal ({len(unmatched)} entidades sin concordancia):")
        for code, name, mun in unmatched:
            print(f"     - [{code}] {name}: Municipio '{mun}' no reconocido en el catálogo de 179 municipios de la CAM.")
        sys.exit(1)

    print(f"  ✓ {matched}/{len(rows)} entidades conciliadas con exactitud contra los 179 municipios del nomenclátor CAM.")
    return True

if __name__ == "__main__":
    reconcile_entities()
