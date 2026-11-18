/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Comparador Objetivo sin Rankings (Límite 3 centros para legibilidad familiar)
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
  Printer,
  Phone,
  Trash2
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
          <Building className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="text-lg font-bold text-slate-900 mb-1">
          El comparador está vacío
        </h1>
        <p className="text-xs text-slate-700 max-w-md mx-auto mb-6 leading-relaxed">
          Puedes comparar hasta un máximo de <span className="font-semibold text-slate-900">3 centros a la vez</span> para analizar lado a lado sus datos de contacto, etapas oficiales y continuidad sin rankings subjetivos.
        </p>
        <button
          type="button"
          onClick={onGoToSearch}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
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
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
              Capacidad: {comparedSchools.length} de 3 centros
            </span>
            {comparedSchools.length >= 3 && (
              <span className="text-xs text-slate-700 font-medium">
                (Límite óptimo para legibilidad alcanzado)
              </span>
            )}
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 leading-tight">
            Comparador Objetivo (Sin Rankings ni Estrellas)
          </h1>
          <p className="text-xs text-slate-700 mt-0.5 max-w-2xl">
            Compara datos publicados por la Comunidad de Madrid y el Portal de Datos Abiertos CAM.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => window.print()}
            className="text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
            title="Imprimir o guardar como informe PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-700" aria-hidden="true" />
            <span>Exportar PDF / Imprimir</span>
          </button>
          <button
            type="button"
            onClick={onClearCompare}
            className="text-xs font-bold text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
            title="Quitar todos los centros marcados del comparador"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Vaciar marcados</span>
          </button>
          {comparedSchools.length < 3 && (
            <button
              type="button"
              onClick={onGoToSearch}
              className="text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Añadir {3 - comparedSchools.length} más</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabla Comparativa Responsive sin desborde horizontal */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse table-fixed min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              <th className="p-4 w-44 sm:w-52 text-slate-700 font-bold uppercase tracking-wider text-xs align-top bg-slate-50/90">
                Criterio Oficial
              </th>
              {comparedSchools.map(sch => {
                const isStillMatching = matchesCentre(sch, state);
                return (
                  <th key={sch.id} className="p-4 align-top border-l border-slate-200">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-mono text-slate-700 text-xs">Cód. {sch.codigo}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveFromCompare(sch.id)}
                        className="p-1 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer transition-colors"
                        aria-label={`Quitar ${sch.nombre} del comparador`}
                        title="Quitar este centro del comparador"
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="font-extrabold text-slate-900 text-sm mb-1 leading-snug">
                      {sch.nombre}
                    </div>

                    <div className="text-xs text-slate-700 mb-2">
                      {sch.municipio} {sch.distrito ? `(${sch.distrito})` : ''}
                    </div>

                    {/* Aviso cuando el centro ya no cumple los filtros activos */}
                    {!isStillMatching && (
                      <div className="text-xs bg-amber-50 text-amber-950 border border-amber-300 p-2 rounded-lg leading-tight mb-2">
                        <div className="flex items-center gap-1 font-bold text-amber-900 mb-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" aria-hidden="true" />
                          <span>Filtros cambiados</span>
                        </div>
                        <p className="text-xs text-amber-900 mb-1.5">
                          Este centro ya no cumple los filtros de búsqueda actuales.
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onRemoveFromCompare(sch.id)}
                            className="text-xs font-bold text-red-700 hover:underline cursor-pointer"
                          >
                            Retirar
                          </button>
                          <span className="text-amber-600" aria-hidden="true">·</span>
                          <span className="text-xs text-amber-900 italic">Mantenido</span>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenDetail(sch)}
                      className="text-xs text-blue-900 font-bold hover:underline inline-flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      <span>Ver ficha completa</span>
                      <ArrowRight className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 text-slate-800">
            {/* 1. Titularidad y Modalidad */}
            <tr>
              <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Titularidad y Tipo</td>
              {comparedSchools.map(sch => (
                <td key={sch.id} className="p-4 border-l border-slate-200">
                  <div className="font-semibold text-slate-900">
                    {sch.titularidad === 'publico'
                      ? 'Centro Público'
                      : sch.titularidad === 'concertado'
                      ? 'Privado Concertado'
                      : 'Centro Privado'}
                  </div>
                  <div className="text-slate-700 text-xs">{sch.tipoGeneralOficial || sch.tipo}</div>
                </td>
              ))}
            </tr>

            {/* 2. Dirección y Teléfono (Datos Abiertos CAM) */}
            <tr>
              <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Dirección y Contacto</td>
              {comparedSchools.map(sch => (
                <td key={sch.id} className="p-4 border-l border-slate-200">
                  <div className="text-slate-900 font-medium">
                    {sch.direccion ? `${sch.direccion}${sch.codigoPostal ? ` (${sch.codigoPostal})` : ''}` : 'Sin dirección en catálogo'}
                  </div>
                  {sch.telefono && (
                    <div className="text-slate-700 mt-1 inline-flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-600 shrink-0" aria-hidden="true" />
                      <span>{sch.telefono}</span>
                    </div>
                  )}
                  {sch.transportePublico && (
                    <div className="text-slate-600 text-xs mt-1 leading-snug">
                      <span className="font-semibold text-slate-800">Transporte:</span> {sch.transportePublico}
                    </div>
                  )}
                </td>
              ))}
            </tr>

            {/* 3. Nivel de Evidencia en Lenguaje Familiar */}
            <tr>
              <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Nivel de Evidencia</td>
              {comparedSchools.map(sch => {
                const sup = state.need
                  ? sch.apoyos.find(a => a.needId === state.need) || sch.apoyos[0]
                  : sch.apoyos[0];
                const isA1 = sup?.evidencia === 'A1';
                return (
                  <td key={sch.id} className="p-4 border-l border-slate-200">
                    <span className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-lg ${
                      isA1 ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-amber-50 text-amber-950 border border-amber-300'
                    }`}>
                      {isA1 ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />}
                      <span>{isA1 ? 'Confirmado (A1)' : 'Por comprobar vigencia (A2)'}</span>
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* 4. Etapas oficiales */}
            <tr>
              <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Etapas Oficiales</td>
              {comparedSchools.map(sch => (
                <td key={sch.id} className="p-4 border-l border-slate-200">
                  <div className="flex flex-wrap gap-1">
                    {sch.etapas.map(st => (
                      <span key={st} className="bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded text-xs font-semibold capitalize">
                        {st === 'eso' ? 'ESO' : st === 'fp_basica' ? 'FP Básica' : st}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* 5. Servicios y Accesibilidad (Ayto. Madrid en capital) */}
            <tr>
              <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Servicios y Accesibilidad</td>
              {comparedSchools.map(sch => {
                const accParts = (sch.accesibilidadCodigoAyto || '').split(',').map(x => x.trim());
                const activeSrvs = [
                  sch.servicios.comedor && 'Comedor',
                  sch.servicios.aula_matinal && 'Horario ampliado',
                  sch.servicios.transporte && 'Transporte',
                  sch.accesibilidad.acceso_fisico && 'Accesible (cód. 1)',
                  !sch.accesibilidad.acceso_fisico && accParts.includes('2') && 'Parcialmente accesible PMR (cód. 2)'
                ].filter(Boolean) as string[];

                return (
                  <td key={sch.id} className="p-4 border-l border-slate-200">
                    {activeSrvs.length > 0 ? (
                      <div className="space-y-1">
                        {activeSrvs.map(item => (
                          <span key={item} className="text-emerald-900 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
                            <span>{item}</span>
                          </span>
                        ))}
                        <span className="text-xs text-slate-600 block">Fuente: datos.madrid.es</span>
                      </div>
                    ) : sch.fuenteAyuntamiento ? (
                      <span className="text-slate-700 text-xs">
                        Sin equipamiento declarado en ficha de Ayto. Madrid
                      </span>
                    ) : (
                      <span className="text-slate-700 flex items-center gap-1">
                        <Minus className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Sin datos fuera de Madrid capital</span>
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* 6. Continuidad Secundaria / Modalidad */}
            <tr>
              <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Trayectoria / Continuidad</td>
              {comparedSchools.map(sch => {
                const activeSup = state.need
                  ? sch.apoyos.find(a => a.needId === state.need) || sch.apoyos[0]
                  : sch.apoyos[0];
                const needId = activeSup?.needId || 'tea';
                return (
                  <td key={sch.id} className="p-4 border-l border-slate-200 text-xs">
                    <div className="font-semibold text-slate-900 mb-0.5">
                      {needId === 'educacion_especial'
                        ? 'Itinerario CEE (hasta 21 años)'
                        : needId === 'salud_hospitalaria'
                        ? 'Atención hospitalaria transitoria'
                        : needId === 'visual'
                        ? 'EOEP itinerante / C.R.E. ONCE'
                        : needId === 'altas_capacidades'
                        ? 'CREACIM / PEAC sábados'
                        : needId === 'auditiva' || needId === 'motora' || needId === 'tdah' || needId === 'tel_lenguaje'
                        ? 'Orientación regional (EOEP Específico)'
                        : needId === 'compensatoria'
                        ? 'Aula de Enlace · acogida lingüística'
                        : sch.continuidad.tipoContinuidad === 'mismo_centro'
                        ? 'En el propio centro'
                        : sch.continuidad.tipoContinuidad === 'zona'
                        ? 'Adscripción no publicada'
                        : 'Vía IES adscrito'}
                    </div>
                    <p className="text-slate-700 leading-snug">{sch.continuidad.descripcion}</p>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-xs text-slate-700 text-center max-w-xl mx-auto">
        {LEGAL_DISCLAIMER}
      </div>
    </div>
  );
};
