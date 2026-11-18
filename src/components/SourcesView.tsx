/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Vista de Fuentes, Vigencia y Limitaciones
 */

import React from 'react';
import { OFFICIAL_SOURCES_INFO, LEGAL_DISCLAIMER } from '../data/disclaimerAndProcedures';
import { ShieldCheck, BookOpen, ExternalLink, Scale, AlertTriangle, Database } from 'lucide-react';
import { OFFICIAL_TEA_SOURCE } from '../data/officialTea';

export const SourcesView: React.FC = () => {
  const isLiveCkan = String(OFFICIAL_TEA_SOURCE.estadoDatosAbiertos) === 'CKAN_EN_VIVO';
  const isPdfVerified = String(OFFICIAL_TEA_SOURCE.estadoVerificacion) === 'PDF_OFICIAL_VERIFICADO';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Declaración Jurídica e Institucional */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <Scale className="w-6 h-6 text-blue-900" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900 block mb-1">
              Régimen Jurídico y Función de la Aplicación
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
              Aviso Legal, Fuentes y Limitaciones
            </h1>
            <div className="mt-3 p-3 bg-slate-900 text-white rounded-xl text-xs font-semibold">
              <span className="text-amber-300 mr-1.5">Declaración obligatoria:</span>
              {LEGAL_DISCLAIMER}
            </div>
            <p className="text-xs text-slate-700 mt-3 leading-relaxed">
              Madrid Educa Apoyo es una herramienta cívica y orientadora desarrollada para facilitar a las familias
              la localización transparente de centros con atención preferente publicados por la Comunidad de Madrid.
              No sustituye la valoración de los Equipos de Orientación Educativa y Psicopedagógica (EOEP) ni garantiza
              plaza en los procesos oficiales de admisión.
            </p>
          </div>
        </div>
      </div>

      {/* Datos realmente cargados en esta versión */}
      <div className="bg-white border border-emerald-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <span>Datos cargados en esta versión ({OFFICIAL_TEA_SOURCE.totalCentrosCatalogo} centros oficiales)</span>
        </h2>

        {/* Bloque 1: Portal de Datos Abiertos CAM */}
        <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-4 text-xs text-slate-800 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-800" aria-hidden="true" />
              <span>Portal de Datos Abiertos CAM · «{OFFICIAL_TEA_SOURCE.datosAbiertosTitulo}»</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-white border border-blue-300 text-blue-900">
              {isLiveCkan
                ? `CKAN en vivo (${OFFICIAL_TEA_SOURCE.datosAbiertosLicencia})`
                : `Instantánea CKAN (${OFFICIAL_TEA_SOURCE.datosAbiertosLicencia})`}
            </span>
          </div>
          <p className="leading-relaxed">
            Aporta <strong>{OFFICIAL_TEA_SOURCE.totalCee} Colegios de Educación Especial (CEE)</strong> en situación <span className="font-mono">ALTA</span>, <strong>{OFFICIAL_TEA_SOURCE.totalHospitalarias} Aulas Hospitalarias</strong>, <strong>{OFFICIAL_TEA_SOURCE.totalVisual} recursos de Discapacidad Visual</strong> (EOEP + C.R.E. ONCE), <strong>{OFFICIAL_TEA_SOURCE.totalAltasCapacidades} recursos/sedes de Altas Capacidades</strong> (CREACIM + EOEP + 8 sedes IES del PEAC) y los <strong>EOEP Específicos regionales</strong> en situación <span className="font-mono">ALTA</span> para <strong>Auditiva</strong> ({OFFICIAL_TEA_SOURCE.totalAuditiva}), <strong>Motora</strong> ({OFFICIAL_TEA_SOURCE.totalMotora}) y <strong>TDAH / Trastornos del Lenguaje</strong> ({OFFICIAL_TEA_SOURCE.totalTdah}), además de dirección postal, teléfono, correo, web y coordenadas exactas ETRS89→WGS84 para <strong>{OFFICIAL_TEA_SOURCE.totalConUbicacionExactaCatalogo} de {OFFICIAL_TEA_SOURCE.totalCentrosCatalogo} entidades</strong>.
          </p>
          <div className="pt-1">
            <a
              href={OFFICIAL_TEA_SOURCE.datosAbiertosUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-900 hover:underline inline-flex items-center gap-1"
            >
              Ver conjunto de datos en datos.comunidad.madrid <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Bloque 2: Ayuntamiento de Madrid (datos.madrid.es) */}
        <div className="border border-indigo-200 bg-indigo-50/50 rounded-xl p-4 text-xs text-slate-800 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-800" aria-hidden="true" />
              <span>Ayuntamiento de Madrid · «Centros educativos en Madrid» (datos.madrid.es)</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-white border border-indigo-300 text-indigo-900">
              {OFFICIAL_TEA_SOURCE.estadoAyuntamiento === 'AYTO_MADRID_EN_VIVO'
                ? 'Fuente externa en vivo'
                : 'Instantánea municipal'}
            </span>
          </div>
          <p className="leading-relaxed">
            Cruce verificado en Madrid capital con <strong>{OFFICIAL_TEA_SOURCE.totalConTransporteAyto} centros con transporte público</strong> (Metro/EMT/Cercanías) y barrio, <strong>{OFFICIAL_TEA_SOURCE.totalConServiciosAyto} con equipamiento municipal declarado</strong> (comedor, horario ampliado, transporte escolar) y <strong>{OFFICIAL_TEA_SOURCE.totalConAccesibilidadAyto} con código 1 (Accesible)</strong> según <span className="font-mono">estructura_ds_conjuntodatos.pdf</span> (que distingue <span className="font-mono">0</span> No accesible, <span className="font-mono">1</span> Accesible, <span className="font-mono">2</span> Parcialmente accesible PMR, <span className="font-mono">3</span> Sin información PMR, <span className="font-mono">4</span> Lengua de signos, <span className="font-mono">5</span> Señalización podotáctil y <span className="font-mono">6</span> Bucle magnético). Los restantes 178 municipios carecen de este conjunto abierto.
          </p>
          <div className="pt-1">
            <a
              href={OFFICIAL_TEA_SOURCE.ayuntamientoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-900 hover:underline inline-flex items-center gap-1"
            >
              Descargar conjunto 300614-0 en datos.madrid.es <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Bloque 3: Relación TEA */}
        <div className="border border-emerald-200 bg-emerald-50/60 rounded-xl p-4 text-xs text-slate-800 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-extrabold text-slate-900">
              Consejería de Educación · {OFFICIAL_TEA_SOURCE.totalCentros} centros preferentes TEA
            </div>
            <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-white border border-emerald-300 text-emerald-900">
              {isPdfVerified
                ? 'Verificado contra PDF oficial'
                : 'Instantánea oficial versionada (SHA-256)'}
            </span>
          </div>
          <p className="leading-relaxed">
            {OFFICIAL_TEA_SOURCE.organismo}. «{OFFICIAL_TEA_SOURCE.titulo}», curso {OFFICIAL_TEA_SOURCE.curso},
            información a {OFFICIAL_TEA_SOURCE.fechaInformacion}.
          </p>
          <p className="leading-relaxed">
            <span className="font-semibold text-slate-900">Alcance:</span> {OFFICIAL_TEA_SOURCE.alcance} Por tratarse de datos publicados para el curso {OFFICIAL_TEA_SOURCE.curso}, los 336 centros TEA figuran como <strong>A2 · oficial, por comprobar vigencia</strong> ante el SAE.
          </p>
          <p className="leading-relaxed text-xs text-slate-700">
            <span className="font-semibold text-slate-900">Productos reutilizables generados por el pipeline:</span>{' '}
            <code className="font-mono bg-white/80 px-1 rounded border border-emerald-200">data_products/centros_apoyo.geojson</code> (GeoJSON RFC 7946, {OFFICIAL_TEA_SOURCE.totalCentrosCatalogo} registros) y{' '}
            <code className="font-mono bg-white/80 px-1 rounded border border-emerald-200">data_products/centros_apoyo.csv</code>, además de descarga directa desde el menú <em>Exportar</em>.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <a href={OFFICIAL_TEA_SOURCE.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-900 hover:underline inline-flex items-center gap-1">
              Documento TEA (PDF 2024/25) <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
            <a href={OFFICIAL_TEA_SOURCE.listadoCompletoUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-900 hover:underline inline-flex items-center gap-1">
              Información general en comunidad.madrid <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Bloque 4: Escuelas de Bienvenida / Aulas de Enlace */}
        <div className="border border-indigo-200 bg-indigo-50/40 rounded-xl p-4 text-xs text-slate-800 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-extrabold text-slate-900">
              Consejería de Educación (DG Concertada) · {OFFICIAL_TEA_SOURCE.totalCompensatoria} Aulas de Enlace ({OFFICIAL_TEA_SOURCE.cursoAulasEnlace})
            </div>
            <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-white border border-indigo-300 text-indigo-900">
              {OFFICIAL_TEA_SOURCE.estadoAulasEnlace === 'PDF_OFICIAL_VERIFICADO'
                ? 'Resolución PDF verificada (SHA-256)'
                : 'Resolución oficial 2026/27'}
            </span>
          </div>
          <p className="leading-relaxed">
            Resolución de {OFFICIAL_TEA_SOURCE.fechaAulasEnlace} por la que se autorizan{' '}
            <strong>{OFFICIAL_TEA_SOURCE.totalCompensatoria} Aulas de Enlace (Escuelas de Bienvenida)</strong> en centros privados concertados para el curso {OFFICIAL_TEA_SOURCE.cursoAulasEnlace} (<strong>Nivel A1 · oficial vigente</strong>). De ellos, 10 coinciden con centros TEA y 37 amplían el catálogo hasta {OFFICIAL_TEA_SOURCE.totalCentrosCatalogo} centros y equipos.
          </p>
          <p className="leading-relaxed text-slate-700">
            <span className="font-semibold text-slate-900">Límite de cobertura pública:</span> {OFFICIAL_TEA_SOURCE.alcanceAulasEnlace}
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <a href={OFFICIAL_TEA_SOURCE.aulasEnlaceResolucionUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-900 hover:underline inline-flex items-center gap-1">
              Resolución Aulas de Enlace 2026/27 (PDF) <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
            <a href={OFFICIAL_TEA_SOURCE.aulasEnlaceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-900 hover:underline inline-flex items-center gap-1">
              Portal Aulas de Enlace (EducaMadrid) <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="border border-slate-200 bg-slate-50/80 rounded-xl p-4 text-xs text-slate-800 space-y-1.5">
          <div className="font-extrabold text-slate-900">Metodología de cruce, detección de conflictos y límites de los datos</div>
          <p className="leading-relaxed">
            Los datos proceden exclusivamente de los conjuntos abiertos arriba citados ({OFFICIAL_TEA_SOURCE.totalCentros} centros TEA con plazas previsibles, {OFFICIAL_TEA_SOURCE.totalCompensatoria} Aulas de Enlace concertadas 2026/27, {OFFICIAL_TEA_SOURCE.totalCee} CEE en <span className="font-mono">ALTA</span>, {OFFICIAL_TEA_SOURCE.totalHospitalarias} Aulas Hospitalarias, {OFFICIAL_TEA_SOURCE.totalVisual} recursos de Discapacidad Visual, {OFFICIAL_TEA_SOURCE.totalAltasCapacidades} recursos/sedes de Altas Capacidades y 3 EOEP Específicos regionales), más el enriquecimiento municipal de <span className="font-mono">datos.madrid.es</span> para Madrid capital.
          </p>
          <p className="leading-relaxed text-slate-700">
            Cuando el listado TEA 2024/25 presenta discrepancias de código o nombre respecto al directorio maestro CKAN (como el intercambio detectado entre <span className="font-mono">28020120</span> y <span className="font-mono">28011258</span>), prevalecen la denominación y contacto del catálogo maestro y se registra la incidencia en <span className="font-mono">data/review/conflictos_nombres.json</span>. Los enlaces telefónicos ambiguos con el fichero municipal se descartan automáticamente en <span className="font-mono">data/review/ayto_matches_dudosos.json</span>.
          </p>
        </div>
      </div>

      {/* Jerarquía de Fuentes */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-800" aria-hidden="true" />
          <span>Fuentes Públicas Integradas</span>
        </h2>

        <div className="space-y-3">
          {OFFICIAL_SOURCES_INFO.map(src => (
            <div key={src.prioridad} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {src.prioridad}
                </span>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">{src.organismo}</div>
                  <p className="text-xs text-slate-700 mt-0.5">{src.descripcion}</p>
                </div>
              </div>

              <div className="shrink-0 text-left sm:text-right">
                <span className="inline-block text-xs font-mono font-medium text-blue-950 bg-blue-50 border border-blue-200 px-2 py-1 rounded">
                  {src.ambito}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Niveles de Evidencia: A1 y A2 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <span>Criterio de Evidencia Documental</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
            <div className="font-extrabold text-emerald-950 text-sm mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              <span>Nivel A1: Confirmado Oficial Vigente</span>
            </div>
            <p className="text-slate-800 leading-relaxed">
              Centros y equipos activos en situación <span className="font-mono">ALTA</span> y resoluciones vigentes del curso en vigor: <strong>69 Colegios de Educación Especial</strong>, <strong>47 Aulas de Enlace concertadas (2026/27)</strong>, <strong>4 Aulas Hospitalarias</strong>, <strong>3 recursos de Discapacidad Visual</strong> (EOEP Específico y C.R.E. ONCE), <strong>CREACIM</strong>, <strong>EOEP Específico de Altas Capacidades</strong> y los <strong>3 EOEP Específicos</strong> de <strong>Auditivas</strong>, <strong>Motóricas</strong> y <strong>Dificultades de Aprendizaje / Lenguaje / TDAH</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
            <div className="font-extrabold text-amber-950 text-sm mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" aria-hidden="true" />
              <span>Nivel A2: Oficial · por comprobar vigencia</span>
            </div>
            <p className="text-slate-800 leading-relaxed">
              Incluye los <strong>336 centros preferentes TEA</strong> (listado 2024/25), las <strong>10 aulas hospitalarias en trámite</strong> y las <strong>8 sedes IES del programa PEAC</strong> (vigencia por convocatoria anual). Recomendamos confirmar disponibilidad actual ante el SAE o centro.
            </p>
          </div>
        </div>
      </div>

      {/* Enlaces de Interés Oficial */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-xs text-slate-700 space-y-2">
        <div className="font-bold text-slate-900 mb-1">Portales Oficiales de Consulta:</div>
        <ul className="space-y-1.5">
          <li>
            <a
              href="https://datos.comunidad.madrid/catalogo/dataset/centros_educativos"
              target="_blank"
              rel="noreferrer"
              className="text-blue-900 hover:underline inline-flex items-center gap-1 font-medium"
            >
              <span>Portal de Datos Abiertos CAM · Centros educativos (CC BY 4.0)</span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </li>
          <li>
            <a
              href="https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=b33290e5b4e4d410VgnVCM2000000c205a0aRCRD"
              target="_blank"
              rel="noreferrer"
              className="text-blue-900 hover:underline inline-flex items-center gap-1 font-medium"
            >
              <span>Portal de Datos Abiertos Ayuntamiento de Madrid · Centros educativos (300614-0)</span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </li>
          <li>
            <a
              href={OFFICIAL_TEA_SOURCE.aulasEnlaceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-900 hover:underline inline-flex items-center gap-1 font-medium"
            >
              <span>Comunidad de Madrid (EducaMadrid) · Programa Escuelas de Bienvenida / Aulas de Enlace</span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </li>
          <li>
            <a
              href="https://www.comunidad.madrid/servicios/educacion/atencion-diferencias-individuales"
              target="_blank"
              rel="noreferrer"
              className="text-blue-900 hover:underline inline-flex items-center gap-1 font-medium"
            >
              <span>Comunidad de Madrid · Atención a las Diferencias Individuales</span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </li>
          <li>
            <a
              href="https://www.comunidad.madrid/servicios/educacion/admision-alumnos-educacion-infantil-primaria-especial-secundaria-obligatoria-bachillerato"
              target="_blank"
              rel="noreferrer"
              className="text-blue-900 hover:underline inline-flex items-center gap-1 font-medium"
            >
              <span>Comunidad de Madrid · Proceso de Admisión de Alumnos</span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </li>
          <li>
            <a
              href="https://www.ign.es/"
              target="_blank"
              rel="noreferrer"
              className="text-blue-900 hover:underline inline-flex items-center gap-1 font-medium"
            >
              <span>Instituto Geográfico Nacional (IGN) · Nomenclátor y geometrías</span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};
