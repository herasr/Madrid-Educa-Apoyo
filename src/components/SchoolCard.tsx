/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tarjeta de Centro Educativo Simplificada para Familias
 * - Dirección real y geolocalización oficial de Datos Abiertos CAM (sin tiempos de trayecto estimados)
 * - Modo Lectura Fácil real sobre nombre, etapa, evidencia, continuidad y aviso de servicios
 * - Tipografía mínima 12px (text-xs) y contraste WCAG AA
 */

import React from 'react';
import { School, SearchState } from '../types';
import { calculateHaversineDistance, MUNICIPALITIES } from '../data/municipalities';
import {
  FileText,
  MapPin,
  Check,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { simplifyText, simplifySchoolTitle } from '../utils/textSimplifier';

interface SchoolCardProps {
  school: School;
  state: SearchState;
  isCompared: boolean;
  onToggleCompare: (school: School) => void;
  onOpenDetail: (school: School) => void;
  onOpenWhyAppears: (school: School) => void;
  onOpenContinuity?: (school: School) => void;
  isEasyReadMode: boolean;
}

export const SchoolCard: React.FC<SchoolCardProps> = ({
  school,
  state,
  isCompared,
  isEasyReadMode,
  onToggleCompare,
  onOpenDetail,
  onOpenWhyAppears,
  onOpenContinuity
}) => {
  const currentSupport = state.need
    ? school.apoyos.find(a => a.needId === state.need) || school.apoyos[0]
    : school.apoyos[0];

  const formatText = (text: string) => (isEasyReadMode ? simplifyText(text) : text);
  const displayName = isEasyReadMode ? simplifySchoolTitle(school.nombre) : school.nombre;
  const isA1 = currentSupport?.evidencia === 'A1';
  const isOfficial = school.procedencia === 'oficial';
  const needId = currentSupport?.needId || 'tea';

  const needLabel = isEasyReadMode
    ? needId === 'tea'
      ? 'Tiene Aula de Apoyo para Autismo (TEA)'
      : needId === 'educacion_especial'
      ? 'Es un Colegio de Educación Especial (apoyo intensivo)'
      : needId === 'salud_hospitalaria'
      ? 'Tiene Aula Hospitalaria mientras dura el ingreso médico'
      : needId === 'visual'
      ? 'Apoyo especializado para ceguera o baja visión (EOEP / ONCE)'
      : needId === 'altas_capacidades'
      ? 'Apoyo o taller los sábados para Altas Capacidades (PEAC / CREACIM)'
      : needId === 'auditiva'
      ? 'Equipo público experto que ayuda en colegios para sordera o pérdida auditiva'
      : needId === 'motora'
      ? 'Equipo público experto que valora ayudas físicas y motoras en los colegios'
      : needId === 'tdah'
      ? 'Equipo público experto que asesora sobre TDAH y dificultades de aprendizaje'
      : needId === 'tel_lenguaje'
      ? 'Equipo público experto que asesora sobre trastornos del lenguaje'
      : needId === 'compensatoria'
      ? 'Tiene Aula de Enlace / Escuela de Bienvenida (español y acogida)'
      : 'Tiene apoyo educativo específico'
    : needId === 'tea'
    ? 'Atención preferente TEA'
    : needId === 'educacion_especial'
    ? 'Educación Especial (CEE)'
    : needId === 'salud_hospitalaria'
    ? 'Atención Hospitalaria'
    : needId === 'visual'
    ? 'Discapacidad Visual (EOEP / CRE ONCE)'
    : needId === 'altas_capacidades'
    ? 'Altas Capacidades (CREACIM / PEAC)'
    : needId === 'auditiva'
    ? 'Discapacidad Auditiva (EOEP Específico)'
    : needId === 'motora'
    ? 'Discapacidad Motora (EOEP Específico)'
    : needId === 'tdah'
    ? 'TDAH y Dificultades (EOEP Específico)'
    : needId === 'tel_lenguaje'
    ? 'Trastorno del Lenguaje (EOEP Específico)'
    : needId === 'compensatoria'
    ? 'Escuelas de Bienvenida · Aula de Enlace (2026/27)'
    : 'Atención educativa especializada';

  const ownershipLabel =
    school.titularidad === 'publico'
      ? 'Público'
      : school.titularidad === 'concertado'
      ? 'Concertado'
      : 'Privado';

  // Distancia geodésica desde ubicación elegida o centro municipal
  let distanceKm: number | null = null;
  if (state.locationSource === 'browser' && state.userCoordinates) {
    distanceKm = calculateHaversineDistance(
      state.userCoordinates.lat,
      state.userCoordinates.lng,
      school.lat,
      school.lng
    );
  } else if (state.municipality) {
    const munObj = MUNICIPALITIES.find(
      m =>
        m.id.toLowerCase() === state.municipality?.toLowerCase() ||
        m.nombre.toLowerCase() === state.municipality?.toLowerCase()
    );
    if (munObj) {
      distanceKm = calculateHaversineDistance(munObj.lat, munObj.lng, school.lat, school.lng);
    }
  }

  const formattedDistance =
    distanceKm === null
      ? null
      : school.ubicacionAproximada
      ? `≈ ${Math.round(distanceKm)} km`
      : `${distanceKm >= 10 ? Math.round(distanceKm) : distanceKm} km`;

  const confirmedStages = currentSupport?.etapasConApoyo || school.etapas;
  const stageLabels = confirmedStages
    .map(s => {
      if (s === 'infantil') return isEasyReadMode ? 'Infantil (3 a 6 años)' : 'Infantil';
      if (s === 'primaria') return isEasyReadMode ? 'Primaria (6 a 12 años)' : 'Primaria';
      if (s === 'eso') return isEasyReadMode ? 'Secundaria / ESO (12 a 16 años)' : 'Secundaria (ESO)';
      if (s === 'bachillerato') return 'Bachillerato';
      return 'FP Básica';
    })
    .join(', ');

  const continuityIsSameCentre =
    school.continuidad.tipoContinuidad === 'mismo_centro' || school.tipo === 'CEIPSO';
  const zoneDestinations = school.continuidad.destinos.length;

  let continuityText = '';
  if (needId === 'educacion_especial') {
    continuityText = isEasyReadMode
      ? 'El alumno puede seguir en este mismo colegio especial desde Infantil hasta los 18-21 años (PTVA).'
      : 'EBO (6-16 años) y PTVA hasta los 21 años en el propio centro';
  } else if (needId === 'salud_hospitalaria') {
    continuityText = isEasyReadMode
      ? 'Atención durante el ingreso hospitalario; después vuelve a su colegio habitual.'
      : 'Unidad transitoria coordinada con el centro ordinario de origen';
  } else if (needId === 'visual') {
    continuityText = isEasyReadMode
      ? 'Apoyo especializado itinerante en tu colegio o en el centro ONCE de Moratalaz.'
      : 'Apoyo itinerante CAM–ONCE en centro ordinario o sede C.R.E. Moratalaz';
  } else if (needId === 'altas_capacidades') {
    continuityText = isEasyReadMode
      ? 'El alumno sigue en su colegio normal y acude al taller los sábados o recibe apoyo experto.'
      : 'Talleres quincenales los sábados (PEAC) o asesoramiento regional sin cambiar de centro';
  } else if (needId === 'auditiva' || needId === 'motora' || needId === 'tdah' || needId === 'tel_lenguaje') {
    continuityText = isEasyReadMode
      ? 'Equipo regional que orienta y asesora en todas las etapas escolares sin matricular directamente.'
      : 'Equipo público de ámbito regional: evalúa y orienta en todas las etapas (no escolariza directamente)';
  } else if (needId === 'compensatoria') {
    continuityText = isEasyReadMode
      ? 'Programa de acogida y español (hasta 9 meses) para continuar en el aula ordinaria.'
      : currentSupport?.etapasConApoyo.includes('eso') && currentSupport?.etapasConApoyo.includes('primaria')
      ? 'Aula de Enlace de acogida lingüística con Primaria y ESO en el propio centro'
      : 'Aula de Enlace de acogida lingüística hacia aula ordinaria';
  } else if (school.continuidad.tipoContinuidad === 'zona') {
    continuityText =
      zoneDestinations > 0
        ? isEasyReadMode
          ? `Al terminar Primaria tendrás que pedir plaza en otro instituto. En esta zona hay ${zoneDestinations} institutos con apoyo para autismo.`
          : 'Hay centros TEA con ESO en la zona (adscripción no publicada)'
        : isEasyReadMode
        ? 'No aparecen institutos con aula TEA en tu zona en la lista de 2024/25. Pregunta al Servicio de Escolarización (SAE).'
        : 'Sin centros TEA con ESO en la zona del listado';
  } else if (continuityIsSameCentre) {
    continuityText = isEasyReadMode
      ? 'El alumno puede seguir en el mismo centro cuando pase a Secundaria (ESO).'
      : 'Imparte Primaria y ESO en el propio centro';
  } else {
    continuityText =
      school.continuidad.apoyoEnSecundariaVerificado === true
        ? 'Confirmada en centro adscrito con apoyo'
        : 'Adscripción a IES (comprobar vacantes)';
  }

  const evidenceLabel = isA1
    ? 'Confirmado (A1)'
    : isEasyReadMode
    ? needId === 'salud_hospitalaria'
      ? 'En trámite oficial: llama al centro o hospital'
      : 'Lista oficial 2024/25: llama al centro o al SAE'
    : 'Por comprobar (A2)';

  const locationDisplay = school.direccion
    ? `${school.direccion} · ${school.municipio}${school.distrito ? ` (${school.distrito})` : ''}`
    : `${school.municipio}${school.distrito ? ` (${school.distrito})` : ''}`;

  const verifiedBadges: string[] = [];
  if (school.servicios.comedor) verifiedBadges.push('Comedor');
  if (school.servicios.aula_matinal) verifiedBadges.push('Horario ampliado');
  if (school.servicios.transporte) verifiedBadges.push('Transporte');
  if (school.accesibilidad.acceso_fisico) verifiedBadges.push('Acceso físico');

  return (
    <article
      className={`bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between ${
        isEasyReadMode ? 'text-sm leading-relaxed' : ''
      }`}
    >
      <div>
        {/* Fila 1: Metadatos técnicos y Sello de Evidencia */}
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-700">
            <span className="font-mono text-slate-900 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
              Cód. {school.codigo}
            </span>
            <span className="text-slate-500" aria-hidden="true">·</span>
            <span>{ownershipLabel}</span>
            {!isEasyReadMode && (
              <>
                <span className="text-slate-500" aria-hidden="true">·</span>
                <span>{school.tipo}</span>
              </>
            )}
            {isOfficial && (
              <span
                className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded"
                title="Registro oficial de la Comunidad de Madrid y Portal de Datos Abiertos CAM"
              >
                Oficial
              </span>
            )}
          </div>

          <div className="shrink-0">
            {isA1 ? (
              <span
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full"
                title="Centro en situación ALTA en el Portal de Datos Abiertos CAM"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>{evidenceLabel}</span>
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full"
                title="Listado oficial CAM (curso 2024/2025 o en trámite): confirmar situación actual ante el SAE."
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>{evidenceLabel}</span>
              </span>
            )}
          </div>
        </div>

        {/* Nombre del centro */}
        <h3 className="text-lg font-bold text-slate-900 leading-snug">
          <button
            type="button"
            onClick={() => onOpenDetail(school)}
            className="text-left hover:text-blue-800 transition-colors cursor-pointer w-full"
          >
            {displayName}
          </button>
        </h3>

        {/* Ubicación oficial real y distancia */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 mt-1.5">
          <span className="inline-flex items-center gap-1 font-medium text-slate-800">
            <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span>{locationDisplay}</span>
          </span>
          {formattedDistance !== null && (
            <span
              className="font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-xs whitespace-nowrap"
              title={
                school.ubicacionAproximada
                  ? 'Distancia aproximada al centro del municipio o distrito.'
                  : 'Distancia en línea recta desde la referencia elegida a la ubicación oficial del centro.'
              }
            >
              {formattedDistance}
            </span>
          )}
        </div>

        {/* 3 Puntos Clave */}
        <div className={`mt-3.5 space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3.5 ${isEasyReadMode ? 'text-sm' : 'text-xs'}`}>
          <div className="flex items-start gap-2">
            <span className="text-emerald-800 font-bold shrink-0 mt-0.5" aria-hidden="true">✓</span>
            <span className="font-semibold text-slate-900">{needLabel}</span>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-emerald-800 font-bold shrink-0 mt-0.5" aria-hidden="true">✓</span>
            <span className="text-slate-700">
              {isEasyReadMode
                ? 'Etapa con plaza de apoyo: '
                : needId === 'tea'
                ? 'Etapa en el listado TEA: '
                : 'Etapas oficiales: '}
              <span className="font-semibold text-slate-900">{stageLabels}</span>
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
            <div className="text-xs text-slate-700">
              <span className="font-bold text-slate-900">
                {isEasyReadMode
                  ? 'Continuidad: '
                  : needId === 'tea'
                  ? 'Continuidad ESO: '
                  : 'Trayectoria: '}
              </span>
              <span>{continuityText}</span>
            </div>
            {needId === 'tea' && (
              <button
                type="button"
                onClick={() => (onOpenContinuity ? onOpenContinuity(school) : onOpenDetail(school))}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-800 hover:text-blue-950 hover:underline shrink-0 cursor-pointer"
              >
                <span>Destinos</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Servicios confirmados por Ayuntamiento de Madrid / Transporte público / Teléfono */}
        {(verifiedBadges.length > 0 || school.transportePublico) && (
          <div className="mt-2.5 px-1 space-y-1.5">
            {verifiedBadges.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {verifiedBadges.map(badge => (
                  <span
                    key={badge}
                    className="text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md"
                    title="Dato procedente del Portal de Datos Abiertos del Ayuntamiento de Madrid (datos.madrid.es)"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
            {school.transportePublico && (
              <div className="text-xs text-slate-700 leading-snug line-clamp-2" title={school.transportePublico}>
                <strong className="text-slate-900">Transporte público:</strong> {school.transportePublico}
              </div>
            )}
          </div>
        )}

        {/* Contacto rápido oficial / nota de servicios */}
        <div className="text-xs text-slate-700 mt-2 mb-3 px-1 leading-relaxed">
          {school.telefono ? (
            isEasyReadMode ? (
              <>
                Teléfono oficial:{' '}
                <a
                  href={`tel:${school.telefono.replace(/\s+/g, '')}`}
                  className="font-semibold text-blue-900 hover:underline"
                >
                  {school.telefono}
                </a>
                .{verifiedBadges.length === 0 ? ' Comedor y autobús escolar: debes preguntar en el colegio.' : ''}
              </>
            ) : school.serviciosConfirmadosAyto ? (
              <>
                Tel.{' '}
                <a
                  href={`tel:${school.telefono.replace(/\s+/g, '')}`}
                  className="font-semibold text-blue-900 hover:underline"
                >
                  {school.telefono}
                </a>{' '}
                · Fuente municipal: datos.madrid.es
              </>
            ) : (
              <>
                Tel.{' '}
                <a
                  href={`tel:${school.telefono.replace(/\s+/g, '')}`}
                  className="font-semibold text-blue-900 hover:underline"
                >
                  {school.telefono}
                </a>{' '}
                · Servicios fuera de Madrid capital: sin datos en las fuentes oficiales.
              </>
            )
          ) : (
            formatText(
              school.serviciosConfirmadosAyto
                ? 'Equipamiento consultado en datos.madrid.es.'
                : 'Servicios y accesibilidad: sin datos en las fuentes oficiales.'
            )
          )}
        </div>
      </div>

      {/* Botonera de Acciones */}
      <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={() => onOpenWhyAppears(school)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-900 hover:text-blue-950 hover:underline cursor-pointer"
          title="Ver origen oficial, fecha de corte y detalle del recurso"
        >
          <FileText className="w-3.5 h-3.5 text-blue-700" />
          <span>¿Por qué aparece?</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleCompare(school)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              isCompared
                ? 'bg-blue-50 text-blue-900 border-blue-300'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }`}
            title={isCompared ? 'Quitar del comparador' : 'Añadir al comparador (máximo 3 centros)'}
          >
            {isCompared ? (
              <>
                <Check className="w-3.5 h-3.5 text-blue-700" />
                <span>En comparador</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-slate-600" />
                <span>Comparar</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onOpenDetail(school)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-cam-blue hover:bg-cam-blue-dark shadow-xs transition-colors cursor-pointer"
          >
            <span>Ficha completa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
