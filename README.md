# Madrid Educa Apoyo

> **Buscador Educativo Accesible con Evidencia Oficial y Filtros Acumulativos**
> *Comunidad de Madrid — Atención Educativa Especializada*

[![Licencia](https://img.shields.io/badge/licencia-Apache--2.0-blue.svg)](LICENSE)
[![Estado](https://img.shields.io/badge/datos-TEA%20oficiales%20%2B%20demo-green.svg)](#-qué-datos-son-reales-y-cuáles-no)

---

## 📊 Qué datos son reales y cuáles no

| Necesidad | Datos | Fuente |
|---|---|---|
| **TEA** (autismo) | **Oficiales: 336 centros de atención preferente** | Comunidad de Madrid, [relación de centros preferentes TEA con plazas previsibles en el aula TEA](https://comunidad.madrid/sites/default/files/informacion_centros_preferentes_tea_curso_2024-25_0.pdf), curso 2024/2025, información a 22/03/2024 |
| Auditiva, motora, visual, altas capacidades, CEE y demás | Demostración (sintéticos) | Pendientes de cargar sus listados oficiales |

**Alcance del dato oficial.** El documento no es el catálogo completo (la Comunidad declara 682 centros preferentes TEA): recoge los centros cuya aula TEA atendía a menos de cinco alumnos en esa fecha, es decir, los que tenían plazas previsibles para la admisión de ese curso. Como es un dato de un curso anterior, la aplicación lo muestra como **A2 · oficial, por comprobar vigencia**.

**Lo que la fuente no publica y la aplicación no inventa:** direcciones, teléfonos, servicios, accesibilidad, nombre del aula, personal asignado e instituto de adscripción. Cada centro se sitúa en el **centroide de su municipio** (geometrías del IGN) **o de su distrito** de Madrid, y la interfaz marca la ubicación como aproximada.

Cada ficha indica su procedencia con la etiqueta **«Dato oficial»** o **«Demostración»**. Para trámites de escolarización consulte siempre la [Comunidad de Madrid](https://www.comunidad.madrid/servicios/educacion/atencion-preferente-necesidades-educativas-especiales) y el Servicio de Apoyo a la Escolarización (SAE).

### Ficheros de datos

- `data/official/tea_preferentes_curso_2024-25.csv` — transcripción literal del documento oficial (336 filas), con su `.metadata.json` (fuente, fecha, alcance, método de extracción).
- `data/reference/` — centroides de los 179 municipios (IGN) y de los 21 distritos de Madrid, generados con `scripts/build_geo_reference.py`.
- `data_products/` — los mismos datos en CSV y GeoJSON (RFC 7946) para reutilizarlos.
- `src/data/officialTea.ts` — módulo que usa la web, generado con `scripts/build_app_data.py`.

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

## 📊 Pipeline de datos (Python)

```bash
pip install -r pipelines/requirements.txt
python3 -m pipelines.ingest && python3 -m pipelines.validate && python3 -m pipelines.reconcile \
  && python3 -m pipelines.detect_changes && python3 -m pipelines.export && python3 scripts/build_app_data.py
```

- `ingest.py`: lee la instantánea oficial versionada, **descarga el PDF de la Comunidad de Madrid, extrae sus códigos de centro y los compara** con la instantánea. Si coinciden, el estado es `PDF_OFICIAL_VERIFICADO`; si difieren, escribe `data/review/tea_diferencias.json` para revisión humana; sin red, usa la instantánea (`SNAPSHOT_VERSIONADO`). Después normaliza municipio, distrito, titularidad, tipo y etapas.
- `validate.py`: campos obligatorios, códigos `28xxxxxx` únicos y coordenadas dentro de la Comunidad de Madrid.
- `reconcile.py`: cada municipio debe coincidir exactamente con uno de los 179 del nomenclátor INE.
- `detect_changes.py`: compara el hash SHA-256 de los datos usados con la ejecución anterior.
- `export.py`: CSV y GeoJSON con fuente, fecha y aviso de ubicación aproximada en cada registro.
- `scripts/build_app_data.py`: genera `src/data/officialTea.ts` para la web.

La tarea programada de GitHub (`.github/workflows/update_resources.yml`) ejecuta todo cada lunes, pasa los tests, compila la web y guarda la cola de revisión como artefacto.

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
