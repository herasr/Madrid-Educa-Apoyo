/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modal de Verificación de la Batería de Pruebas (FIL-001 a FIL-012)
 */

import React from 'react';
import { TestScenario } from '../types';
import { TEST_SCENARIOS } from '../data/testScenarios';
import { X, Play } from 'lucide-react';
import { useModalFocusTrap } from '../utils/useModalFocusTrap';

interface TestScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunTest: (test: TestScenario) => void;
}

export const TestScenariosModal: React.FC<TestScenariosModalProps> = ({
  isOpen,
  onClose,
  onRunTest
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  useModalFocusTrap(isOpen, modalRef, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] focus:outline-none focus:ring-2 focus:ring-blue-700"
        role="dialog"
        aria-modal="true"
        aria-labelledby="test-modal-title"
      >
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900 block mb-0.5">
              Validación Técnica · Proyecto DataMad 2026
            </span>
            <h2 id="test-modal-title" className="text-xl font-extrabold text-slate-900">
              Batería de Escenarios de Prueba (FIL-001 a FIL-012)
            </h2>
            <p className="text-xs text-slate-700 mt-0.5">
              Haz clic en cualquiera de los escenarios para cargar los filtros y verificar el comportamiento del motor.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto divide-y divide-slate-200 space-y-3">
          {TEST_SCENARIOS.map(test => (
            <div
              key={test.id}
              className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    {test.code}
                  </span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    {test.titulo}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-snug">
                  {test.descripcion}
                </p>
                <div className="text-xs text-slate-700 mt-1 flex items-start gap-1 font-medium">
                  <span className="text-emerald-800 font-bold shrink-0">Esperado:</span>
                  <span>{test.esperado}</span>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onRunTest(test);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Probar escenario</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-800 bg-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
