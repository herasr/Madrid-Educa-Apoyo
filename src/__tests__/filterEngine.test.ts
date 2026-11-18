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
  buildResultsCSVContent,
  serializeSearchStateToQuery,
  parseSearchStateFromQuery,
  INITIAL_SEARCH_STATE
} from '../utils/filterEngine';
import { MUNICIPALITIES } from '../data/municipalities';
import { OFFICIAL_TEA_SOURCE } from '../data/officialTea';
import { NeedId, School, SearchState } from '../types';
import { TEST_ALL_SCHOOLS as SCHOOLS_DATA } from './catalogHelper';

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

  it('calculates Escuelas de Bienvenida counts (33 in Madrid, 47 total) and explains public DAT/SAE limit with concertado relaxation', () => {
    const compState: SearchState = {
      ...INITIAL_SEARCH_STATE,
      need: 'compensatoria',
      stages: [],
      municipality: 'Madrid',
      radiusKm: null
    };
    const counts = computeDynamicCounts(SCHOOLS_DATA, compState);
    expect(counts.needs.compensatoria).toBe(33);
    expect(counts.evidence.A1).toBe(33);
    expect(counts.ownership.concertado).toBe(33);
    expect(counts.ownership.publico).toBe(0);

    const query = serializeSearchStateToQuery(compState);
    const parsed = parseSearchStateFromQuery(`?${query}`);
    expect(parsed.need).toBe('compensatoria');
    expect(parsed.municipality).toBe('Madrid');

    const analysisPublic = analyzeZeroResults(SCHOOLS_DATA, {
      ...compState,
      stages: ['primaria'],
      radiusKm: 20,
      ownership: ['publico']
    });
    expect(analysisPublic.reason).toContain('Escuelas de Bienvenida');
    expect(analysisPublic.reason).toContain('concertados');
    const relaxOwnership = analysisPublic.relaxations.find(r => r.id === 'remove_ownership');
    expect(relaxOwnership).toBeDefined();
    expect(relaxOwnership?.resultingCount).toBeGreaterThan(30);
  });

  it('exports Codigo_Accesibilidad_Ayto and Observaciones columns in CSV export', () => {
    const chamberi = SCHOOLS_DATA.find(s => s.codigo === '28020120')!;
    const ciudadValencia = SCHOOLS_DATA.find(s => s.codigo === '28020673')!;
    const csv = buildResultsCSVContent([chamberi, ciudadValencia], INITIAL_SEARCH_STATE);

    const headerLine = csv.split('\n')[0];
    expect(headerLine).toContain('Codigo_Accesibilidad_Ayto');
    expect(headerLine).toContain('Observaciones');
    expect(csv).toContain('28020120');
    expect(csv).toMatch(/Amor Misericordioso/i);
    expect(csv).toContain('Parcialmente accesible PMR (cód. 2, Ayto. Madrid)');
  });

  it('exposes all 179 official CAM municipalities and applies strict normalized equality without substring leaks', () => {
    expect(MUNICIPALITIES).toHaveLength(179);

    const madridOnly: SearchState = {
      ...INITIAL_SEARCH_STATE,
      need: null,
      stages: [],
      municipality: 'Madrid',
      district: null,
      radiusKm: null,
      evidence: ['A1', 'A2']
    };
    const madridCentres = SCHOOLS_DATA.filter(s => matchesCentre(s, madridOnly));
    expect(madridCentres.length).toBeGreaterThan(100);
    expect(madridCentres.every(s => s.municipio === 'Madrid')).toBe(true);
    expect(madridCentres.some(s => s.municipio === 'Rivas-Vaciamadrid')).toBe(false);
  });

  it('round-trips cleared, partial, and empty-evidence SearchState cleanly via URL sentinels', () => {
    const clearedState: SearchState = {
      need: null,
      stages: [],
      stageMatchMode: 'any',
      municipality: null,
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

    const statesToVerify: SearchState[] = [
      clearedState,
      INITIAL_SEARCH_STATE,
      {
        ...clearedState,
        need: 'visual',
        stages: ['primaria', 'eso'],
        stageMatchMode: 'all',
        municipality: 'Madrid',
        district: 'Chamberí',
        evidence: [],
        sort: 'evidence_then_distance',
        searchQuery: 'ONCE'
      }
    ];

    for (const original of statesToVerify) {
      const qs = serializeSearchStateToQuery(original);
      const parsed = parseSearchStateFromQuery(`?${qs}`);
      expect(parsed).toEqual(original);
    }
  });

  it('rejects GPS coordinates in URL, clamps radius to [1,100], and ignores invalid municipality/district', () => {
    const parsedGps = parseSearchStateFromQuery('?loc=browser&lat=40.4168&lng=-3.7038&need=tea');
    expect(parsedGps.locationSource).toBe('municipality');
    expect(parsedGps.userCoordinates).toBeNull();

    const parsedNegativeRadius = parseSearchStateFromQuery('?radius=-5');
    expect(parsedNegativeRadius.radiusKm).toBe(1);

    const parsedHugeRadius = parseSearchStateFromQuery('?radius=100000');
    expect(parsedHugeRadius.radiusKm).toBe(100);

    const parsedInvalidMun = parseSearchStateFromQuery('?municipality=Atlantis&district=Centro');
    expect(parsedInvalidMun.municipality).toBe(INITIAL_SEARCH_STATE.municipality);

    const parsedMismatchDist = parseSearchStateFromQuery('?municipality=Getafe&district=Centro');
    expect(parsedMismatchDist.municipality).toBe('Getafe');
    expect(parsedMismatchDist.district).toBeNull();
  });

  it('sorts A1 evidence before A2 when sort="evidence_then_distance" and breaks ties by distance', () => {
    const state: SearchState = {
      ...INITIAL_SEARCH_STATE,
      need: null,
      stages: [],
      municipality: 'Madrid',
      radiusKm: null,
      sort: 'evidence_then_distance'
    };
    const a1Hospital = SCHOOLS_DATA.find(s => s.apoyos.every(a => a.evidencia === 'A1'))!;
    const a2Tea = SCHOOLS_DATA.find(s => s.apoyos.every(a => a.evidencia === 'A2'))!;
    const sorted = sortCentres([a2Tea, a1Hospital], state);

    expect(sorted[0].id).toBe(a1Hospital.id);
    expect(sorted[1].id).toBe(a2Tea.id);
  });

  it('neutralizes CSV formula injection in text fields while preserving raw numeric coordinates', () => {
    const base = SCHOOLS_DATA[0];
    const malicious: School = {
      ...base,
      nombre: '=HYPERLINK("http://evil.example","Click")',
      telefono: '+34914450001',
      observacionesOficiales: '@SUM(1+1)',
      lat: 40.4168,
      lng: -3.7038
    };

    const csv = buildResultsCSVContent([malicious], INITIAL_SEARCH_STATE);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"\'=HYPERLINK(""http://evil.example"",""Click"")"');
    expect(csv).toContain('"\'+34914450001"');
    expect(csv).toContain('"\'@SUM(1+1)"');
    expect(csv).toContain(';40.4168;-3.7038;');
  });

  it('populates failingConditions and translates all ServiceId labels in analyzeZeroResults', () => {
    const analysisBoth = analyzeZeroResults(SCHOOLS_DATA, {
      ...INITIAL_SEARCH_STATE,
      municipality: 'Alcala de Henares',
      radiusKm: null,
      requiredServices: ['aula_matinal', 'actividades_extraescolares']
    });

    expect(analysisBoth.failingConditions.some(c => c.includes('Horario ampliado / Aula matinal'))).toBe(true);
    expect(analysisBoth.failingConditions.some(c => c.includes('Actividades extraescolares'))).toBe(true);

    const analysisMatinal = analyzeZeroResults(SCHOOLS_DATA, {
      ...INITIAL_SEARCH_STATE,
      municipality: 'Alcala de Henares',
      radiusKm: null,
      requiredServices: ['aula_matinal']
    });
    expect(analysisMatinal.relaxations.some(r => r.label.includes('Horario ampliado / Aula matinal'))).toBe(true);

    const analysisExtra = analyzeZeroResults(SCHOOLS_DATA, {
      ...INITIAL_SEARCH_STATE,
      municipality: 'Alcala de Henares',
      radiusKm: null,
      requiredServices: ['actividades_extraescolares']
    });
    expect(analysisExtra.relaxations.some(r => r.label.includes('Actividades extraescolares'))).toBe(true);

    const uncataloguedAnalysis = analyzeZeroResults(SCHOOLS_DATA, {
      ...INITIAL_SEARCH_STATE,
      need: 'sin_catalogo' as unknown as NeedId
    });
    const teaRelax = uncataloguedAnalysis.relaxations.find(r => r.id === 'switch_to_tea');
    expect(teaRelax?.resultingCount).toBe(164);

    const emptyCatalogAnalysis = analyzeZeroResults([], {
      ...INITIAL_SEARCH_STATE,
      need: 'sin_catalogo' as unknown as NeedId
    });
    expect(emptyCatalogAnalysis.relaxations.find(r => r.id === 'switch_to_tea')?.resultingCount).toBe(
      OFFICIAL_TEA_SOURCE.totalCentros
    );
  });
});
