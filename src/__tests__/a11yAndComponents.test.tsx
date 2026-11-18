// @vitest-environment jsdom
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Pruebas de componentes React, accesibilidad automatizada (axe-core WCAG 2A/2AA)
 * y flujo de usuario extremo a extremo (carga JSON, filtros, modal, Lectura Fácil y privacidad URL).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import axe from 'axe-core';

import { Suspense } from 'react';
import { Header } from '../components/Header';
import { FilterSidebar } from '../components/FilterSidebar';
import { SchoolDetailModal } from '../components/SchoolDetailModal';
import { ComparatorView } from '../components/ComparatorView';
import { ErrorBoundary } from '../components/ErrorBoundary';
import App from '../App';
import { computeDynamicCounts, INITIAL_SEARCH_STATE } from '../utils/filterEngine';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import { TEST_ALL_SCHOOLS } from './catalogHelper';
import { SearchState } from '../types';

vi.mock('../components/SchoolsMap', () => ({
  SchoolsMap: ({ schools }: { schools: Array<{ id: string }> }) => (
    <div role="region" aria-label="Mapa interactivo de centros educativos">
      Mapa simulado ({schools.length} centros)
    </div>
  )
}));

vi.mock('../components/SchoolMiniMap', () => ({
  SchoolMiniMap: () => <div aria-label="Mapa de ubicación del centro">MiniMapa simulado</div>
}));

async function expectNoA11yViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
    },
    rules: {
      'color-contrast': { enabled: false }
    }
  });
  expect(results.violations).toEqual([]);
}

describe('Accesibilidad automatizada (axe-core) y pruebas de componentes', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.history.replaceState({}, '', '/');
  });

  beforeEach(() => {
    window.localStorage.clear();
    window.scrollTo = vi.fn();
  });

  it('Header cumple WCAG AA, marca aria-current="page" y abre el menú Exportar en escritorio y móvil', async () => {
    const user = userEvent.setup();
    const onSelectTab = vi.fn();
    const onShareLink = vi.fn();
    const onExportCSV = vi.fn();
    const onExportJSON = vi.fn();

    const { container } = render(
      <Header
        currentTab="search"
        onSelectTab={onSelectTab}
        comparedCount={1}
        passportCount={2}
        onOpenTestModal={vi.fn()}
        onOpenLegalModal={vi.fn()}
        isEasyReadMode={false}
        onToggleEasyRead={vi.fn()}
        onShareLink={onShareLink}
        onExportCSV={onExportCSV}
        onExportJSON={onExportJSON}
      />
    );

    const searchBtns = screen.getAllByRole('button', { name: 'Buscar' });
    expect(searchBtns.some(btn => btn.getAttribute('aria-current') === 'page')).toBe(true);

    const exportBtns = screen.getAllByRole('button', { name: /Exportar/i });
    await user.click(exportBtns[0]);
    expect(screen.getByText('Copiar enlace compartible')).toBeInTheDocument();
    expect(screen.getByText('Descargar CSV')).toBeInTheDocument();

    // Escape cierra los menús desplegables de la cabecera
    await user.keyboard('{Escape}');
    expect(screen.queryByText('Copiar enlace compartible')).not.toBeInTheDocument();

    await user.click(exportBtns[1]);
    expect(screen.getByText('Copiar enlace')).toBeInTheDocument();

    const moreBtns = screen.getAllByRole('button', { name: /Más/i });
    await user.click(moreBtns[1]);
    expect(screen.getByText(/Pasaporte \(2\)/i)).toBeInTheDocument();
    expect(screen.queryByText('Copiar enlace')).not.toBeInTheDocument();

    await expectNoA11yViolations(container);
  });

  it('FilterSidebar cumple WCAG AA, permite seleccionar Escuelas de Bienvenida y abrir guía DAT/SAE', async () => {
    const user = userEvent.setup();
    let currentState: SearchState = { ...INITIAL_SEARCH_STATE };
    const onOpenProcedure = vi.fn();

    const { container, rerender } = render(
      <FilterSidebar
        state={currentState}
        dynamicCounts={computeDynamicCounts(TEST_ALL_SCHOOLS, currentState)}
        onUpdateState={updater => {
          currentState = updater(currentState);
        }}
        onOpenProcedureModal={onOpenProcedure}
      />
    );

    await expectNoA11yViolations(container);

    expect(screen.queryByText(/Sin CSV autonómico de colegios preferentes;/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/incorporaci[oó]n temporal/i)).not.toBeInTheDocument();
    expect(screen.getByText('Escuelas de Bienvenida (Aulas de Enlace)')).toBeInTheDocument();

    const bienvenidaBtn = screen.getByRole('radio', { name: /Escuelas de Bienvenida \(Aulas de Enlace\)/i });
    await user.click(bienvenidaBtn);
    expect(currentState.need).toBe('compensatoria');

    rerender(
      <FilterSidebar
        state={currentState}
        dynamicCounts={computeDynamicCounts(TEST_ALL_SCHOOLS, currentState)}
        onUpdateState={updater => {
          currentState = updater(currentState);
        }}
        onOpenProcedureModal={onOpenProcedure}
      />
    );

    const guideBtn = screen.getByRole('button', { name: /Escuelas de Bienvenida \/ Aulas de Enlace/i });
    await user.click(guideBtn);
    expect(onOpenProcedure).toHaveBeenCalledWith('compensatoria');
  });

  it('ComparatorView cumple WCAG AA y muestra el botón "Vaciar marcados"', async () => {
    const user = userEvent.setup();
    const onClearCompare = vi.fn();

    const { container } = render(
      <ComparatorView
        comparedSchools={TEST_ALL_SCHOOLS.slice(0, 2)}
        state={INITIAL_SEARCH_STATE}
        onRemoveFromCompare={vi.fn()}
        onClearCompare={onClearCompare}
        onOpenDetail={vi.fn()}
        onGoToSearch={vi.fn()}
      />
    );

    const clearBtn = screen.getByRole('button', { name: /Vaciar marcados/i });
    expect(clearBtn).toBeInTheDocument();
    await user.click(clearBtn);
    expect(onClearCompare).toHaveBeenCalledTimes(1);

    await expectNoA11yViolations(container);
  });

  it('SchoolDetailModal atrapa el foco, cierra con Escape y cumple WCAG AA', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const chamberi = TEST_ALL_SCHOOLS.find(s => s.codigo === '28020120')!;

    const { container } = render(
      <SchoolDetailModal
        school={chamberi}
        state={INITIAL_SEARCH_STATE}
        isOpen={true}
        initialTab="details"
        isCompared={false}
        isInPassport={false}
        isEasyReadMode={false}
        onClose={onClose}
        onToggleCompare={vi.fn()}
        onTogglePassport={vi.fn()}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
    expect(screen.getByText(/Amor Misericordioso/i)).toBeInTheDocument();

    await expectNoA11yViolations(container);

    // Navegación ARIA por teclado entre pestañas de la ficha
    const detailsTab = screen.getByRole('tab', { name: /Ficha y Contacto/i });
    expect(detailsTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', detailsTab.id);

    detailsTab.focus();
    await user.keyboard('{ArrowRight}');
    const continuityTab = screen.getByRole('tab', { name: /Continuidad ESO/i });
    expect(continuityTab).toHaveAttribute('aria-selected', 'true');
    expect(document.activeElement).toBe(continuityTab);

    await user.keyboard('{Home}');
    const whyTab = screen.getByRole('tab', { name: /Evidencia/i });
    expect(whyTab).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Flujo E2E de App: carga asíncrona de centros.json, filtro, Lectura Fácil, modal y privacidad de URL sin GPS', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem('madrid_educa_compared', JSON.stringify(['id-invalido-1', 'id-invalido-2']));
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => TEST_ALL_SCHOOLS
      }))
    );

    const { container } = render(<App />);

    expect(screen.getAllByRole('button', { name: /Comparar.*0\/3/i }).length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.getByText(/Mostrando/i)).toBeInTheDocument();
    });

    expect(screen.getAllByRole('button', { name: /Comparar.*0\/3/i }).length).toBeGreaterThan(0);
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem('madrid_educa_compared') || '[]')).toEqual([]);
    });

    expect(screen.getByRole('link', { name: /Saltar al contenido principal/i })).toBeInTheDocument();

    // Activar Lectura Fácil
    const easyReadBtn = screen.getAllByRole('button', { name: /Lectura Fácil/i })[0];
    await user.click(easyReadBtn);
    expect(screen.getByText(/Modo Lectura Fácil activo:/i)).toBeInTheDocument();

    // Comprobar estado aria-pressed de los modos Lista y Mapa
    const listBtn = screen.getByRole('button', { name: /^Lista$/i });
    const mapBtn = screen.getByRole('button', { name: /^Mapa$/i });
    expect(mapBtn).toHaveAttribute('aria-pressed', 'true');
    expect(listBtn).toHaveAttribute('aria-pressed', 'false');

    // Filtrar por código único (con debounce de 150 ms) y limpiar con el botón rápido
    const searchInput = screen.getByRole('textbox', { name: /Buscar centros por nombre/i });
    await user.type(searchInput, '28010722');
    expect(await screen.findByText(/1 resultado/i)).toBeInTheDocument();
    const clearSearchBtn = screen.getByRole('button', { name: /Limpiar búsqueda de texto/i });
    await user.click(clearSearchBtn);
    expect(searchInput).toHaveValue('');

    // Abrir la ficha del primer centro y cerrarla con Escape
    const detailButtons = screen.getAllByRole('button', { name: /Ficha completa/i });
    await user.click(detailButtons[0]);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Verificar que la URL nunca expone coordenadas GPS personales
    expect(window.location.search).not.toContain('lat=');
    expect(window.location.search).not.toContain('lng=');
    expect(window.location.search).not.toContain('loc=browser');

    await expectNoA11yViolations(container);
  });

  it('ErrorBoundary y lazyWithRetry recuperan tras fallo de carga de chunk al pulsar Reintentar', async () => {
    const user = userEvent.setup();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let shouldFail = true;
    const LazySample = lazyWithRetry(
      async () => {
        if (shouldFail) {
          throw new Error('ChunkLoadError simulado');
        }
        return { default: () => <div>Vista recuperada</div> };
      },
      0,
      0
    );

    render(
      <ErrorBoundary>
        <Suspense fallback={<div>Cargando...</div>}>
          <LazySample />
        </Suspense>
      </ErrorBoundary>
    );

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/ChunkLoadError simulado/i)).toBeInTheDocument();

    shouldFail = false;
    await user.click(screen.getByRole('button', { name: /^Reintentar$/i }));
    expect(await screen.findByText('Vista recuperada')).toBeInTheDocument();
  });
});
