/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Madrid Educa Apoyo - Filtros Acumulativos
 * Buscador Educativo con Evidencia Oficial y Filtros que se Acumulan
 *
 * Arquitectura:
 * - Eliminación total del desborde horizontal (responsive 1 col en < 1280px)
 * - Tarjetas simplificadas en 4 preguntas esenciales con lenguaje familiar
 * - Unificación de navegación: Buscar (Lista / Mapa)
 * - Navegación desaturada de 4 destinos + Menú Más
 * - Comparador con límite de 3 centros y alerta de filtros posteriores
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  DynamicCounts,
  RelaxationOption,
  School,
  SearchState,
  TestScenario
} from './types';
import { SCHOOLS_DATA } from './data/schools';
import { OFFICIAL_TEA_SOURCE } from './data/officialTea';
import {
  computeDynamicCounts,
  INITIAL_SEARCH_STATE,
  matchesCentre,
  parseSearchStateFromQuery,
  serializeSearchStateToQuery,
  sortCentres,
  analyzeZeroResults,
  downloadResultsCSV,
  downloadResultsJSON
} from './utils/filterEngine';

import { Header } from './components/Header';
import { FilterSidebar } from './components/FilterSidebar';
import { ActiveFilterChips } from './components/ActiveFilterChips';
import { SchoolCard } from './components/SchoolCard';
import { ZeroResultsAdvice } from './components/ZeroResultsAdvice';

const SchoolsMap = React.lazy(() =>
  import('./components/SchoolsMap').then(m => ({ default: m.SchoolsMap }))
);
const SchoolDetailModal = React.lazy(() =>
  import('./components/SchoolDetailModal').then(m => ({ default: m.SchoolDetailModal }))
);
const ContinuityView = React.lazy(() =>
  import('./components/ContinuityView').then(m => ({ default: m.ContinuityView }))
);
const ComparatorView = React.lazy(() =>
  import('./components/ComparatorView').then(m => ({ default: m.ComparatorView }))
);
const PassportView = React.lazy(() =>
  import('./components/PassportView').then(m => ({ default: m.PassportView }))
);
const SourcesView = React.lazy(() =>
  import('./components/SourcesView').then(m => ({ default: m.SourcesView }))
);
const OfficialProceduresModal = React.lazy(() =>
  import('./components/OfficialProceduresModal').then(m => ({ default: m.OfficialProceduresModal }))
);
const TestScenariosModal = React.lazy(() =>
  import('./components/TestScenariosModal').then(m => ({ default: m.TestScenariosModal }))
);

import {
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  CheckCircle,
  Map,
  LayoutGrid,
  Share2,
  Download,
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';
import { LEGAL_DISCLAIMER, ProcedureTopic } from './data/disclaimerAndProcedures';
import { useModalFocusTrap } from './utils/useModalFocusTrap';

export default function App() {
  // 1. Estado de búsqueda inicial con sincronización de URL
  const [searchState, setSearchState] = useState<SearchState>(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      try {
        return parseSearchStateFromQuery(window.location.search);
      } catch (err) {
        console.error('Error restaurando URL de búsqueda:', err);
      }
    }
    return INITIAL_SEARCH_STATE;
  });

  // Pestaña activa simplificada: Buscar, Continuidad, Comparador, Pasaporte, Fuentes
  const [activeTab, setActiveTab] = useState<'search' | 'continuity' | 'comparator' | 'passport' | 'sources'>('search');

  // Modo de visualización en el buscador: Mapa (Mapa + Lista) por defecto en primera carga, o Lista
  const [searchViewMode, setSearchViewMode] = useState<'cards' | 'map'>('map');
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Centros guardados en el comparador (máximo 3) y en el pasaporte local
  const [comparedIds, setComparedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('madrid_educa_compared');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [passportIds, setPassportIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('madrid_educa_passport');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Estado del modal de ficha / evidencia
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<'why' | 'details' | 'continuity'>('details');

  // Estado del modal de procedimientos específicos (Visual / Altas capacidades / CEE / EOEP / Compensatoria)
  const [procedureTopic, setProcedureTopic] = useState<ProcedureTopic | null>(null);

  // Modal de Batería de Pruebas oficiales FIL-001 a FIL-012
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);

  // Drawer de filtros en móviles
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [isEasyReadMode, setIsEasyReadMode] = useState<boolean>(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const legalModalRef = useRef<HTMLDivElement>(null);

  // Notificación breve accesible
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (message: string, duration = 3500) => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, duration);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const closeLegalModal = React.useCallback(() => setIsLegalModalOpen(false), []);
  useModalFocusTrap(isLegalModalOpen, legalModalRef, closeLegalModal);

  useEffect(() => {
    setVisibleCount(12);
  }, [searchState]);

  // Guardar comparador y pasaporte en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('madrid_educa_compared', JSON.stringify(comparedIds));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [comparedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('madrid_educa_passport', JSON.stringify(passportIds));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [passportIds]);

  // Sincronización continua de la URL con el estado acumulado (N.4 URL Reproducible)
  useEffect(() => {
    const query = serializeSearchStateToQuery(searchState);
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [searchState]);

  // 2. Filtrado acumulativo y ordenación (N.1)
  const filteredSchools = useMemo(() => {
    const matching = SCHOOLS_DATA.filter(school => matchesCentre(school, searchState));
    return sortCentres(matching, searchState);
  }, [searchState]);

  // 3. Contadores dinámicos para cada opción (N.5)
  const dynamicCounts = useMemo<DynamicCounts>(() => {
    return computeDynamicCounts(SCHOOLS_DATA, searchState);
  }, [searchState]);

  // 4. Análisis de Cero Resultados si no hay coincidencias (N.7)
  const zeroResultsAnalysis = useMemo(() => {
    if (filteredSchools.length === 0) {
      return analyzeZeroResults(SCHOOLS_DATA, searchState);
    }
    return null;
  }, [filteredSchools.length, searchState]);

  // Centros para el Comparador y Pasaporte
  const comparedSchools = useMemo(() => {
    return SCHOOLS_DATA.filter(s => comparedIds.includes(s.id));
  }, [comparedIds]);

  const passportSchools = useMemo(() => {
    return SCHOOLS_DATA.filter(s => passportIds.includes(s.id));
  }, [passportIds]);

  // Handlers para comparar (Límite estricto a 3 centros para legibilidad familiar)
  const handleToggleCompare = (school: School) => {
    if (comparedIds.includes(school.id)) {
      setComparedIds(prev => prev.filter(id => id !== school.id));
      return;
    }
    if (comparedIds.length >= 3) {
      showToast('El comparador permite un máximo de 3 centros simultáneos para mantener una lectura clara.', 4500);
      return;
    }
    setComparedIds(prev => [...prev, school.id]);
  };

  const handleTogglePassport = (school: School) => {
    setPassportIds(prev => {
      if (prev.includes(school.id)) {
        return prev.filter(id => id !== school.id);
      } else {
        return [...prev, school.id];
      }
    });
  };

  // Limpiar todos los filtros (N.3)
  const handleClearAll = () => {
    setSearchState({
      need: null,
      stages: [],
      stageMatchMode: 'any',
      municipality: null,
      district: null,
      radiusKm: null,
      locationSource: 'municipality',
      userCoordinates: null,
      ownership: [],
      modalities: [],
      requiredServices: [],
      preferredServices: [],
      accessibilityRequired: [],
      evidence: ['A1', 'A2'],
      searchQuery: '',
      sort: 'distance'
    });
  };

  // Restablecer a estado inicial con valores por defecto
  const handleResetInitial = () => {
    setSearchState(INITIAL_SEARCH_STATE);
  };

  // Copiar enlace compartible completo (sin coordenadas GPS personales)
  const handleShareLink = () => {
    const fullUrl = window.location.href;
    const msg = searchState.locationSource === 'browser'
      ? 'Enlace copiado (por privacidad, omite tu ubicación GPS exacta).'
      : '¡Enlace compartible copiado al portapapeles!';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        showToast(msg, 4000);
      }).catch(() => {
        showToast(`Enlace: ${fullUrl}`, 4000);
      });
    } else {
      showToast(`Enlace: ${fullUrl}`, 4000);
    }
  };

  // Relajar filtros secundarios conservando necesidad (N.7)
  const handleClearSecondaryFilters = () => {
    setSearchState(prev => ({
      ...prev,
      requiredServices: [],
      accessibilityRequired: [],
      ownership: [],
      radiusKm: 25
    }));
  };

  // Aplicar sugerencia de relajación
  const handleApplyRelaxation = (relaxation: RelaxationOption) => {
    setSearchState(prev => relaxation.apply(prev));
  };

  // Ejecutar escenario de prueba FIL-001 a FIL-012 desde un estado limpio
  const handleRunTest = (test: TestScenario) => {
    const cleanBaseState: SearchState = {
      ...INITIAL_SEARCH_STATE,
      need: 'tea',
      stages: [],
      stageMatchMode: 'any',
      municipality: null,
      district: null,
      radiusKm: null,
      locationSource: 'municipality',
      userCoordinates: null,
      ownership: [],
      modalities: [],
      requiredServices: [],
      preferredServices: [],
      accessibilityRequired: [],
      evidence: ['A1', 'A2'],
      searchQuery: '',
      sort: 'distance'
    };

    setSearchState({
      ...cleanBaseState,
      ...test.estadoPrueba
    });

    if (test.code === 'FIL-010') {
      setActiveTab('passport');
    } else if (test.code === 'FIL-011') {
      setActiveTab('continuity');
    } else {
      setActiveTab('search');
    }

    showToast(`Prueba ${test.code} ejecutada: ${test.titulo}`, 4500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased overflow-x-hidden w-full">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-slate-900 focus:text-white focus:rounded-lg focus:text-xs focus:font-bold focus:shadow-lg"
      >
        Saltar al contenido principal
      </a>
      {/* 1. Encabezado Oficial con Menú "Más" y Notificación Legal Desescalada */}
      <Header
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        comparedCount={comparedIds.length}
        passportCount={passportIds.length}
        onOpenTestModal={() => setIsTestModalOpen(true)}
        onOpenLegalModal={() => setIsLegalModalOpen(true)}
        isEasyReadMode={isEasyReadMode}
        onToggleEasyRead={() => setIsEasyReadMode(!isEasyReadMode)}
        onShareLink={handleShareLink}
        onExportCSV={() => downloadResultsCSV(filteredSchools, searchState)}
        onExportJSON={() => downloadResultsJSON(filteredSchools, searchState)}
      />

      {/* 3. Contenido Principal (todo el contenido visible dentro de regiones ARIA) */}
      <main id="main-content" className="flex-1 w-full min-w-0">
        {/* Aviso de Transparencia y Origen de Datos dentro del landmark principal */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-950">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
              <span className="font-bold uppercase tracking-wide bg-blue-100 text-blue-950 px-2.5 py-0.5 rounded text-xs leading-tight">
                Datos abiertos · CAM + Ayto. Madrid
              </span>
              <span className="text-xs text-amber-950 leading-snug">
                <strong>Transparencia:</strong> {OFFICIAL_TEA_SOURCE.totalCentrosCatalogo} centros y equipos oficiales ({OFFICIAL_TEA_SOURCE.totalCentros} TEA · {OFFICIAL_TEA_SOURCE.totalCee} CEE · {OFFICIAL_TEA_SOURCE.totalHospitalarias} Hosp. · {OFFICIAL_TEA_SOURCE.totalAltasCapacidades} AACC · {OFFICIAL_TEA_SOURCE.totalVisual} Visual · EOEP Auditiva/Motora/TDAH-TEL), con {OFFICIAL_TEA_SOURCE.totalConTransporteAyto} en Madrid capital vía <span className="font-mono">datos.madrid.es</span>.
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsLegalModalOpen(true)}
                className="text-xs font-bold text-amber-950 hover:underline cursor-pointer"
              >
                Marco y Privacidad
              </button>
              <a
                href="https://www.comunidad.madrid/servicios/educacion"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-amber-950 hover:underline inline-flex items-center gap-1"
              >
                <span>Portal Educación CAM</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Barra de Filtros Activos Resumen - En pestaña Buscar */}
        {activeTab === 'search' && (
          <ActiveFilterChips
            state={searchState}
            resultsCount={filteredSchools.length}
            onUpdateState={setSearchState}
            onClearAll={handleClearAll}
          />
        )}

        {isEasyReadMode && (
          <div className="bg-indigo-50 border-b border-indigo-200 px-4 py-2 text-xs text-indigo-950">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
              <span>
                <strong>Modo Lectura Fácil activo:</strong> las siglas técnicas (<em>CEIPSO, IES, SIES, SAE, EOEP</em>) se muestran explicadas en lenguaje sencillo.
              </span>
              <button
                type="button"
                onClick={() => setIsEasyReadMode(false)}
                className="text-indigo-800 font-bold hover:underline cursor-pointer"
              >
                Desactivar
              </button>
            </div>
          </div>
        )}

        {/* Toast accesible al ejecutar escenarios de prueba */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 min-w-0">
        {/* PESTAÑA A: BUSCADOR UNIFICADO CON VISTAS (LISTA, MAPA + LISTA, MAPA) */}
        {activeTab === 'search' && (
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mb-4">
              Buscador Cívico de Educación Inclusiva en la Comunidad de Madrid
            </h1>
            <div className="flex flex-col lg:flex-row gap-6 items-start min-w-0">
            {/* Botón flotante para abrir filtros en pantallas pequeñas */}
            <div className="lg:hidden w-full flex items-center justify-between gap-2 mb-2">
              <button
                type="button"
                aria-expanded={isMobileFilterOpen}
                aria-controls="filters-sidebar-panel"
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-xs cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-cam-red" aria-hidden="true" />
                <span>{isMobileFilterOpen ? 'Ocultar Filtros' : 'Mostrar Filtros Acumulativos'}</span>
              </button>

              <span className="text-xs font-mono font-bold text-slate-800">
                {filteredSchools.length} {filteredSchools.length === 1 ? 'centro' : 'centros'}
              </span>
            </div>

            {/* Panel Lateral de Filtros Plegables */}
            <div id="filters-sidebar-panel" className={`${isMobileFilterOpen ? 'block' : 'hidden'} lg:block w-full lg:w-72 xl:w-80 shrink-0`}>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs sticky top-20">
                <FilterSidebar
                  state={searchState}
                  dynamicCounts={dynamicCounts}
                  onUpdateState={setSearchState}
                  onOpenProcedureModal={setProcedureTopic}
                  onClearFilters={handleClearAll}
                />
              </div>
            </div>

            {/* Columna Derecha: Barra de Búsqueda Rápida, Conmutador de Vista y Resultados */}
            <div className="flex-1 w-full min-w-0 space-y-4">
              <h2 className="sr-only">Resultados de centros y equipos oficiales</h2>
              {/* Procedencia de los datos que se están viendo */}
              <div
                role="note"
                className={`rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed ${
                  !searchState.need ||
                  searchState.need === 'tea' ||
                  searchState.need === 'educacion_especial' ||
                  searchState.need === 'salud_hospitalaria' ||
                  searchState.need === 'visual' ||
                  searchState.need === 'altas_capacidades' ||
                  searchState.need === 'auditiva' ||
                  searchState.need === 'motora' ||
                  searchState.need === 'tdah' ||
                  searchState.need === 'tel_lenguaje'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                {!searchState.need ? (
                  <>
                    <span className="font-bold">Catálogo oficial unificado ({OFFICIAL_TEA_SOURCE.totalCentrosCatalogo} centros y recursos verificados):</span>{' '}
                    Información oficial de la Comunidad de Madrid, Ayuntamiento de Madrid y ONCE.
                  </>
                ) : searchState.need === 'tea' ? (
                  <>
                    <span className="font-bold">Atención Preferente TEA:</span>{' '}
                    {OFFICIAL_TEA_SOURCE.totalCentros} centros con plazas previsibles (curso {OFFICIAL_TEA_SOURCE.curso}) con trazabilidad del Portal de Datos Abiertos CAM.
                  </>
                ) : searchState.need === 'educacion_especial' ? (
                  <>
                    <span className="font-bold">Educación Especial (CEE):</span>{' '}
                    {OFFICIAL_TEA_SOURCE.totalCee} Colegios de Educación Especial activos (Nivel A1).{' '}
                    <button
                      type="button"
                      onClick={() => setProcedureTopic('educacion_especial')}
                      className="font-bold underline cursor-pointer text-emerald-950 ml-1"
                    >
                      Ver guía de trámite
                    </button>
                  </>
                ) : searchState.need === 'salud_hospitalaria' ? (
                  <>
                    <span className="font-bold">Atención Hospitalaria:</span>{' '}
                    {OFFICIAL_TEA_SOURCE.totalHospitalarias} Aulas Hospitalarias de la Comunidad de Madrid.
                  </>
                ) : searchState.need === 'visual' ? (
                  <>
                    <span className="font-bold">Discapacidad Visual (EOEP y C.R.E. ONCE):</span>{' '}
                    Atención itinerante en centros ordinarios y C.R.E. de Moratalaz.{' '}
                    <button
                      type="button"
                      onClick={() => setProcedureTopic('visual')}
                      className="font-bold underline cursor-pointer text-emerald-950 ml-1"
                    >
                      Ver guía oficial
                    </button>
                  </>
                ) : searchState.need === 'altas_capacidades' ? (
                  <>
                    <span className="font-bold">Altas Capacidades (CREACIM, EOEP y Red PEAC):</span>{' '}
                    Evaluación regional y talleres los sábados (8 sedes IES).{' '}
                    <button
                      type="button"
                      onClick={() => setProcedureTopic('altas_capacidades')}
                      className="font-bold underline cursor-pointer text-emerald-950 ml-1"
                    >
                      Ver guía oficial
                    </button>
                  </>
                ) : searchState.need === 'auditiva' ? (
                  <>
                    <span className="font-bold">Discapacidad Auditiva · EOEP Específico (cód. 28700741):</span>{' '}
                    Equipo público regional de orientación especializada en sordera y apoyos auditivos.{' '}
                    <button
                      type="button"
                      onClick={() => setProcedureTopic('auditiva')}
                      className="font-bold underline cursor-pointer text-emerald-950 ml-1"
                    >
                      Ver guía y trámite DAT
                    </button>
                  </>
                ) : searchState.need === 'motora' ? (
                  <>
                    <span className="font-bold">Discapacidad Motora · EOEP Específico (cód. 28700763):</span>{' '}
                    Equipo público regional de orientación en accesibilidad, fisioterapia y ATU.{' '}
                    <button
                      type="button"
                      onClick={() => setProcedureTopic('motora')}
                      className="font-bold underline cursor-pointer text-emerald-950 ml-1"
                    >
                      Ver guía y trámite DAT
                    </button>
                  </>
                ) : searchState.need === 'tdah' || searchState.need === 'tel_lenguaje' ? (
                  <>
                    <span className="font-bold">
                      {searchState.need === 'tdah' ? 'TDAH y Dificultades' : 'Trastorno del Lenguaje (TDL/TEL)'} · EOEP Específico (cód. 28701214):
                    </span>{' '}
                    Asesoramiento técnico regional para centros y familias en modalidad ordinaria.{' '}
                    <button
                      type="button"
                      onClick={() => setProcedureTopic(searchState.need as ProcedureTopic)}
                      className="font-bold underline cursor-pointer text-emerald-950 ml-1"
                    >
                      Ver guía de apoyos
                    </button>
                  </>
                ) : (
                  <>
                    <span className="font-bold">Escuelas de Bienvenida / Aulas de Enlace:</span> Programa de incorporación temporal gestionado por las Direcciones de Área Territorial (DAT).{' '}
                    <button
                      type="button"
                      onClick={() => setProcedureTopic('compensatoria')}
                      className="font-bold underline cursor-pointer text-amber-950 ml-1"
                    >
                      Ver guía oficial DAT / SAE
                    </button>
                  </>
                )}
              </div>

              {/* Controles de búsqueda textual, vista y ordenación */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Búsqueda rápida por texto o código */}
                <div className="relative w-full sm:max-w-xs">
                  <Search className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, código o municipio..."
                    aria-label="Buscar centros por nombre, código o municipio"
                    value={searchState.searchQuery}
                    onChange={e => setSearchState(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cam-red focus:bg-white transition-all"
                  />
                </div>

                {/* Selector de modo de vista: Lista | Mapa (con mapa y lista combinados) */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSearchViewMode('cards')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      searchViewMode === 'cards'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                    title="Vista de lista de tarjetas"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-slate-700" aria-hidden="true" />
                    <span>Lista</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSearchViewMode('map')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      searchViewMode === 'map'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                    title="Vista con mapa y tarjetas"
                  >
                    <Map className="w-3.5 h-3.5 text-slate-700" aria-hidden="true" />
                    <span>Mapa</span>
                  </button>
                </div>

                {/* Selector de Ordenación (sólo Distancia y Alfabético) */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 shrink-0" aria-hidden="true" />
                  <label htmlFor="sort-select" className="text-slate-700 font-medium hidden sm:inline">
                    Ordenar:
                  </label>
                  <select
                    id="sort-select"
                    aria-label="Ordenar resultados"
                    value={searchState.sort}
                    onChange={e =>
                      setSearchState(prev => ({
                        ...prev,
                        sort: e.target.value as 'distance' | 'alphabetical'
                      }))
                    }
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-700 cursor-pointer font-medium"
                  >
                    <option value="distance">Distancia</option>
                    <option value="alphabetical">Alfabético (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Aviso para Primera Infancia y Atención Temprana cuando se selecciona Infantil */}
              {searchState.stages.includes('infantil') && (
                <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-3.5 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
                  <div>
                    <span className="font-bold text-amber-950">Primera Infancia (0-6 años): </span>
                    Para niños y niñas en edad temprana, la valoración y orientación la gestionan los <span className="font-semibold">Equipos de Atención Temprana (EAT)</span> de la Comunidad de Madrid. Recuerda que los colegios públicos de Infantil y Primaria (CEIP) también escolarizan 2.º ciclo de Infantil aunque el listado TEA suela consignar «Primaria».
                  </div>
                  <a
                    href="https://www.comunidad.madrid/servicios/educacion/equipos-atencion-temprana-eat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-950 underline shrink-0"
                  >
                    <span>Guía oficial EAT CAM</span>
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              )}

              {/* Si hay cero resultados, mostrar análisis y relajación asistida */}
              {filteredSchools.length === 0 && zeroResultsAnalysis ? (
                <ZeroResultsAdvice
                  state={searchState}
                  analysis={zeroResultsAnalysis}
                  onApplyRelaxation={handleApplyRelaxation}
                  onClearSecondaryFilters={handleClearSecondaryFilters}
                />
              ) : (
                <>
                  {/* Vista Mapa: Mapa interactivo sobre las tarjetas de centros */}
                  {searchViewMode === 'map' && (
                    <div className="mb-4">
                      <React.Suspense
                        fallback={
                          <div className="h-[400px] rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-xs text-slate-600 shadow-xs">
                            Cargando mapa interactivo de centros...
                          </div>
                        }
                      >
                        <SchoolsMap
                          schools={filteredSchools}
                          state={searchState}
                          selectedSchoolId={selectedSchool?.id ?? null}
                          onSelectSchool={sch => {
                            setSelectedSchool(sch);
                            setModalInitialTab('details');
                          }}
                          onOpenWhyAppears={sch => {
                            setSelectedSchool(sch);
                            setModalInitialTab('why');
                          }}
                          onToggleCompare={handleToggleCompare}
                          isSchoolCompared={schId => comparedIds.includes(schId)}
                          isEasyReadMode={isEasyReadMode}
                          height="400px"
                        />
                      </React.Suspense>
                    </div>
                  )}

                  {/* Grid de Tarjetas de Centros (1 columna en < 1280px para evitar desborde) */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 min-w-0">
                    {filteredSchools.slice(0, visibleCount).map(school => (
                      <SchoolCard
                        key={school.id}
                        school={school}
                        state={searchState}
                        isCompared={comparedIds.includes(school.id)}
                        isEasyReadMode={isEasyReadMode}
                        onToggleCompare={handleToggleCompare}
                        onOpenDetail={sch => {
                          setSelectedSchool(sch);
                          setModalInitialTab('details');
                        }}
                        onOpenWhyAppears={sch => {
                          setSelectedSchool(sch);
                          setModalInitialTab('why');
                        }}
                        onOpenContinuity={sch => {
                          setSelectedSchool(sch);
                          setModalInitialTab('continuity');
                        }}
                      />
                    ))}
                  </div>

                  {filteredSchools.length > visibleCount && (
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <span className="text-xs text-slate-700">
                        Mostrando <strong className="text-slate-900">{Math.min(visibleCount, filteredSchools.length)}</strong> de <strong className="text-slate-900">{filteredSchools.length}</strong> centros
                      </span>
                      <button
                        type="button"
                        onClick={() => setVisibleCount(prev => prev + 12)}
                        className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 shadow-xs transition-colors cursor-pointer"
                      >
                        Mostrar 12 centros más
                      </button>
                      {filteredSchools.length - visibleCount > 12 && (
                        <button
                          type="button"
                          onClick={() => setVisibleCount(filteredSchools.length)}
                          className="px-3 py-2 text-xs font-semibold text-blue-900 hover:underline cursor-pointer"
                        >
                          Ver todos ({filteredSchools.length})
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            </div>
          </div>
        )}

        {/* PESTAÑA B: CONTINUIDAD PRIMARIA-ESO */}
        {activeTab === 'continuity' && (
          <React.Suspense fallback={<div className="py-12 text-center text-xs text-slate-600">Cargando continuidad educativa...</div>}>
            <ContinuityView
              schools={filteredSchools}
              state={searchState}
              isEasyReadMode={isEasyReadMode}
              onOpenDetail={sch => {
                setSelectedSchool(sch);
                setModalInitialTab('continuity');
              }}
              onUpdateRadius={newRadius => {
                setSearchState(prev => ({ ...prev, radiusKm: newRadius }));
              }}
            />
          </React.Suspense>
        )}

        {/* PESTAÑA C: COMPARADOR OBJETIVO (MÁXIMO 3 CENTROS) */}
        {activeTab === 'comparator' && (
          <React.Suspense fallback={<div className="py-12 text-center text-xs text-slate-600">Cargando comparador...</div>}>
            <ComparatorView
              comparedSchools={comparedSchools}
              state={searchState}
              onRemoveFromCompare={id => setComparedIds(prev => prev.filter(x => x !== id))}
              onClearCompare={() => setComparedIds([])}
              onOpenDetail={sch => {
                setSelectedSchool(sch);
                setModalInitialTab('details');
              }}
              onGoToSearch={() => setActiveTab('search')}
            />
          </React.Suspense>
        )}

        {/* PESTAÑA D: PASAPORTE LOCAL PARA FAMILIAS */}
        {activeTab === 'passport' && (
          <React.Suspense fallback={<div className="py-12 text-center text-xs text-slate-600">Cargando pasaporte local...</div>}>
            <PassportView
              savedSchools={passportSchools}
              state={searchState}
              onRemoveSchool={id => setPassportIds(prev => prev.filter(x => x !== id))}
              onClearPassport={() => setPassportIds([])}
              onOpenDetail={sch => {
                setSelectedSchool(sch);
                setModalInitialTab('details');
              }}
              onGoToSearch={() => setActiveTab('search')}
            />
          </React.Suspense>
        )}

        {/* PESTAÑA E: FUENTES Y NORMATIVA OFICIAL */}
        {activeTab === 'sources' && (
          <React.Suspense fallback={<div className="py-12 text-center text-xs text-slate-600">Cargando fuentes oficiales...</div>}>
            <SourcesView />
          </React.Suspense>
        )}
        </div>
      </main>

      {/* 4. Pie de página Proyecto Cívico DataMad 2026 */}
      <footer className="no-print bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1 space-y-1.5">
              <span className="font-bold text-slate-900 text-sm block">Madrid Educa Apoyo · DataMad 2026</span>
              <p className="text-xs text-slate-700">
                Proyecto cívico de datos abiertos con evidencia documental y filtros acumulativos.
              </p>
              <p className="text-xs text-slate-600">
                Fuentes: Datos Abiertos CAM (CC BY 4.0), Consejería de Educación (TEA 2024/25) y Ayuntamiento de Madrid (datos.madrid.es).
              </p>
              <p className="text-xs text-slate-700 font-medium">
                Privacidad: tus notas del Pasaporte y ubicación GPS no salen de tu navegador.
              </p>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button type="button" onClick={() => setActiveTab('passport')} className="text-left hover:text-blue-900 transition-colors cursor-pointer">
                  <div className="font-semibold text-slate-900">Pasaporte Local</div>
                  <div className="text-xs text-slate-600">Consulta tus centros guardados</div>
                </button>
                <button type="button" onClick={() => setActiveTab('sources')} className="text-left hover:text-blue-900 transition-colors cursor-pointer">
                  <div className="font-semibold text-slate-900">Fuentes y Datos</div>
                  <div className="text-xs text-slate-600">Datos Abiertos CAM y TEA</div>
                </button>
                <button type="button" onClick={() => setIsLegalModalOpen(true)} className="text-left hover:text-blue-900 transition-colors cursor-pointer">
                  <div className="font-semibold text-slate-900">Marco y Privacidad</div>
                  <div className="text-xs text-slate-600">Evidencia A1/A2 y uso local</div>
                </button>
                <button type="button" onClick={() => setIsTestModalOpen(true)} className="text-left hover:text-blue-900 transition-colors cursor-pointer">
                  <div className="font-semibold text-slate-900">Pruebas Técnicas</div>
                  <div className="text-xs text-slate-600">Escenarios FIL-001 a FIL-012</div>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 text-xs text-slate-700 text-center">
            Herramienta cívica independiente con función puramente orientadora. No sustituye el registro ni la admisión oficial de la Consejería de Educación.
          </div>
        </div>
      </footer>

      {/* 5. Modales Operativos */}
      <React.Suspense fallback={null}>
        {Boolean(selectedSchool) && (
          <SchoolDetailModal
            school={selectedSchool}
            state={searchState}
            isOpen={Boolean(selectedSchool)}
            initialTab={modalInitialTab}
            isCompared={selectedSchool ? comparedIds.includes(selectedSchool.id) : false}
            isInPassport={selectedSchool ? passportIds.includes(selectedSchool.id) : false}
            isEasyReadMode={isEasyReadMode}
            onClose={() => setSelectedSchool(null)}
            onToggleCompare={handleToggleCompare}
            onTogglePassport={handleTogglePassport}
          />
        )}

        {Boolean(procedureTopic) && (
          <OfficialProceduresModal
            topic={procedureTopic}
            onClose={() => setProcedureTopic(null)}
          />
        )}

        {isTestModalOpen && (
          <TestScenariosModal
            isOpen={isTestModalOpen}
            onClose={() => setIsTestModalOpen(false)}
            onRunTest={handleRunTest}
          />
        )}
      </React.Suspense>

      {/* Modal Descriptivo de Marco Oficial, Metodología y Privacidad */}
      {isLegalModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={closeLegalModal}
        >
          <div
            ref={legalModalRef}
            tabIndex={-1}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-modal-title"
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-700"
          >
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-800" aria-hidden="true" />
                <h2 id="legal-modal-title" className="text-base font-extrabold text-slate-900">
                  Marco Legal, Metodología y Privacidad
                </h2>
              </div>
              <button
                type="button"
                onClick={closeLegalModal}
                aria-label="Cerrar aviso legal"
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-800 leading-relaxed">
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-amber-950 font-medium">
                <span className="font-bold">Aviso para familias: </span>
                {LEGAL_DISCLAIMER}
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-1">Criterio de Evidencia</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-800 shrink-0">Confirmado (A1):</span>
                    <span>Centro y etapa confirmados en listados vigentes del curso en vigor.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-amber-900 shrink-0">Por comprobar (A2):</span>
                    <span>El centro figura en el listado oficial 2024/25, pero las vacantes vigentes deben comprobarse ante el SAE.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <h3 className="font-bold text-slate-900 mb-1">Privacidad y Protección de Datos</h3>
                <p className="text-slate-700">
                  Esta aplicación no utiliza cookies de seguimiento ni envía datos a servidores externos. Tu selección del Comparador y las notas del Pasaporte se guardan únicamente en el almacenamiento local (<code className="font-mono">localStorage</code>) de tu navegador. Si activas «Cerca de mí», tu ubicación aproximada se procesa en tu dispositivo y nunca se incluye en los enlaces compartibles.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={closeLegalModal}
                  className="px-4 py-2 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
