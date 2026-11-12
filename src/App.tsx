/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Madrid Educa Apoyo (v2.4 - Filtros Acumulativos)
 * Buscador Educativo con Evidencia Oficial y Filtros que se Acumulan
 *
 * Mejoras aplicadas:
 * - Eliminación total del desborde horizontal (responsive 1 col en < 1280px)
 * - Tarjetas simplificadas en 4 preguntas esenciales con lenguaje familiar
 * - Unificación de navegación: Buscar (Lista / Lista + Mapa / Solo Mapa)
 * - Navegación desaturada de 4 destinos + Menú Más
 * - Comparador con límite de 3 centros y alerta de filtros posteriores
 */

import React, { useState, useEffect, useMemo } from 'react';
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
import { SchoolDetailModal } from './components/SchoolDetailModal';
import { ZeroResultsAdvice } from './components/ZeroResultsAdvice';
import { ContinuityView } from './components/ContinuityView';
import { ComparatorView } from './components/ComparatorView';
import { PassportView } from './components/PassportView';
import { SourcesView } from './components/SourcesView';
import { OfficialProceduresModal } from './components/OfficialProceduresModal';
import { TestScenariosModal } from './components/TestScenariosModal';
import { SchoolsMap } from './components/SchoolsMap';

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
import { LEGAL_DISCLAIMER } from './data/disclaimerAndProcedures';

export default function App() {
  // 1. Estado de búsqueda inicial con sincronización de URL (N.4 y FIL-009)
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
  const [focusedSchoolId, setFocusedSchoolId] = useState<string | null>(null);

  // Detección automática de la ubicación del usuario en la primera carga
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lng = Number(pos.coords.longitude.toFixed(4));
          setSearchState(prev => {
            if (prev.locationSource === 'browser') {
              return {
                ...prev,
                userCoordinates: {
                  lat,
                  lng,
                  label: 'Tu ubicación actual'
                }
              };
            }
            return prev;
          });
        },
        err => {
          console.info('Ubicación del navegador no disponible o denegada:', err.message);
        },
        { timeout: 7000, enableHighAccuracy: false }
      );
    }
  }, []);

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

  // Estado del modal de procedimientos específicos (Visual / Altas capacidades)
  const [procedureTopic, setProcedureTopic] = useState<'visual' | 'altas_capacidades' | 'educacion_especial' | null>(null);

  // Modal de Batería de Pruebas oficiales FIL-001 a FIL-012
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);

  // Drawer de filtros en móviles
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [isEasyReadMode, setIsEasyReadMode] = useState<boolean>(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);

  // Notificación breve de ejecución de test
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    setComparedIds(prev => {
      if (prev.includes(school.id)) {
        return prev.filter(id => id !== school.id);
      } else {
        if (prev.length >= 3) {
          alert('El comparador permite un máximo de 3 centros simultáneos para garantizar una lectura clara y sin sobrecarga.');
          return prev;
        }
        return [...prev, school.id];
      }
    });
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

  // Copiar enlace compartible completo
  const handleShareLink = () => {
    const fullUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        setToastMessage('¡Enlace compartible completo copiado al portapapeles!');
        setTimeout(() => setToastMessage(null), 3500);
      }).catch(() => {
        setToastMessage(`Enlace: ${fullUrl}`);
        setTimeout(() => setToastMessage(null), 4000);
      });
    } else {
      setToastMessage(`Enlace: ${fullUrl}`);
      setTimeout(() => setToastMessage(null), 4000);
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

  // Ejecutar escenario de prueba FIL-001 a FIL-012
  const handleRunTest = (test: TestScenario) => {
    setSearchState(prev => ({
      ...prev,
      ...test.estadoPrueba
    }));

    if (test.code === 'FIL-010') {
      setActiveTab('passport');
    } else if (test.code === 'FIL-011') {
      setActiveTab('continuity');
    } else {
      setActiveTab('search');
    }

    setToastMessage(`Prueba ${test.code} ejecutada: ${test.titulo}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased overflow-x-hidden w-full">
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

      {/* 1b. Aviso de Transparencia y Origen de Datos en la Cabecera (Proyecto DataMad 2026) */}
      <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2.5 text-xs text-amber-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
            <span className="font-bold uppercase tracking-wider bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded text-[10px] shrink-0">
              Datos 100% Reales y Oficiales
            </span>
            <span className="text-[11px] text-amber-900 leading-tight">
              <strong>Transparencia:</strong> Catálogo oficial de 336 centros de atención preferente TEA de la Comunidad de Madrid (curso {OFFICIAL_TEA_SOURCE.curso}). Cero datos inventados o simulados. Iniciativa cívica independiente.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsLegalModalOpen(true)}
              className="text-[11px] font-bold text-amber-900 hover:text-amber-950 underline cursor-pointer"
            >
              Marco y Metodología
            </button>
            <a
              href="https://www.comunidad.madrid/servicios/educacion"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-amber-900 hover:text-amber-950 underline inline-flex items-center gap-1"
            >
              <span>Buscador Oficial CAM</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

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

      {/* 2. Barra de Filtros Activos Resumen (Anexo N.6) - En pestaña Buscar */}
      {activeTab === 'search' && (
        <ActiveFilterChips
          state={searchState}
          resultsCount={filteredSchools.length}
          onUpdateState={setSearchState}
          onClearAll={handleClearAll}
        />
      )}

      {/* 3. Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 min-w-0">
        {/* PESTAÑA A: BUSCADOR UNIFICADO CON VISTAS (LISTA, MAPA + LISTA, MAPA) */}
        {activeTab === 'search' && (
          <div className="flex flex-col lg:flex-row gap-6 items-start min-w-0">
            {/* Botón flotante para abrir filtros en pantallas pequeñas */}
            <div className="lg:hidden w-full flex items-center justify-between gap-2 mb-2">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-xs cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-cam-red" />
                <span>{isMobileFilterOpen ? 'Ocultar Filtros' : 'Mostrar Filtros Acumulativos'}</span>
              </button>

              <span className="text-xs font-mono font-bold text-slate-700">
                {filteredSchools.length} {filteredSchools.length === 1 ? 'centro' : 'centros'}
              </span>
            </div>

            {/* Panel Lateral de Filtros Plegables */}
            <div className={`${isMobileFilterOpen ? 'block' : 'hidden'} lg:block w-full lg:w-72 xl:w-80 shrink-0`}>
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
              {/* Procedencia de los datos que se están viendo */}
              <div
                role="note"
                className={`rounded-xl border px-3.5 py-2.5 text-[11px] leading-relaxed ${
                  !searchState.need || searchState.need === 'tea'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                {!searchState.need || searchState.need === 'tea' ? (
                  <>
                    <span className="font-bold">Datos oficiales TEA:</span>{' '}
                    {OFFICIAL_TEA_SOURCE.totalCentros} centros preferentes con plazas previsibles en el aula TEA según la
                    Comunidad de Madrid (curso {OFFICIAL_TEA_SOURCE.curso}, información a {OFFICIAL_TEA_SOURCE.fechaInformacion}).
                    Ubicaciones aproximadas; comprueba la vigencia con el SAE.{' '}
                    <a href={OFFICIAL_TEA_SOURCE.url} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                      Ver documento oficial
                    </a>
                  </>
                ) : (
                  <>
                    <span className="font-bold">Sin datos abiertos disponibles:</span> La Consejería no publica un catálogo descargable con plazas y centros preferentes para esta necesidad. Por rigor absoluto con las familias, <strong>esta herramienta no incluye centros inventados ni simulados</strong>.{' '}
                    <a href="https://www.comunidad.madrid/servicios/educacion" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                      Consulta el buscador oficial de centros CAM
                    </a>.
                  </>
                )}
              </div>

              {/* Controles de búsqueda textual, vista y ordenación */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Búsqueda rápida por texto o código */}
                <div className="relative w-full sm:max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, código o calle..."
                    value={searchState.searchQuery}
                    onChange={e => setSearchState(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cam-red focus:bg-white transition-all"
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
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Vista de lista de tarjetas"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-slate-600" />
                    <span>Lista</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSearchViewMode('map')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      searchViewMode === 'map'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Vista con mapa y tarjetas"
                  >
                    <Map className="w-3.5 h-3.5 text-slate-600" />
                    <span>Mapa</span>
                  </button>
                </div>

                {/* Selector de Ordenación (sólo Distancia y Alfabético) */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-500 font-medium hidden sm:inline">Ordenar:</span>
                  <select
                    value={searchState.sort}
                    onChange={e =>
                      setSearchState(prev => ({
                        ...prev,
                        sort: e.target.value as 'distance' | 'alphabetical'
                      }))
                    }
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer font-medium"
                  >
                    <option value="distance">Distancia</option>
                    <option value="alphabetical">Alfabético (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Aviso para Primera Infancia y Atención Temprana cuando se selecciona Infantil */}
              {searchState.stages.includes('infantil') && (
                <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
                  <div>
                    <span className="font-bold text-amber-900">Primera Infancia (0-6 años): </span>
                    Para niños y niñas en edad temprana, la valoración y orientación la gestionan los <span className="font-semibold">Equipos de Atención Temprana (EAT)</span> de la Comunidad de Madrid.
                  </div>
                  <a
                    href="https://www.comunidad.madrid/servicios/educacion/equipos-atencion-temprana-eat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 hover:text-amber-950 underline shrink-0"
                  >
                    <span>Guía oficial EAT CAM</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Si hay cero resultados, mostrar análisis y relajación asistida (Anexo N.7) */}
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
                      <SchoolsMap
                        schools={filteredSchools}
                        state={searchState}
                        selectedSchoolId={focusedSchoolId}
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
                        height="400px"
                      />
                    </div>
                  )}

                  {/* Grid de Tarjetas de Centros (1 columna en < 1280px para evitar desborde) */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 min-w-0">
                    {filteredSchools.map(school => (
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
                </>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA B: CONTINUIDAD PRIMARIA-ESO */}
        {activeTab === 'continuity' && (
          <ContinuityView
            schools={filteredSchools}
            state={searchState}
            onOpenDetail={sch => {
              setSelectedSchool(sch);
              setModalInitialTab('continuity');
            }}
            onUpdateRadius={newRadius => {
              setSearchState(prev => ({ ...prev, radiusKm: newRadius }));
            }}
          />
        )}

        {/* PESTAÑA C: COMPARADOR OBJETIVO (MÁXIMO 3 CENTROS) */}
        {activeTab === 'comparator' && (
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
        )}

        {/* PESTAÑA D: PASAPORTE LOCAL PARA FAMILIAS */}
        {activeTab === 'passport' && (
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
        )}

        {/* PESTAÑA E: FUENTES Y NORMATIVA OFICIAL */}
        {activeTab === 'sources' && <SourcesView />}
      </main>

      {/* 4. Pie de página Proyecto Cívico DataMad 2026 */}
      <footer className="no-print bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <span className="font-bold text-slate-800 text-sm">Madrid Educa Apoyo · DataMad 2026</span>
              <p className="text-[11px] text-slate-500 mt-1">
                Proyecto cívico de datos abiertos con evidencia oficial y filtros acumulativos.
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Datos de la Comunidad de Madrid (EDUCAbase y resoluciones oficiales). Iniciativa independiente.
              </p>
            </div>
            
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <button onClick={() => setActiveTab('passport')} className="text-left hover:text-blue-900 transition-colors">
                  <div className="font-semibold text-slate-700">Pasaporte Local</div>
                  <div className="text-[10px] text-slate-400">Consulta tus centros guardados</div>
                </button>
                <button onClick={() => setActiveTab('sources')} className="text-left hover:text-blue-900 transition-colors">
                  <div className="font-semibold text-slate-700">Fuentes y Datos</div>
                  <div className="text-[10px] text-slate-400">Resoluciones BOCM y fechas</div>
                </button>
                <button onClick={() => setIsLegalModalOpen(true)} className="text-left hover:text-blue-900 transition-colors">
                  <div className="font-semibold text-slate-700">Metodología y Legal</div>
                  <div className="text-[10px] text-slate-400">Evidencia A1/A2 y Aviso Legal</div>
                </button>
                <button onClick={() => setIsTestModalOpen(true)} className="text-left hover:text-blue-900 transition-colors">
                  <div className="font-semibold text-slate-700">Pruebas Técnicas</div>
                  <div className="text-[10px] text-slate-400">Batería de validación FIL-001/012</div>
                </button>
              </div>


            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-6 text-[10px] text-slate-400 text-center">
            No constituyen el registro oficial de la Consejería de Educación. Función puramente orientadora.
          </div>
        </div>
      </footer>

      {/* 5. Modales Operativos */}
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

      <OfficialProceduresModal
        topic={procedureTopic}
        onClose={() => setProcedureTopic(null)}
      />

      <TestScenariosModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        onRunTest={handleRunTest}
      />
      
      {/* Modal Descriptivo de Marco Oficial y Metodología (movido de Header) */}
      {isLegalModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-700" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Marco Legal e Información de la Herramienta
                </h3>
              </div>
              <button
                onClick={() => setIsLegalModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-950 font-medium">
                <span className="font-bold">Aviso para familias: </span>
                {LEGAL_DISCLAIMER}
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Criterio de Evidencia</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-700 shrink-0">Confirmado (A1):</span>
                    <span>Centro y etapa ratificados en resoluciones vigentes del BOCM y listados de la Consejería.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-amber-700 shrink-0">Por comprobar (A2):</span>
                    <span>El centro dispone del recurso, pero la etapa específica o vacantes deben comprobarse administrativamente.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsLegalModalOpen(false)}
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
