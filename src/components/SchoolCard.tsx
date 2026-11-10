/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tarjeta de Centro Educativo Simplificada para Familias
 * Responde de inmediato a 4 preguntas esenciales:
 * 1. ¿Por qué aparece este centro?
 * 2. ¿Para qué etapa está confirmado?
 * 3. ¿A qué distancia está?
 * 4. ¿Qué continuidad tiene?
 *
 * Utiliza lenguaje familiar:
 * - "Confirmado para esta etapa" (Evidencia A1)
 * - "Confirmado, pero debe comprobarse etapa o vigencia" (Evidencia A2)
 *
 * Jerarquía de acciones clara:
 * - [Ficha completa] (botón principal)
 * - [Comparar] (botón secundario con límite 3)
 * - ¿Por qué aparece? (enlace explicativo con evidencia oficial)
 */

import React from 'react';
import { School, SearchState } from '../types';
import { calculateHaversineDistance, estimateTransitMinutes, MUNICIPALITIES } from '../data/municipalities';
import {
  FileText,
  MapPin,
  Check,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  GitCompare,
  ArrowUpRight
} from 'lucide-react';

interface SchoolCardProps {
  school: School;
  state: SearchState;
  isCompared: boolean;
  onToggleCompare: (school: School) => void;
  onOpenDetail: (school: School) => void;
  onOpenWhyAppears: (school: School) => void;
  onOpenContinuity?: (school: School) => void;
}

export const SchoolCard: React.FC<SchoolCardProps> = ({
  school,
  state,
  isCompared,
  onToggleCompare,
  onOpenDetail,
  onOpenWhyAppears,
  onOpenContinuity
}) => {
  // Soporte correspondiente a la necesidad activa o el primer apoyo registrado
  const currentSupport = state.need
    ? school.apoyos.find(a => a.needId === state.need) || school.apoyos[0]
    : school.apoyos[0];

  const isA1 = currentSupport?.evidencia === 'A1';

  // Nombre amigable de la necesidad
  const needLabel = 
    currentSupport?.needId === 'tea' ? 'Atención preferente TEA' :
    currentSupport?.needId === 'auditiva' ? 'Atención discapacidad auditiva' :
    currentSupport?.needId === 'motora' ? 'Atención discapacidad motora' :
    currentSupport?.needId === 'educacion_especial' || school.modalidad === 'especial' ? 'Educación Especial (CEE)' :
    'Atención educativa especializada';

  // Cálculo de distancia respecto al origen activo (GPS del navegador o municipio)
  let distanceKm: number | null = null;
  let originLabel = 'Madrid';

  if (state.locationSource === 'browser' && state.userCoordinates) {
    distanceKm = calculateHaversineDistance(
      state.userCoordinates.lat,
      state.userCoordinates.lng,
      school.lat,
      school.lng
    );
    originLabel = 'tu ubicación';
  } else if (state.municipality) {
    const munObj = MUNICIPALITIES.find(
      m => m.id.toLowerCase() === state.municipality?.toLowerCase() ||
           m.nombre.toLowerCase() === state.municipality?.toLowerCase()
    );
    if (munObj) {
      distanceKm = calculateHaversineDistance(munObj.lat, munObj.lng, school.lat, school.lng);
      originLabel = munObj.nombre;
    }
  }

  // Etapas confirmadas para este apoyo específico
  const confirmedStages = currentSupport?.etapasConApoyo || school.etapas;
  const stageLabels = confirmedStages.map(s => {
    if (s === 'infantil') return 'Infantil';
    if (s === 'primaria') return 'Primaria';
    if (s === 'eso') return 'Secundaria (ESO)';
    if (s === 'bachillerato') return 'Bachillerato';
    return 'FP Básica';
  }).join(', ');

  // Continuidad simplificada
  const continuityIsSameCentre = school.continuidad.tipoContinuidad === 'mismo_centro' || school.tipo === 'CEIPSO';
  const continuityText = continuityIsSameCentre
    ? 'Imparte Primaria y ESO en el propio centro'
    : school.continuidad.apoyoEnSecundariaVerificado === true
    ? 'Confirmada en centro adscrito con apoyo'
    : 'Adscripción a IES (comprobar vacantes)';

  // Resumen de servicios en una sola línea tranquila
  const servicesSummary: string[] = [];
  if (school.servicios.comedor && school.servicios.enfermeria) {
    servicesSummary.push('Comedor y enfermería publicados');
  } else if (school.servicios.comedor) {
    servicesSummary.push('Comedor publicado');
  } else if (school.servicios.enfermeria) {
    servicesSummary.push('Enfermería escolar publicada');
  } else {
    servicesSummary.push('Sin comedor publicado');
  }

  if (school.servicios.transporte) {
    servicesSummary.push('transporte adaptado disponible');
  } else {
    servicesSummary.push('transporte no localizado');
  }

  const singleLineServices = `${servicesSummary.join('. ')}.`;

  return (
    <article className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Fila 1: Metadatos superiores concisos y Badge de Evidencia en Lenguaje Familiar */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            {/* Metadatos técnicos discretos */}
            <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 mb-1">
              <span className="font-mono text-slate-600 font-semibold">Cód. {school.codigo}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{school.titularidad === 'publico' ? 'Público' : 'Concertado'}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{school.tipo}</span>
            </div>

            {/* Nombre del centro */}
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              <button
                type="button"
                onClick={() => onOpenDetail(school)}
                className="text-left hover:text-blue-700 transition-colors cursor-pointer"
              >
                {school.nombre}
              </button>
            </h3>

            {/* Ubicación y Distancia clara */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {school.municipio}{school.distrito ? `, ${school.distrito}` : ''}
              </span>
              {distanceKm !== null && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="font-semibold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded">
                    {distanceKm} km aprox.
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded" title="Tiempo estimado en transporte público colectivo (Bus EMT / Metro CRTM)">
                    ⏱️ ~{estimateTransitMinutes(distanceKm)} min bus/metro
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Sello de Evidencia en Lenguaje Familiar (Reemplazo amigable de A1/A2) */}
          <div className="shrink-0 text-right">
            {isA1 ? (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg"
                title="Evidencia oficial A1: Centro y etapa confirmados en resoluciones oficiales vigentes de la Comunidad de Madrid."
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Confirmado para esta etapa</span>
                <span className="text-[10px] text-emerald-600 font-mono opacity-80">(A1)</span>
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg"
                title="Evidencia A2: Centro con apoyo, pero se debe comprobar en secretaría la vigencia o etapa exacta."
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Por comprobar etapa o vigencia</span>
                <span className="text-[10px] text-amber-600 font-mono opacity-80">(A2)</span>
              </span>
            )}
          </div>
        </div>

        {/* 3 Puntos Clave Esenciales */}
        <div className="mt-3.5 space-y-2 bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 text-xs">
          {/* Criterios confirmados */}
          <div className="flex items-start gap-2">
            <span className="text-emerald-700 font-bold shrink-0 mt-0.5">✓</span>
            <span className="font-semibold text-slate-800">
              {needLabel}
              {currentSupport?.aulaNombre ? `: ${currentSupport.aulaNombre}` : ''}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-emerald-700 font-bold shrink-0 mt-0.5">✓</span>
            <span className="text-slate-700">
              Confirmado para: <span className="font-semibold text-slate-900">{stageLabels}</span>
            </span>
          </div>

          {/* Bloque resumido de Continuidad a ESO */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
            <div className="text-[11px] text-slate-600">
              <span className="font-bold text-slate-800">Continuidad ESO: </span>
              <span>{continuityText}</span>
            </div>
            <button
              type="button"
              onClick={() => onOpenContinuity ? onOpenContinuity(school) : onOpenDetail(school)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline shrink-0 cursor-pointer"
            >
              <span>Destinos</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Resumen de servicios en una sola línea tipográfica tranquila */}
        <div className="text-[11px] text-slate-500 mt-2.5 mb-3 px-1 leading-relaxed">
          {singleLineServices}
        </div>
      </div>

      {/* Botonera de Acciones con Jerarquía Clara:
          [Ficha completa] (Primaria) | [Comparar] (Secundaria) | ¿Por qué aparece? (Enlace explicativo) */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={() => onOpenWhyAppears(school)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-900 hover:text-blue-950 hover:underline cursor-pointer"
          title="Ver resolución oficial, fecha de corte y dotación del BOCM"
        >
          <FileText className="w-3.5 h-3.5 text-blue-700" />
          <span>¿Por qué aparece?</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Botón secundario: Comparar */}
          <button
            type="button"
            onClick={() => onToggleCompare(school)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isCompared
                ? 'bg-blue-50 text-blue-900 border-blue-300 font-semibold'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
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
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                <span>Comparar</span>
              </>
            )}
          </button>

          {/* Botón principal destacado: Ficha completa */}
          <button
            type="button"
            onClick={() => onOpenDetail(school)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-xs transition-colors cursor-pointer"
          >
            <span>Ficha completa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
