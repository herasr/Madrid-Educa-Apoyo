/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modal de Procedimientos y Marcos Oficiales
 * Explica cómo operan:
 * - Discapacidad Visual (EOEP Específico + Convenio ONCE)
 * - Altas Capacidades (PEAC, CREACIM y enriquecimiento curricular)
 * - Educación Especial (Modalidad CEE según dictamen de escolarización)
 */

import React from 'react';
import { X, ExternalLink, CheckCircle2 } from 'lucide-react';
import { SPECIAL_PROCEDURES, ProcedureTopic } from '../data/disclaimerAndProcedures';
import { useModalFocusTrap } from '../utils/useModalFocusTrap';

interface OfficialProceduresModalProps {
  topic: ProcedureTopic | null;
  onClose: () => void;
}

export const OfficialProceduresModal: React.FC<OfficialProceduresModalProps> = ({
  topic,
  onClose
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  useModalFocusTrap(Boolean(topic), modalRef, onClose);

  if (!topic) return null;

  const data = SPECIAL_PROCEDURES[topic];
  if (!data) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-700"
        role="dialog"
        aria-modal="true"
        aria-labelledby="procedure-modal-title"
      >
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900 block mb-1">
              Guía de Procedimiento · Comunidad de Madrid
            </span>
            <h2 id="procedure-modal-title" className="text-xl font-extrabold text-slate-900 leading-tight">
              {data.titulo}
            </h2>
            <p className="text-xs text-slate-700 mt-1">{data.subtitulo}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-800 leading-relaxed max-h-[70vh] overflow-y-auto">
          {/* Resumen */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-slate-900 leading-relaxed font-medium">
            {data.resumen}
          </div>

          {/* Pasos de funcionamiento oficial */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              ¿Cómo se tramita y cómo funciona en la práctica?
            </h3>
            <ul className="space-y-2">
              {data.comoFunciona.map((paso, i) => (
                <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{paso}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto / Sede si existe */}
          {('contacto' in data) && (
            <div className="p-3 bg-slate-100 rounded-lg text-slate-800 border border-slate-200">
              <span className="font-bold text-slate-900">Sede de referencia: </span>
              {data.contacto}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs">
          <a
            href={data.tramiteEnlace}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-blue-900 hover:underline"
          >
            <span>{'tramiteEtiqueta' in data ? data.tramiteEtiqueta : 'Ver trámite en portal oficial Comunidad de Madrid'}</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-bold text-slate-800 bg-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
