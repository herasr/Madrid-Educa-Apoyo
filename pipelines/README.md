# Pipeline de Ingesta y Gobernanza de Datos · Madrid Educa Apoyo

Este directorio contiene la arquitectura del **Pipeline de Ingesta, Detección de Cambios, Conciliación, Validación y Exportación de Datos Educativos**.

---

## ⚡ Qué hace cada fase

- **`ingest.py`** — datos oficiales reales:
  - Fuente: relación de centros de atención preferente TEA de la Comunidad de Madrid (curso 2024/2025, información a 22/03/2024), versionada en `data/official/`.
  - Descarga el PDF oficial, calcula su **SHA-256**, extrae los códigos de centro con `pdfplumber` y los compara con la instantánea. Diferencias → `data/review/tea_diferencias.json` (nunca se publican sin revisión humana).
  - Normaliza abreviaturas de localidad (`S.S.REYES` → San Sebastián de los Reyes…), distritos, titularidad (CP/IES → público, CPR → concertado) y etapas.
  - Asigna una **ubicación aproximada** (centroide IGN del municipio o del distrito de Madrid), porque el documento no publica direcciones.
- **`validate.py`**: campos obligatorios, códigos `28xxxxxx` únicos y coordenadas dentro del rectángulo de la Comunidad de Madrid.
- **`reconcile.py`**: coincidencia exacta con los **179 municipios** del nomenclátor INE.
- **`detect_changes.py`**: compara el SHA-256 de los datos usados con la ejecución anterior (`metadata_previous.json`).
- **`export.py`**: GeoJSON (RFC 7946) y CSV con fuente, fecha, procedencia y aviso de ubicación aproximada.
- **`scripts/build_app_data.py`**: genera `src/data/officialTea.ts`, el módulo que usa la web.

---

## 🏗️ Flujo de Ejecución

```bash
pip install -r pipelines/requirements.txt
python3 -m pipelines.ingest
python3 -m pipelines.validate
python3 -m pipelines.reconcile
python3 -m pipelines.detect_changes
python3 -m pipelines.export
python3 scripts/build_app_data.py
```

---

## 📋 Regla de Gobernanza de Recursos Educativos

> **No encontrado en la nueva captura ≠ El recurso ha sido eliminado oficialmente ≠ El parser ha fallado**

Ningún centro o recurso de apoyo se retira automáticamente únicamente por desaparecer de una captura HTML. La baja o modificación sustancial requiere:
1. Publicación de acto administrativo o resolución en boletín oficial.
2. Confirmación cruzada en una segunda fuente institucional.
3. O revisión técnica humana supervisada.

---

## 📁 Estructura de Directorios

- `data/official/`: instantánea literal de cada documento oficial + `.metadata.json` (fuente, fecha, alcance, método de extracción).
- `data/reference/`: centroides de municipios (IGN) y distritos de Madrid (`scripts/build_geo_reference.py`).
- `data/raw/educacion_cam/`: `metadata.json` y `metadata_previous.json` de cada ejecución (el PDF descargado no se versiona).
- `data/processed/`: registros normalizados (`schools_extracted.json`).
- `data/review/`: diferencias detectadas frente a la fuente oficial, pendientes de revisión humana.
- `data_products/`: datos abiertos para reutilizar (`centros_apoyo.geojson`, `centros_apoyo.csv`, `export-summary.json`).
