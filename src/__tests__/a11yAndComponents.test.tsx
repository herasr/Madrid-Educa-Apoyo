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

import { Header } from '../components/Header';
import { FilterSidebar } from '../components/FilterSidebar';
import { SchoolDetailModal } from '../components/SchoolDetailModal';
import App from '../App';
import { computeDynamicCounts, INITIAL_SEARCH_STATE } from '../utils/filterEngine';
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

    const bienvenidaBtn = screen.getByRole('radio', { name: /Escuelas de Bienvenida/i });
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

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Flujo E2E de App: carga asíncrona de centros.json, filtro, Lectura Fácil, modal y privacidad de URL sin GPS', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => TEST_ALL_SCHOOLS
      }))
    );

    const { container } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Mostrando/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: /Saltar al contenido principal/i })).toBeInTheDocument();

    // Activar Lectura Fácil
    const easyReadBtn = screen.getAllByRole('button', { name: /Lectura Fácil/i })[0];
    await user.click(easyReadBtn);
    expect(screen.getByText(/Modo Lectura Fácil activo:/i)).toBeInTheDocument();

    // Filtrar por código único y limpiar con el botón rápido
    const searchInput = screen.getByRole('textbox', { name: /Buscar centros por nombre/i });
    await user.type(searchInput, '28010722');
    expect(screen.getByText(/1 resultado/i)).toBeInTheDocument();
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
});
