/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modal de Ficha Completa y Desglose Oficial:
 * "¿Por qué aparece este centro?"
 * Con desglose de BOCM, código oficial de 8 dígitos, etapas, recursos y adscripción.
 */

import React from 'react';
import { School, SearchState } from '../types';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  FileText,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  GitCompare,
  BookmarkCheck,
  Check,
  Building,
  GraduationCap
} from 'lucide-react';
import { LEGAL_DISCLAIMER } from '../data/disclaimerAndProcedures';
import { SchoolMiniMap } from './SchoolMiniMap';

interface SchoolDetailModalProps {
  school: School | null;
  state: SearchState;
  isOpen: boolean;
  initialTab?: 'why' | 'details' | 'continuity';
  isCompared: boolean;
  isInPassport: boolean;
  onClose: () => void;
  onToggleCompare: (school: School) => void;
  onTogglePassport: (school: School) => void;
}

export const SchoolDetailModal: React.FC<SchoolDetailModalProps> = ({
  school,
  state,
  isOpen,
  initialTab = 'details',
  isCompared,
  isInPassport,
  onClose,
  onToggleCompare,
  onTogglePassport
}) => {
  const [activeTab, setActiveTab] = React.useState<'why' | 'details' | 'continuity'>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, school]);

  if (!isOpen || !school) return null;

  const currentSupport = state.need
    ? school.apoyos.find(a => a.needId === state.need) || school.apoyos[0]
    : school.apoyos[0];

  const evidenceLevel = currentSupport?.evidencia || 'A1';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-school-title"
      >
        {/* Cabecera del Modal */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="font-mono text-slate-700 font-bold">Cód. Oficial: {school.codigo}</span>
              <span>·</span>
              <span className="capitalize">{school.titularidad === 'publico' ? 'Centro Público' : 'Privado Concertado'}</span>
              <span>·</span>
              <span>{school.tipo}</span>
            </div>

            <h2 id="modal-school-title" className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
              {school.nombre}
            </h2>

            <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {school.direccion}, {school.codigoPostal} · {school.municipio} {school.distrito ? `(${school.distrito})` : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pestañas de navegación interna del modal */}
        <div className="flex items-center px-4 sm:px-6 border-b border-slate-200 bg-white gap-3 sm:gap-6 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('why')}
            className={`py-3 border-b-2 cursor-pointer flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'why'
                ? 'border-blue-700 text-blue-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
            <span>Evidencia (¿Por qué?)</span>
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 cursor-pointer flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'details'
                ? 'border-blue-700 text-blue-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Ficha y Servicios</span>
          </button>

          <button
            onClick={() => setActiveTab('continuity')}
            className={`py-3 border-b-2 cursor-pointer flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'continuity'
                ? 'border-blue-700 text-blue-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Continuidad ESO</span>
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          {/* TAB 1: ¿POR QUÉ APARECE ESTE CENTRO? */}
          {activeTab === 'why' && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {evidenceLevel === 'A1' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Evidencia A1: Confirmado Oficial Vigente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Evidencia A2: En Comprobación Administrativa
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Corte: {currentSupport?.fechaCorte}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Justificación de Inclusión en el Buscador Oficial
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {currentSupport?.detallesResolucion}
                </p>
              </div>

              {/* Datos de publicación oficial */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Fuente y Soporte Documental
                </h4>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-slate-400 font-medium">Organismo Emisor:</dt>
                    <dd className="font-semibold text-slate-800 mt-0.5">{currentSupport?.fuenteOficial}</dd>
                  </div>

                  <div>
                    <dt className="text-slate-400 font-medium">Resolución Oficial:</dt>
                    <dd className="font-semibold text-slate-800 mt-0.5">{currentSupport?.resolucionBOCM || 'Catálogo General CAM'}</dd>
                  </div>

                  <div>
                    <dt className="text-slate-400 font-medium">Unidad / Aula de Apoyo:</dt>
                    <dd className="font-semibold text-slate-800 mt-0.5">{currentSupport?.aulaNombre}</dd>
                  </div>

                  <div>
                    <dt className="text-slate-400 font-medium">Etapas con Apoyo Dotado:</dt>
                    <dd className="font-semibold text-blue-900 mt-0.5 uppercase">
                      {currentSupport?.etapasConApoyo.join(', ')}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Dotación de Recursos Profesionales */}
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Dotación de Personal Especializado Asignado
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {currentSupport?.recursosOficiales.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-700 font-bold shrink-0 mt-0.5">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recordatorio de procedimiento */}
              <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 border border-slate-200">
                <h5 className="font-bold text-slate-900 mb-1">Requisitos para la Asignación de Plaza</h5>
                <p className="leading-relaxed">
                  Para acceder a los recursos de aula de apoyo de este centro es preceptivo disponer del Dictamen de Escolarización 
                  emitido por el Equipo de Orientación Educativa y Psicopedagógica (EOEP) o Departamento de Orientación competente, 
                  con la propuesta de centro de atención preferente validada en el proceso de admisión oficial de la Comunidad de Madrid.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: DETALLES, SERVICIOS Y ACCESIBILIDAD */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              {/* Etapas autorizadas */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Etapas Educativas Impartidas
                </h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  {school.etapas.map(st => (
                    <span key={st} className="bg-slate-100 text-slate-800 font-medium px-2.5 py-1 rounded-md border border-slate-200">
                      {st === 'infantil' ? 'Educación Infantil' :
                       st === 'primaria' ? 'Educación Primaria' :
                       st === 'eso' ? 'E.S.O.' :
                       st === 'bachillerato' ? 'Bachillerato' : 'FP Básica'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Servicios */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Servicios Complementarios
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'Comedor escolar', active: school.servicios.comedor },
                    { label: 'Transporte escolar adaptado', active: school.servicios.transporte },
                    { label: 'Enfermería escolar jornada completa', active: school.servicios.enfermeria },
                    { label: 'Aula matinal / Primeros del cole', active: school.servicios.aula_matinal },
                    { label: 'Actividades extraescolares adaptadas', active: school.servicios.actividades_extraescolares }
                  ].map((srv, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50/50">
                      <span className="text-slate-800">{srv.label}</span>
                      <span className={`font-semibold ${srv.active ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {srv.active ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accesibilidad Física */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Accesibilidad Arquitectónica y Sensorial
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'Acceso a cota cero / Rampa reglamentaria', active: school.accesibilidad.acceso_fisico },
                    { label: 'Ascensor adaptado a silla de ruedas', active: school.accesibilidad.ascensor },
                    { label: 'Aseos higiénicos accesibles', active: school.accesibilidad.bano_adaptado },
                    { label: 'Bucle de inducción magnética', active: school.accesibilidad.bucle_magnetico },
                    { label: 'Itinerarios y planos podotáctiles', active: school.accesibilidad.plano_podotactil }
                  ].map((acc, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50/50">
                      <span className="text-slate-800">{acc.label}</span>
                      <span className={`font-semibold ${acc.active ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {acc.active ? 'Verificado' : 'No acreditado'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Datos de Contacto */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Datos de Contacto del Centro
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{school.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{school.email}</span>
                  </div>
                  {school.web && (
                    <div className="flex items-center gap-2 col-span-2 text-blue-900 font-medium">
                      <ExternalLink className="w-4 h-4 text-blue-700" />
                      <a href={school.web} target="_blank" rel="noreferrer" className="hover:underline truncate">
                        {school.web}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Ubicación y Mapa Georreferenciado */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Ubicación Georreferenciada (OpenStreetMap)
                </h4>
                <SchoolMiniMap school={school} height="200px" />
              </div>
            </div>
          )}

          {/* TAB 3: CONTINUIDAD PRIMARIA - SECUNDARIA */}
          {activeTab === 'continuity' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Transición Escolar y Continuidad del Apoyo
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed mb-3">
                  {school.continuidad.descripcion}
                </p>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Evaluación oficial:</span>
                  <span className={`font-bold ${
                    school.continuidad.apoyoEnSecundariaVerificado === true
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}>
                    {school.continuidad.apoyoEnSecundariaVerificado === true
                      ? 'Continuidad de apoyo específica verificada en catálogo'
                      : 'Continuidad no verificada documentalmente (nunca inexistencia afirmada)'}
                  </span>
                </div>
              </div>

              {/* Centros de destino adscritos */}
              {school.continuidad.destinos.length > 0 ? (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Institutos de Educación Secundaria (IES) de Adscripción
                  </h4>
                  <div className="space-y-2">
                    {school.continuidad.destinos.map((dest, i) => (
                      <div key={i} className="border border-slate-200 rounded-xl p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-mono text-slate-700 font-semibold">Cód. {dest.codigo}</span>
                            <span>·</span>
                            <span>{dest.etapa}</span>
                            {dest.distanciaKm && (
                              <>
                                <span>·</span>
                                <span className="font-mono text-blue-900 font-medium">{dest.distanciaKm} km</span>
                              </>
                            )}
                          </div>
                          <div className="text-sm font-bold text-slate-900 mt-0.5">{dest.nombre}</div>
                          <p className="text-xs text-slate-600 mt-1">{dest.detallesApoyo}</p>
                        </div>

                        <div className="shrink-0">
                          {dest.tieneMismoApoyo === true ? (
                            <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                              Apoyo TEA/Apoyo Específico
                            </span>
                          ) : (
                            <span className="inline-block text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded">
                              Apoyo Ordinario D.O.
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                  <div className="font-bold mb-1">Centro Integrado (CEIPSO o Colegio con Secundaria):</div>
                  <p>
                    El alumno no precisa cambiar de centro al finalizar Primaria; puede cursar la etapa de Educación Secundaria Obligatoria 
                    dentro del mismo recinto escolar manteniendo su equipo de apoyo.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pie del modal con acciones */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {LEGAL_DISCLAIMER}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onTogglePassport(school)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                isInPassport
                  ? 'bg-emerald-700 text-white border-emerald-800'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>{isInPassport ? 'En Pasaporte' : 'Guardar en Pasaporte'}</span>
            </button>

            <button
              onClick={() => onToggleCompare(school)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                isCompared
                  ? 'bg-blue-700 text-white border-blue-800'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span>{isCompared ? 'En Comparador' : 'Comparar'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
