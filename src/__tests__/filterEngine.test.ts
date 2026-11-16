/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Unit Tests for Filter Engine (`src/utils/filterEngine.ts`)
 * Validates `matchesCentre`, `sortCentres`, and `analyzeZeroResults`
 * covering standard success cases and edge cases.
 */

import { describe, it, expect } from 'vitest';
import {
  matchesCentre,
  sortCentres,
  analyzeZeroResults,
  computeDynamicCounts,
  INITIAL_SEARCH_STATE
} from '../utils/filterEngine';
import { School, SearchState } from '../types';
import { SCHOOLS_DATA } from '../data/schools';

// Mock dataset representing varied school types, needs, and locations
const mockSchools: School[] = [
  {
    id: 'school-a',
    codigo: '28000001',
    nombre: 'CEIP Alpha',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Retiro',
    codigoPostal: '28009',
    direccion: 'Calle Alcalá, 1',
    telefono: '910000001',
    email: 'alpha@educa.madrid.org',
    lat: 40.4168,
    lng: -3.7038, // Center of Madrid
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'tea',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: 'Aula TEA Alpha',
        recursosOficiales: ['PT', 'AL'],
        fuenteOficial: 'BOCM',
        fechaCorte: '2025/2026',
        detallesResolucion: 'Resolución Alpha'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
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
      tipoContinuidad: 'adscripcion_unica',
      descripcion: 'Continuidad a IES Beta',
      apoyoEnSecundariaVerificado: true,
      destinos: []
    }
  },
  {
    id: 'school-b',
    codigo: '28000002',
    nombre: 'IES Beta',
    titularidad: 'publico',
    tipo: 'IES',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Centro',
    codigoPostal: '28013',
    direccion: 'Calle Mayor, 10',
    telefono: '910000002',
    email: 'beta@educa.madrid.org',
    lat: 40.4200,
    lng: -3.7000,
    etapas: ['eso', 'bachillerato'],
    apoyos: [
      {
        needId: 'tea',
        evidencia: 'A2',
        etapasConApoyo: ['eso'],
        aulaNombre: 'Aula TEA Beta',
        recursosOficiales: ['PT', 'TIS'],
        fuenteOficial: 'BOCM',
        fechaCorte: '2025/2026',
        detallesResolucion: 'Resolución Beta'
      },
      {
        needId: 'auditiva',
        evidencia: 'A1',
        etapasConApoyo: ['eso', 'bachillerato'],
        aulaNombre: 'Aula Auditiva Beta',
        recursosOficiales: ['ILSE', 'AL'],
        fuenteOficial: 'BOCM',
        fechaCorte: '2025/2026',
        detallesResolucion: 'Resolución Auditiva'
      }
    ],
    servicios: {
      comedor: false,
      transporte: false,
      aula_matinal: false,
      enfermeria: true,
      actividades_extraescolares: false
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: true,
      plano_podotactil: true
    },
    continuidad: {
      tipoContinuidad: 'mismo_centro',
      descripcion: 'Continuidad en propio centro',
      apoyoEnSecundariaVerificado: true,
      destinos: []
    }
  },
  {
    id: 'school-c',
    codigo: '28000003',
    nombre: 'Colegio Concertado Gamma',
    titularidad: 'concertado',
    tipo: 'Colegio Concertado',
    modalidad: 'especial',
    municipio: 'Alcala de Henares',
    codigoPostal: '28801',
    direccion: 'Avenida Madrid, 50',
    telefono: '910000003',
    email: 'gamma@educa.madrid.org',
    lat: 40.4812,
    lng: -3.3688, // Far from Madrid center (~30km)
    etapas: ['infantil', 'primaria', 'eso'],
    apoyos: [
      {
        needId: 'educacion_especial',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria', 'eso'],
        aulaNombre: 'Unidad CEE Gamma',
        recursosOficiales: ['PT', 'AL', 'Fisioterapeuta'],
        fuenteOficial: 'BOCM',
        fechaCorte: '2025/2026',
        detallesResolucion: 'Resolución CEE'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: false,
      enfermeria: false,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: false,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'mismo_centro',
      descripcion: 'Atención especializada hasta 21 años',
      apoyoEnSecundariaVerificado: true,
      destinos: []
    }
  }
];

describe('filterEngine - matchesCentre', () => {
  it('matches all schools when state is blank / minimal', () => {
    const state: SearchState = {
      ...INITIAL_SEARCH_STATE,
      need: null,
      stages: [],
      municipality: null,
      radiusKm: null,
      locationSource: 'municipality',
      userCoordinates: null,
      evidence: ['A1', 'A2']
    };

    expect(matchesCentre(mockSchools[0], state)).toBe(true);
    expect(matchesCentre(mockSchools[1], state)).toBe(true);
    expect(matchesCentre(mockSchools[2], state)).toBe(true);
  });

  describe('Need filtering', () => {
    it('filters correctly for standard need (TEA)', () => {
      const state: SearchState = {
        ...INITIAL_SEARCH_STATE,
        need: 'tea',
        stages: [],
        municipality: null,
        radiusKm: null
      };

      expect(matchesCentre(mockSchools[0], state)).toBe(true);  // Has TEA
      expect(matchesCentre(mockSchools[1], state)).toBe(true);  // Has TEA
      expect(matchesCentre(mockSchools[2], state)).toBe(false); // Does not have TEA
    });

    it('filters correctly for special education (educacion_especial)', () => {
      const state: SearchState = {
        ...INITIAL_SEARCH_STATE,
        need: 'educacion_especial',
        stages: [],
        municipality: null,
        radiusKm: null
      };

      expect(matchesCentre(mockSchools[0], state)).toBe(false);
      expect(matchesCentre(mockSchools[1], state)).toBe(false);
      expect(matchesCentre(mockSchools[2], state)).toBe(true); // Modalidad 'especial'
    });
  });

  describe('Stage matching modes (any vs all)', () => {
    it('matches ANY stage selected', () => {
      const state: SearchState = {
        ...INITIAL_SEARCH_STATE,
        need: null,
        stages: ['primaria', 'eso'],
        stageMatchMode: 'any',
        municipality: null,
        radiusKm: null
      };

      expect(matchesCentre(mockSchools[0], state)).toBe(true);  // Has primaria
      expect(matchesCentre(mockSchools[1], state)).toBe(true);  // Has eso
      expect(matchesCentre(mockSchools[2], state)).toBe(true);  // Has both
    });

    it('matches ALL stages selected (strict AND)', () => {
      const state: SearchState = {
        ...INITIAL_SEARCH_STATE,
        need: null,
        stages: ['infantil', 'primaria', 'eso'],
        stageMatchMode: 'all',
        municipality: null,
        radiusKm: null
      };

      expect(matchesCentre(mockSchools[0], state)).toBe(false); // Missing 'eso'
      expect(matchesCentre(mockSchools[1], state)).toBe(false); // Missing 'infantil'
      expect(matchesCentre(mockSchools[2], state)).toBe(true);  // Has all 3
    });
  });

  describe('Location & Radius filtering', () => {
    it('filters by browser location radius', () => {
      const state: SearchState = {
        ...INITIAL_SEARCH_STATE,
        need: null,
        stages: [],
        locationSource: 'browser',
        userCoordinates: { lat: 40.4168, lng: -3.7038, label: 'Madrid Center' },
        radiusKm: 5 // 5 km radius
      };

      expect(matchesCentre(mockSchools[0], state)).toBe(true);  // ~0 km away
      expect(matchesCentre(mockSchools[1], state)).toBe(true);  // ~0.5 km away
      expect(matchesCentre(mockSchools[2], state)).toBe(false); // ~30 km away (Alcalá)
    });

    it('filters strictly by district when municipality is Madrid and excludes other municipalities', () => {
      const state: SearchState = {
        ...INITIAL_SEARCH_STATE,
        need: null,
        stages: [],
        locationSource: 'municipality',
        municipality: 'Madrid',
        district: 'Retiro',
        radiusKm: 50
      };

      expect(matchesCentre(mockSchools[0], state)).toBe(true);  // Madrid + Retiro
      expect(matchesCentre(mockSchools[1], state)).toBe(false); // Madrid + Centro
      expect(matchesCentre(mockSchools[2], state)).toBe(false); // Alcala de Henares (no district)
    });
  });

  describe('Services & Accessibility required filtering (AND logic)', () => {
    it('requires ALL specified required services', () => {
      const state: SearchState = {
        ...INITIAL_SEARCH_STATE,
        need: null,
        stages: [],
        municipality: null,
        radiusKm: null,
        requiredServices: ['comedor', 'enfermeria']
      };

      expect(matchesCentre(mockSchools[0], state)).toBe(true);  // Has both
      expect(matchesCentre(mockSchools[1], state)).toBe(false); // Missing comedor
      expect(matchesCentre(mockSchools[2], state)).toBe(false); // Missing enfermeria
    });

    it('requires ALL specified accessibility features', () => {
      const state: SearchState = {
        ...INITIAL_SEARCH_STATE,
        need: null,
        stages: [],
        municipality: null,
        radiusKm: null,
        accessibilityRequired: ['bucle_magnetico', 'plano_podotactil']
      };

      expect(matchesCentre(mockSchools[0], state)).toBe(false);
      expect(matchesCentre(mockSchools[1], state)).toBe(true); // Has both
      expect(matchesCentre(mockSchools[2], state)).toBe(false);
    });
  });

  describe('Evidence level filtering', () => {
    it('filters by evidence A1 when need is specified', () => {
      const state: SearchState = {
        ...INITIAL_SEARCH_STATE,
        need: 'tea',
        stages: [],
        municipality: null,
        radiusKm: null,
        evidence: ['A1'] // Only A1
      };

      expect(matchesCentre(mockSchools[0], state)).toBe(true);  // TEA + A1
      expect(matchesCentre(mockSchools[1], state)).toBe(false); // TEA + A2
    });
  });

  describe('Text search query matching', () => {
    it('matches by code, name, address or municipality', () => {
      const stateByName: SearchState = { ...INITIAL_SEARCH_STATE, need: null, stages: [], municipality: null, radiusKm: null, searchQuery: 'Alpha' };
      const stateByCode: SearchState = { ...INITIAL_SEARCH_STATE, need: null, stages: [], municipality: null, radiusKm: null, searchQuery: '28000003' };
      const stateByStreet: SearchState = { ...INITIAL_SEARCH_STATE, need: null, stages: [], municipality: null, radiusKm: null, searchQuery: 'Mayor' };

      expect(matchesCentre(mockSchools[0], stateByName)).toBe(true);
      expect(matchesCentre(mockSchools[1], stateByName)).toBe(false);

      expect(matchesCentre(mockSchools[2], stateByCode)).toBe(true);

      expect(matchesCentre(mockSchools[1], stateByStreet)).toBe(true);
    });

    it('matches text queries regardless of diacritics / accents', () => {
      const stateAlcalaNoAccent: SearchState = {
        ...INITIAL_SEARCH_STATE,
        need: null,
        stages: [],
        municipality: null,
        radiusKm: null,
        searchQuery: 'Alcala'
      };
      // mockSchools[0] has 'Calle Alcalá, 1' and mockSchools[2] has 'Alcala de Henares'
      expect(matchesCentre(mockSchools[0], stateAlcalaNoAccent)).toBe(true);
      expect(matchesCentre(mockSchools[1], stateAlcalaNoAccent)).toBe(false);
      expect(matchesCentre(mockSchools[2], stateAlcalaNoAccent)).toBe(true);
    });
  });
});

describe('filterEngine - sortCentres', () => {
  it('sorts alphabetically by school name', () => {
    const state: SearchState = { ...INITIAL_SEARCH_STATE, sort: 'alphabetical' };
    const sorted = sortCentres([...mockSchools], state);

    expect(sorted[0].nombre).toBe('CEIP Alpha');
    expect(sorted[1].nombre).toBe('Colegio Concertado Gamma');
    expect(sorted[2].nombre).toBe('IES Beta');
  });

  it('sorts by distance when userCoordinates are present', () => {
    const state: SearchState = {
      ...INITIAL_SEARCH_STATE,
      sort: 'distance',
      locationSource: 'browser',
      userCoordinates: { lat: 40.4200, lng: -3.7000, label: 'Near Beta' }
    };
    const sorted = sortCentres([...mockSchools], state);

    // School B (Beta) is closest to 40.4200, -3.7000
    expect(sorted[0].id).toBe('school-b');
    // School C (Alcalá) is furthest
    expect(sorted[2].id).toBe('school-c');
  });
});

describe('filterEngine - analyzeZeroResults & multi-source dynamicCounts', () => {
  it('returns appropriate analysis and non-empty relaxations when zero schools match outside Madrid capital with services filter', () => {
    const restrictiveState: SearchState = {
      ...INITIAL_SEARCH_STATE,
      need: 'tea',
      stages: ['primaria'],
      municipality: 'Alcalá de Henares',
      radiusKm: null,
      requiredServices: ['comedor'],
      evidence: ['A2']
    };

    const matchesCount = SCHOOLS_DATA.filter(s => matchesCentre(s, restrictiveState)).length;
    expect(matchesCount).toBe(0);

    const analysis = analyzeZeroResults(SCHOOLS_DATA, restrictiveState);

    expect(analysis).toBeDefined();
    expect(typeof analysis.reason).toBe('string');
    expect(analysis.reason.length).toBeGreaterThan(0);
    expect(Array.isArray(analysis.relaxations)).toBe(true);
    expect(analysis.relaxations.length).toBeGreaterThan(0);

    analysis.relaxations.forEach(opt => {
      expect(typeof opt.label).toBe('string');
      expect(typeof opt.resultingCount).toBe('number');
      expect(typeof opt.apply).toBe('function');

      const newState = opt.apply(restrictiveState);
      expect(newState).toBeDefined();
    });
  });

  it('calculates dynamic evidence and Ayuntamiento Madrid service counts accurately per need and municipality', () => {
    const teaMadridCounts = computeDynamicCounts(SCHOOLS_DATA, {
      ...INITIAL_SEARCH_STATE,
      need: 'tea',
      stages: [],
      municipality: 'Madrid',
      radiusKm: null
    });
    expect(teaMadridCounts.evidence.A1).toBe(0);
    expect(teaMadridCounts.evidence.A2).toBeGreaterThan(100);
    expect(teaMadridCounts.requiredServices.comedor).toBeGreaterThan(50);
    expect(teaMadridCounts.accessibility.acceso_fisico).toBeGreaterThan(5);

    const ceeCounts = computeDynamicCounts(SCHOOLS_DATA, {
      ...INITIAL_SEARCH_STATE,
      need: 'educacion_especial',
      stages: [],
      municipality: null,
      radiusKm: null
    });
    expect(ceeCounts.evidence.A1).toBe(69);
    expect(ceeCounts.evidence.A2).toBe(0);
    expect(ceeCounts.ownership.privado).toBe(2);

    const hospCounts = computeDynamicCounts(SCHOOLS_DATA, {
      ...INITIAL_SEARCH_STATE,
      need: 'salud_hospitalaria',
      stages: [],
      municipality: null,
      radiusKm: null
    });
    expect(hospCounts.evidence.A1).toBe(4);
    expect(hospCounts.evidence.A2).toBe(10);

    const visualCounts = computeDynamicCounts(SCHOOLS_DATA, {
      ...INITIAL_SEARCH_STATE,
      need: 'visual',
      stages: [],
      municipality: null,
      radiusKm: null
    });
    expect(visualCounts.evidence.A1).toBe(3);
    expect(visualCounts.evidence.A2).toBe(0);

    const aaccCounts = computeDynamicCounts(SCHOOLS_DATA, {
      ...INITIAL_SEARCH_STATE,
      need: 'altas_capacidades',
      stages: [],
      municipality: null,
      radiusKm: null
    });
    expect(aaccCounts.evidence.A1).toBe(2);
    expect(aaccCounts.evidence.A2).toBe(8);

    for (const eoepNeed of ['auditiva', 'motora', 'tdah', 'tel_lenguaje'] as const) {
      const eoepCounts = computeDynamicCounts(SCHOOLS_DATA, {
        ...INITIAL_SEARCH_STATE,
        need: eoepNeed,
        stages: [],
        municipality: null,
        radiusKm: null
      });
      expect(eoepCounts.evidence.A1).toBe(1);
      expect(eoepCounts.evidence.A2).toBe(0);
    }

    const alcalaCounts = computeDynamicCounts(SCHOOLS_DATA, {
      ...INITIAL_SEARCH_STATE,
      need: 'tea',
      stages: [],
      municipality: 'Alcalá de Henares',
      radiusKm: null
    });
    expect(alcalaCounts.requiredServices.comedor).toBe(0);
    expect(alcalaCounts.accessibility.acceso_fisico).toBe(0);
  });

  it('offers both TEA and CEE relaxations when an uncatalogued need is selected', () => {
    const analysis = analyzeZeroResults(SCHOOLS_DATA, {
      ...INITIAL_SEARCH_STATE,
      need: 'compensatoria',
      stages: [],
      municipality: 'Madrid',
      radiusKm: null
    });
    expect(analysis.reason).toContain('conjunto abierto regional descargable');
    expect(analysis.relaxations.some(r => r.id === 'switch_to_tea')).toBe(true);
    expect(analysis.relaxations.some(r => r.id === 'switch_to_cee')).toBe(true);
  });
});
