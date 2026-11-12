/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Vista de Fuentes, Vigencia y Limitaciones (Sección 2 y 6)
 */

import React from 'react';
import { OFFICIAL_SOURCES_INFO, LEGAL_DISCLAIMER } from '../data/disclaimerAndProcedures';
import { ShieldCheck, BookOpen, ExternalLink, Scale, AlertTriangle } from 'lucide-react';
import { OFFICIAL_TEA_SOURCE } from '../data/officialTea';

export const SourcesView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Declaración Jurídica e Institucional */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <Scale className="w-6 h-6 text-blue-900" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-blue-900 block mb-1">
              Régimen Jurídico y Función de la Aplicación
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
              Aviso Legal, Función y Limitaciones
            </h2>
            <div className="mt-3 p-3 bg-slate-900 text-white rounded-xl text-xs font-semibold">
              <span className="text-amber-300 mr-1.5">Declaración obligatoria:</span>
              {LEGAL_DISCLAIMER}
            </div>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Madrid Educa Apoyo es una herramienta cívica y orientadora desarrollada para facilitar a las familias 
              la localización transparente de centros con atención preferente formalmente publicada en los boletines 
              y catálogos oficiales de la Comunidad de Madrid. No sustituye la labor de los Equipos de Orientación Educativa 
              y Psicopedagógica (EOEP) ni garantiza la concesión de plaza escolar en los procesos ordinarios o extraordinarios de admisión.
            </p>
          </div>
        </div>
      </div>

      {/* Datos realmente cargados en esta versión */}
      <div className="bg-white border border-emerald-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <span>Datos cargados en esta versión</span>
        </h3>

        <div className="border border-emerald-200 bg-emerald-50/60 rounded-xl p-4 text-xs text-slate-700 space-y-2">
          <div className="font-extrabold text-slate-900">
            Oficial · {OFFICIAL_TEA_SOURCE.totalCentros} centros de atención preferente TEA
          </div>
          <p className="leading-relaxed">
            {OFFICIAL_TEA_SOURCE.organismo}. «{OFFICIAL_TEA_SOURCE.titulo}», curso {OFFICIAL_TEA_SOURCE.curso},
            información a {OFFICIAL_TEA_SOURCE.fechaInformacion}.
          </p>
          <p className="leading-relaxed">
            <span className="font-semibold">Alcance:</span> no es el catálogo completo. El documento recoge los centros
            preferentes TEA en los que el aula de apoyo atendía a menos de cinco alumnos en esa fecha, es decir, centros
            con plazas previsibles para la admisión de ese curso. Por eso se muestran como «por comprobar vigencia» (A2).
          </p>
          <p className="leading-relaxed">
            <span className="font-semibold">Ubicaciones aproximadas:</span> el documento no publica direcciones. Cada centro
            se sitúa en el centro de su municipio (geometrías del Instituto Geográfico Nacional) o de su distrito de Madrid,
            por lo que las distancias son orientativas.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <a href={OFFICIAL_TEA_SOURCE.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-800 hover:underline inline-flex items-center gap-1">
              Documento oficial (PDF) <ExternalLink className="w-3 h-3" />
            </a>
            <a href={OFFICIAL_TEA_SOURCE.listadoCompletoUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-800 hover:underline inline-flex items-center gap-1">
              Listado completo en comunidad.madrid <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="border border-slate-200 bg-slate-50/80 rounded-xl p-4 text-xs text-slate-700">
          <div className="font-extrabold text-slate-900 mb-1">Compromiso de datos 100% reales y verificados</div>
          <p className="leading-relaxed">
            Esta herramienta aplica un principio deontológico estricto: <strong>cero datos inventados o simulados</strong>.
            Actualmente incorpora los 336 centros de atención preferente TEA oficiales publicados por la Comunidad de Madrid.
            Para el resto de necesidades educativas, dado que la administración educativa no ha liberado aún catálogos descargables
            equivalentes, la aplicación no inventa centros sintéticos y redirige a las familias a los canales oficiales y EOEP.
          </p>
        </div>
      </div>

      {/* Jerarquía de Fuentes (Sección 2 del Prompt Maestro) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-700" />
          <span>Regla de Prioridad de Fuentes Oficiales (Sección 2)</span>
        </h3>

        <div className="space-y-3">
          {OFFICIAL_SOURCES_INFO.map(src => (
            <div key={src.prioridad} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {src.prioridad}
                </span>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">{src.organismo}</div>
                  <p className="text-xs text-slate-600 mt-0.5">{src.descripcion}</p>
                </div>
              </div>

              <div className="shrink-0 text-left sm:text-right">
                <span className="inline-block text-[11px] font-mono font-medium text-blue-900 bg-blue-50 border border-blue-200 px-2 py-1 rounded">
                  {src.ambito}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Niveles de Evidencia: A1 y A2 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <span>Criterio de Evidencia Documental (Sección 4)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
            <div className="font-extrabold text-emerald-950 text-sm mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Nivel A1: Confirmado Oficial Vigente</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Cumple la triple condición reglamentaria: <span className="font-semibold">necesidad nominal + etapa confirmada + oferta educativa vigente</span>. El centro cuenta con resolución expresa publicada en el BOCM o catálogo general de la CAM con dotación presupuestaria y de plantilla docente específica (PT/AL/TIS).
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
            <div className="font-extrabold text-amber-950 text-sm mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Nivel A2: En Comprobación / Expediente</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Cumple: <span className="font-semibold">necesidad nominal con etapa o vigencia administrativa por comprobar</span>. Aplica a proyectos en trámite de ampliación a Secundaria, unidades de concertada en renovación singular de cupo o centros en proceso de dotación.
            </p>
          </div>
        </div>
      </div>

      {/* Enlaces de Interés Oficial */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-xs text-slate-600 space-y-2">
        <div className="font-bold text-slate-900 mb-1">Portales Oficiales de Consulta:</div>
        <ul className="space-y-1.5">
          <li>
            <a
              href="https://www.comunidad.madrid/servicios/educacion/atencion-diferencias-individuales"
              target="_blank"
              rel="noreferrer"
              className="text-blue-900 hover:underline inline-flex items-center gap-1 font-medium"
            >
              <span>Comunidad de Madrid · Atención a las Diferencias Individuales</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </li>
          <li>
            <a
              href="https://www.comunidad.madrid/servicios/educacion/admision-alumnos-educacion-infantil-primaria-especial-secundaria-obligatoria-bachillerato"
              target="_blank"
              rel="noreferrer"
              className="text-blue-900 hover:underline inline-flex items-center gap-1 font-medium"
            >
              <span>Comunidad de Madrid · Proceso de Admisión de Alumnos</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </li>
          <li>
            <a
              href="https://geoportal.madrid.es/"
              target="_blank"
              rel="noreferrer"
              className="text-blue-900 hover:underline inline-flex items-center gap-1 font-medium"
            >
              <span>Ayuntamiento de Madrid · Geoportal de Equipamientos Educativos</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};
