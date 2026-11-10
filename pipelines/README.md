# Pipeline de Actualización y Gobernanza de Datos · Madrid Educa Apoyo

Este directorio contiene la arquitectura del **Pipeline de Ingesta, Conciliación, Validación y Publicación de Evidencia Oficial Educativa**.

---

## 🏗️ Estructura de las Fases del Pipeline

```
Fuentes oficiales (CAM, ONCE, Ayto)
        ↓
1. Descarga y captura de instantáneas (data/raw/)
        ↓
2. Validación de integridad y hashes (sha256)
        ↓
3. Extracción y Normalización textual/etapas (Unicode NFC, mappings)
        ↓
4. Conciliación de entidades (Código oficial exacto, normalizado)
        ↓
5. Detección de cambios e incidencias (Baja, Media, Alta, Crítica)
        ↓
6. Cola de revisión de incidencias (Aprobación automática vs humana)
        ↓
7. Cálculo de evidencias oficiales (A1 Confirmado / A2 Por comprobar)
        ↓
8. Exportación de productos de datos (facts_resources.csv, derived_evidence.csv, JSON, GeoJSON)
        ↓
9. Pruebas de regresión y calidad (Vitest, axe-core, Lighthouse)
        ↓
10. Publicación estática de la aplicación sin regresiones
```

---

## 📋 Regla Fundamental de Protección de Datos

> **No encontrado en la nueva captura ≠ El recurso ha sido eliminado oficialmente ≠ El parser ha fallado**

Ningún centro o recurso se retira automáticamente únicamente por desaparecer de una captura HTML/CKAN. La baja requiere:
1. Fuente oficial explícita con boletín o acto administrativo.
2. Confirmación cruzada en una segunda fuente oficial.
3. O revisión humana supervisada.

---

## 📁 Directorios de Datos

- `data/raw/`: Instantáneas inmutables con `source.html`, `headers.json`, `metadata.json` y `sha256.txt`.
- `data/normalized/`: Registros limpios con campos estándar y taxonomía mapeada.
- `data/review/`: Incidencias bloqueadas por cambios de código, dirección >500m o especialidad.
- `data/approved/`: Dataset validado listo para la compilación estática.
- `data_products/`: Archivos distribuidos (`csv`, `json`, `geojson`, `metadata.json`).
