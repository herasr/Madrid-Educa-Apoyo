/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Resumen de Filtros Activos (Anexo N.6)
 * - Chips individuales dismissables con `aria-label`
 * - Botón "Limpiar todos"
 * - Anuncio accesible a lectores de pantalla con aria-live="polite"
 */

import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { AccessibilityId, EvidenceId, NeedId, OwnershipId, SearchState, ServiceId, StageId } from '../types';

interface ActiveFilterChipsProps {
  state: SearchState;
  resultsCount: number;
  onUpdateState: (updater: (prev: SearchState) => SearchState) => void;
  onClearAll: () => void;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  state,
  resultsCount,
  onUpdateState,
  onClearAll
}) => {
  const chips: Array<{ id: string; label: string; onRemove: () => void; isMandatory?: boolean; isPreference?: boolean }> = [];

  // Necesidad
  if (state.need) {
    const needLabel = 
      state.need === 'tea' ? 'Atención TEA' :
      state.need === 'auditiva' ? 'Discapacidad Auditiva' :
      state.need === 'motora' ? 'Discapacidad Motora' :
      state.need === 'educacion_especial' ? 'Educación Especial (CEE)' :
      state.need === 'visual' ? 'Discapacidad Visual (EOEP)' :
      state.need === 'altas_capacidades' ? 'Altas Capacidades (PEAC)' :
      state.need === 'tdah' ? 'TDAH y Conducta' :
      state.need === 'tel_lenguaje' ? 'Trastorno Lenguaje (TDL/TEL)' :
      state.need === 'salud_hospitalaria' ? 'Atención Hospitalaria' :
      'Compensación Educativa';

    chips.push({
      id: 'need',
      label: needLabel,
      onRemove: () => onUpdateState(prev => ({ ...prev, need: null })),
      isMandatory: true
    });
  }

  // Etapas
  state.stages.forEach(st => {
    const stageNames: Record<StageId, string> = {
      infantil: 'Infantil',
      primaria: 'Primaria',
      eso: 'ESO',
      bachillerato: 'Bachillerato',
      fp_basica: 'FP Básica'
    };
    chips.push({
      id: `stage-${st}`,
      label: stageNames[st] || st,
      onRemove: () => onUpdateState(prev => ({ ...prev, stages: prev.stages.filter(s => s !== st) }))
    });
  });

  // Territorio: Municipio o Ubicación GPS
  if (state.locationSource === 'browser' && state.userCoordinates) {
    chips.push({
      id: 'browser-location',
      label: 'Cerca de mí (Tu ubicación)',
      onRemove: () => onUpdateState(prev => ({ ...prev, locationSource: 'municipality', userCoordinates: null, municipality: 'Madrid' }))
    });
  } else if (state.municipality) {
    chips.push({
      id: 'municipality',
      label: `Municipio: ${state.municipality}`,
      onRemove: () => onUpdateState(prev => ({ ...prev, municipality: null, district: null }))
    });
  }

  // Distrito
  if (state.district && state.locationSource !== 'browser') {
    chips.push({
      id: 'district',
      label: `Distrito: ${state.district}`,
      onRemove: () => onUpdateState(prev => ({ ...prev, district: null }))
    });
  }

  // Radio
  if (state.radiusKm !== null && (state.municipality || state.locationSource === 'browser')) {
    chips.push({
      id: 'radius',
      label: `Radio: ${state.radiusKm} km`,
      onRemove: () => onUpdateState(prev => ({ ...prev, radiusKm: null }))
    });
  }

  // Titularidad
  state.ownership.forEach(own => {
    const ownName: Record<OwnershipId, string> = {
      publico: 'Público',
      concertado: 'Concertado'
    };
    chips.push({
      id: `own-${own}`,
      label: ownName[own] || own,
      onRemove: () => onUpdateState(prev => ({ ...prev, ownership: prev.ownership.filter(o => o !== own) }))
    });
  });

  // Modalidad
  state.modalities.forEach(mod => {
    const modNames = {
      preferente: 'Centro Preferente',
      especial: 'Colegio Ed. Especial',
      ordinaria: 'Centro Ordinario'
    };
    chips.push({
      id: `mod-${mod}`,
      label: modNames[mod] || mod,
      onRemove: () => onUpdateState(prev => ({ ...prev, modalities: prev.modalities.filter(m => m !== mod) }))
    });
  });

  // Servicios obligatorios (AND)
  state.requiredServices.forEach(srv => {
    const srvNames: Record<ServiceId, string> = {
      comedor: 'Comedor escolar',
      transporte: 'Transporte escolar',
      aula_matinal: 'Aula matinal',
      enfermeria: 'Enfermería escolar',
      actividades_extraescolares: 'Actividades extraescolares'
    };
    chips.push({
      id: `req-srv-${srv}`,
      label: `${srvNames[srv] || srv} (Obligatorio)`,
      onRemove: () => onUpdateState(prev => ({ ...prev, requiredServices: prev.requiredServices.filter(s => s !== srv) })),
      isMandatory: true
    });
  });

  // Servicios preferidos (no excluyen)
  state.preferredServices.forEach(srv => {
    const srvNames: Record<ServiceId, string> = {
      comedor: 'Comedor',
      transporte: 'Transporte',
      aula_matinal: 'Aula matinal',
      enfermeria: 'Enfermería',
      actividades_extraescolares: 'Extraescolares'
    };
    chips.push({
      id: `pref-srv-${srv}`,
      label: `${srvNames[srv] || srv} (Preferido)`,
      onRemove: () => onUpdateState(prev => ({ ...prev, preferredServices: prev.preferredServices.filter(s => s !== srv) })),
      isPreference: true
    });
  });

  // Accesibilidad
  state.accessibilityRequired.forEach(acc => {
    const accNames: Record<AccessibilityId, string> = {
      acceso_fisico: 'Acceso a cota cero',
      ascensor: 'Ascensor adaptado',
      bano_adaptado: 'Baño adaptado',
      bucle_magnetico: 'Bucle magnético',
      plano_podotactil: 'Plano podotáctil'
    };
    chips.push({
      id: `acc-${acc}`,
      label: accNames[acc] || acc,
      onRemove: () => onUpdateState(prev => ({ ...prev, accessibilityRequired: prev.accessibilityRequired.filter(a => a !== acc) })),
      isMandatory: true
    });
  });

  // Evidencia
  if (state.evidence.length === 1) {
    chips.push({
      id: 'evidence',
      label: state.evidence[0] === 'A1' ? 'Solo Confirmados (A1)' : 'Solo por comprobar (A2)',
      onRemove: () => onUpdateState(prev => ({ ...prev, evidence: ['A1', 'A2'] }))
    });
  }

  // Búsqueda de texto
  if (state.searchQuery) {
    chips.push({
      id: 'query',
      label: `Texto: "${state.searchQuery}"`,
      onRemove: () => onUpdateState(prev => ({ ...prev, searchQuery: '' }))
    });
  }

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3">
      {/* Región aria-live requerida en N.6 y FIL-012 */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {`Búsqueda actualizada: ${resultsCount} ${resultsCount === 1 ? 'centro encontrado' : 'centros encontrados'}`}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Chips de filtros activos */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Filtros activos:
          </span>

          {chips.length === 0 ? (
            <span className="text-xs text-slate-400 italic">Ningún filtro activo (mostrando todo el catálogo)</span>
          ) : (
            chips.map(chip => (
              <span
                key={chip.id}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                  chip.isMandatory
                    ? 'bg-cam-red-light text-cam-red-dark border-cam-red-border font-semibold'
                    : chip.isPreference
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <span>{chip.label}</span>
                <button
                  onClick={chip.onRemove}
                  className="p-0.5 hover:bg-black/10 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cam-red cursor-pointer"
                  aria-label={`Eliminar filtro ${chip.label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Recuento de resultados y botón Limpiar todos */}
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-sm font-bold text-slate-900 tabular-nums">
            Resultados: <span className="text-cam-red">{resultsCount}</span> {resultsCount === 1 ? 'centro' : 'centros'}
          </span>

          {chips.length > 0 && (
            <button
              onClick={onClearAll}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-red-700 transition-colors cursor-pointer"
              title="Restablece todos los filtros acumulados"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Borrar filtros</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
