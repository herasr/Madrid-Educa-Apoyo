# Madrid Educa Apoyo

> **Buscador Educativo Accesible con Evidencia Oficial y Filtros Acumulativos**
> *Comunidad de Madrid — Atención Educativa Especializada · Proyecto cívico DataMad 2026*

[![Licencia](https://img.shields.io/badge/licencia-Apache--2.0-blue.svg)](LICENSE)
[![Datos Abiertos CAM](https://img.shields.io/badge/datos-Portal%20Datos%20Abiertos%20CAM%20(CC%20BY%204.0)-1d4ed8.svg)](#-datos-cargados-y-procedencia)
[![Demo pública](https://img.shields.io/badge/demo-ver%20aplicaci%C3%B3n%20en%20vivo-059669.svg)](https://ais-pre-fmis3wup3u6lkm7cq2xqsm-156015160307.europe-west2.run.app)

**Demo pública en vivo:** [Madrid Educa Apoyo (DataMad 2026)](https://ais-pre-fmis3wup3u6lkm7cq2xqsm-156015160307.europe-west2.run.app)

---

## 📊 Datos cargados y procedencia

El proyecto cruza **cuatro fuentes públicas oficiales (autonómicas, municipales y estatales)** mediante el código oficial de centro (`28xxxxxx`) y verificación nominal multiclave, bajo un principio estricto de **cero datos inventados o sintéticos**:

| Conjunto / Fuente | Alcance y contenido | Licencia / Trazabilidad |
|---|---|---|
| **Portal de Datos Abiertos CAM** — [`Centros educativos de la Comunidad de Madrid`](https://datos.comunidad.madrid/catalogo/dataset/centros_educativos) | Extrae los **69 Colegios de Educación Especial (CEE)** en situación `ALTA` (`A1`), **14 Aulas Hospitalarias** no anuladas (`4 ALTA` → `A1`, `10 EN TRÁMITE` → `A2`), **3 recursos oficiales de Discapacidad Visual** (EOEP Específico + CRE ONCE, `A1`), **10 recursos/sedes de Altas Capacidades** (CREACIM + EOEP `A1` y 8 sedes IES del PEAC `A2`) y **3 EOEP Específicos regionales** (`28700741` Auditiva, `28700763` Motora, `28701214` TDAH/Lenguaje, `A1`), además de dirección, teléfono, correo, web y coordenadas ETRS89 (`EPSG:25830` → WGS84) para **432 / 433 registros** (el restante usa centroide oficial municipal). | CC BY 4.0 · Cruce automático en vivo vía CKAN con instantánea versionada |
| **Consejería de Educación CAM** — [Relación de centros preferentes TEA con plazas previsibles](https://comunidad.madrid/sites/default/files/informacion_centros_preferentes_tea_curso_2024-25_0.pdf) (curso 2024/2025, 22/03/2024) | **336 centros preferentes TEA** (de los 682 preferentes TEA y 855 aulas declarados en la región) en los que el aula atendía a menos de 5 alumnos o se preveía nueva apertura. | Ley 37/2007 RISP · Etiquetado como **A2 · oficial, por comprobar vigencia** ante el SAE |
| **Ayuntamiento de Madrid (`datos.madrid.es`)** — [`Centros educativos en Madrid` (300614-0)](https://datos.madrid.es/egob/catalogo/300614-0-centros-educativos.csv) | Enriquece **153 centros ubicados en Madrid capital** con **transporte público** (Metro, EMT, Cercanías), **barrio**, equipamiento confirmado (**comedor**, **horario ampliado**, **transporte escolar**) y certificado de **accesibilidad física** (`ACCESIBILIDAD = 1`). | Aviso Legal Ayto. Madrid (datos abiertos) · Solo cobertura en Madrid capital |
| **Ministerio de Educación (MEFPD) · [Registro Estatal RCD](https://www.educacionfpydeportes.gob.es/servicios-al-ciudadano/catalogo/general/05/050220/ficha/050220.html)** + **[ONCE](https://www.once.es/servicios-sociales/educacion-inclusiva)** + **IGN/INE** | Respaldo estatal de codificación, convenio CAM–ONCE (`C.R.E. Antonio Vicente Mosquete`) y nomenclátor oficial de los 179 municipios y 21 distritos de Madrid. | Información pública estatal / ONCE / IGN |

**Transparencia sobre las limitaciones de los datos:**
- Para **Discapacidad Visual** (`3` registros `A1`) no existe red de centros preferentes: la aplicación muestra el **EOEP Específico de Deficiencias Visuales** (atención itinerante en cualquier colegio ordinario) y los dos centros del **C.R.E. «Antonio Vicente Mosquete» (ONCE)** en Moratalaz (`CEE` y `Primaria/ESO`), junto con la guía de trámite.
- Para **Altas Capacidades** (`10` registros) el alumnado permanece escolarizado en su centro ordinario; el buscador muestra el **CREACIM** (`A1`), el **EOEP Específico** (`A1`) y las **8 sedes IES del programa PEAC** (`A2`, talleres los sábados).
- Para **Auditiva** (`28700741`), **Motora** (`28700763`) y **TDAH / Trastorno del Lenguaje** (`28701214`), la Consejería no publica un fichero abierto nominativo de colegios preferentes en los 179 municipios; en coherencia deontológica, el buscador incorpora sus **3 EOEP Específicos regionales oficiales (`A1`)** junto con guías de trámite ante la DAT/SAE, evitando importar etiquetas parciales exclusivas de Madrid capital. Los códigos `28020910` (*IES Juan de la Cierva*, TEA+PEAC), `28021070` (*CRE ONCE*, CEE+Visual) y `28701214` (*EOEP TDAH/Lenguaje*, TDAH+TEL) acumulan doble apoyo oficial (`433` entidades únicas / `436` perfiles de apoyo).
- Para **Compensación Educativa**, la asignación de Aulas de Enlace y refuerzo se tramita de forma temporal a través del **SAE** y de las **Direcciones de Área Territorial (DAT)** sin conjunto abierto descargable (`0 · Vía SAE / DAT`, con modal de procedimiento oficial).
- El equipamiento municipal (`comedor`, `horario ampliado`, `transporte escolar`, `accesibilidad física`) solo existe en datos abiertos para **Madrid capital** (`datos.madrid.es`); fuera de Madrid capital esos filtros se deshabilitan dinámicamente para no inducir ceros engañosos.

### Ficheros de datos

- `data/official/tea_preferentes_curso_2024-25.csv` — relación oficial de los 336 centros preferentes TEA con su `.metadata.json`.
- `data/official/centros_educativos_datos_abiertos_cam.json` — subconjunto verificado del catálogo abierto CAM (433 entidades) con su `.metadata.json`.
- `data/official/ayuntamiento_madrid_centros_300614.csv` — instantánea UTF-8 de `datos.madrid.es` (`300614-0`) con su `.metadata.json`.
- `data/reference/` — centroides de respaldo de los 179 municipios (IGN) y 21 distritos de Madrid, generados con `scripts/build_geo_reference.py`.
- `data_products/` — productos reutilizables en **CSV** y **GeoJSON (RFC 7946, 433 registros)** generados por el pipeline.
- `src/data/officialTea.ts` — módulo TypeScript generado automáticamente con `scripts/build_app_data.py`.

---

## 🚀 Características Principales

1. **Filtros Acumulativos Transparentes y Dinámicos (Lógica AND entre dimensiones)**
   - **Catálogo escolar y equipos regionales (433 entidades únicas):** *Atención Preferente TEA* (`336`), *Educación Especial CEE* (`69`), *Atención Hospitalaria* (`14`), *Discapacidad Visual* (`3` · EOEP + CRE ONCE), *Altas Capacidades* (`10` · CREACIM + EOEP + 8 sedes PEAC), y los **EOEP Específicos CAM (`A1`)** de *Auditiva* (`1`), *Motora* (`1`), *TDAH* (`1`) y *Lenguaje (TDL/TEL)* (`1`), más *Ver todos* (`433`) y guía de trámite para *Compensación Educativa* (`0 · Vía SAE / DAT`).
   - **Activación y deshabilitación inteligente:** Los filtros de **servicios**, **accesibilidad física** (`datos.madrid.es`), **titularidad privada** y **evidencia A1** se habilitan automáticamente donde existen datos reales (por ejemplo, Madrid capital, CEE/Hospitalaria, Visual o Altas Capacidades) y se desactivan con aviso transparente cuando el ámbito actual carece de fuente oficial.
   - Etapas educativas (Infantil, Primaria, ESO y Bachillerato cuando procede en PEAC) con conmutador **Cualquiera / Debe impartir todas**.
   - Ámbito territorial: **Toda la Comunidad**, **Solo municipio**, **Distrito en Madrid capital** o **Radio geodésico (Haversine)** desde municipio o geolocalización bajo demanda.

2. **Privacidad desde el Diseño**
   - Sin peticiones automáticas de ubicación GPS al abrir la web.
   - Si el usuario activa *«Cerca de mí»*, su coordenada se redondea a ~110 m y **nunca** se escribe en los parámetros de URL compartibles.
   - Las notas personales del Pasaporte Local se almacenan exclusivamente en el navegador (`localStorage`), sin envío a servidores externos.

3. **Accesibilidad, Lectura Fácil, Comparador y Pasaporte Local**
   - Mapa interactivo (Leaflet + OpenStreetMap) con leyenda diferenciada (`TEA` azul, `CEE` verde, `HOSP` rojo, `VIS` azul cobalto, `AAC` púrpura, `AUD/MOT` teal y `TDA/TEL` naranja) e indicador visual A1/A2.
   - Modo **Lectura Fácil** que simplifica siglas (`CEIP`, `CEIPSO`, `IES`, `SIES`, `CEE`, `PT`, `AL`, `TIS`, `EOEP`, `SAE`) en lenguaje claro.
   - Gestión de foco accesible en todos los modales, región `aria-live="polite"`, contraste WCAG AA y etiquetas semánticas.
   - **Comparador objetivo** (máximo 3 centros) y **Pasaporte Local** orientativo imprimible/PDF.

4. **URL Reproducible y Exportación Abierta**
   - Sincronización de filtros territoriales y educativos en URL compartible.
   - Descarga directa en **CSV** y **JSON** con trazabilidad de las cuatro fuentes públicas y distinción explícita entre dato confirmado y ausencia de fuente, además de los ficheros publicados en `data_products/`.

---

## 🛠️ Requisitos e Instalación

### Requisitos previos
- **Node.js**: v22.12+ (requerido por Vitest 4 y Vite)
- **npm**: v10+
- **Python**: v3.10+ (para ejecutar el pipeline de datos)

### Instalación local
```bash
# Instalar dependencias de la aplicación web
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

- `ingest.py`: verifica la relación oficial TEA (336), descarga o lee `centros_educativos` de `datos.comunidad.madrid` (CKAN) para extraer CEE (`69 ALTA`), Aulas Hospitalarias (`14`), Discapacidad Visual (`3`), Altas Capacidades (`10`) y los 3 EOEP Específicos regionales (Auditiva, Motora, TDAH/Lenguaje), convierte coordenadas ETRS89 UTM30N (`EPSG:25830`) a WGS84 (`latitud`, `longitud`) y cruza centros de Madrid capital con `datos.madrid.es` (`300614-0`) por teléfono/denominación normalizada.
- `validate.py`: comprueba campos obligatorios, unicidad de códigos `28xxxxxx` y coordenadas válidas dentro de la Comunidad de Madrid para los 433 registros.
- `reconcile.py`: valida los municipios contra el nomenclátor oficial de 179 municipios de la Comunidad de Madrid.
- `detect_changes.py`: compara el hash SHA-256 del catálogo respecto a la ejecución anterior.
- `export.py`: genera `data_products/centros_apoyo.csv` y `data_products/centros_apoyo.geojson` (433 features).
- `scripts/build_app_data.py`: genera `src/data/officialTea.ts` para la aplicación web.

El flujo de GitHub Actions (`.github/workflows/update_resources.yml`) se ejecuta automáticamente en cada `push`/`pull_request` y semanalmente cada lunes: ejecuta el pipeline Python, corre la suite de pruebas, verifica tipos TypeScript (`npm run lint`) y compila la aplicación (`npm run build`).

---

## 🧪 Pruebas y Validación

El proyecto incluye pruebas unitarias automatizadas para el motor de filtros, la integridad de las 433 entidades oficiales (336 TEA, 69 CEE, 14 Hospitalaria, 3 Discapacidad Visual, 10 Altas Capacidades y 3 EOEP Específicos, con doble apoyo en `28020910`, `28021070` y `28701214`) cruzadas con Datos Abiertos CAM y `datos.madrid.es`, la privacidad en URLs compartibles y los 12 escenarios técnicos `FIL-001` a `FIL-012`:
```bash
# Ejecutar suite de pruebas con Vitest
npm test

# Comprobar tipos TypeScript y compilación de producción
npm run lint && npm run build
```

---

## 👥 Autoría y Licencia

Desarrollado como iniciativa cívica abierta para **DataMad 2026**.

- **Código fuente:** Licencia [Apache 2.0](LICENSE).
- **Datos públicos integrados:**
  - *Centros educativos de la Comunidad de Madrid* (`datos.comunidad.madrid`), bajo licencia **CC BY 4.0**.
  - *Relación de centros preferentes TEA* (Consejería de Educación, Comunidad de Madrid), reutilización conforme a la Ley 37/2007.
  - *Centros educativos en Madrid* (`datos.madrid.es`, conjunto `300614-0`, Ayuntamiento de Madrid).
  - *Registro Estatal de Centros Docentes (RCD)* (Ministerio de Educación, Formación Profesional y Deportes).
