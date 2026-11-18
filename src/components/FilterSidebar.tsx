/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Panel Lateral de Filtros Acumulativos
 * - Secciones plegables en acordeón (1 abierta por defecto; 2-6 compactas)
 * - Etapas TEA depuradas (sin Bachillerato/FP Básica al tener 0 centros) con aclaración sobre Infantil
 * - Privacidad estricta: solo solicita geolocalización tras clic explícito y sin suplantar ubicación si se deniega
 * - Tipografía mínima 12px (text-xs) y contraste WCAG AA
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
  Compass,
  ShieldCheck,
  Building,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

import { ProcedureTopic } from '../data/disclaimerAndProcedures';

interface FilterSidebarProps {
  state: SearchState;
  dynamicCounts: DynamicCounts;
  onUpdateState: (updater: (prev: SearchState) => SearchState) => void;
  onOpenProcedureModal?: (topic: ProcedureTopic) => void;
  onClearFilters?: () => void;
}

const ACTIVE_NEED_OPTIONS: Array<{
  id: NeedId;
  label: string;
  desc: string;
  sourceTag: string;
}> = [
  {
    id: 'tea',
    label: 'Atención preferente TEA',
    desc: 'Aulas de apoyo TEA en centros ordinarios (curso 2024/25)',
    sourceTag: 'Listado CAM · A2'
  },
  {
    id: 'compensatoria',
    label: 'Escuelas de Bienvenida (Aulas de Enlace)',
    desc: '47 concertados 2026/27 (red pública vía SAE/DAT)',
    sourceTag: 'Concertados 26/27 · A1'
  },
  {
    id: 'educacion_especial',
    label: 'Educación Especial (CEE)',
    desc: 'Colegios específicos en situación ALTA (CAM)',
    sourceTag: 'Datos Abiertos · A1'
  },
  {
    id: 'salud_hospitalaria',
    label: 'Atención Hospitalaria',
    desc: 'Aulas hospitalarias en centros sanitarios públicos (CAM)',
    sourceTag: 'Datos Abiertos CAM'
  },
  {
    id: 'visual',
    label: 'Discapacidad Visual',
    desc: 'EOEP regional itinerante y C.R.E. ONCE',
    sourceTag: 'CAM + ONCE · A1'
  },
  {
    id: 'altas_capacidades',
    label: 'Altas Capacidades',
    desc: 'CREACIM, EOEP y 8 sedes IES del PEAC (sábados)',
    sourceTag: 'CAM + PEAC'
  }
];

const REGIONAL_EOEP_NEED_OPTIONS: Array<{
  id: NeedId;
  label: string;
  desc: string;
  sourceTag: string;
}> = [
  {
    id: 'auditiva',
    label: 'Discapacidad Auditiva',
    desc: 'EOEP Específico regional de orientación auditiva',
    sourceTag: 'EOEP CAM · A1'
  },
  {
    id: 'motora',
    label: 'Discapacidad Motora',
    desc: 'EOEP Específico regional en movilidad y acceso',
    sourceTag: 'EOEP CAM · A1'
  },
  {
    id: 'tdah',
    label: 'TDAH y Dificultades',
    desc: 'EOEP Específico regional en centro ordinario',
    sourceTag: 'EOEP CAM · A1'
  },
  {
    id: 'tel_lenguaje',
    label: 'Trastorno del Lenguaje',
    desc: 'EOEP Específico Lenguaje y TDAH (TDL/TEL)',
    sourceTag: 'EOEP CAM · A1'
  }
];

const NEED_LABELS: Record<NeedId, string> = {
  tea: 'Atención TEA',
  educacion_especial: 'Educación Especial (CEE)',
  salud_hospitalaria: 'Atención Hospitalaria',
  auditiva: 'Discapacidad Auditiva',
  motora: 'Discapacidad Motora',
  visual: 'Discapacidad Visual',
  altas_capacidades: 'Altas Capacidades',
  tdah: 'TDAH y Conducta',
  tel_lenguaje: 'Trastorno del Lenguaje',
  compensatoria: 'Escuelas de Bienvenida'
};

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  state,
  dynamicCounts,
  onUpdateState,
  onOpenProcedureModal
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

  // 1. Necesidad Educativa
  const handleSelectNeed = (needId: NeedId | null) => {
    onUpdateState(prev => ({
      ...prev,
      need: needId === null ? null : prev.need === needId ? null : needId,
      // Restablecer evidencia a ambas si venía restringida para evitar bloqueos entre catálogos A1/A2
      evidence: ['A1', 'A2']
    }));
  };

  // 2. Etapas
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

  // 5a. Servicios (Ayuntamiento de Madrid para Madrid capital)
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

  // 5b. Accesibilidad física (Ayuntamiento de Madrid para Madrid capital)
  const handleToggleAccessibility = (accId: AccessibilityId) => {
    onUpdateState(prev => {
      const exists = prev.accessibilityRequired.includes(accId);
      const next = exists
        ? prev.accessibilityRequired.filter(a => a !== accId)
        : [...prev.accessibilityRequired, accId];
      return { ...prev, accessibilityRequired: next };
    });
  };

  // 6. Evidencia (solo alterna si la otra opción tiene centros o está activa)
  const handleToggleEvidence = (evId: EvidenceId) => {
    const otherEv: EvidenceId = evId === 'A1' ? 'A2' : 'A1';
    const otherCount = dynamicCounts.evidence[otherEv] ?? 0;

    onUpdateState(prev => {
      const exists = prev.evidence.includes(evId);
      if (exists && (prev.evidence.length === 1 || otherCount === 0)) {
        return prev;
      }
      const newEv = exists
        ? prev.evidence.filter(e => e !== evId)
        : [...prev.evidence, evId];
      return { ...prev, evidence: newEv };
    });
  };

  // Georreferenciación del navegador: solo bajo petición explícita y sin inventar Puerta del Sol si falla
  const handleUseBrowserLocation = () => {
    setGeoError(null);

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoError('Tu navegador no admite geolocalización. Usa la selección por municipio.');
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGeoLoading(false);
        const lat = Number(pos.coords.latitude.toFixed(3));
        const lng = Number(pos.coords.longitude.toFixed(3));
        onUpdateState(prev => ({
          ...prev,
          locationSource: 'browser',
          municipality: null,
          district: null,
          userCoordinates: {
            lat,
            lng,
            label: 'Tu ubicación aproximada'
          },
          radiusKm: prev.radiusKm ?? 20
        }));
      },
      err => {
        setGeoLoading(false);
        console.info('GPS del navegador restringido o denegado:', err.message);
        setGeoError('Permiso denegado o ubicación no disponible. Mantenemos la búsqueda por municipio.');
        onUpdateState(prev => ({
          ...prev,
          locationSource: 'municipality',
          municipality: prev.municipality || 'Madrid',
          userCoordinates: null
        }));
      },
      { timeout: 6000, enableHighAccuracy: false }
    );
  };

  const handleUseMunicipality = () => {
    setGeoError(null);
    onUpdateState(prev => ({
      ...prev,
      locationSource: 'municipality',
      municipality: prev.municipality || 'Madrid',
      district: prev.municipality === 'Madrid' || !prev.municipality ? prev.district : null,
      userCoordinates: null,
      radiusKm: prev.radiusKm ?? 20
    }));
  };

  const serviceItems: Array<{ id: ServiceId; label: string }> = [
    { id: 'comedor', label: 'Comedor escolar' },
    { id: 'aula_matinal', label: 'Horario ampliado / Aula matinal' },
    { id: 'transporte', label: 'Transporte escolar' },
    { id: 'enfermeria', label: 'Enfermería escolar' },
    { id: 'actividades_extraescolares', label: 'Actividades extraescolares' }
  ];

  const anyServiceAvailable = serviceItems.some(
    s => (dynamicCounts.requiredServices[s.id] ?? 0) > 0
  );
  const accPhysicalCount = dynamicCounts.accessibility['acceso_fisico'] ?? 0;
  const isAccPhysicalChecked = state.accessibilityRequired.includes('acceso_fisico');
  const isAccPhysicalDisabled = accPhysicalCount === 0 && !isAccPhysicalChecked;

  const a1Count = dynamicCounts.evidence['A1'] ?? 0;
  const a2Count = dynamicCounts.evidence['A2'] ?? 0;

  return (
    <aside className="w-full bg-white divide-y divide-slate-200 text-sm text-slate-800" aria-label="Filtros de búsqueda">
      {/* ========================================================
          1. NECESIDAD EDUCATIVA (3 CATÁLOGOS OFICIALES ACTIVOS)
         ======================================================== */}
      <div className="p-4 sm:p-5">
        <button
          type="button"
          onClick={() => toggleSection('needs')}
          aria-expanded={openSections.needs}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 group-hover:text-blue-900 transition-colors">
              1. Necesidad Educativa
            </div>
            <div className="text-xs text-slate-600">
              {state.need
                ? NEED_LABELS[state.need]
                : 'Todo el catálogo oficial (TEA, Enlace, CEE, Hosp., Visual, AACC y EOEP)'}
            </div>
          </div>
          {openSections.needs ? (
            <ChevronDown className="w-4 h-4 text-slate-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {openSections.needs && (
          <div className="mt-3.5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-700">
                Catálogos oficiales cargados:
              </span>
              {state.need !== null && (
                <button
                  type="button"
                  onClick={() => handleSelectNeed(null)}
                  className="text-xs font-bold text-blue-900 hover:underline cursor-pointer"
                >
                  Ver todos
                </button>
              )}
            </div>

            <div className="space-y-1.5" role="radiogroup" aria-label="Necesidad Educativa">
              {ACTIVE_NEED_OPTIONS.map(item => {
                const isSelected = state.need === item.id;
                const count = dynamicCounts.needs[item.id] ?? 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectNeed(item.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-950 font-semibold ring-1 ring-blue-600/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-snug flex items-center gap-1.5 flex-wrap">
                        <span>{item.label}</span>
                        <span className="text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          {item.sourceTag}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">{item.desc}</div>
                    </div>
                    <span
                      className={`text-xs tabular-nums px-2 py-0.5 rounded-md font-mono shrink-0 font-bold ${
                        isSelected ? 'bg-blue-100 text-blue-950' : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}

              <div className="pt-2 pb-0.5">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Equipos regionales específicos (EOEP CAM):
                </div>
                <p className="text-xs text-slate-600 leading-snug mt-0.5">
                  Mostramos el equipo público específico oficial que orienta en toda la región.
                </p>
              </div>

              {REGIONAL_EOEP_NEED_OPTIONS.map(item => {
                const isSelected = state.need === item.id;
                const count = dynamicCounts.needs[item.id] ?? 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectNeed(item.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-950 font-semibold ring-1 ring-blue-600/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-snug flex items-center gap-1.5 flex-wrap">
                        <span>{item.label}</span>
                        <span className="text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          {item.sourceTag}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">{item.desc}</div>
                    </div>
                    <span
                      className={`text-xs tabular-nums px-2 py-0.5 rounded-md font-mono shrink-0 font-bold ${
                        isSelected ? 'bg-blue-100 text-blue-950' : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {state.need && state.need !== 'tea' && state.need !== 'salud_hospitalaria' && onOpenProcedureModal && (
              <button
                type="button"
                onClick={() => onOpenProcedureModal(state.need as ProcedureTopic)}
                className="w-full text-left px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50 text-xs text-emerald-950 font-semibold flex items-center justify-between gap-2 cursor-pointer transition-colors"
              >
                <span>
                  {state.need === 'educacion_especial'
                    ? '¿Cómo se solicita plaza en un CEE?'
                    : state.need === 'visual'
                    ? '¿Cómo funciona el EOEP Visual y el C.R.E. ONCE?'
                    : state.need === 'altas_capacidades'
                    ? '¿Cómo funcionan el CREACIM y las sedes PEAC?'
                    : state.need === 'auditiva'
                    ? '¿Cómo consultar centros preferentes auditivos / EOEP?'
                    : state.need === 'motora'
                    ? '¿Cómo tramitar plaza preferente motora y fisioterapia?'
                    : state.need === 'tdah'
                    ? '¿Cómo apoya el EOEP de TDAH en centros ordinarios?'
                    : state.need === 'tel_lenguaje'
                    ? '¿Cómo funciona el apoyo de Lenguaje (TDL/TEL) y AL?'
                    : '¿Cómo solicitar Escuelas de Bienvenida / Aulas de Enlace (DAT)?'}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-800 shrink-0" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          2. ETAPA EDUCATIVA
         ======================================================== */}
      <div className="p-4 sm:p-5">
        <button
          type="button"
          onClick={() => toggleSection('stages')}
          aria-expanded={openSections.stages}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 group-hover:text-blue-900 transition-colors">
              2. Etapa Educativa
            </div>
            <div className="text-xs text-slate-600">
              {state.stages.length === 0
                ? 'Todas las etapas'
                : `${state.stages.length} seleccionada(s) (${state.stageMatchMode === 'all' ? 'todas' : 'cualquiera'})`}
            </div>
          </div>
          {openSections.stages ? (
            <ChevronDown className="w-4 h-4 text-slate-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {openSections.stages && (
          <div className="mt-3.5 space-y-2.5">
            {state.stages.length > 1 && (
              <div className="bg-slate-100 p-1 rounded-lg flex items-center text-xs">
                <button
                  type="button"
                  onClick={() => onUpdateState(prev => ({ ...prev, stageMatchMode: 'any' }))}
                  className={`flex-1 py-1 px-2 rounded-md font-semibold text-center transition-colors cursor-pointer ${
                    state.stageMatchMode !== 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
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
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                  title="Sólo centros que figuren en todas las etapas marcadas"
                >
                  Todas
                </button>
              </div>
            )}

            <div className="space-y-1">
              {[
                { id: 'infantil' as StageId, label: 'Educación Infantil (3-6 años)', always: true },
                { id: 'primaria' as StageId, label: 'Educación Primaria (6-12 años)', always: true },
                { id: 'eso' as StageId, label: 'Secundaria Obligatoria (E.S.O.)', always: true },
                { id: 'bachillerato' as StageId, label: 'Bachillerato (PEAC)', always: false }
              ]
                .filter(st => st.always || (dynamicCounts.stages[st.id] ?? 0) > 0 || state.stages.includes(st.id))
                .map(st => {
                  const isChecked = state.stages.includes(st.id);
                  const count = dynamicCounts.stages[st.id] ?? 0;
                  return (
                    <div key={st.id}>
                      <label
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-cam-blue-light border-cam-blue-border text-cam-blue-dark font-semibold'
                            : 'bg-white border-transparent hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleStage(st.id)}
                            className="rounded border-slate-400 text-cam-blue focus:ring-cam-blue cursor-pointer"
                          />
                          <span className="text-xs">{st.label}</span>
                        </div>
                        <span className="text-xs font-mono text-slate-700 tabular-nums">
                          ({count})
                        </span>
                      </label>
                      {st.id === 'infantil' && (!state.need || state.need === 'tea') && (
                        <p className="px-3 pt-1 pb-1.5 text-xs text-slate-600 leading-snug">
                          Nota: solo 3 centros figuran solo en Infantil en el PDF TEA 2024/25; los CEIP/CEIPSO marcados en Primaria también imparten Infantil.
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-snug">
              {state.need === 'educacion_especial' ? (
                <>
                  <strong>Modalidad CEE:</strong> Los Colegios de Educación Especial escolarizan Infantil Especial, Educación Básica Obligatoria (EBO, 6-16 años) y Programas de Transición a la Vida Adulta (PTVA).
                </>
              ) : state.need === 'salud_hospitalaria' ? (
                <>
                  <strong>Atención Hospitalaria:</strong> Las unidades escolares hospitalarias cubren toda la escolarización obligatoria (Infantil, Primaria y ESO) mientras dura el ingreso.
                </>
              ) : state.need === 'visual' ? (
                <>
                  <strong>Discapacidad Visual:</strong> El EOEP Visual atiende de forma itinerante desde Infantil a ESO en cualquier centro ordinario; el C.R.E. ONCE de Moratalaz cubre CEE, Primaria y ESO.
                </>
              ) : state.need === 'compensatoria' ? (
                <>
                  <strong>Escuelas de Bienvenida (Aulas de Enlace 2026/27):</strong> De los 47 centros concertados autorizados, 1 cubre Primaria, 4 solo Secundaria (ESO) y 42 Primaria y ESO (habitualmente desde 3.º de Primaria). La red pública se asigna vía SAE/DAT.
                </>
              ) : state.need === 'altas_capacidades' ? (
                <>
                  <strong>Altas Capacidades:</strong> El alumnado permanece en su colegio o instituto ordinario; el programa PEAC ofrece talleres los sábados en Primaria, ESO y Bachillerato.
                </>
              ) : (
                <>
                  <strong>Sobre Infantil y Primaria:</strong> En el listado oficial TEA 2024/25 solo 3 escuelas privadas figuran con etapa «Infantil». La mayoría de los CEIP imparten Infantil, aunque el PDF solo marca «Primaria» para el aula TEA.
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          3. UBICACIÓN DE REFERENCIA Y RADIO
         ======================================================== */}
      <div className="p-4 sm:p-5">
        <button
          type="button"
          onClick={() => toggleSection('location')}
          aria-expanded={openSections.location}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 group-hover:text-blue-900 transition-colors">
              3. Ubicación y Radio
            </div>
            <div className="text-xs text-slate-600">
              {state.locationSource === 'browser'
                ? 'Tu ubicación aproximada'
                : state.municipality
                ? `${state.municipality}${state.district ? ` (${state.district})` : ''} · ${state.radiusKm ? `${state.radiusKm} km` : 'solo municipio'}`
                : 'Toda la Comunidad de Madrid'}
            </div>
          </div>
          {openSections.location ? (
            <ChevronDown className="w-4 h-4 text-slate-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {openSections.location && (
          <div className="mt-3.5 space-y-3">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={handleUseMunicipality}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  state.locationSource !== 'browser'
                    ? 'bg-cam-blue text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Building className={`w-3.5 h-3.5 ${state.locationSource !== 'browser' ? 'text-white' : 'text-slate-600'}`} />
                <span>Municipio</span>
              </button>

              <button
                type="button"
                onClick={handleUseBrowserLocation}
                disabled={geoLoading}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  state.locationSource === 'browser'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Compass className={`w-3.5 h-3.5 ${state.locationSource === 'browser' ? 'text-white' : 'text-blue-700'}`} />
                <span>{geoLoading ? 'Detectando...' : 'Cerca de mí'}</span>
              </button>
            </div>

            {geoError && (
              <div role="alert" className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-1.5 leading-snug">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>{geoError}</span>
              </div>
            )}

            <div className="space-y-2.5">
              <div>
                <label htmlFor="municipality-select" className="block text-xs font-semibold text-slate-700 mb-1">
                  Municipio de referencia:
                </label>
                <select
                  id="municipality-select"
                  disabled={state.locationSource === 'browser'}
                  value={state.locationSource === 'browser' ? '' : (state.municipality ?? '')}
                  onChange={e => {
                    const val = e.target.value || null;
                    setGeoError(null);
                    onUpdateState(prev => ({
                      ...prev,
                      locationSource: 'municipality',
                      userCoordinates: null,
                      municipality: val,
                      district: val === 'Madrid' ? prev.district : null,
                      radiusKm: val ? (prev.radiusKm ?? 20) : null
                    }));
                  }}
                  className={`w-full text-xs rounded-lg px-2.5 py-1.5 transition-colors ${
                    state.locationSource === 'browser'
                      ? 'bg-slate-100 text-slate-600 border border-slate-200 cursor-not-allowed'
                      : 'bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cam-blue cursor-pointer'
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

              {state.locationSource !== 'browser' && state.municipality === 'Madrid' && (
                <div>
                  <label htmlFor="district-select" className="block text-xs font-semibold text-slate-700 mb-1">
                    Distrito (Madrid capital):
                  </label>
                  <select
                    id="district-select"
                    value={state.district || ''}
                    onChange={e => {
                      const val = e.target.value || null;
                      onUpdateState(prev => ({ ...prev, district: val }));
                    }}
                    className="w-full text-xs rounded-lg px-2.5 py-1.5 transition-colors bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cam-blue cursor-pointer"
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

              {state.locationSource !== 'browser' && state.municipality && (
                <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 leading-snug flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Referencia municipal: </span>
                    {state.district
                      ? `Mostrando exclusivamente los centros ubicados en el distrito de ${state.district}.`
                      : `La distancia en km se calcula desde el centro de ${state.municipality} hasta la ubicación oficial de cada centro.`}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {state.locationSource !== 'browser' && state.municipality && !state.district && (
                <div className="bg-slate-100 p-1 rounded-lg flex items-center text-xs">
                  <button
                    type="button"
                    onClick={() => onUpdateState(prev => ({ ...prev, radiusKm: null }))}
                    className={`flex-1 py-1 px-2 rounded-md font-semibold text-center transition-colors cursor-pointer ${
                      state.radiusKm === null
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    Solo municipio
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateState(prev => ({ ...prev, radiusKm: prev.radiusKm ?? 20 }))}
                    className={`flex-1 py-1 px-2 rounded-md font-semibold text-center transition-colors cursor-pointer ${
                      state.radiusKm !== null
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    Ampliar por radio
                  </button>
                </div>
              )}

              {state.locationSource !== 'browser' && !state.municipality ? (
                <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2">
                  Mostrando los centros de <strong>toda la Comunidad de Madrid</strong> sin restricción de radio.
                </div>
              ) : state.district ? null : (
                <div className={state.locationSource !== 'browser' && state.radiusKm === null ? 'opacity-60' : ''}>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Radio geodésico:</span>
                    <span className="font-mono text-cam-blue font-bold tabular-nums">
                      {state.radiusKm ? `${state.radiusKm} km` : 'Solo municipio'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="5"
                    aria-label="Radio geodésico en kilómetros"
                    value={state.radiusKm ?? 20}
                    onChange={e => {
                      const val = Number(e.target.value);
                      onUpdateState(prev => ({ ...prev, radiusKm: val }));
                    }}
                    className="w-full accent-cam-blue cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-600 font-mono">
                    <span>5 km</span>
                    <span>20 km</span>
                    <span>40 km</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          4. TITULARIDAD DEL CENTRO
         ======================================================== */}
      <div className="p-4 sm:p-5">
        <button
          type="button"
          onClick={() => toggleSection('ownership')}
          aria-expanded={openSections.ownership}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 group-hover:text-blue-900 transition-colors">
              4. Titularidad del Centro
            </div>
            <div className="text-xs text-slate-600">
              {state.ownership.length === 0
                ? 'Cualquier titularidad'
                : `${state.ownership.length} seleccionada(s)`}
            </div>
          </div>
          {openSections.ownership ? (
            <ChevronDown className="w-4 h-4 text-slate-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {openSections.ownership && (
          <div className="mt-3.5 space-y-1">
            {[
              { id: 'publico' as OwnershipId, label: 'Centros Públicos (CEIP, CEIPSO, IES, CEE)' },
              { id: 'concertado' as OwnershipId, label: 'Privados Concertados' },
              { id: 'privado' as OwnershipId, label: 'Privados (no concertados)' }
            ].map(own => {
              const isChecked = state.ownership.includes(own.id);
              const count = dynamicCounts.ownership[own.id] ?? 0;
              const isDisabled = count === 0 && !isChecked;
              return (
                <label
                  key={own.id}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-colors ${
                    isDisabled
                      ? 'bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed'
                      : isChecked
                      ? 'bg-cam-blue-light border-cam-blue-border text-cam-blue-dark font-semibold cursor-pointer'
                      : 'bg-white border-transparent hover:bg-slate-50 text-slate-800 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      disabled={isDisabled}
                      checked={isChecked}
                      onChange={() => !isDisabled && handleToggleOwnership(own.id)}
                      className={`rounded border-slate-400 text-cam-blue focus:ring-cam-blue ${
                        isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    />
                    <span className="text-xs">{own.label}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-700 tabular-nums">
                    ({count})
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================
          5. SERVICIOS Y ACCESIBILIDAD (AYUNTAMIENTO DE MADRID)
         ======================================================== */}
      <div className="p-4 sm:p-5">
        <button
          type="button"
          onClick={() => toggleSection('services')}
          aria-expanded={openSections.services}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 group-hover:text-blue-900 transition-colors">
              5. Servicios y Accesibilidad
            </div>
            <div className="text-xs text-slate-600">
              {state.requiredServices.length > 0 ||
              state.preferredServices.length > 0 ||
              state.accessibilityRequired.length > 0
                ? `${state.requiredServices.length + state.accessibilityRequired.length} obligatorios · ${state.preferredServices.length} preferidos`
                : anyServiceAvailable || accPhysicalCount > 0
                ? 'Datos Ayto. Madrid disponibles'
                : 'Sin datos públicos en esta zona'}
            </div>
          </div>
          {openSections.services ? (
            <ChevronDown className="w-4 h-4 text-slate-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {openSections.services && (
          <div className="mt-3.5 space-y-2">
            <div
              className={`p-2.5 rounded-xl border text-xs leading-snug ${
                anyServiceAvailable || accPhysicalCount > 0
                  ? 'bg-blue-50 border-blue-200 text-blue-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <strong>Cobertura de la fuente abierta municipal:</strong> El portal del Ayuntamiento de Madrid (<span className="font-mono">datos.madrid.es</span>) publica equipamiento y accesibilidad física <strong>exclusivamente para centros de Madrid capital</strong>. Los otros 178 municipios no disponen de este conjunto abierto y se muestran inactivos para evitar falsos ceros.
            </div>

            {serviceItems.map(srv => {
              const isRequired = state.requiredServices.includes(srv.id);
              const isPreferred = state.preferredServices.includes(srv.id);
              const countReq = dynamicCounts.requiredServices[srv.id] ?? 0;
              const countPref = dynamicCounts.preferredServices[srv.id] ?? 0;
              const isAllDisabled = countReq === 0 && !isRequired && !isPreferred;

              return (
                <div
                  key={srv.id}
                  className={`p-2.5 rounded-xl border text-xs transition-colors ${
                    isAllDisabled
                      ? 'bg-slate-100 border-slate-200'
                      : isRequired
                      ? 'bg-blue-50 border-blue-200'
                      : isPreferred
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                  title={
                    isAllDisabled
                      ? 'No hay centros coincidentes con datos publicados para este servicio en la selección actual'
                      : undefined
                  }
                >
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <span className="font-semibold text-slate-800">{srv.label}</span>
                    <span className="font-mono text-xs text-slate-700 whitespace-nowrap font-semibold tabular-nums">
                      {countReq > 0 ? `(${countReq})` : 'Sin datos'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={countReq === 0 && !isRequired}
                      onClick={() => handleToggleService(srv.id, true)}
                      className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold border text-center transition-colors ${
                        countReq === 0 && !isRequired
                          ? 'bg-slate-200 text-slate-600 border-slate-300 cursor-not-allowed'
                          : isRequired
                          ? 'bg-blue-700 text-white border-blue-800 cursor-pointer'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer'
                      }`}
                    >
                      Obligatorio
                    </button>

                    <button
                      type="button"
                      disabled={countPref === 0 && !isPreferred}
                      onClick={() => handleToggleService(srv.id, false)}
                      className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold border text-center transition-colors ${
                        countPref === 0 && !isPreferred
                          ? 'bg-slate-200 text-slate-600 border-slate-300 cursor-not-allowed'
                          : isPreferred
                          ? 'bg-amber-600 text-white border-amber-700 cursor-pointer'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer'
                      }`}
                    >
                      Preferido
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Accesibilidad física según códigos oficiales ACCESIBILIDAD del Ayuntamiento de Madrid */}
            <div className="pt-2 border-t border-slate-200">
              <div className="text-xs font-bold text-slate-700 mb-1.5">
                Accesibilidad física declarada (cód. 1 · Ayto. Madrid):
              </div>
              <label
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs transition-colors ${
                  isAccPhysicalDisabled
                    ? 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
                    : isAccPhysicalChecked
                    ? 'bg-blue-50 border-blue-300 text-blue-950 font-semibold cursor-pointer'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800 cursor-pointer'
                }`}
                title={
                  isAccPhysicalDisabled
                    ? 'Sin centros con código oficial ACCESIBILIDAD = 1 (Accesible) en la selección actual'
                    : 'Centros con código ACCESIBILIDAD = 1 (Accesible) en datos.madrid.es (los códigos 2 = parcialmente accesible PMR y 3 = sin información PMR se detallan en cada ficha)'
                }
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    disabled={isAccPhysicalDisabled}
                    checked={isAccPhysicalChecked}
                    onChange={() => !isAccPhysicalDisabled && handleToggleAccessibility('acceso_fisico')}
                    className={`rounded border-slate-400 text-blue-700 focus:ring-blue-600 ${
                      isAccPhysicalDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  />
                  <span>Solo accesible confirmado (ACCESIBILIDAD = 1)</span>
                </div>
                <span className="font-mono text-xs text-slate-700 tabular-nums shrink-0 font-semibold">
                  {accPhysicalCount > 0 ? `(${accPhysicalCount})` : 'Sin datos'}
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          6. EVIDENCIA Y VIGENCIA OFICIAL
         ======================================================== */}
      <div className="p-4 sm:p-5">
        <button
          type="button"
          onClick={() => toggleSection('evidence')}
          aria-expanded={openSections.evidence}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 group-hover:text-blue-900 transition-colors">
              6. Nivel de Evidencia
            </div>
            <div className="text-xs text-slate-600">
              {state.evidence.length === 2
                ? 'Confirmados (A1) y en comprobación (A2)'
                : `Sólo ${state.evidence[0] === 'A1' ? 'Confirmados (A1)' : 'Por comprobar (A2)'}`}
            </div>
          </div>
          {openSections.evidence ? (
            <ChevronDown className="w-4 h-4 text-slate-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {openSections.evidence && (
          <div className="mt-3.5 space-y-2">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-snug mb-2">
              <strong>Criterio documental:</strong> Cuentan con vigencia confirmada (<strong>A1</strong>) los centros en situación <span className="font-mono">ALTA</span> y resoluciones vigentes (CEE, 47 Aulas de Enlace concertadas 2026/27, Hospitalarias activas, EOEP Visual, CRE ONCE, CREACIM y EOEP específicos). Figuran en <strong>A2</strong> el listado TEA 2024/25, las aulas hospitalarias en trámite y las 8 sedes IES del programa PEAC.
            </div>

            <label
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-colors ${
                a1Count === 0
                  ? 'border-slate-200 bg-slate-100 cursor-not-allowed'
                  : 'border-emerald-200 bg-emerald-50/70 cursor-pointer'
              }`}
              title={
                a1Count === 0
                  ? 'No hay registros A1 en la necesidad o zona seleccionada (el listado TEA actual es A2)'
                  : undefined
              }
            >
              <input
                type="checkbox"
                disabled={a1Count === 0 || (a2Count === 0 && state.evidence.includes('A1'))}
                checked={a1Count > 0 && state.evidence.includes('A1')}
                onChange={() => a1Count > 0 && handleToggleEvidence('A1')}
                className={`mt-0.5 rounded border-slate-400 text-emerald-700 focus:ring-emerald-600 ${
                  a1Count === 0 ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              />
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                  <ShieldCheck
                    className={`w-3.5 h-3.5 ${a1Count > 0 ? 'text-emerald-700' : 'text-slate-600'}`}
                  />
                  <span>Confirmado vigente (A1)</span>
                  <span className="font-mono text-xs text-slate-800 font-bold tabular-nums">({a1Count})</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {a1Count > 0
                    ? 'CEE, 47 Aulas de Enlace concertadas (2026/27), aulas hospitalarias ALTA, EOEP Visual, CRE ONCE, CREACIM y EOEP específicos.'
                    : 'Sin registros A1 coincidentes con la necesidad o filtros actuales.'}
                </p>
              </div>
            </label>

            <label
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-colors ${
                a2Count === 0
                  ? 'border-slate-200 bg-slate-100 cursor-not-allowed'
                  : 'border-blue-200 bg-blue-50/70 cursor-pointer'
              }`}
            >
              <input
                type="checkbox"
                disabled={a2Count === 0 || (a1Count === 0 && state.evidence.includes('A2'))}
                checked={a2Count > 0 && state.evidence.includes('A2')}
                onChange={() => a2Count > 0 && handleToggleEvidence('A2')}
                className={`mt-0.5 rounded border-blue-400 text-blue-700 focus:ring-blue-600 ${
                  a2Count === 0 ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              />
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                  <span>Oficial por comprobar vigencia (A2)</span>
                  <span className="font-mono text-xs text-slate-800 font-bold tabular-nums">({a2Count})</span>
                </div>
                <p className="text-xs text-slate-700 mt-0.5">
                  {a2Count > 0
                    ? 'Centros TEA (2024/25), aulas en trámite o sedes PEAC por convocatoria anual.'
                    : 'Sin registros A2 en la necesidad o filtros actuales.'}
                </p>
              </div>
            </label>
          </div>
        )}
      </div>
    </aside>
  );
};
