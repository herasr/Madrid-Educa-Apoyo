# Madrid Educa Apoyo

> **Buscador Educativo Accesible con Evidencia Oficial y Filtros Acumulativos**
> *Comunidad de Madrid — Atención Educativa Especializada*

[![Licencia](https://img.shields.io/badge/licencia-Apache--2.0-blue.svg)](LICENSE)
[![Estado](https://img.shields.io/badge/estado-prototipo--demo-amber.svg)](#aviso-legal)

---

## ⚠️ Aviso de Prototipo de Demostración

Los datos de centros y resoluciones incluidos en este repositorio son **simulaciones técnicas sintéticas** diseñadas exclusivamente para la prueba de concepto y evaluación de arquitectura/interfaz. **No constituyen el registro ni la oferta oficial de la Consejería de Educación de la Comunidad de Madrid.**

Para trámites de escolarización oficial, consulte siempre los portales institucionales de la [Comunidad de Madrid](https://www.comunidad.madrid/servicios/educacion).

---

## 🚀 Características Principales

1. **Filtros Acumulativos (Lógica AND Estricta)**
   - Necesidades funcionales (TEA, Discapacidad Auditiva, Motora, CEE, Visual, Altas Capacidades).
   - Etapas educativas (Infantil, Primaria, ESO, Bachillerato, FP Básica).
   - Radio geográfico real (Haversine desde municipio o geolocalización GPS).
   - Accesibilidad física y servicios de apoyo.

2. **Criterio de Evidencia Oficial (A1 / A2)**
   - **A1 (Confirmado):** Centro y etapa ratificados en resoluciones publicadas en el BOCM.
   - **A2 (Por comprobar):** Centro con recurso asignado pendiente de confirmación de vacantes o etapa.

3. **Navegación Unificada y Transparente**
   - Vista integrada Mapa + Tarjetas (Leaflet client-side en local).
   - Comparador de centros (límite recomendado a 3 centros para claridad familiar).
   - Exportación de informes en PDF e impresión sin elementos de interfaz.
   - Generación de datos abiertos (CSV y JSON con procedencia BOCM).

4. **URL Reproducible y Compartible**
   - Sincronización completa de estado de búsqueda en los parámetros de la URL para compartir búsquedas exactas sin pérdida de contexto.

---

## 🛠️ Requisitos e Instalación

### Requisitos previos
- **Node.js**: v18+
- **npm**: v9+
- **Python**: v3.10+ (para pipelines de datos)

### Instalación local
```bash
# Clonar repositorio e instalar dependencias de la web app
npm install

# Iniciar servidor de desarrollo (puerto 3000)
npm run dev
```

---

## 📊 Pipelines de Datos y Trazabilidad (Python)

El directorio `pipelines/` contiene los scripts del flujo de datos para ingesta y validación:

- `pipelines/ingest.py`: Descarga y captura de fuentes con cálculo de hash SHA-256 e instantánea de respaldo offline (`OFFLINE_SAMPLE_FIXTURE`).
- `pipelines/validate.py`: Validación de esquema de datos y verificación de códigos oficiales CAM (`28xxxxxx`).
- `pipelines/reconcile.py`: Comprobación de concordancia frente al nomenclátor municipal oficial de la CAM.
- `pipelines/detect_changes.py`: Inspección de hashes de integridad SHA-256 frente a la captura previa.
- `pipelines/export.py`: Exportación a formatos abiertos: `data_products/centros_apoyo.geojson` (GeoJSON RFC 7946), `centros_apoyo.csv` y `export-summary.json`.

Ejecución manual completa del pipeline:
```bash
python3 -m pipelines.ingest && python3 -m pipelines.validate && python3 -m pipelines.reconcile && python3 -m pipelines.detect_changes && python3 -m pipelines.export
```

---

## 🧪 Pruebas Unitarias y Calidad

El proyecto incluye tests unitarios para las funciones puras del motor de filtrado, ordenación y relajación de cero resultados:
```bash
# Ejecutar suite de pruebas con Vitest
npm test
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia [Apache 2.0](LICENSE).
