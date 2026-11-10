# Pipeline de Ingesta y Gobernanza de Datos · Madrid Educa Apoyo

Este directorio contiene la arquitectura del **Pipeline de Ingesta, Detección de Cambios, Conciliación, Validación y Exportación de Datos Educativos**.

---

## ⚡ Estado de Implementación Técnica (100% Funcional)

- **`ingest.py`**:
  - Descarga de la fuente oficial (`comunidad.madrid`) o uso de fixture offline reproducible.
  - Cálculo de suma de verificación criptográfica **SHA-256**.
  - Respaldo de metadatos históricos (`metadata_previous.json`) para permitir comparación temporal.
  - Integración transparente de registros de prueba técnica sin atribuir falsamente datos sintéticos al BOCM.

- **`detect_changes.py`**:
  - Comparación activa del hash SHA-256 de la captura actual frente a la instantánea previa.
  - Reporte de delta de bytes y detección de modificaciones en la fuente oficial.
  - Verificación de estabilidad del esquema de datos extraídos.

- **`validate.py`**:
  - Verificación de esquema y obligatoriedad de campos (`codigo`, `nombre`, `municipio`, `necesidad`, `latitud`, `longitud`).
  - Validación del patrón oficial de códigos CAM (`28xxxxxx`).
  - **Comprobación efectiva de delimitación geográfica**: verifica que todas las coordenadas se ubiquen estrictamente dentro del rectángulo delimitador oficial de la Comunidad de Madrid (EPSG:4326: `lat` [39.8, 41.2], `lng` [-4.6, -3.0]).

- **`reconcile.py`**:
  - Conciliación estricta contra el catálogo oficial completo de los **179 municipios de la Comunidad de Madrid** (INE Código 28).
  - Normalización Unicode (eliminación de tildes y diacríticos, minúsculas, limpieza de blancos).
  - Coincidencia exacta obligatoria (sin inclusiones parciales permisivas).

- **`export.py`**:
  - Exportación a **GeoJSON estricto conforme a RFC 7946** (WGS 84 implícito; omisión del miembro `crs` obsoleto prohibido por el estándar).
  - Exportación tabular normalizada en **CSV** (`data_products/centros_apoyo.csv`).
  - Metadatos de gobernanza y trazabilidad (`data_products/export-summary.json`).
  - Señalización honesta del entorno de demostración técnica (`es_demostracion: True`).

---

## 🏗️ Flujo de Ejecución

```bash
python3 pipelines/ingest.py
python3 pipelines/detect_changes.py
python3 pipelines/validate.py
python3 pipelines/reconcile.py
python3 pipelines/export.py
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

- `data/raw/educacion_cam/`: Instantáneas inmutables con `source_page.html`, `metadata.json` y `metadata_previous.json`.
- `data/processed/`: Registros extraídos y parseados (`schools_extracted.json`).
- `data_products/`: Productos de datos abiertos para consumo externo (`centros_apoyo.geojson`, `centros_apoyo.csv`, `export-summary.json`).
