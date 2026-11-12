/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Comparador Objetivo sin Rankings (Límite 3 centros para legibilidad familiar)
 * - Cero puntuaciones, estrellas o clasificaciones artificiales
 * - Límite de 3 centros simultáneos para garantizar legibilidad sin desborde
 * - Indicador claro de capacidad: "Comparador: X de 3 centros"
 * - Gestión de centros excluidos por filtros activos posteriores: [Mantener] o [Retirar]
 */

import React from 'react';
import { School, SearchState } from '../types';
import { matchesCentre } from '../utils/filterEngine';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Building,
  Check,
  Minus,
  AlertCircle,
  Plus,
  ArrowRight,
  Printer
} from 'lucide-react';
import { LEGAL_DISCLAIMER } from '../data/disclaimerAndProcedures';

interface ComparatorViewProps {
  comparedSchools: School[];
  state: SearchState;
  onRemoveFromCompare: (schoolId: string) => void;
  onClearCompare: () => void;
  onOpenDetail: (school: School) => void;
  onGoToSearch: () => void;
}

export const ComparatorView: React.FC<ComparatorViewProps> = ({
  comparedSchools,
  state,
  onRemoveFromCompare,
  onClearCompare,
  onOpenDetail,
  onGoToSearch
}) => {
  if (comparedSchools.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-xl mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center mx-auto mb-4">
          <Building className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          El comparador está vacío
        </h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
          Puedes comparar hasta un máximo de <span className="font-semibold text-slate-800">3 centros a la vez</span> para analizar lado a lado sus recursos oficiales, etapas confirmadas, servicios y continuidad sin rankings subjetivos.
        </p>
        <button
          type="button"
          onClick={onGoToSearch}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Ir al Buscador y añadir centros (máx. 3)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera explicativa con contador de capacidad claro */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
              Capacidad: {comparedSchools.length} de 3 centros
            </span>
            {comparedSchools.length >= 3 && (
              <span className="text-xs text-slate-500 font-medium">
                (Límite óptimo para legibilidad alcanzado)
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
            Comparador Objetivo (Sin Rankings ni Estrellas)
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
            Compara datos verificados publicados por la Comunidad de Madrid.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => window.print()}
            className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
            title="Imprimir o guardar como informe PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Exportar PDF / Imprimir</span>
          </button>
          <button
            type="button"
            onClick={onClearCompare}
            className="text-xs font-semibold text-slate-600 hover:text-red-700 transition-colors cursor-pointer"
          >
            Vaciar
          </button>
          {comparedSchools.length < 3 && (
            <button
              type="button"
              onClick={onGoToSearch}
              className="text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir {3 - comparedSchools.length} más</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabla Comparativa Responsive sin desborde horizontal */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse table-fixed">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              <th className="p-4 w-44 sm:w-52 text-slate-500 font-bold uppercase tracking-wider text-[11px] align-top bg-slate-50/90">
                Criterio Oficial
              </th>
              {comparedSchools.map(sch => {
                const isStillMatching = matchesCentre(sch, state);
                return (
                  <th key={sch.id} className="p-4 align-top border-l border-slate-100">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-mono text-slate-500 text-[10px]">Cód. {sch.codigo}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveFromCompare(sch.id)}
                        className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer transition-colors"
                        title="Quitar este centro del comparador"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="font-extrabold text-slate-900 text-sm mb-1 leading-snug">
                      {sch.nombre}
                    </div>

                    <div className="text-[11px] text-slate-500 mb-2">
                      {sch.municipio} {sch.distrito ? `(${sch.distrito})` : ''}
                    </div>

                    {/* Aviso cuando el centro ya no cumple los filtros activos */}
                    {!isStillMatching && (
                      <div className="text-[11px] bg-amber-50 text-amber-900 border border-amber-300 p-2 rounded-lg leading-tight mb-2">
                        <div className="flex items-center gap-1 font-bold text-amber-800 mb-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Filtros cambiados</span>
                        </div>
                        <p className="text-[10px] text-amber-800 mb-1.5">
                          Este centro ya no cumple los filtros de búsqueda actuales.
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onRemoveFromCompare(sch.id)}
                            className="text-[10px] font-bold text-red-700 hover:underline"
                          >
                            Retirar
                          </button>
                          <span className="text-amber-300">·</span>
                          <span className="text-[10px] text-amber-700 italic">Mantenido en comparativa</span>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenDetail(sch)}
                      className="text-xs text-blue-700 font-bold hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      <span>Ver ficha completa</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {/* 1. Titularidad y Modalidad */}
            <tr>
              <td className="p-4 font-bold text-slate-800 bg-slate-50/50">Titularidad y Tipo</td>
              {comparedSchools.map(sch => (
                <td key={sch.id} className="p-4 border-l border-slate-100">
                  <div className="font-semibold text-slate-900 capitalize">
                    {sch.titularidad === 'publico' ? 'Centro Público' : 'Privado Concertado'}
                  </div>
                  <div className="text-slate-500 text-[11px]">{sch.tipo}</div>
                </td>
              ))}
            </tr>

            {/* 2. Nivel de Evidencia en Lenguaje Familiar */}
            <tr>
              <td className="p-4 font-bold text-slate-800 bg-slate-50/50">Nivel de Evidencia</td>
              {comparedSchools.map(sch => {
                const sup = sch.apoyos[0];
                const isA1 = sup?.evidencia === 'A1';
                return (
                  <td key={sch.id} className="p-4 border-l border-slate-100">
                    <span className={`inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-1 rounded-lg ${
                      isA1 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {isA1 ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                      <span>{isA1 ? 'Confirmado para esta etapa' : 'Por comprobar etapa'}</span>
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* 3. Aula o Proyecto de Apoyo */}
            <tr>
              <td className="p-4 font-bold text-slate-800 bg-slate-50/50">Proyecto / Aula de Apoyo</td>
              {comparedSchools.map(sch => {
                const sup = sch.apoyos[0];
                return (
                  <td key={sch.id} className="p-4 border-l border-slate-100">
                    <div className="font-bold text-slate-900 text-xs">{sup?.aulaNombre || (sch.procedencia === 'oficial' ? 'Aula TEA (nombre no publicado)' : 'Aula Específica')}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">Etapas con apoyo: {sup?.etapasConApoyo.join(', ')}</div>
                  </td>
                );
              })}
            </tr>

            {/* 4. Etapas Impartidas */}
            <tr>
              <td className="p-4 font-bold text-slate-800 bg-slate-50/50">Etapas Impartidas</td>
              {comparedSchools.map(sch => (
                <td key={sch.id} className="p-4 border-l border-slate-100">
                  <div className="flex flex-wrap gap-1">
                    {sch.etapas.map(st => (
                      <span key={st} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        {st}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* 5. Servicios: Comedor */}
            <tr>
              <td className="p-4 font-bold text-slate-800 bg-slate-50/50">Comedor Escolar</td>
              {comparedSchools.map(sch => (
                <td key={sch.id} className="p-4 border-l border-slate-100">
                  {sch.servicios.comedor ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-600" /> Publicado
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Minus className="w-4 h-4" /> {sch.procedencia === 'oficial' ? 'Sin datos en la fuente' : 'No localizado'}
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* 6. Servicios: Transporte Adaptado */}
            <tr>
              <td className="p-4 font-bold text-slate-800 bg-slate-50/50">Transporte Adaptado</td>
              {comparedSchools.map(sch => (
                <td key={sch.id} className="p-4 border-l border-slate-100">
                  {sch.servicios.transporte ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-600" /> Disponible
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Minus className="w-4 h-4" /> {sch.procedencia === 'oficial' ? 'Sin datos en la fuente' : 'No localizado'}
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* 7. Servicios: Enfermería */}
            <tr>
              <td className="p-4 font-bold text-slate-800 bg-slate-50/50">Enfermería Escolar</td>
              {comparedSchools.map(sch => (
                <td key={sch.id} className="p-4 border-l border-slate-100">
                  {sch.servicios.enfermeria ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-600" /> Jornada completa
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Minus className="w-4 h-4" /> {sch.procedencia === 'oficial' ? 'Sin datos en la fuente' : 'No localizada'}
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* 8. Continuidad Secundaria */}
            <tr>
              <td className="p-4 font-bold text-slate-800 bg-slate-50/50">Continuidad Secundaria (ESO)</td>
              {comparedSchools.map(sch => (
                <td key={sch.id} className="p-4 border-l border-slate-100 text-[11px]">
                  <div className="font-semibold text-slate-900 mb-0.5">
                    {sch.continuidad.tipoContinuidad === 'mismo_centro'
                      ? 'En el propio centro'
                      : sch.continuidad.tipoContinuidad === 'zona'
                      ? 'Adscripción no publicada'
                      : 'Vía IES adscrito'}
                  </div>
                  <p className="text-slate-600 leading-snug">{sch.continuidad.descripcion}</p>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-xs text-slate-400 text-center max-w-xl mx-auto">
        {LEGAL_DISCLAIMER}
      </div>
    </div>
  );
};
