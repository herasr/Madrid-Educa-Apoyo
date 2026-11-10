/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Componente de Gestión de Cero Resultados (Anexo N.7)
 * - NUNCA borra los filtros automáticamente.
 * - Muestra qué combinación exacta produjo cero resultados.
 * - Ofrece relajaciones asistidas con 1 clic calculando cuántos centros aparecerían.
 * - Mantiene intacta la necesidad educativa.
 * - No introduce centros sin evidencia para rellenar.
 */

import React from 'react';
import { RelaxationOption, SearchState, ZeroResultsAnalysis } from '../types';
import { AlertCircle, ArrowUpRight, RotateCcw, Sparkles } from 'lucide-react';

interface ZeroResultsAdviceProps {
  state: SearchState;
  analysis: ZeroResultsAnalysis;
  onApplyRelaxation: (relaxation: RelaxationOption) => void;
  onClearSecondaryFilters: () => void;
}

export const ZeroResultsAdvice: React.FC<ZeroResultsAdviceProps> = ({
  state,
  analysis,
  onApplyRelaxation,
  onClearSecondaryFilters
}) => {
  return (
    <div className="bg-white border-2 border-amber-300/80 rounded-2xl p-6 sm:p-8 my-4 shadow-sm max-w-3xl mx-auto">
      {/* Icono y Encabezado de Advertencia */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <AlertCircle className="w-6 h-6 text-amber-700" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 leading-tight">
            No se han encontrado centros con la combinación actual
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Los filtros activos son muy restrictivos para la zona o servicios indicados.
          </p>
        </div>
      </div>

      {/* 1. Motivo exacto de la combinación que produjo cero resultados */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
          Causa detectada por el motor de filtros:
        </div>
        <p className="text-sm font-semibold text-slate-800">
          «{analysis.reason}»
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Conforme a la norma oficial v2.4, la aplicación no borra filtros automáticamente ni rellena la lista con centros sin evidencia autorizada.
        </p>
      </div>

      {/* 2, 3, 4. Sugerencias de Relajación Asistida con 1 Clic */}
      {analysis.relaxations.length > 0 && (
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-700" />
            <span>Sugerencias de relajación recomendadas (manteniendo la necesidad):</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {analysis.relaxations.map(rel => (
              <button
                key={rel.id}
                type="button"
                onClick={() => onApplyRelaxation(rel)}
                className="text-left p-3 rounded-xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-400 transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-blue-950 flex items-center justify-between">
                    <span>{rel.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    {rel.description}
                  </p>
                </div>

                <div className="mt-2 text-right">
                  <span className="text-[11px] font-bold text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded font-mono">
                    +{rel.resultingCount} centro(s)
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Acción de reinicio selectivo de filtros secundarios conservando la necesidad */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-slate-500">
          ¿Deseas mantener la necesidad y etapa pero retirar servicios o radios restrictivos?
        </span>

        <button
          type="button"
          onClick={onClearSecondaryFilters}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Restablecer solo filtros secundarios</span>
        </button>
      </div>
    </div>
  );
};
