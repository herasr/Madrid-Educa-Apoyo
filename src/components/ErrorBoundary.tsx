/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Límite de errores React (ErrorBoundary) con recuperación real de chunks diferidos.
 */

import React, { Fragment } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
  resetKey: number;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: null,
    resetKey: 0
  };

  static getDerivedStateFromError(error: unknown): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : String(error || 'Error inesperado al renderizar la interfaz.')
    };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    console.error('Error capturado por ErrorBoundary:', error, info.componentStack);
  }

  handleRetry = (): void => {
    this.setState(prev => ({
      hasError: false,
      errorMessage: null,
      resetKey: prev.resetKey + 1
    }));
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return <Fragment key={this.state.resetKey}>{this.props.children}</Fragment>;
    }

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6"
      >
        <div className="max-w-lg w-full bg-white border border-rose-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1
                tabIndex={-1}
                ref={node => node?.focus()}
                className="text-lg font-extrabold text-slate-900 outline-none"
              >
                No se pudo mostrar esta vista
              </h1>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                Puede deberse a una conexión intermitente o a una nueva publicación mientras navegabas. Reintenta la carga o recarga la página.
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
              onClick={this.handleRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reintentar</span>
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Recargar página
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
