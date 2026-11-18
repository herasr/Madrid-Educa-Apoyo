/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Integridad del conjunto de datos oficial de centros preferentes TEA
 * enriquecido con Portal de Datos Abiertos CAM (CC BY 4.0).
 */

import { describe, it, expect } from 'vitest';
import { OFFICIAL_TEA_SOURCE } from '../data/officialTea';
import { DEMO_SCHOOLS } from '../data/schools';
import { TEST_ALL_SCHOOLS as OFFICIAL_ALL_SCHOOLS, TEST_TEA_SCHOOLS as OFFICIAL_TEA_SCHOOLS } from './catalogHelper';
import { INITIAL_SEARCH_STATE, matchesCentre, serializeSearchStateToQuery } from '../utils/filterEngine';
import { TEST_SCENARIOS } from '../data/testScenarios';
import { SearchState } from '../types';

const SCHOOLS_DATA = OFFICIAL_ALL_SCHOOLS;

describe('Datos oficiales CAM + Ayto. Madrid + ONCE (470 entidades)', () => {
  it('carga los 336 centros del documento TEA con códigos únicos de 8 dígitos', () => {
    expect(OFFICIAL_TEA_SCHOOLS).toHaveLength(336);
    expect(OFFICIAL_TEA_SOURCE.totalCentros).toBe(336);
    expect(OFFICIAL_TEA_SOURCE.totalConUbicacionExacta).toBe(336);
    const codes = OFFICIAL_TEA_SCHOOLS.map(s => s.codigo);
    expect(new Set(codes).size).toBe(336);
    codes.forEach(c => expect(c).toMatch(/^28\d{6}$/));
  });

  it('integra el catálogo completo de 470 entidades oficiales (TEA, Aulas de Enlace, CEE, Hosp., Visual, AACC y EOEP Específicos)', () => {
    expect(OFFICIAL_ALL_SCHOOLS).toHaveLength(470);
    expect(OFFICIAL_TEA_SOURCE.totalCentrosCatalogo).toBe(470);
    expect(OFFICIAL_TEA_SOURCE.totalCompensatoria).toBe(47);
    expect(OFFICIAL_TEA_SOURCE.totalCee).toBe(69);
    expect(OFFICIAL_TEA_SOURCE.totalHospitalarias).toBe(14);
    expect(OFFICIAL_TEA_SOURCE.totalVisual).toBe(3);
    expect(OFFICIAL_TEA_SOURCE.totalAltasCapacidades).toBe(10);
    expect(OFFICIAL_TEA_SOURCE.totalAuditiva).toBe(1);
    expect(OFFICIAL_TEA_SOURCE.totalMotora).toBe(1);
    expect(OFFICIAL_TEA_SOURCE.totalTdah).toBe(1);
    expect(OFFICIAL_TEA_SOURCE.totalTelLenguaje).toBe(1);
    expect(OFFICIAL_TEA_SOURCE.totalConUbicacionExactaCatalogo).toBe(469);

    const allCodes = OFFICIAL_ALL_SCHOOLS.map(s => s.codigo);
    expect(new Set(allCodes).size).toBe(470);
    allCodes.forEach(c => expect(c).toMatch(/^28\d{6}$/));

    const enlace = OFFICIAL_ALL_SCHOOLS.filter(s => s.apoyos.some(a => a.needId === 'compensatoria'));
    const cee = OFFICIAL_ALL_SCHOOLS.filter(s => s.apoyos.some(a => a.needId === 'educacion_especial'));
    const hosp = OFFICIAL_ALL_SCHOOLS.filter(s => s.apoyos.some(a => a.needId === 'salud_hospitalaria'));
    const visual = OFFICIAL_ALL_SCHOOLS.filter(s => s.apoyos.some(a => a.needId === 'visual'));
    const aacc = OFFICIAL_ALL_SCHOOLS.filter(s => s.apoyos.some(a => a.needId === 'altas_capacidades'));
    const auditiva = OFFICIAL_ALL_SCHOOLS.filter(s => s.apoyos.some(a => a.needId === 'auditiva'));
    const motora = OFFICIAL_ALL_SCHOOLS.filter(s => s.apoyos.some(a => a.needId === 'motora'));
    const tdah = OFFICIAL_ALL_SCHOOLS.filter(s => s.apoyos.some(a => a.needId === 'tdah'));
    const tel = OFFICIAL_ALL_SCHOOLS.filter(s => s.apoyos.some(a => a.needId === 'tel_lenguaje'));

    expect(enlace).toHaveLength(47);
    expect(enlace.every(e => e.titularidad === 'concertado')).toBe(true);
    expect(enlace.every(e => e.apoyos.find(a => a.needId === 'compensatoria')?.evidencia === 'A1')).toBe(true);
    expect(cee).toHaveLength(69);
    expect(hosp).toHaveLength(14);
    expect(visual).toHaveLength(3);
    expect(aacc).toHaveLength(10);
    expect(auditiva).toHaveLength(1);
    expect(motora).toHaveLength(1);
    expect(tdah).toHaveLength(1);
    expect(tel).toHaveLength(1);

    expect(auditiva[0].codigo).toBe('28700741');
    expect(auditiva[0].apoyos[0].evidencia).toBe('A1');
    expect(motora[0].codigo).toBe('28700763');
    expect(motora[0].apoyos[0].evidencia).toBe('A1');
    expect(tdah[0].codigo).toBe('28701214');
    expect(tel[0].codigo).toBe('28701214');
    expect(tdah[0].apoyos.find(a => a.needId === 'tdah')?.evidencia).toBe('A1');
    expect(tel[0].apoyos.find(a => a.needId === 'tel_lenguaje')?.evidencia).toBe('A1');

    expect(cee.every(c => c.apoyos.find(a => a.needId === 'educacion_especial')?.evidencia === 'A1')).toBe(true);
    expect(cee.filter(c => c.titularidad === 'privado')).toHaveLength(2);
    expect(hosp.filter(h => h.apoyos[0].evidencia === 'A1')).toHaveLength(4);
    expect(hosp.filter(h => h.apoyos[0].evidencia === 'A2')).toHaveLength(10);
    expect(visual.every(v => v.apoyos.find(a => a.needId === 'visual')?.evidencia === 'A1')).toBe(true);
    expect(visual.map(v => v.codigo).sort()).toEqual(['28021070', '28067501', '28700738']);
    expect(aacc.filter(a => a.apoyos.find(x => x.needId === 'altas_capacidades')?.evidencia === 'A1')).toHaveLength(2);
    expect(aacc.filter(a => a.apoyos.find(x => x.needId === 'altas_capacidades')?.evidencia === 'A2')).toHaveLength(8);

    // Normalización de "Rozas de Madrid, Las" -> "Las Rozas de Madrid"
    expect(cee.some(c => c.municipio === 'Las Rozas de Madrid')).toBe(true);

    // Valdemoro hospital unit sin coordenadas UTM usa fallback aproximado
    const valdemoroHosp = OFFICIAL_ALL_SCHOOLS.find(s => s.codigo === '28081467');
    expect(valdemoroHosp?.ubicacionAproximada).toBe(true);
  });

  it('enriquece centros de Madrid capital con Ayuntamiento de Madrid (datos.madrid.es) sin inventar fuera', () => {
    const withTransport = OFFICIAL_ALL_SCHOOLS.filter(s => Boolean(s.transportePublico));
    const withServices = OFFICIAL_ALL_SCHOOLS.filter(s => s.serviciosConfirmadosAyto);
    const withAcc = OFFICIAL_ALL_SCHOOLS.filter(s => s.accesibilidadConfirmadaAyto);
    const outsideMadrid = OFFICIAL_ALL_SCHOOLS.filter(s => s.municipio !== 'Madrid');

    expect(withTransport.length).toBeGreaterThanOrEqual(150);
    expect(withServices.length).toBeGreaterThanOrEqual(120);
    expect(withAcc.length).toBeGreaterThanOrEqual(17);
    expect(outsideMadrid.every(s => !s.fuenteAyuntamiento && !s.serviciosConfirmadosAyto)).toBe(true);
  });

  it('cada registro TEA declara su procedencia, su fuente abierta y dirección/teléfono reales sin inventar', () => {
    OFFICIAL_TEA_SCHOOLS.forEach(s => {
      expect(s.procedencia).toBe('oficial');
      expect(s.ubicacionAproximada).toBe(false);
      expect(s.fuenteUrl).toBe(OFFICIAL_TEA_SOURCE.url);
      expect(s.fuenteDatosAbiertos).toContain('Portal de Datos Abiertos CAM');
      const teaSupport = s.apoyos.find(a => a.needId === 'tea');
      expect(teaSupport).toBeDefined();
      expect(teaSupport?.evidencia).toBe('A2');
      expect(s.direccion.length).toBeGreaterThan(3);
      expect(s.codigoPostal).toMatch(/^28\d{3}$/);
      expect(s.telefono.length).toBeGreaterThanOrEqual(7);
      expect(teaSupport?.aulaNombre).toBeUndefined();
      expect(teaSupport?.resolucionBOCM).toBeUndefined();
    });
  });

  it('corrige la errata tipográfica en Colegio La Dehesa de Humanes', () => {
    const dehesa = OFFICIAL_TEA_SCHOOLS.find(s => s.codigo === '28074086');
    expect(dehesa).toBeDefined();
    expect(dehesa?.nombre).toBe('Colegio La Dehesa de Humanes');
  });

  it('sitúa todos los centros dentro de la Comunidad de Madrid', () => {
    OFFICIAL_ALL_SCHOOLS.forEach(s => {
      expect(s.lat).toBeGreaterThan(39.8);
      expect(s.lat).toBeLessThan(41.2);
      expect(s.lng).toBeGreaterThan(-4.6);
      expect(s.lng).toBeLessThan(-3.0);
    });
  });

  it('los destinos de continuidad apuntan a centros reales del mismo listado', () => {
    const codes = new Set(OFFICIAL_TEA_SCHOOLS.map(s => s.codigo));
    OFFICIAL_TEA_SCHOOLS.forEach(s => {
      s.continuidad.destinos.forEach(d => expect(codes.has(d.codigo)).toBe(true));
    });
  });

  it('contiene únicamente las 470 entidades oficiales del catálogo sin registros de muestra', () => {
    expect(DEMO_SCHOOLS).toHaveLength(0);
    expect(SCHOOLS_DATA).toHaveLength(470);
    expect(SCHOOLS_DATA.every(s => s.procedencia === 'oficial')).toBe(true);
  });

  it('mantiene el nombre del registro CAM en el choque 28020120/28011258 con aviso en observaciones', () => {
    const chamberi = OFFICIAL_ALL_SCHOOLS.find(s => s.codigo === '28020120');
    const amorMisericordioso = OFFICIAL_ALL_SCHOOLS.find(s => s.codigo === '28011258');

    expect(chamberi).toBeDefined();
    expect(amorMisericordioso).toBeDefined();
    expect(chamberi?.nombre).toMatch(/Chamber[ií]/i);
    expect(chamberi?.observacionesOficiales).toMatch(/Amor Misericordioso/i);
    expect(chamberi?.observacionesOficiales).toContain('28020120');
    expect(amorMisericordioso?.nombre).toMatch(/Amor Misericordioso/i);
    expect(amorMisericordioso?.observacionesOficiales).toMatch(/Chamber[ií]/i);
    expect(amorMisericordioso?.observacionesOficiales).toContain('28011258');
  });

  it('evita el falso cruce de Ayuntamiento en CEE Alenta (28012299) y conserva códigos reales Ayto/CKAN', () => {
    const alenta = OFFICIAL_ALL_SCHOOLS.find(s => s.codigo === '28012299');
    expect(alenta).toBeDefined();
    expect(alenta?.serviciosConfirmadosAyto).toBeFalsy();
    expect(alenta?.servicios.comedor).toBe(false);
    expect(alenta?.servicios.transporte).toBe(false);
    expect(alenta?.transportePublico).toBeUndefined();

    const ceipso = OFFICIAL_ALL_SCHOOLS.find(s => s.codigo === '28026067');
    const ies = OFFICIAL_ALL_SCHOOLS.find(s => s.codigo === '28065841');
    expect(ceipso?.tipo).toBe('CEIPSO');
    expect(ies?.tipo).toBe('IES');

    const ciudadValencia = OFFICIAL_ALL_SCHOOLS.find(s => s.codigo === '28020673');
    expect(ciudadValencia?.accesibilidadCodigoAyto).toBe('2');
    expect(ciudadValencia?.accesibilidad.acceso_fisico).toBe(false);

    const hasOldCompensacion = OFFICIAL_ALL_SCHOOLS.some(s =>
      s.apoyos.some(a => /compensaci[oó]n educativa/i.test(a.detallesResolucion || ''))
    );
    expect(hasOldCompensacion).toBe(false);
  });

  it('el estado inicial no activa geolocalización automática ni fija Puerta del Sol', () => {
    expect(INITIAL_SEARCH_STATE.locationSource).toBe('municipality');
    expect(INITIAL_SEARCH_STATE.municipality).toBe('Madrid');
    expect(INITIAL_SEARCH_STATE.userCoordinates).toBeNull();
  });

  it('la búsqueda inicial (TEA, Primaria, 20 km de Madrid) devuelve centros oficiales', () => {
    const results = SCHOOLS_DATA.filter(s => matchesCentre(s, INITIAL_SEARCH_STATE));
    expect(results.length).toBeGreaterThan(50);
    expect(results.every(s => s.procedencia === 'oficial')).toBe(true);
  });

  it('el filtro Madrid + Tetuán devuelve estrictamente los centros TEA de Tetuán (nunca de otros municipios)', () => {
    const tetuanPrimaria: SearchState = {
      ...INITIAL_SEARCH_STATE,
      need: 'tea',
      stages: ['primaria'],
      locationSource: 'municipality',
      municipality: 'Madrid',
      district: 'Tetuán',
      radiusKm: 20
    };
    const resPrimaria = SCHOOLS_DATA.filter(s => matchesCentre(s, tetuanPrimaria));
    expect(resPrimaria).toHaveLength(2);
    expect(resPrimaria.every(s => s.municipio === 'Madrid' && s.distrito === 'Tetuán')).toBe(true);

    const tetuanTodas: SearchState = {
      ...tetuanPrimaria,
      stages: []
    };
    const resTodas = SCHOOLS_DATA.filter(s => matchesCentre(s, tetuanTodas));
    expect(resTodas).toHaveLength(3);
    expect(resTodas.every(s => s.municipio === 'Madrid' && s.distrito === 'Tetuán')).toBe(true);
  });

  it('la URL compartible nunca filtra coordenadas GPS personales', () => {
    const browserState: SearchState = {
      ...INITIAL_SEARCH_STATE,
      locationSource: 'browser',
      userCoordinates: { lat: 40.4123, lng: -3.6987, label: 'Tu ubicación' },
      radiusKm: 5
    };
    const qs = serializeSearchStateToQuery(browserState);
    expect(qs).not.toContain('lat=');
    expect(qs).not.toContain('lng=');
    expect(qs).not.toContain('loc=browser');
  });

  it('la búsqueda por municipio ignora tildes (Alcala / Alcalá)', () => {
    const state = {
      ...INITIAL_SEARCH_STATE,
      need: 'tea' as const,
      stages: [],
      locationSource: 'municipality' as const,
      userCoordinates: null,
      municipality: 'Alcala de Henares',
      radiusKm: null
    };
    const results = SCHOOLS_DATA.filter(s => matchesCentre(s, state) && s.procedencia === 'oficial');
    expect(results).toHaveLength(10);
  });

  it('devuelve 336 TEA, 47 Aulas de Enlace, 3 Visual, 10 AACC, los 3 EOEP Específicos o los 470 totales en Toda la Comunidad', () => {
    const baseState: SearchState = {
      ...INITIAL_SEARCH_STATE,
      stages: [],
      locationSource: 'municipality',
      userCoordinates: null,
      municipality: null,
      district: null,
      radiusKm: null
    };
    expect(SCHOOLS_DATA.filter(s => matchesCentre(s, { ...baseState, need: 'tea' }))).toHaveLength(336);
    expect(SCHOOLS_DATA.filter(s => matchesCentre(s, { ...baseState, need: 'compensatoria' }))).toHaveLength(47);
    expect(SCHOOLS_DATA.filter(s => matchesCentre(s, { ...baseState, need: 'compensatoria', stages: ['primaria'] }))).toHaveLength(43);
    expect(SCHOOLS_DATA.filter(s => matchesCentre(s, { ...baseState, need: 'compensatoria', stages: ['eso'] }))).toHaveLength(46);
    expect(SCHOOLS_DATA.filter(s => matchesCentre(s, { ...baseState, need: 'visual' }))).toHaveLength(3);
    expect(SCHOOLS_DATA.filter(s => matchesCentre(s, { ...baseState, need: 'altas_capacidades' }))).toHaveLength(10);
    expect(SCHOOLS_DATA.filter(s => matchesCentre(s, { ...baseState, need: 'auditiva' }))).toHaveLength(1);
    expect(SCHOOLS_DATA.filter(s => matchesCentre(s, { ...baseState, need: 'motora' }))).toHaveLength(1);
    expect(SCHOOLS_DATA.filter(s => matchesCentre(s, { ...baseState, need: 'tdah' }))).toHaveLength(1);
    expect(SCHOOLS_DATA.filter(s => matchesCentre(s, { ...baseState, need: 'tel_lenguaje' }))).toHaveLength(1);
    expect(SCHOOLS_DATA.filter(s => matchesCentre(s, { ...baseState, need: null }))).toHaveLength(470);

    // Dualidad TEA + Aula de Enlace (p. ej. 28014478)
    const dualEnlace = SCHOOLS_DATA.find(s => s.codigo === '28014478')!;
    expect(matchesCentre(dualEnlace, { ...baseState, need: 'tea' })).toBe(true);
    expect(matchesCentre(dualEnlace, { ...baseState, need: 'compensatoria' })).toBe(true);

    // El código 28020910 (IES Juan de la Cierva) tiene apoyo TEA en ESO y PEAC en Primaria/ESO/Bachillerato:
    const juanCiervaTeaPrim = SCHOOLS_DATA.find(s => s.codigo === '28020910')!;
    expect(matchesCentre(juanCiervaTeaPrim, { ...baseState, need: 'tea', stages: ['primaria'] })).toBe(false);
    expect(matchesCentre(juanCiervaTeaPrim, { ...baseState, need: 'altas_capacidades', stages: ['primaria'] })).toBe(true);

    // El código 28701214 cubre tanto TDAH como Trastorno del Lenguaje (TDL/TEL):
    const eoepTdahTel = SCHOOLS_DATA.find(s => s.codigo === '28701214')!;
    expect(matchesCentre(eoepTdahTel, { ...baseState, need: 'tdah' })).toBe(true);
    expect(matchesCentre(eoepTdahTel, { ...baseState, need: 'tel_lenguaje' })).toBe(true);
  });

  it('la búsqueda de texto libre ignora tildes (Mostoles / Chamartin)', () => {
    const base: SearchState = {
      ...INITIAL_SEARCH_STATE,
      stages: [],
      locationSource: 'municipality',
      userCoordinates: null,
      municipality: null,
      radiusKm: null
    };
    const mostoles = SCHOOLS_DATA.filter(s => matchesCentre(s, { ...base, searchQuery: 'Mostoles' }));
    const chamartin = SCHOOLS_DATA.filter(s => matchesCentre(s, { ...base, searchQuery: 'Chamartin' }));
    expect(mostoles.length).toBeGreaterThanOrEqual(9);
    expect(chamartin.length).toBeGreaterThan(0);
  });

  it('todos los escenarios FIL-001 a FIL-012 producen los resultados esperados desde un estado limpio', () => {
    const cleanBase: SearchState = {
      ...INITIAL_SEARCH_STATE,
      need: 'tea',
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

    const counts: Record<string, number> = {};
    for (const sc of TEST_SCENARIOS) {
      const state: SearchState = { ...cleanBase, ...sc.estadoPrueba };
      counts[sc.code] = SCHOOLS_DATA.filter(s => matchesCentre(s, state)).length;
    }

    expect(counts['FIL-001']).toBeGreaterThan(100);
    expect(counts['FIL-002']).toBeGreaterThan(30);
    expect(counts['FIL-003']).toBe(counts['FIL-001']);
    expect(counts['FIL-004']).toBe(10);
    expect(counts['FIL-005']).toBeGreaterThan(40);
    expect(counts['FIL-006']).toBeGreaterThan(100);
    expect(counts['FIL-007']).toBe(0);
    expect(counts['FIL-008']).toBeGreaterThan(counts['FIL-001']);
    expect(counts['FIL-009']).toBe(9);
    expect(counts['FIL-010']).toBe(counts['FIL-001']);
    expect(counts['FIL-011']).toBeGreaterThan(150);
    expect(counts['FIL-012']).toBe(counts['FIL-001']);
  });
});
