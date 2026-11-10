/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Unit tests for filterEngine using Vitest
 */

import { describe, it, expect } from 'vitest';
import { matchesCentre, sortCentres, serializeSearchStateToQuery, parseSearchStateFromQuery, analyzeZeroResults } from './filterEngine';
import { School, SearchState } from '../types';
import { SCHOOLS_DATA } from '../data/schools';

const mockSchool: School = {
  id: 'test-school-1',
  codigo: '28000001',
  nombre: 'CEIP Test School',
  titularidad: 'publico',
  tipo: 'CEIP',
  modalidad: 'preferente',
  municipio: 'Madrid',
  distrito: 'Retiro',
  codigoPostal: '28009',
  direccion: 'Calle Test 1',
  telefono: '910000000',
  email: 'test@educa.madrid.org',
  lat: 40.42,
  lng: -3.68,
  etapas: ['infantil', 'primaria'],
  apoyos: [
    {
      needId: 'tea',
      evidencia: 'A1',
      etapasConApoyo: ['infantil', 'primaria'],
      aulaNombre: "Aula TEA Test",
      recursosOficiales: ['1 PT', '1 AL'],
      fuenteOficial: 'CAM',
      fechaCorte: '2025/2026',
      detallesResolucion: 'Resolución de prueba'
    }
  ],
  servicios: {
    comedor: true,
    transporte: false,
    aula_matinal: true,
    enfermeria: true,
    actividades_extraescolares: true
  },
  accesibilidad: {
    acceso_fisico: true,
    ascensor: true,
    bano_adaptado: true,
    bucle_magnetico: false,
    plano_podotactil: false
  },
  continuidad: {
    tipoContinuidad: 'mismo_centro',
    descripcion: 'Continuidad de prueba',
    apoyoEnSecundariaVerificado: true,
    destinos: []
  }
};

describe('filterEngine pure functions', () => {
  it('should match a school when state matches', () => {
    const state: SearchState = {
      need: 'tea',
      stages: ['primaria'],
      stageMatchMode: 'any',
      municipality: 'Madrid',
      district: 'Retiro',
      radiusKm: 20,
      locationSource: 'municipality',
      userCoordinates: null,
      ownership: ['publico'],
      modalities: [],
      requiredServices: ['comedor'],
      preferredServices: [],
      accessibilityRequired: [],
      evidence: ['A1'],
      searchQuery: '',
      sort: 'distance'
    };

    const matches = matchesCentre(mockSchool, state);
    expect(matches).toBe(true);
  });

  it('should not match when need does not match', () => {
    const state: SearchState = {
      need: 'auditiva',
      stages: ['primaria'],
      stageMatchMode: 'any',
      municipality: 'Madrid',
      district: null,
      radiusKm: null,
      locationSource: 'municipality',
      userCoordinates: null,
      ownership: [],
      modalities: [],
      requiredServices: [],
      preferredServices: [],
      accessibilityRequired: [],
      evidence: ['A1', 'A2'],
      searchQuery: '',
      sort: 'distance'
    };

    const matches = matchesCentre(mockSchool, state);
    expect(matches).toBe(false);
  });

  it('should serialize and parse search state correctly', () => {
    const state: SearchState = {
      need: 'tea',
      stages: ['primaria'],
      stageMatchMode: 'any',
      municipality: 'Madrid',
      district: 'Retiro',
      radiusKm: 20,
      locationSource: 'municipality',
      userCoordinates: null,
      ownership: ['publico'],
      modalities: [],
      requiredServices: ['comedor'],
      preferredServices: [],
      accessibilityRequired: [],
      evidence: ['A1'],
      searchQuery: 'test',
      sort: 'distance'
    };

    const query = serializeSearchStateToQuery(state);
    const parsed = parseSearchStateFromQuery(`?${query}`);

    expect(parsed.need).toBe(state.need);
    expect(parsed.municipality).toBe(state.municipality);
    expect(parsed.searchQuery).toBe(state.searchQuery);
    expect(parsed.requiredServices).toEqual(state.requiredServices);
  });

  it('should sort centres alphabetically', () => {
    const state: SearchState = {
      need: null, stages: [], municipality: 'Madrid', radiusKm: null, locationSource: 'municipality', userCoordinates: null, ownership: [], modalities: [], requiredServices: [], preferredServices: [], accessibilityRequired: [], evidence: [], searchQuery: '', sort: 'alphabetical'
    };
    const sorted = sortCentres([
      { ...mockSchool, id: 'b', nombre: 'B' },
      { ...mockSchool, id: 'a', nombre: 'A' }
    ] as School[], state);
    
    expect(sorted[0].nombre).toBe('A');
    expect(sorted[1].nombre).toBe('B');
  });

  it('should analyze zero results correctly', () => {
    const state: SearchState = {
      need: 'tea', stages: ['bachillerato'], municipality: 'Madrid', radiusKm: 1, locationSource: 'municipality', userCoordinates: null, ownership: [], modalities: [], requiredServices: ['comedor'], preferredServices: [], accessibilityRequired: [], evidence: ['A1'], searchQuery: '', sort: 'distance'
    };
    const analysis = analyzeZeroResults(SCHOOLS_DATA, state);
    expect(analysis).toBeDefined();
    expect(analysis.relaxations.length).toBeGreaterThan(0);
  });
});

