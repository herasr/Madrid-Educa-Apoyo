/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Encabezado Institucional Madrid Educa Apoyo (v2.4)
 * Estructura limpia y desaturada:
 * - 4 Secciones principales: Buscar | Continuidad | Comparador (X/3) | Pasaporte
 * - Menú secundario "Más": Fuentes, Metodología, Glosario, Pruebas FIL
 * - Banner legal desescalado a botón/modal accesible para no competir visualmente
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  BookmarkCheck,
  GitCompare,
  Search,
  ChevronDown,
  Info,
  FileSpreadsheet,
  BookOpen,
  Sparkles,
  ShieldCheck,
  X,
  Share2,
  Download
} from 'lucide-react';
import { LEGAL_DISCLAIMER } from '../data/disclaimerAndProcedures';

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
  const shareExportMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareExportMenuRef.current && !shareExportMenuRef.current.contains(event.target as Node)) {
        setIsShareExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zona 1: Wordmark institucional */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('search')}
              className="text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-900 transition-colors whitespace-nowrap">
                  Madrid Educa Apoyo
                </span>
              </div>
            </button>
          </div>

          {/* Zona 2: Navegación principal limpia (4 destinos clave + Menú Más) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium text-slate-600" aria-label="Navegación principal">
            {/* 1. Buscar */}
            <button
              onClick={() => onSelectTab('search')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                currentTab === 'search'
                  ? 'bg-blue-50 text-blue-900 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4 text-blue-700" />
              <span>Buscar</span>
            </button>

            {/* 3. Comparador con contador visible (máximo 3) */}
            <button
              onClick={() => onSelectTab('comparator')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                currentTab === 'comparator'
                  ? 'bg-blue-50 text-blue-900 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <GitCompare className="w-4 h-4 text-slate-500" />
              <span>Comparar</span>
              <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                comparedCount > 0 ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-500'
              }`}>
                {comparedCount}/3
              </span>
            </button>

            {/* Nuevo Botón Modo Lectura Fácil */}
            <button
              onClick={onToggleEasyRead}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                isEasyReadMode
                  ? 'bg-indigo-100 text-indigo-900 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
              title={isEasyReadMode ? 'Desactivar modo simplificado' : 'Activar modo Lectura Fácil'}
            >
              <BookOpen className={`w-4 h-4 ${isEasyReadMode ? 'text-indigo-700' : 'text-slate-500'}`} />
              <span className="hidden lg:inline">Lectura Fácil</span>
            </button>

            {/* 3. Menú Desplegable "Compartir / Exportar" */}
            <div className="relative" ref={shareExportMenuRef}>
              <button
                type="button"
                onClick={() => setIsShareExportOpen(!isShareExportOpen)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                  isShareExportOpen
                    ? 'bg-blue-50 text-blue-900 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
                aria-expanded={isShareExportOpen}
              >
                <Share2 className="w-4 h-4 text-blue-700" />
                <span>Compartir / Exportar</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {isShareExportOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-xs">
                  <button
                    onClick={() => {
                      onShareLink();
                      setIsShareExportOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium"
                  >
                    <Share2 className="w-4 h-4 text-blue-700 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Copiar enlace compartible</div>
                      <div className="text-[11px] text-slate-400">Guarda todos los filtros y ubicación actuales</div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={() => {
                      onExportCSV();
                      setIsShareExportOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium"
                  >
                    <Download className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Descargar Resultados CSV</div>
                      <div className="text-[11px] text-slate-400">Tabla estructurada con procedencia BOCM</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onExportJSON();
                      setIsShareExportOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium"
                  >
                    <Download className="w-4 h-4 text-blue-700 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Descargar Resultados JSON</div>
                      <div className="text-[11px] text-slate-400">Datos abiertos con metadata oficial</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Sub-barra de navegación móvil compacta */}
        <div className="md:hidden flex items-center overflow-x-auto px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs gap-2">
          <button
            onClick={() => onSelectTab('search')}
            className={`whitespace-nowrap px-3 py-1 rounded-lg font-medium cursor-pointer ${
              currentTab === 'search' ? 'bg-white shadow-xs text-blue-900 font-bold' : 'text-slate-600'
            }`}
          >
            Buscar
          </button>
          <button
            onClick={() => onSelectTab('comparator')}
            className={`whitespace-nowrap px-3 py-1 rounded-lg font-medium cursor-pointer ${
              currentTab === 'comparator' ? 'bg-white shadow-xs text-blue-900 font-bold' : 'text-slate-600'
            }`}
          >
            Comparar ({comparedCount}/3)
          </button>
          <button
            onClick={() => onSelectTab('passport')}
            className={`whitespace-nowrap px-3 py-1 rounded-lg font-medium cursor-pointer ${
              currentTab === 'passport' ? 'bg-white shadow-xs text-blue-900 font-bold' : 'text-slate-600'
            }`}
          >
            Pasaporte ({passportCount})
          </button>
          <button
            onClick={() => onSelectTab('sources')}
            className={`whitespace-nowrap px-3 py-1 rounded-lg font-medium cursor-pointer ${
              currentTab === 'sources' ? 'bg-white shadow-xs text-blue-900 font-bold' : 'text-slate-600'
            }`}
          >
            Fuentes
          </button>
          <button
            onClick={onOpenLegalModal}
            className="whitespace-nowrap px-3 py-1 rounded-lg font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Aviso Legal
          </button>
          <button
            onClick={onOpenTestModal}
            className="whitespace-nowrap px-3 py-1 rounded-lg font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 cursor-pointer"
          >
            Pruebas FIL
          </button>
        </div>
      </header>

    </>
  );
};
