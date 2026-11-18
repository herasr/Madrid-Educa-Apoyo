/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Límite de errores React (ErrorBoundary) para fallos inesperados o de carga de chunks.
 */

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Error inesperado al renderizar la interfaz.'
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Error capturado por ErrorBoundary:', error, info);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, errorMessage: null });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        role="alert"
        className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6"
      >
        <div className="max-w-lg w-full bg-white border border-rose-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">
                No se pudo mostrar esta vista
              </h1>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                Se ha producido un fallo inesperado o un recurso diferido quedó desactualizado tras una nueva publicación.
              </p>
            </div>
          </div>

          {this.state.errorMessage && (
            <p className="text-xs font-mono bg-slate-100 border border-slate-200 rounded-lg p-3 text-slate-800 break-words">
              {this.state.errorMessage}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Recargar aplicación</span>
            </button>
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }
}
