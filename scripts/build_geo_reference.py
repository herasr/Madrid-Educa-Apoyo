#!/usr/bin/env python3
"""
Genera las tablas de referencia geográfica que usa el proyecto para situar
de forma APROXIMADA los centros cuyo listado oficial no publica coordenadas.

Salidas (versionadas en el repositorio):
  data/reference/municipios_madrid_centroides.csv
      179 municipios de la Comunidad de Madrid con su código INE y el centroide
      de su término municipal.
      Fuente: geometrías del Instituto Geográfico Nacional (IGN) empaquetadas en
      el paquete npm `es-atlas` (licencia MIT, datos IGN).
  data/reference/distritos_madrid_centroides.csv
      21 distritos de Madrid capital con el centroide de la unión de sus barrios.
      Fuente: polígonos de barrios de Madrid publicados en
      github.com/codeforgermany/click_that_hood (public/data/madrid.geojson),
      agrupados por distrito según la división administrativa municipal.

Uso:
  python scripts/build_geo_reference.py <ruta es-atlas municipalities.json> <ruta madrid.geojson>

  Ejemplo de descarga de las entradas:
    npm pack es-atlas@0.6.0 && tar xzf es-atlas-0.6.0.tgz   # -> package/es/municipalities.json
    curl -LO https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/madrid.geojson

Los centroides son una aproximación: sirven para ordenar por cercanía y
pintar el mapa, NUNCA como dirección del centro.
"""

import csv
import json
import os
import sys
import unicodedata

OUT_DIR = "data/reference"

# Barrios (según los polígonos de origen) agrupados por distrito municipal.
DISTRICT_BARRIOS = {
    "Centro": ["Palacio", "Embajadores", "Cortes", "Justicia", "Universidad", "Sol"],
    "Arganzuela": ["Imperial", "Acacias", "Chopera", "Legazpi", "Delicias", "Palos de Moguer", "Atocha"],
    "Retiro": ["Pacífico", "Adelfas", "Estrella", "Ibiza", "Jerónimos", "Niño Jesús"],
    "Salamanca": ["Recoletos", "Goya", "Fuente del Berro", "Guindalera", "Lista", "Castellana"],
    "Chamartín": ["El Viso", "Prosperidad", "Ciudad Jardín", "Hispanoamérica", "Nueva España", "Castilla"],
    "Tetuán": ["Bellas Vistas", "Cuatro Caminos", "Castillejos", "Almenara", "Valdeacederas", "Berruguete"],
    "Chamberí": ["Gaztambide", "Arapiles", "Trafalgar", "Almagro", "Rios Rosas", "Vallehermoso"],
    "Fuencarral-El Pardo": ["El Pardo", "Fuentelareina", "Peñagrande", "Pilar", "La Paz", "Valverde", "Mirasierra", "El Goloso"],
    "Moncloa-Aravaca": ["Casa de Campo", "Argüelles", "Ciudad Universitaria", "Valdezarza", "Valdemarín", "El Plantío", "Aravaca"],
    "Latina": ["Cármenes", "Puerta del Angel", "Lucero", "Aluche", "Campamento", "Cuatro Vientos", "Aguilas"],
    "Carabanchel": ["Comillas", "Opañel", "San Isidro", "Vista Alegre", "Puerta Bonita", "Buenavista", "Abrantes"],
    "Usera": ["Orcasitas", "Orcasur", "San Fermín", "Almendrales", "Moscardó", "Zofío", "Pradolongo"],
    "Puente de Vallecas": ["Entrevías", "San Diego", "Palomeras Bajas", "Palomeras Sureste", "Portazgo", "Numancia"],
    "Moratalaz": ["Pavones", "Horcajo", "Marroquina", "Media Legua", "Fontarrón", "Vinateros"],
    "Ciudad Lineal": ["Ventas", "Pueblo Nuevo", "Quintana", "Concepción", "San Pascual", "San Juan Bautista", "Colina", "Atalaya", "Costillares"],
    "Hortaleza": ["Palomas", "Piovera", "Canillas", "Pinar del Rey", "Apostol Santiago", "Valdefuentes"],
    "Villaverde": ["San Andrés", "San Cristobal", "Butarque", "Los Rosales", "Los Angeles"],
    "Villa de Vallecas": ["Casco Histórico de Vallecas", "Santa Eugenia"],
    "Vicálvaro": ["Casco Histórico de Vicálvaro", "Ambroz"],
    "San Blas-Canillejas": ["Simancas", "Hellín", "Amposta", "Arcos", "Rosas", "Rejas", "Canillejas", "Salvador"],
    "Barajas": ["Alameda de Osuna", "Aeropuerto", "Casco Histórico de Barajas", "Timón", "Corralejos"],
}


# Barrios casi sin población (monte, parque o aeropuerto) que desplazarían el
# centroide del distrito lejos de donde están los colegios. Se excluyen del cálculo.
NON_RESIDENTIAL_BARRIOS = {"El Pardo", "Fuentelareina", "Casa de Campo", "Aeropuerto"}


def ring_area_centroid(ring):
    """Área con signo y centroide de un anillo (fórmula del polígono plano en grados)."""
    a = cx = cy = 0.0
    for (x0, y0), (x1, y1) in zip(ring, ring[1:] + ring[:1]):
        cross = x0 * y1 - x1 * y0
        a += cross
        cx += (x0 + x1) * cross
        cy += (y0 + y1) * cross
    a *= 0.5
    if a == 0:
        return 0.0, 0.0, 0.0
    return a, cx / (6 * a), cy / (6 * a)


def polygons_centroid(polygons):
    """Centroide ponderado por área de una lista de polígonos (cada uno, lista de anillos)."""
    total = sx = sy = 0.0
    for rings in polygons:
        for i, ring in enumerate(rings):
            a, cx, cy = ring_area_centroid(ring)
            a = abs(a) if i == 0 else -abs(a)  # anillos interiores restan
            total += a
            sx += cx * a
            sy += cy * a
    return sy / total, sx / total  # (lat, lng)


def decode_topojson_arcs(topo):
    sx, sy = topo["transform"]["scale"]
    tx, ty = topo["transform"]["translate"]
    arcs = []
    for arc in topo["arcs"]:
        x = y = 0
        pts = []
        for dx, dy in arc:
            x += dx
            y += dy
            pts.append((x * sx + tx, y * sy + ty))
        arcs.append(pts)
    return arcs


def ring_from_arcs(indexes, arcs):
    pts = []
    for idx in indexes:
        arc = arcs[idx] if idx >= 0 else list(reversed(arcs[~idx]))
        pts.extend(arc if not pts else arc[1:])
    return pts[:-1] if len(pts) > 1 and pts[0] == pts[-1] else pts


def build_municipalities(atlas_path):
    topo = json.load(open(atlas_path, encoding="utf-8"))
    arcs = decode_topojson_arcs(topo)
    rows = []
    for geom in topo["objects"]["municipalities"]["geometries"]:
        ine = str(geom.get("id", ""))
        if not ine.startswith("28"):
            continue
        if geom["type"] == "Polygon":
            polys = [[ring_from_arcs(r, arcs) for r in geom["arcs"]]]
        else:
            polys = [[ring_from_arcs(r, arcs) for r in p] for p in geom["arcs"]]
        lat, lng = polygons_centroid(polys)
        rows.append({"codigo_ine": ine, "municipio": geom["properties"]["name"],
                     "lat": round(lat, 5), "lng": round(lng, 5)})
    rows.sort(key=lambda r: r["codigo_ine"])
    if len(rows) != 179:
        sys.exit(f"Se esperaban 179 municipios de Madrid y se obtuvieron {len(rows)}")
    return rows


def build_districts(barrios_path):
    gj = json.load(open(barrios_path, encoding="utf-8"))
    by_name = {f["properties"]["name"]: f["geometry"] for f in gj["features"]}
    rows = []
    for district, barrios in DISTRICT_BARRIOS.items():
        polys = []
        used = [b for b in barrios if b not in NON_RESIDENTIAL_BARRIOS]
        for b in used:
            g = by_name.get(b)
            if g is None:
                sys.exit(f"Barrio '{b}' ({district}) no encontrado en el GeoJSON de origen")
            if g["type"] == "Polygon":
                polys.append([[tuple(p) for p in r] for r in g["coordinates"]])
            else:
                polys.extend([[tuple(p) for p in r] for r in poly] for poly in g["coordinates"])
        lat, lng = polygons_centroid(polys)
        rows.append({"distrito": district, "lat": round(lat, 5), "lng": round(lng, 5),
                     "barrios_agregados": len(used)})
    return rows


def write_csv(path, rows):
    with open(path, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print(f"  ✓ {path} ({len(rows)} filas)")


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    os.makedirs(OUT_DIR, exist_ok=True)
    write_csv(os.path.join(OUT_DIR, "municipios_madrid_centroides.csv"), build_municipalities(sys.argv[1]))
    write_csv(os.path.join(OUT_DIR, "distritos_madrid_centroides.csv"), build_districts(sys.argv[2]))


if __name__ == "__main__":
    main()
