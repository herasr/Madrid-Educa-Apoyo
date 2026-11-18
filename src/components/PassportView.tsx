/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Pasaporte Local para Familias
 * Incluye:
 * - Filtros aplicados y fecha de emisión
 * - Centros seleccionados con evidencia oficial (A1/A2), dirección, teléfono y fuentes
 * - Rutas de continuidad escolar hacia ESO
 * - Notas locales de la familia (solo en el navegador, sin envío a servidores)
 * - Cuestionario de preguntas recomendadas para la visita/entrevista escolar
 * - Imprimible / PDF
 */

import React from 'react';
import { School, SearchState } from '../types';
import {
  Printer,
  BookmarkCheck,
  Calendar,
  HelpCircle,
  Trash2,
  FileEdit,
  Lock
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
      if (!stored) return {};
      const parsed: unknown = JSON.parse(stored);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return {};
      }
      const clean: Record<string, string> = {};
      for (const [key, val] of Object.entries(parsed)) {
        if (typeof val === 'string') {
          clean[key] = val;
        }
      }
      return clean;
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
          <BookmarkCheck className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="text-lg font-bold text-slate-900 mb-1">
          Tu Pasaporte Local está vacío
        </h1>
        <p className="text-xs text-slate-700 max-w-md mx-auto mb-6 leading-relaxed">
          Guarda centros educativos en tu Pasaporte desde la ficha de cada centro para generar un cuaderno personal imprimible con la evidencia oficial, los datos de contacto, la ruta de continuidad y la guía de preguntas clave para tu visita.
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
          <div className="text-lg font-bold text-slate-900">
            Pasaporte Local de Orientación Escolar
          </div>
          <p className="text-xs text-slate-700">
            Dossier personal orientativo generado para la familia · Listo para imprimir o llevar en el móvil a la visita
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span>Imprimir Dossier / PDF</span>
          </button>

          <button
            type="button"
            onClick={onClearPassport}
            className="p-2 text-slate-600 hover:text-red-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Vaciar pasaporte"
            title="Vaciar pasaporte"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* DOCUMENTO IMPRIMIBLE ORIENTATIVO */}
      <div className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-10 shadow-sm print:border-none print:shadow-none print:p-0 space-y-8">
        {/* Cabecera del Documento */}
        <div className="border-b-2 border-slate-900 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-blue-900 block mb-1">
                Proyecto Cívico DataMad 2026 · Cuaderno de Orientación para Familias
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Pasaporte Local de Centros y Apoyos
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-700 mt-1">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Fecha de emisión: {currentDate}</span>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="inline-block text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 px-3 py-1 rounded">
                Datos Abiertos CAM + TEA + Aulas de Enlace + Ayto. Madrid
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-50/70 rounded-lg border border-amber-300 text-xs text-slate-900 font-medium">
            <span className="font-bold text-slate-900 mr-1.5">Aviso orientativo (no es un documento oficial):</span>
            {LEGAL_DISCLAIMER}
          </div>
        </div>

        {/* 1. Instantánea de Filtros Aplicados */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            1. Criterios y Filtros Aplicados en la Consulta
          </h2>
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-slate-600 font-medium block">Necesidad Educativa:</span>
              <span className="font-bold text-slate-900">
                {state.need === 'tea'
                  ? 'Atención Preferente TEA'
                  : state.need === 'educacion_especial'
                  ? 'Educación Especial (CEE)'
                  : state.need === 'salud_hospitalaria'
                  ? 'Atención Hospitalaria'
                  : state.need === 'visual'
                  ? 'Discapacidad Visual (EOEP / ONCE)'
                  : state.need === 'altas_capacidades'
                  ? 'Altas Capacidades (CREACIM / PEAC)'
                  : state.need === 'auditiva'
                  ? 'Discapacidad Auditiva (EOEP Específico)'
                  : state.need === 'motora'
                  ? 'Discapacidad Motora (EOEP Específico)'
                  : state.need === 'tdah'
                  ? 'TDAH y Dificultades (EOEP Específico)'
                  : state.need === 'tel_lenguaje'
                  ? 'Trastorno del Lenguaje (EOEP Específico)'
                  : state.need === 'compensatoria'
                  ? 'Escuelas de Bienvenida (Aulas de Enlace)'
                  : 'Todo el catálogo (TEA, Enlace, CEE, Hosp., Visual, AACC y EOEP)'}
              </span>
            </div>

            <div>
              <span className="text-slate-600 font-medium block">Etapas Seleccionadas:</span>
              <span className="font-bold text-slate-900">
                {state.stages.length > 0
                  ? state.stages
                      .map(st =>
                        st === 'infantil'
                          ? 'Infantil'
                          : st === 'primaria'
                          ? 'Primaria'
                          : st === 'eso'
                          ? 'ESO'
                          : st === 'bachillerato'
                          ? 'Bachillerato'
                          : 'FP Básica'
                      )
                      .join(', ')
                  : 'Todas'}
              </span>
            </div>

            <div>
              <span className="text-slate-600 font-medium block">Ámbito Territorial:</span>
              <span className="font-bold text-slate-900">
                {state.locationSource === 'browser'
                  ? 'Tu ubicación aproximada'
                  : state.municipality || 'Toda la Comunidad de Madrid'}
                {state.district && state.locationSource !== 'browser' ? ` (${state.district})` : ''}
                {state.radiusKm ? ` · Radio ${state.radiusKm} km` : ''}
              </span>
            </div>

            <div>
              <span className="text-slate-600 font-medium block">Titularidad:</span>
              <span className="font-bold text-slate-900">
                {state.ownership.length > 0
                  ? state.ownership
                      .map(o =>
                        o === 'publico' ? 'Público' : o === 'concertado' ? 'Concertado' : 'Privado'
                      )
                      .join(', ')
                  : 'Cualquier titularidad'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Centros Guardados en el Pasaporte */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              2. Centros Educativos Seleccionados y Evidencia Documental
            </h2>
            <span className="no-print inline-flex items-center gap-1 text-xs text-slate-700 font-medium">
              <Lock className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
              Tus notas se guardan solo en tu navegador
            </span>
          </div>

          <div className="space-y-4">
            {savedSchools.map((sch, idx) => {
              const sup = state.need
                ? sch.apoyos.find(a => a.needId === state.need) || sch.apoyos[0]
                : sch.apoyos[0];
              const isA1 = sup?.evidencia === 'A1';
              const needId = sup?.needId || 'tea';
              const supportTitle =
                needId === 'educacion_especial'
                  ? 'Educación Especial (CEE)'
                  : needId === 'salud_hospitalaria'
                  ? 'Aula Hospitalaria'
                  : needId === 'visual'
                  ? 'Discapacidad Visual (EOEP / CRE ONCE)'
                  : needId === 'altas_capacidades'
                  ? 'Altas Capacidades (CREACIM / PEAC)'
                  : needId === 'auditiva'
                  ? 'Discapacidad Auditiva (EOEP Específico)'
                  : needId === 'motora'
                  ? 'Discapacidad Motora (EOEP Específico)'
                  : needId === 'tdah'
                  ? 'TDAH y Dificultades (EOEP Específico)'
                  : needId === 'tel_lenguaje'
                  ? 'Trastorno del Lenguaje (EOEP Específico)'
                  : needId === 'compensatoria'
                  ? 'Escuelas de Bienvenida · Aula de Enlace'
                  : 'Atención preferente TEA';
              const ownLabel =
                sch.titularidad === 'publico'
                  ? 'Público'
                  : sch.titularidad === 'concertado'
                  ? 'Concertado'
                  : 'Privado';

              return (
                <div key={sch.id} className="border border-slate-200 rounded-xl p-4 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-slate-700">
                        N.º {idx + 1} · Código CAM: {sch.codigo} · {ownLabel} · {sch.tipo}
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                        <button
                          type="button"
                          onClick={() => onOpenDetail(sch)}
                          className="text-left hover:text-blue-900 hover:underline cursor-pointer"
                        >
                          {sch.nombre}
                        </button>
                      </h3>
                      <div className="text-xs text-slate-700 mt-0.5">
                        {sch.direccion ? `${sch.direccion}${sch.codigoPostal ? `, ${sch.codigoPostal}` : ''} · ` : ''}
                        {sch.municipio} {sch.distrito ? `(${sch.distrito})` : ''}
                        {sch.telefono ? ` · Tel. ${sch.telefono}` : ''}
                        {sch.ubicacionAproximada ? ' · Ubicación aproximada' : ' · Datos Abiertos CAM'}
                      </div>
                      {sch.transportePublico && (
                        <div className="text-xs text-slate-700 mt-0.5">
                          <strong>Transporte público:</strong> {sch.transportePublico}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded border inline-block ${
                        isA1 ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-amber-50 text-amber-950 border-amber-300'
                      }`}>
                        {isA1 ? 'A1: Oficial Vigente' : 'A2: Oficial, comprobar vigencia'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveSchool(sch.id)}
                        className="no-print text-xs font-semibold text-slate-600 hover:text-red-700 underline cursor-pointer"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>

                  {/* Proyecto y recursos */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs mb-3">
                    <div className="font-bold text-slate-900 mb-1">
                      {supportTitle} · Fuente: {sup?.fuenteOficial || 'Comunidad de Madrid'}
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {sup?.detallesResolucion || `Etapas: ${sup?.etapasConApoyo.join(', ')}. Comprueba disponibilidad ante el SAE.`}
                    </p>
                  </div>

                  {/* Continuidad */}
                  <div className="text-xs text-slate-700 border-t border-slate-200 pt-2">
                    <span className="font-semibold text-slate-900">Ruta de Continuidad ESO: </span>
                    <span>{sch.continuidad.descripcion}</span>
                  </div>

                  {/* Notas de la Familia / Observaciones EOEP */}
                  <div className="mt-3 border-t border-slate-200 pt-2.5">
                    <label htmlFor={`note-${sch.id}`} className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                      <FileEdit className="w-3.5 h-3.5 text-slate-700 shrink-0" aria-hidden="true" />
                      <span>Mis notas para la entrevista / Informe de orientación:</span>
                    </label>
                    <textarea
                      id={`note-${sch.id}`}
                      rows={2}
                      value={notesMap[sch.id] || ''}
                      onChange={e => handleNoteChange(sch.id, e.target.value)}
                      placeholder="Escribe aquí preguntas particulares, vacantes acordadas o notas para la visita (se guarda solo en este dispositivo)..."
                      className="w-full text-xs bg-amber-50/40 border border-slate-300 rounded-lg p-2 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-700 print:bg-white"
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
            <HelpCircle className="w-5 h-5 text-blue-800" aria-hidden="true" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              3. Preguntas Recomendadas para la Entrevista con el Centro
            </h2>
          </div>
          <p className="text-xs text-slate-700 mb-4 leading-relaxed">
            Lleva este cuestionario a la jornada de puertas abiertas o a la entrevista con la jefatura de estudios y el equipo de orientación (PT / AL):
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Bloque 1: Aula de Apoyo y Tiempos */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
              <h3 className="font-bold text-blue-950 mb-2">
                A. Organización del Aula de Apoyo
              </h3>
              <ul className="space-y-2 text-slate-800">
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-800 font-bold">1.</span>
                  <span>¿Cuántos alumnos acuden actualmente al aula de apoyo simultáneamente?</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-800 font-bold">2.</span>
                  <span>¿Qué porcentaje aproximado de la jornada lectiva permanece en el aula ordinaria de referencia?</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-800 font-bold">3.</span>
                  <span>¿Realiza el maestro PT o AL apoyos dentro del aula ordinaria (codocencia)?</span>
                </li>
              </ul>
            </div>

            {/* Bloque 2: Comunicación y Sistemas Aumentativos */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
              <h3 className="font-bold text-blue-950 mb-2">
                B. Metodología y Comunicación
              </h3>
              <ul className="space-y-2 text-slate-800">
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-800 font-bold">4.</span>
                  <span>¿Qué sistemas aumentativos/alternativos de comunicación (SAAC/pictogramas/bimodal) están implantados en los pasillos y aulas comunes?</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-800 font-bold">5.</span>
                  <span>¿Cómo se estructura la anticipación visual y las transiciones entre materias?</span>
                </li>
              </ul>
            </div>

            {/* Bloque 3: Tiempos no lectivos (Patios y Comedor) */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
              <h3 className="font-bold text-blue-950 mb-2">
                C. Patios, Comedor y Enfermería
              </h3>
              <ul className="space-y-2 text-slate-800">
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-800 font-bold">6.</span>
                  <span>¿Hay proyecto de patios dinámicos o recreos estructurados con monitor/TIS de apoyo?</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-800 font-bold">7.</span>
                  <span>¿Qué personal acompaña al alumno durante el servicio de comedor escolar?</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-800 font-bold">8.</span>
                  <span>¿La enfermera escolar está presente durante toda la jornada o de forma compartida?</span>
                </li>
              </ul>
            </div>

            {/* Bloque 4: Transición y Coordinación Externa */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
              <h3 className="font-bold text-blue-950 mb-2">
                D. Coordinación Externa y Continuidad
              </h3>
              <ul className="space-y-2 text-slate-800">
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-800 font-bold">9.</span>
                  <span>¿Existe cauce de coordinación regular con terapeutas externos (Centro Base, Atención Temprana o gabinetes)?</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-800 font-bold">10.</span>
                  <span>¿Cómo se articula el traspaso de información con el IES de adscripción al terminar Primaria?</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pie con Fuentes Oficiales */}
        <div className="border-t border-slate-200 pt-4 text-xs text-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Fuentes: Comunidad de Madrid (TEA 2024/25 y Aulas de Enlace 2026/27), Datos Abiertos CAM (CC BY 4.0) y Ayto. Madrid.</span>
          <span>Proyecto DataMad 2026 · Madrid Educa Apoyo</span>
        </div>
      </div>
    </div>
  );
};
