/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Panel Lateral de Filtros Acumulativos
 * - Secciones plegables en acordeón (las 3 primeras abiertas, las 3 secundarias plegadas)
 * - Separación nítida: Necesidad Educativa vs Modalidad Educativa vs Orientación y Programas
 * - Tarjetas destacadas y compactas para Discapacidad Visual y Altas Capacidades
 * - Claridad total en etapas: recuentos comprensibles y conmutador OR / AND
 * - Ubicación de referencia transparente: Usar mi ubicación vs Municipio con aviso geodésico
 */

import React, { useState } from 'react';
import {
  AccessibilityId,
  DynamicCounts,
  EvidenceId,
  NeedId,
  OwnershipId,
  SearchState,
  ServiceId,
  StageId
} from '../types';
import { MUNICIPALITIES, MADRID_DISTRICTS } from '../data/municipalities';
import {
  ChevronDown,
  ChevronRight,
  Info,
  MapPin,
  Compass,
  Sparkles,
  Eye,
  HelpCircle,
  ShieldCheck,
  Building,
  RotateCcw
} from 'lucide-react';

interface FilterSidebarProps {
  state: SearchState;
  dynamicCounts: DynamicCounts;
  onUpdateState: (updater: (prev: SearchState) => SearchState) => void;
  onOpenProcedureModal: (topic: 'visual' | 'altas_capacidades' | 'educacion_especial') => void;
  onClearFilters?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  state,
  dynamicCounts,
  onUpdateState,
  onOpenProcedureModal,
  onClearFilters
}) => {
  // Secciones plegables: 1 abierta por defecto; 2 a 6 encogidas inicialmente
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    needs: true,
    stages: false,
    location: false,
    ownership: false,
    services: false,
    evidence: false
  });

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // 1. Necesidad Educativa (TEA, Auditiva, Motora)
  const handleSelectNeed = (needId: NeedId) => {
    onUpdateState(prev => ({
      ...prev,
      need: prev.need === needId ? null : needId
    }));
  };

  // 2. Modalidad Educativa Especial
  const handleToggleSpecialEducation = () => {
    onUpdateState(prev => ({
      ...prev,
      need: prev.need === 'educacion_especial' ? null : 'educacion_especial'
    }));
  };

  // 3. Etapas
  const handleToggleStage = (stageId: StageId) => {
    onUpdateState(prev => {
      const exists = prev.stages.includes(stageId);
      const newStages = exists
        ? prev.stages.filter(s => s !== stageId)
        : [...prev.stages, stageId];
      return { ...prev, stages: newStages };
    });
  };

  // 4. Titularidad
  const handleToggleOwnership = (ownId: OwnershipId) => {
    onUpdateState(prev => {
      const exists = prev.ownership.includes(ownId);
      const newOwnership = exists
        ? prev.ownership.filter(o => o !== ownId)
        : [...prev.ownership, ownId];
      return { ...prev, ownership: newOwnership };
    });
  };

  // 5. Servicios (Obligatorio AND vs Preferido)
  const handleToggleService = (srvId: ServiceId, asMandatory: boolean) => {
    onUpdateState(prev => {
      if (asMandatory) {
        const isRequired = prev.requiredServices.includes(srvId);
        const newRequired = isRequired
          ? prev.requiredServices.filter(s => s !== srvId)
          : [...prev.requiredServices, srvId];
        const newPreferred = prev.preferredServices.filter(s => s !== srvId);
        return { ...prev, requiredServices: newRequired, preferredServices: newPreferred };
      } else {
        const isPreferred = prev.preferredServices.includes(srvId);
        const newPreferred = isPreferred
          ? prev.preferredServices.filter(s => s !== srvId)
          : [...prev.preferredServices, srvId];
        const newRequired = prev.requiredServices.filter(s => s !== srvId);
        return { ...prev, requiredServices: newRequired, preferredServices: newPreferred };
      }
    });
  };

  // 6. Evidencia
  const handleToggleEvidence = (evId: EvidenceId) => {
    onUpdateState(prev => {
      const exists = prev.evidence.includes(evId);
      if (exists && prev.evidence.length === 1) return prev; // Mantener al menos una
      const newEv = exists
        ? prev.evidence.filter(e => e !== evId)
        : [...prev.evidence, evId];
      return { ...prev, evidence: newEv };
    });
  };

  // Georreferenciación del navegador
  const handleUseBrowserLocation = () => {
    setGeoLoading(true);
    setGeoError(null);

    // Activación inmediata del modo 'browser'
    onUpdateState(prev => ({
      ...prev,
      locationSource: 'browser',
      userCoordinates: prev.userCoordinates || {
        lat: 40.4168,
        lng: -3.7038,
        label: 'Tu ubicación actual'
      },
      radiusKm: prev.radiusKm ?? 20
    }));

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setGeoLoading(false);
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lng = Number(pos.coords.longitude.toFixed(4));
          onUpdateState(prev => ({
            ...prev,
            locationSource: 'browser',
            userCoordinates: {
              lat,
              lng,
              label: 'Tu ubicación actual'
            }
          }));
        },
        err => {
          setGeoLoading(false);
          // NUNCA revertir a municipality. Mantener modo browser activo con coordenadas aproximadas.
          console.info('GPS del navegador restringido o denegado:', err.message);
        },
        { timeout: 6000, enableHighAccuracy: false }
      );
    } else {
      setGeoLoading(false);
    }
  };

  const handleUseMunicipality = () => {
    setGeoError(null);
    onUpdateState(prev => ({
      ...prev,
      locationSource: 'municipality',
      municipality: prev.municipality || 'Madrid',
      district: (prev.municipality === 'Madrid' || !prev.municipality) ? prev.district : null,
      userCoordinates: null,
      radiusKm: prev.radiusKm ?? 20
    }));
  };

  return (
    <aside className="w-full bg-white divide-y divide-slate-200 text-sm text-slate-800">
      {/* ========================================================
          1. NECESIDAD EDUCATIVA Y MODALIDADES
         ======================================================== */}
      <div className="p-4 sm:p-5">
        <button
          type="button"
          onClick={() => toggleSection('needs')}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 group-hover:text-blue-900 transition-colors">
              1. Necesidad Educativa
            </div>
            <div className="text-[11px] text-slate-500">
              {state.need
                ? `Seleccionado: ${state.need.toUpperCase()}`
                : 'Cualquier necesidad'}
            </div>
          </div>
          {openSections.needs ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.needs && (
          <div className="mt-3.5 space-y-3">
            {/* 1.1 NECESIDAD EDUCATIVA Y MODALIDAD */}
            <div className="space-y-1.5" role="radiogroup" aria-label="Necesidad Educativa">
              {[{ id: 'tea' as NeedId, label: 'Atención preferente TEA', desc: 'Trastorno del Espectro Autista' }].map(item => {
                const isSelected = state.need === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectNeed(item.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-950 font-semibold ring-1 ring-blue-600/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold leading-snug flex items-center gap-1.5 flex-wrap">
                        <span>{item.label}</span>
                        <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                          Oficial
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">{item.desc}</div>
                    </div>
                    <span className="text-xs tabular-nums px-2 py-0.5 rounded-md font-mono shrink-0 bg-blue-100 text-blue-900 font-bold">
                      336
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Otras necesidades Próximamente */}
            <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Otras necesidades (Próximamente):
              </div>
              {[
                { id: 'auditiva', label: 'Discapacidad Auditiva', desc: 'Bilingüismo LSE y logopedia' },
                { id: 'motora', label: 'Discapacidad Motora', desc: 'Fisioterapia y motórica' },
                { id: 'visual', label: 'Discapacidad Visual', desc: 'Apoyo tiflotécnico y convenio ONCE' },
                { id: 'altas_capacidades', label: 'Altas Capacidades', desc: 'Sedes PEAC y Bachillerato Excelencia' },
                { id: 'educacion_especial', label: 'Educación Especial (CEE)', desc: 'Colegios de Educación Especial' },
                { id: 'tdah', label: 'TDAH y Trastornos de Conducta', desc: 'Apoyo conductual y adaptación metodológica' },
                { id: 'tel_lenguaje', label: 'Trastorno del Lenguaje (TDL/TEL)', desc: 'Intervención intensiva en comunicación' },
                { id: 'salud_hospitalaria', label: 'Atención Hospitalaria / Domiciliaria', desc: 'Unidades de hospitalización y convalecencia' },
                { id: 'compensatoria', label: 'Compensación Educativa', desc: 'Aulas de Enlace y desfavorecidos' }
              ].map(item => (
                <div
                  key={item.id}
                  className="w-full text-left px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-400 flex items-center justify-between cursor-not-allowed opacity-80"
                  title="Listado oficial pendiente de incorporar en este prototipo"
                >
                  <div>
                    <div className="text-xs font-semibold leading-snug flex items-center gap-1.5 flex-wrap">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="text-[9px] font-semibold text-slate-500 bg-slate-200/80 border border-slate-300 px-1 py-0.2 rounded">
                        Próximamente
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </div>
                  <span className="text-xs tabular-nums px-2 py-0.5 rounded-md font-mono shrink-0 bg-slate-200/60 text-slate-500">
                    0
                  </span>
                </div>
              ))}
            </div>


          </div>
        )}
      </div>

      {/* ========================================================
          2. ETAPA EDUCATIVA CON CONMUTADOR Y EXPLICACIÓN DE RECUENTOS
         ======================================================== */}
      <div className="p-4 sm:p-5">
        <button
          type="button"
          onClick={() => toggleSection('stages')}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 group-hover:text-blue-900 transition-colors">
              2. Etapa Educativa
            </div>
            <div className="text-[11px] text-slate-500">
              {state.stages.length === 0
                ? 'Todas las etapas'
                : `${state.stages.length} seleccionada(s) (${state.stageMatchMode === 'all' ? 'impartir todas' : 'cualquiera'})`}
            </div>
          </div>
          {openSections.stages ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.stages && (
          <div className="mt-3.5 space-y-2.5">


            {/* Selector de modo OR vs AND si hay más de 1 etapa seleccionada */}
            {state.stages.length > 1 && (
              <div className="bg-slate-100 p-1 rounded-lg flex items-center text-xs">
                <button
                  type="button"
                  onClick={() => onUpdateState(prev => ({ ...prev, stageMatchMode: 'any' }))}
                  className={`flex-1 py-1 px-2 rounded-md font-semibold text-center transition-colors cursor-pointer ${
                    state.stageMatchMode !== 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cualquiera
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateState(prev => ({ ...prev, stageMatchMode: 'all' }))}
                  className={`flex-1 py-1 px-2 rounded-md font-semibold text-center transition-colors cursor-pointer ${
                    state.stageMatchMode === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Sólo centros que impartan simultáneamente todas las etapas marcadas"
                >
                  Debe impartir todas
                </button>
              </div>
            )}

            {/* Listado de etapas */}
            <div className="space-y-1">
              {[
                { id: 'infantil' as StageId, label: 'Educación Infantil (3-6 años)' },
                { id: 'primaria' as StageId, label: 'Educación Primaria (6-12 años)' },
                { id: 'eso' as StageId, label: 'Secundaria Obligatoria (E.S.O.)' },
                { id: 'bachillerato' as StageId, label: 'Bachillerato' },
                { id: 'fp_basica' as StageId, label: 'Formación Profesional Básica' }
              ].map(st => {
                const isChecked = state.stages.includes(st.id);
                const count = dynamicCounts.stages[st.id] ?? 0;
                return (
                  <label
                    key={st.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-cam-red-light border-cam-red-border text-cam-red-dark font-semibold'
                        : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleStage(st.id)}
                        className="rounded border-slate-300 text-cam-red focus:ring-cam-red cursor-pointer"
                      />
                      <span className="text-xs">{st.label}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500 tabular-nums">
                      ({count})
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          3. UBICACIÓN DE REFERENCIA Y RADIO (CON TRANSPARENCIA DE ORIGEN)
         ======================================================== */}
      <div className="p-4 sm:p-5">
        <button
          type="button"
          onClick={() => toggleSection('location')}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 group-hover:text-blue-900 transition-colors">
              3. Ubicación y Radio
            </div>
            <div className="text-[11px] text-slate-500">
              {state.locationSource === 'browser'
                ? 'Ubicación del navegador'
                : state.municipality
                ? `${state.municipality} (${state.radiusKm ? `${state.radiusKm} km` : 'municipio'})`
                : 'Toda la Comunidad de Madrid'}
            </div>
          </div>
          {openSections.location ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.location && (
          <div className="mt-3.5 space-y-3">
            {/* Conmutador de origen de ubicación con diseño de pestañas segmentadas limpio y claro */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={handleUseMunicipality}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  state.locationSource === 'municipality'
                    ? 'bg-cam-red text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Building className={`w-3.5 h-3.5 ${state.locationSource === 'municipality' ? 'text-white' : 'text-slate-500'}`} />
                <span>Elegir municipio</span>
              </button>

              <button
                type="button"
                onClick={handleUseBrowserLocation}
                disabled={geoLoading}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  state.locationSource === 'browser'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Compass className={`w-3.5 h-3.5 ${state.locationSource === 'browser' ? 'text-white' : 'text-blue-700'}`} />
                <span>{geoLoading ? 'Detectando...' : 'Cerca de mí'}</span>
              </button>
            </div>

            {/* Selectores de Municipio y Distrito (deshabilitados cuando se activa Cerca de mí) */}
            <div className="space-y-2.5">
              <div>
                <label htmlFor="municipality-select" className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Municipio de referencia:
                </label>
                <select
                  id="municipality-select"
                  disabled={state.locationSource === 'browser'}
                  value={state.municipality || 'Madrid'}
                  onChange={e => {
                    const val = e.target.value || null;
                    onUpdateState(prev => ({
                      ...prev,
                      locationSource: 'municipality',
                      municipality: val,
                      district: val === 'Madrid' ? prev.district : null
                    }));
                  }}
                  className={`w-full text-xs rounded-lg px-2.5 py-1.5 transition-colors ${
                    state.locationSource === 'browser'
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                      : 'bg-white border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cam-red cursor-pointer'
                  }`}
                >
                  <option value="">Toda la Comunidad de Madrid</option>
                  {MUNICIPALITIES.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Distrito para Madrid capital */}
              {(state.municipality === 'Madrid' || state.locationSource === 'browser') && (
                <div>
                  <label htmlFor="district-select" className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Distrito (Madrid capital):
                  </label>
                  <select
                    id="district-select"
                    disabled={state.locationSource === 'browser'}
                    value={state.district || ''}
                    onChange={e => {
                      const val = e.target.value || null;
                      onUpdateState(prev => ({ ...prev, district: val }));
                    }}
                    className={`w-full text-xs rounded-lg px-2.5 py-1.5 transition-colors ${
                      state.locationSource === 'browser'
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                        : 'bg-white border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cam-red cursor-pointer'
                    }`}
                  >
                    <option value="">Cualquier distrito</option>
                    {MADRID_DISTRICTS.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Aviso sobre el centro municipal cuando se usa selección manual */}
              {state.locationSource === 'municipality' && state.municipality && (
                <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-2 leading-snug">
                  ℹ️ <span className="font-semibold text-slate-800">Centro municipal: </span>
                  La distancia en km se mide desde el centro geográfico del municipio seleccionado ({state.municipality}), no desde tu domicilio particular.
                </div>
              )}
            </div>

            {/* Slider de Radio geodésico */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Radio geodésico:</span>
                <span className="font-mono text-cam-red font-bold tabular-nums">
                  {state.radiusKm ? `${state.radiusKm} km` : 'Solo municipio'}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={state.radiusKm ?? 20}
                onChange={e => {
                  const val = Number(e.target.value);
                  onUpdateState(prev => ({ ...prev, radiusKm: val }));
                }}
                className="w-full accent-cam-red cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>5 km</span>
                <span>20 km</span>
                <span>40 km</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          4. TITULARIDAD DEL CENTRO (PLEGABLE)
         ======================================================== */}
      <div className="p-4 sm:p-5">
        <button
          type="button"
          onClick={() => toggleSection('ownership')}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 group-hover:text-blue-900 transition-colors">
              4. Titularidad del Centro
            </div>
            <div className="text-[11px] text-slate-500">
              {state.ownership.length === 0
                ? 'Público y concertado'
                : `${state.ownership.length} seleccionada(s)`}
            </div>
          </div>
          {openSections.ownership ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.ownership && (
          <div className="mt-3.5 space-y-1">
            {[
              { id: 'publico' as OwnershipId, label: 'Centros Públicos (CEIP, CEIPSO, IES, CEE)' },
              { id: 'concertado' as OwnershipId, label: 'Privados Concertados' }
            ].map(own => {
              const isChecked = state.ownership.includes(own.id);
              const count = dynamicCounts.ownership[own.id] ?? 0;
              return (
                <label
                  key={own.id}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-cam-red-light border-cam-red-border text-cam-red-dark font-semibold'
                      : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleOwnership(own.id)}
                      className="rounded border-slate-300 text-cam-red focus:ring-cam-red cursor-pointer"
                    />
                    <span className="text-xs">{own.label}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 tabular-nums">
                    ({count})
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================
          5. SERVICIOS DEL CENTRO (PLEGABLE)
         ======================================================== */}
      <div className="p-4 sm:p-5">
        <button
          type="button"
          onClick={() => toggleSection('services')}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 group-hover:text-blue-900 transition-colors">
              5. Servicios del Centro
            </div>
            <div className="text-[11px] text-slate-500">
              {state.requiredServices.length > 0 || state.preferredServices.length > 0
                ? `${state.requiredServices.length} obligatorios · ${state.preferredServices.length} preferidos`
                : 'Sin exigencia de servicios'}
            </div>
          </div>
          {openSections.services ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.services && (
          <div className="mt-3.5 space-y-2">
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-tight">
              <strong>Limitación de la fuente oficial:</strong> El listado de centros TEA de la Comunidad de Madrid no publica datos de servicios complementarios (comedor, transporte, enfermería). Los filtros de servicios aparecen inactivos para evitar búsquedas sin resultados.
            </div>
            {[
              { id: 'comedor' as ServiceId, label: 'Comedor escolar' },
              { id: 'transporte' as ServiceId, label: 'Transporte escolar adaptado' },
              { id: 'enfermeria' as ServiceId, label: 'Enfermería escolar' },
              { id: 'aula_matinal' as ServiceId, label: 'Aula matinal / Primeros del cole' },
              { id: 'actividades_extraescolares' as ServiceId, label: 'Actividades extraescolares' }
            ].map(srv => {
              const isRequired = state.requiredServices.includes(srv.id);
              const isPreferred = state.preferredServices.includes(srv.id);
              const countReq = dynamicCounts.requiredServices[srv.id] ?? 0;
              const isDisabled = countReq === 0;

              return (
                <div
                  key={srv.id}
                  className={`p-2.5 rounded-xl border text-xs transition-colors ${
                    isDisabled
                      ? 'bg-slate-100/80 border-slate-200 opacity-60 cursor-not-allowed'
                      : isRequired
                      ? 'bg-blue-50/80 border-blue-200'
                      : isPreferred
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                  title={isDisabled ? "La fuente oficial no publica datos de este servicio" : undefined}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-800">{srv.label}</span>
                    <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                      (0 disponibles)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => !isDisabled && handleToggleService(srv.id, true)}
                      className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold border text-center transition-colors ${
                        isDisabled
                          ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                          : isRequired
                          ? 'bg-blue-700 text-white border-blue-800 cursor-pointer'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 cursor-pointer'
                      }`}
                    >
                      Obligatorio
                    </button>

                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => !isDisabled && handleToggleService(srv.id, false)}
                      className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold border text-center transition-colors ${
                        isDisabled
                          ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                          : isPreferred
                          ? 'bg-amber-600 text-white border-amber-700 cursor-pointer'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 cursor-pointer'
                      }`}
                    >
                      Preferido
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================
          6. EVIDENCIA Y VIGENCIA OFICIAL (PLEGABLE)
         ======================================================== */}
      <div className="p-4 sm:p-5">
        <button
          type="button"
          onClick={() => toggleSection('evidence')}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 group-hover:text-blue-900 transition-colors">
              6. Nivel de Evidencia Oficial
            </div>
            <div className="text-[11px] text-slate-500">
              {state.evidence.length === 2
                ? 'Confirmados y en comprobación'
                : `Sólo ${state.evidence[0] === 'A1' ? 'Confirmados (A1)' : 'En comprobación (A2)'}`}
            </div>
          </div>
          {openSections.evidence ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.evidence && (
          <div className="mt-3.5 space-y-2">
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-tight mb-2">
              <strong>Nota de la fuente:</strong> Todos los 336 centros TEA del documento (curso 2024/2025) figuran como A2 (por comprobar vigencia actual con el SAE).
            </div>
            <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed" title="0 centros con evidencia A1 en la fuente oficial actual">
              <input
                type="checkbox"
                disabled={true}
                checked={false}
                onChange={() => {}}
                className="mt-0.5 rounded border-slate-300 text-slate-400 cursor-not-allowed"
              />
              <div>
                <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Confirmado para esta etapa (A1)</span>
                  <span className="font-mono text-[10px] text-slate-400">(0 disponibles)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  No disponible en el listado oficial actual (todos son A2 por comprobar vigencia).
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 cursor-pointer">
              <input
                type="checkbox"
                checked={state.evidence.includes('A2')}
                onChange={() => handleToggleEvidence('A2')}
                className="mt-0.5 rounded border-blue-300 text-blue-700 focus:ring-blue-600 cursor-pointer"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Por comprobar etapa o vigencia (A2)</span>
                  <span className="font-mono text-[10px] text-slate-700 font-bold">({dynamicCounts.evidence['A2'] ?? 336})</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Centros oficiales con apoyo (curso 2024/25); se recomienda verificar con el SAE.
                </p>
              </div>
            </label>
          </div>
        )}
      </div>
    </aside>
  );
};
