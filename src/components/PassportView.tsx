/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Pasaporte Local para Familias (Sección 6, Anexo N.8 y FIL-010)
 * Incluye:
 * - Filtros aplicados y fecha de generación
 * - Centros seleccionados con evidencia oficial (A1/A2) y fuentes
 * - Rutas de continuidad escolar hacia ESO
 * - Cuestionario de preguntas recomendadas para la visita/entrevista escolar
 * - Imprimible / Exportable
 */

import React from 'react';
import { School, SearchState } from '../types';
import {
  Printer,
  BookmarkCheck,
  ShieldCheck,
  MapPin,
  Calendar,
  CheckCircle,
  HelpCircle,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { LEGAL_DISCLAIMER } from '../data/disclaimerAndProcedures';

interface PassportViewProps {
  savedSchools: School[];
  state: SearchState;
  onRemoveSchool: (schoolId: string) => void;
  onClearPassport: () => void;
  onOpenDetail: (school: School) => void;
  onGoToSearch: () => void;
}

export const PassportView: React.FC<PassportViewProps> = ({
  savedSchools,
  state,
  onRemoveSchool,
  onClearPassport,
  onOpenDetail,
  onGoToSearch
}) => {
  const [notesMap, setNotesMap] = React.useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('madrid_educa_passport_notes');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const handleNoteChange = (schoolId: string, note: string) => {
    setNotesMap(prev => {
      const updated = { ...prev, [schoolId]: note };
      try {
        localStorage.setItem('madrid_educa_passport_notes', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage error saving notes:', e);
      }
      return updated;
    });
  };

  const currentDate = new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(new Date());

  const handlePrint = () => {
    window.print();
  };

  if (savedSchools.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-2xl mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-4">
          <BookmarkCheck className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Tu Pasaporte Local está vacío
        </h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
          Guarda centros educativos en tu Pasaporte desde la ficha de cada centro para generar un dossier imprimible con la evidencia oficial, la ruta de continuidad y la guía de preguntas clave para tu entrevista con el centro.
        </p>
        <button
          type="button"
          onClick={onGoToSearch}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          <span>Ir al Buscador</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Botonera de control superior (oculta al imprimir) */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Pasaporte Local de Orientación Escolar
          </h2>
          <p className="text-xs text-slate-500">
            Dossier oficial generado para las familias · Listo para imprimir o llevar en el móvil a la visita
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Dossier / PDF</span>
          </button>

          <button
            type="button"
            onClick={onClearPassport}
            className="p-2 text-slate-500 hover:text-red-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Vaciar pasaporte"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DOCUMENTO IMPRIMIBLE OFICIAL */}
      <div className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-10 shadow-sm print:border-none print:shadow-none print:p-0 space-y-8">
        {/* Cabecera del Documento */}
        <div className="border-b-2 border-slate-900 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-blue-900 block mb-1">
                Comunidad de Madrid · Orientación Educativa
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Pasaporte Local de Centros y Apoyos
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Fecha de emisión: {currentDate}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1 rounded">
                Catálogo Oficial v2.4 (Curso 2025/2026)
              </span>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 font-medium">
            <span className="font-bold text-slate-900 mr-1.5">Aviso vinculante:</span>
            {LEGAL_DISCLAIMER}
          </div>
        </div>

        {/* 1. Instantánea de Filtros Aplicados */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            1. Criterios y Filtros Aplicados en la Consulta
          </h2>
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-slate-400 font-medium block">Necesidad Educativa:</span>
              <span className="font-bold text-slate-900">
                {state.need === 'tea' ? 'Trastorno del Espectro Autista (TEA)' :
                 state.need === 'auditiva' ? 'Discapacidad Auditiva' :
                 state.need === 'motora' ? 'Discapacidad Motora' :
                 state.need === 'educacion_especial' ? 'Educación Especial (CEE)' :
                 'Atención Inclusiva'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Etapas Seleccionadas:</span>
              <span className="font-bold text-slate-900">
                {state.stages.join(', ') || 'Todas'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Ámbito Territorial:</span>
              <span className="font-bold text-slate-900">
                {state.municipality || 'Toda la Comunidad de Madrid'} 
                {state.district ? ` (${state.district})` : ''} 
                {state.radiusKm ? ` · Radio ${state.radiusKm} km` : ''}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Servicios Obligatorios:</span>
              <span className="font-bold text-slate-900">
                {state.requiredServices.length > 0 ? state.requiredServices.join(', ') : 'Sin exclusión'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Centros Guardados en el Pasaporte */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            2. Centros Educativos Seleccionados y Evidencia Acreditada
          </h2>

          <div className="space-y-4">
            {savedSchools.map((sch, idx) => {
              const sup = sch.apoyos[0];
              const isA1 = sup?.evidencia === 'A1';

              return (
                <div key={sch.id} className="border border-slate-200 rounded-xl p-4 bg-white relative">
                  <div className="no-print absolute top-3 right-3">
                    <button
                      type="button"
                      onClick={() => onRemoveSchool(sch.id)}
                      className="text-xs text-slate-400 hover:text-red-700 cursor-pointer"
                    >
                      Quitar
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="text-[11px] font-mono text-slate-500">
                        N.º {idx + 1} · Código CAM: {sch.codigo} · {sch.titularidad === 'publico' ? 'Público' : 'Concertado'} · {sch.tipo}
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                        {sch.nombre}
                      </h3>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {sch.direccion} · {sch.municipio} {sch.distrito ? `(${sch.distrito})` : ''} · Tel. {sch.telefono}
                      </div>
                    </div>

                    <div className="shrink-0 text-right pr-6 sm:pr-0">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border inline-block ${
                        isA1 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {isA1 ? 'A1: Oficial Vigente' : 'A2: En Comprobación'}
                      </span>
                    </div>
                  </div>

                  {/* Proyecto y recursos */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs mb-3">
                    <div className="font-bold text-slate-800 mb-1">
                      {sup?.aulaNombre || 'Aula Específica'} (Resolución: {sup?.resolucionBOCM || 'BOCM'})
                    </div>
                    <ul className="text-slate-600 space-y-0.5">
                      {sup?.recursosOficiales.map((r, i) => (
                        <li key={i}>• {r}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Continuidad */}
                  <div className="text-xs text-slate-600 border-t border-slate-100 pt-2">
                    <span className="font-semibold text-slate-800">Ruta de Continuidad ESO: </span>
                    <span>{sch.continuidad.descripcion}</span>
                  </div>

                  {/* Notas de la Familia / Observaciones EOEP */}
                  <div className="mt-3 border-t border-slate-100 pt-2.5">
                    <label htmlFor={`note-${sch.id}`} className="block text-[11px] font-bold text-slate-700 mb-1">
                      📝 Mis notas para la entrevista / Informe de orientación:
                    </label>
                    <textarea
                      id={`note-${sch.id}`}
                      rows={2}
                      value={notesMap[sch.id] || ''}
                      onChange={e => handleNoteChange(sch.id, e.target.value)}
                      placeholder="Escribe aquí preguntas particulares, vacantes acordadas o notas para la visita..."
                      className="w-full text-xs bg-amber-50/40 border border-slate-200 rounded-lg p-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 print:bg-white"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Guía de Preguntas Recomendadas para Familias */}
        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-5 h-5 text-blue-700" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              3. Preguntas Recomendadas para la Entrevista con el Centro
            </h2>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Lleva este cuestionario a la jornada de puertas abiertas o a la entrevista con la jefatura de estudios y el equipo de orientación (PT / AL):
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Bloque 1: Aula de Apoyo y Tiempos */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
              <h4 className="font-bold text-slate-900 mb-2 text-blue-950">
                A. Organización del Aula de Apoyo
              </h4>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>¿Cuántos alumnos acuden actualmente al aula de apoyo simultáneamente?</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>¿Qué porcentaje aproximado de la jornada lectiva permanece en el aula ordinaria de referencia?</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>¿Realiza el maestro PT o AL apoyos dentro del aula ordinaria (codocencia)?</span>
                </li>
              </ul>
            </div>

            {/* Bloque 2: Comunicación y Sistemas Aumentativos */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
              <h4 className="font-bold text-slate-900 mb-2 text-blue-950">
                B. Metodología y Comunicación
              </h4>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-600 font-bold">4.</span>
                  <span>¿Qué sistemas aumentativos/alternativos de comunicación (SAAC/pictogramas/bimodal) están implantados en los pasillos y aulas comunes?</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-600 font-bold">5.</span>
                  <span>¿Cómo se estructura la anticipación visual y las transiciones entre materias?</span>
                </li>
              </ul>
            </div>

            {/* Bloque 3: Tiempos no lectivos (Patios y Comedor) */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
              <h4 className="font-bold text-slate-900 mb-2 text-blue-950">
                C. Patios, Comedor y Enfermería
              </h4>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-600 font-bold">6.</span>
                  <span>¿Hay proyecto de patios dinámicos o recreos estructurados con monitor/TIS de apoyo?</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-600 font-bold">7.</span>
                  <span>¿Qué personal acompaña al alumno durante el servicio de comedor escolar?</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-600 font-bold">8.</span>
                  <span>¿La enfermera escolar está presente durante toda la jornada o de forma compartida?</span>
                </li>
              </ul>
            </div>

            {/* Bloque 4: Transición y Coordinación Externa */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
              <h4 className="font-bold text-slate-900 mb-2 text-blue-950">
                D. Coordinación Externa y Continuidad
              </h4>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-600 font-bold">9.</span>
                  <span>¿Existe cauce de coordinación regular con terapeutas externos (Centro Base, Atención Temprana o gabinetes)?</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-600 font-bold">10.</span>
                  <span>¿Cómo se articula el traspaso de información con el IES de adscripción al terminar Primaria?</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pie con Fuentes Oficiales */}
        <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Fuente: Comunidad de Madrid (Resoluciones Oficiales) y Geodatos Madrid Capital.</span>
          <span>Madrid Educa Apoyo v2.4</span>
        </div>
      </div>
    </div>
  );
};
