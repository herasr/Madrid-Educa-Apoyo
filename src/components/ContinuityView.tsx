/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Vista de Continuidad Educativa y Transición Primaria-ESO (Sección 5 y FIL-011)
 * Evalúa:
 * - Mismo centro con Primaria y ESO
 * - CEIPSO para 1.º y 2.º de ESO
 * - Adscripciones únicas y múltiples con verificación del apoyo preferente
 * - Si faltan datos: "Continuidad no verificada", nunca inexistencia afirmada.
 */

import React from 'react';
import { School, SearchState } from '../types';
import {
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  Building,
  ArrowRight,
  ExternalLink,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { calculateHaversineDistance, MUNICIPALITIES } from '../data/municipalities';

interface ContinuityViewProps {
  schools: School[];
  state: SearchState;
  onOpenDetail: (school: School) => void;
  onUpdateRadius: (newRadius: number) => void;
}

export const ContinuityView: React.FC<ContinuityViewProps> = ({
  schools,
  state,
  onOpenDetail,
  onUpdateRadius
}) => {
  // Filtrar centros que imparten Primaria (origen de la transición a Secundaria)
  const primarySchools = schools.filter(s => s.etapas.includes('primaria'));

  const munObj = state.municipality
    ? MUNICIPALITIES.find(
        m => m.id.toLowerCase() === state.municipality?.toLowerCase() || m.nombre.toLowerCase() === state.municipality?.toLowerCase()
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Banner explicativo del modelo de continuidad oficial */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6 text-blue-900" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
              Mapa de Transición y Continuidad Escolar (Primaria a ESO)
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              En la Comunidad de Madrid, la continuidad del apoyo educativo específico (aulas TEA, apoyos auditivos o motóricos) 
              al pasar de Primaria a Secundaria depende de si el centro imparte ESO, de la tipología CEIPSO o de los Institutos (IES) 
              adscritos oficialmente.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Apoyo específico verificado en Secundaria</span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Continuidad no verificada documentalmente (nunca inexistencia afirmada)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selector rápido para ampliar radio sin perder filtros (FIL-011) */}
      {state.municipality && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-700 font-medium">
            Mostrando continuidad para centros en {state.municipality} ({state.radiusKm} km). ¿Necesitas ver más institutos adscritos limítrofes?
          </span>

          <div className="flex items-center gap-2">
            {[20, 30, 45].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => onUpdateRadius(r)}
                className={`px-2.5 py-1 rounded-md font-semibold border transition-colors cursor-pointer ${
                  state.radiusKm === r
                    ? 'bg-blue-700 text-white border-blue-800'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Listado de centros y sus rutas de continuidad */}
      {primarySchools.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
          No hay centros con etapa de Primaria que cumplan los filtros actuales. Ajusta los filtros para explorar la continuidad.
        </div>
      ) : (
        <div className="space-y-4">
          {primarySchools.map(school => {
            const distanceKm = munObj ? calculateHaversineDistance(munObj.lat, munObj.lng, school.lat, school.lng) : null;
            const isIntegrated = school.continuidad.tipoContinuidad === 'mismo_centro';
            const isCeipso = school.tipo === 'CEIPSO' || school.continuidad.tipoContinuidad === 'ceipso_parcial';

            return (
              <div key={school.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <span className="font-mono text-slate-700 font-semibold">Cód. {school.codigo}</span>
                      <span>·</span>
                      <span>{school.tipo}</span>
                      <span>·</span>
                      <span>{school.municipio} {school.distrito ? `(${school.distrito})` : ''}</span>
                      {distanceKm !== null && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-blue-900 font-medium">{distanceKm} km</span>
                        </>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{school.nombre}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenDetail(school)}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Ver Ficha del Centro
                    </button>
                  </div>
                </div>

                {/* Ruta de continuidad */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Ruta hacia la Educación Secundaria Obligatoria:
                    </div>

                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      school.continuidad.apoyoEnSecundariaVerificado === true
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {school.continuidad.apoyoEnSecundariaVerificado === true
                        ? 'Apoyo verificado en ESO'
                        : school.continuidad.tipoContinuidad === 'zona'
                        ? 'Adscripción no publicada'
                        : 'Continuidad no verificada'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 mb-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {school.continuidad.descripcion}
                  </p>

                  {/* Destinos */}
                  {school.continuidad.destinos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {school.continuidad.destinos.map((dest, i) => (
                        <div key={i} className="border border-slate-200 rounded-xl p-3 bg-white flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <span className="font-mono font-medium">Cód. {dest.codigo}</span>
                              <span>·</span>
                              <span>{dest.etapa}</span>
                              {dest.distanciaKm && <span>· {dest.distanciaKm} km</span>}
                            </div>
                            <div className="text-xs font-bold text-slate-900 mt-0.5">{dest.nombre}</div>
                            <p className="text-[11px] text-slate-600 mt-1 leading-snug">{dest.detallesApoyo}</p>
                          </div>

                          <div className="shrink-0 text-right">
                            {dest.tieneMismoApoyo === true ? (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded block">
                                Apoyo Específico
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded block">
                                Apoyo Ordinario
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs font-medium text-emerald-900 bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-lg">
                      {isIntegrated
                        ? 'Centro integrado completo: Sin cambio de centro requerido de 3 a 16 años (mantiene recursos de aula).'
                        : 'Modalidad de Educación Especial continuada en el propio centro.'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
