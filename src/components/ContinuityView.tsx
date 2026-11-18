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
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { calculateHaversineDistance, MUNICIPALITIES } from '../data/municipalities';
import { simplifySchoolTitle, simplifyText } from '../utils/textSimplifier';

interface ContinuityViewProps {
  schools: School[];
  state: SearchState;
  isEasyReadMode?: boolean;
  onOpenDetail: (school: School) => void;
  onUpdateRadius: (newRadius: number) => void;
}

export const ContinuityView: React.FC<ContinuityViewProps> = ({
  schools,
  state,
  isEasyReadMode = false,
  onOpenDetail,
  onUpdateRadius
}) => {
  const formatText = (text: string) => isEasyReadMode ? simplifyText(text) : text;
  // Filtrar centros que imparten Primaria (origen de la transición a Secundaria)
  const primarySchools = schools.filter(s => s.etapas.includes('primaria'));

  const munObj = state.municipality
    ? MUNICIPALITIES.find(
        m => m.id.toLowerCase() === state.municipality?.toLowerCase() || m.nombre.toLowerCase() === state.municipality?.toLowerCase()
      )
    : null;

  const refCoords = state.locationSource === 'browser' && state.userCoordinates
    ? state.userCoordinates
    : munObj
    ? { lat: munObj.lat, lng: munObj.lng, label: munObj.nombre }
    : null;

  return (
    <div className="space-y-6">
      {/* Banner explicativo del modelo de continuidad oficial */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6 text-blue-900" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight">
              Mapa de Transición y Continuidad Escolar (Primaria a ESO)
            </h1>
            <p className="text-sm text-slate-700 mt-1 max-w-3xl leading-relaxed">
              {formatText(
                'En la Comunidad de Madrid, la continuidad del apoyo educativo específico (aulas TEA) al pasar de Primaria a Secundaria depende de si el centro imparte ESO (CEIPSO o concertado integrado) o de los Institutos (IES) adscritos oficialmente.'
              )}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-800">
              <span className="flex items-center gap-1.5 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <span>Apoyo específico verificado en Secundaria</span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-950">
                <AlertCircle className="w-4 h-4 text-amber-700" aria-hidden="true" />
                <span>Continuidad no verificada documentalmente (nunca inexistencia afirmada)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selector rápido para ampliar radio sin perder filtros (FIL-011) */}
      {refCoords && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-800 font-medium">
            Mostrando continuidad para centros en {refCoords.label} ({state.radiusKm ? `${state.radiusKm} km` : 'solo municipio'}). ¿Necesitas ver más institutos cercanos?
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
                    : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
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
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-700">
          No hay centros con etapa de Primaria que cumplan los filtros actuales. Ajusta los filtros para explorar la continuidad.
        </div>
      ) : (
        <div className="space-y-4">
          {primarySchools.map(school => {
            const rawDistance = refCoords ? calculateHaversineDistance(refCoords.lat, refCoords.lng, school.lat, school.lng) : null;
            const displayDistance = rawDistance !== null
              ? (school.ubicacionAproximada || rawDistance >= 10 ? Math.round(rawDistance) : rawDistance)
              : null;
            const isIntegrated = school.continuidad.tipoContinuidad === 'mismo_centro';

            return (
              <div key={school.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 mb-1">
                      <span className="font-mono text-slate-900 font-semibold">Cód. {school.codigo}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatText(school.tipo)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{school.municipio} {school.distrito ? `(${school.distrito})` : ''}</span>
                      {displayDistance !== null && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-blue-950 font-semibold">{school.ubicacionAproximada ? '≈ ' : ''}{displayDistance} km</span>
                        </>
                      )}
                    </div>

                    <h2 className="text-lg font-bold text-slate-900">
                      {isEasyReadMode ? simplifySchoolTitle(school.nombre) : school.nombre}
                    </h2>
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
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Ruta hacia la Educación Secundaria Obligatoria:
                    </div>

                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      school.continuidad.apoyoEnSecundariaVerificado === true
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-50 text-amber-950 border border-amber-300'
                    }`}>
                      {school.continuidad.apoyoEnSecundariaVerificado === true
                        ? 'Apoyo verificado en ESO'
                        : school.continuidad.tipoContinuidad === 'zona'
                        ? 'Adscripción no publicada'
                        : 'Continuidad no verificada'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 mb-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {formatText(school.continuidad.descripcion)}
                  </p>

                  {/* Destinos */}
                  {school.continuidad.destinos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {school.continuidad.destinos.map((dest, i) => (
                        <div key={i} className="border border-slate-200 rounded-xl p-3 bg-white flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
                              <span className="font-mono font-medium text-slate-900">Cód. {dest.codigo}</span>
                              <span aria-hidden="true">·</span>
                              <span>{dest.etapa}</span>
                              {dest.distanciaKm !== undefined && <span>· {dest.distanciaKm} km</span>}
                            </div>
                            <div className="text-xs font-bold text-slate-900 mt-0.5">
                              {isEasyReadMode ? simplifySchoolTitle(dest.nombre) : dest.nombre}
                            </div>
                            <p className="text-xs text-slate-700 mt-1 leading-snug">{formatText(dest.detallesApoyo || '')}</p>
                          </div>

                          <div className="shrink-0 text-right">
                            {dest.tieneMismoApoyo === true ? (
                              <span className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded block">
                                Apoyo Específico
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-slate-700 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded block">
                                Apoyo Ordinario
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs font-medium text-emerald-950 bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-lg">
                      {isIntegrated
                        ? 'Centro integrado completo: Sin cambio de centro requerido hasta 4.º de ESO (mantiene recursos de aula).'
                        : 'Modalidad continuada en el propio centro.'}
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
