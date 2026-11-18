/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Cabecera de navegación de Madrid Educa Apoyo
 * Estructura limpia: Buscar, Comparar, Lectura Fácil, Exportar y Más
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  BookmarkCheck,
  GitCompare,
  Search,
  ChevronDown,
  BookOpen,
  ShieldCheck,
  Share2,
  Download,
  GraduationCap,
  Database,
  PlayCircle
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'search' | 'continuity' | 'comparator' | 'passport' | 'sources';
  onSelectTab: (tab: 'search' | 'continuity' | 'comparator' | 'passport' | 'sources') => void;
  comparedCount: number;
  passportCount?: number;
  onOpenTestModal: () => void;
  onOpenLegalModal: () => void;
  isEasyReadMode: boolean;
  onToggleEasyRead: () => void;
  onShareLink: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  comparedCount,
  passportCount = 0,
  onOpenTestModal,
  onOpenLegalModal,
  isEasyReadMode,
  onToggleEasyRead,
  onShareLink,
  onExportCSV,
  onExportJSON
}) => {
  const [isShareExportOpen, setIsShareExportOpen] = useState(false);
  const [isMobileExportOpen, setIsMobileExportOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const shareExportMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menús al hacer clic fuera o pulsar Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareExportMenuRef.current && !shareExportMenuRef.current.contains(event.target as Node)) {
        setIsShareExportOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsShareExportOpen(false);
        setIsMoreMenuOpen(false);
        setIsMobileExportOpen(false);
        setIsMobileMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 lg:gap-4">
          {/* Zona 1: Identidad Cívica DataMad */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onSelectTab('search')}
              className="text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded p-1"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 flex items-center justify-center text-white font-bold shadow-md text-base ring-2 ring-blue-100 shrink-0">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-base sm:text-lg lg:text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
                    Madrid Educa Apoyo
                  </div>
                  <div className="text-xs font-semibold text-blue-800 tracking-tight leading-tight hidden sm:block truncate">
                    Proyecto DataMad 2026 · Datos Oficiales
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Zona 2: Navegación superior simplificada */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs lg:text-sm font-medium text-slate-700" aria-label="Navegación principal">
            {/* 1. Buscar */}
            <button
              type="button"
              aria-current={currentTab === 'search' ? 'page' : undefined}
              onClick={() => onSelectTab('search')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                currentTab === 'search'
                  ? 'bg-blue-50 text-blue-900 font-bold shadow-xs border border-blue-200/80'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className={`w-4 h-4 shrink-0 ${currentTab === 'search' ? 'text-blue-700' : 'text-slate-600'}`} aria-hidden="true" />
              <span>Buscar</span>
            </button>

            {/* 2. Comparar */}
            <button
              type="button"
              aria-current={currentTab === 'comparator' ? 'page' : undefined}
              onClick={() => onSelectTab('comparator')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                currentTab === 'comparator'
                  ? 'bg-blue-50 text-blue-900 font-bold shadow-xs border border-blue-200/80'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <GitCompare className={`w-4 h-4 shrink-0 ${currentTab === 'comparator' ? 'text-blue-700' : 'text-slate-600'}`} aria-hidden="true" />
              <span>Comparar</span>
              <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full tabular-nums font-bold ${
                comparedCount > 0 ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-700'
              }`}>
                {comparedCount}/3
              </span>
            </button>

            {/* 3. Lectura Fácil */}
            <button
              type="button"
              onClick={onToggleEasyRead}
              className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isEasyReadMode
                  ? 'bg-indigo-100 text-indigo-900 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
              title={isEasyReadMode ? 'Desactivar modo simplificado' : 'Activar modo Lectura Fácil'}
              aria-pressed={isEasyReadMode}
            >
              <BookOpen className={`w-4 h-4 shrink-0 ${isEasyReadMode ? 'text-indigo-800' : 'text-slate-600'}`} />
              <span>Lectura Fácil</span>
            </button>

            {/* 4. Exportar (Dropdown) */}
            <div className="relative" ref={shareExportMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsShareExportOpen(prev => !prev);
                  setIsMoreMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  isShareExportOpen
                    ? 'bg-blue-50 text-blue-900 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
                aria-haspopup="true"
                aria-expanded={isShareExportOpen}
              >
                <Share2 className="w-4 h-4 text-blue-700 shrink-0" />
                <span>Exportar</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              </button>

              {isShareExportOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onShareLink();
                      setIsShareExportOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-blue-700 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Copiar enlace compartible</div>
                      <div className="text-xs text-slate-600">Guarda tus filtros de búsqueda</div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={() => {
                      onExportCSV();
                      setIsShareExportOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Descargar CSV</div>
                      <div className="text-xs text-slate-600">Tabla con fuentes oficiales</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onExportJSON();
                      setIsShareExportOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-blue-700 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Descargar JSON</div>
                      <div className="text-xs text-slate-600">Datos estructurados</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* 5. Más (Dropdown) */}
            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(prev => !prev);
                  setIsShareExportOpen(false);
                }}
                className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  isMoreMenuOpen
                    ? 'bg-blue-50 text-blue-900 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
                aria-haspopup="true"
                aria-expanded={isMoreMenuOpen}
              >
                <span>Más</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('continuity');
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4 text-blue-700 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Continuidad Educativa</div>
                      <div className="text-xs text-slate-600">Transición de Primaria a ESO</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('passport');
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium cursor-pointer"
                  >
                    <BookmarkCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Pasaporte Local {passportCount > 0 ? `(${passportCount})` : ''}</div>
                      <div className="text-xs text-slate-600">Dossier familiar imprimible</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('sources');
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium cursor-pointer"
                  >
                    <Database className="w-4 h-4 text-indigo-700 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Fuentes Oficiales</div>
                      <div className="text-xs text-slate-600">Trazabilidad y CKAN de la CAM</div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={() => {
                      onOpenLegalModal();
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Aviso Legal y Privacidad</div>
                      <div className="text-xs text-slate-600">Criterios A1/A2 y protección de datos</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenTestModal();
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4 text-blue-700 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Pruebas Técnicas (FIL-001/012)</div>
                      <div className="text-xs text-slate-600">Batería de validación del motor</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Sub-barra de navegación móvil compacta: Buscar, Comparar, Lectura Fácil, Exportar y Más */}
        <nav aria-label="Navegación móvil" className="md:hidden flex items-center overflow-x-auto px-3 py-1.5 bg-slate-50 border-t border-slate-200 text-xs gap-1.5">
          <button
            type="button"
            aria-current={currentTab === 'search' ? 'page' : undefined}
            onClick={() => {
              onSelectTab('search');
              setIsMobileExportOpen(false);
              setIsMobileMoreOpen(false);
            }}
            className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
              currentTab === 'search' ? 'bg-white shadow-xs text-blue-900 font-bold' : 'text-slate-700'
            }`}
          >
            Buscar
          </button>
          <button
            type="button"
            aria-current={currentTab === 'comparator' ? 'page' : undefined}
            onClick={() => {
              onSelectTab('comparator');
              setIsMobileExportOpen(false);
              setIsMobileMoreOpen(false);
            }}
            className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
              currentTab === 'comparator' ? 'bg-white shadow-xs text-blue-900 font-bold' : 'text-slate-700'
            }`}
          >
            Comparar ({comparedCount}/3)
          </button>
          <button
            type="button"
            onClick={onToggleEasyRead}
            aria-pressed={isEasyReadMode}
            className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
              isEasyReadMode ? 'bg-indigo-100 text-indigo-900 font-bold' : 'text-slate-700'
            }`}
          >
            Lectura Fácil
          </button>
          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={isMobileExportOpen}
            onClick={() => {
              setIsMobileExportOpen(prev => !prev);
              setIsMobileMoreOpen(false);
            }}
            className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded-lg font-medium cursor-pointer inline-flex items-center gap-1 ${
              isMobileExportOpen ? 'bg-blue-100 text-blue-950 font-bold' : 'text-slate-700'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Exportar</span>
          </button>
          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={isMobileMoreOpen}
            onClick={() => {
              setIsMobileMoreOpen(prev => !prev);
              setIsMobileExportOpen(false);
            }}
            className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded-lg font-medium cursor-pointer inline-flex items-center gap-1 ${
              isMobileMoreOpen || ['continuity', 'passport', 'sources'].includes(currentTab)
                ? 'bg-blue-100 text-blue-950 font-bold'
                : 'text-slate-700'
            }`}
          >
            <span>Más</span>
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </nav>

        {/* Panel móvil desplegable para compartir enlace y exportar CSV/JSON */}
        {isMobileExportOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-3 py-2 flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                onShareLink();
                setIsMobileExportOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-950 font-semibold cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Copiar enlace</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onExportCSV();
                setIsMobileExportOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onExportJSON();
                setIsMobileExportOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-900 font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>JSON</span>
            </button>
          </div>
        )}

        {/* Panel móvil desplegable "Más" */}
        {isMobileMoreOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-3 py-2 flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              aria-current={currentTab === 'continuity' ? 'page' : undefined}
              onClick={() => {
                onSelectTab('continuity');
                setIsMobileMoreOpen(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg border font-semibold cursor-pointer ${
                currentTab === 'continuity'
                  ? 'bg-blue-50 border-blue-300 text-blue-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              Continuidad
            </button>
            <button
              type="button"
              aria-current={currentTab === 'passport' ? 'page' : undefined}
              onClick={() => {
                onSelectTab('passport');
                setIsMobileMoreOpen(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg border font-semibold cursor-pointer ${
                currentTab === 'passport'
                  ? 'bg-blue-50 border-blue-300 text-blue-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              Pasaporte ({passportCount})
            </button>
            <button
              type="button"
              aria-current={currentTab === 'sources' ? 'page' : undefined}
              onClick={() => {
                onSelectTab('sources');
                setIsMobileMoreOpen(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg border font-semibold cursor-pointer ${
                currentTab === 'sources'
                  ? 'bg-blue-50 border-blue-300 text-blue-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              Fuentes Oficiales
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenLegalModal();
                setIsMobileMoreOpen(false);
              }}
              className="px-2.5 py-1.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-800 font-semibold cursor-pointer"
            >
              Aviso Legal
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenTestModal();
                setIsMobileMoreOpen(false);
              }}
              className="px-2.5 py-1.5 rounded-lg border bg-blue-50 border-blue-200 text-blue-900 font-semibold cursor-pointer"
            >
              Pruebas FIL
            </button>
          </div>
        )}
      </header>
    </>
  );
};
