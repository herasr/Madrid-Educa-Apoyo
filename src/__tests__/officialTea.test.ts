/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Integridad del conjunto de datos oficial de centros preferentes TEA.
 */

import { describe, it, expect } from 'vitest';
import { OFFICIAL_TEA_SCHOOLS, OFFICIAL_TEA_SOURCE } from '../data/officialTea';
import { DEMO_SCHOOLS, SCHOOLS_DATA } from '../data/schools';
import { INITIAL_SEARCH_STATE, matchesCentre } from '../utils/filterEngine';

describe('Datos oficiales TEA (Comunidad de Madrid, curso 2024/2025)', () => {
  it('carga los 336 centros del documento oficial con códigos únicos de 8 dígitos', () => {
    expect(OFFICIAL_TEA_SCHOOLS).toHaveLength(336);
    expect(OFFICIAL_TEA_SOURCE.totalCentros).toBe(336);
    const codes = OFFICIAL_TEA_SCHOOLS.map(s => s.codigo);
    expect(new Set(codes).size).toBe(336);
    codes.forEach(c => expect(c).toMatch(/^28\d{6}$/));
  });

  it('cada registro declara su procedencia, su fuente y que la ubicación es aproximada', () => {
    OFFICIAL_TEA_SCHOOLS.forEach(s => {
      expect(s.procedencia).toBe('oficial');
      expect(s.ubicacionAproximada).toBe(true);
      expect(s.fuenteUrl).toBe(OFFICIAL_TEA_SOURCE.url);
      expect(s.apoyos).toHaveLength(1);
      expect(s.apoyos[0].needId).toBe('tea');
      // Dato oficial de un curso anterior: «por comprobar vigencia»
      expect(s.apoyos[0].evidencia).toBe('A2');
      // No se inventan datos que la fuente no publica
      expect(s.direccion).toBe('');
      expect(s.telefono).toBe('');
      expect(s.apoyos[0].aulaNombre).toBeUndefined();
      expect(s.apoyos[0].resolucionBOCM).toBeUndefined();
    });
  });

  it('sitúa todos los centros dentro de la Comunidad de Madrid', () => {
    OFFICIAL_TEA_SCHOOLS.forEach(s => {
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

  it('no contiene ningún dato inventado: 100% centros oficiales verificados', () => {
    expect(DEMO_SCHOOLS).toHaveLength(0);
    expect(SCHOOLS_DATA).toHaveLength(336);
    expect(SCHOOLS_DATA.every(s => s.procedencia === 'oficial')).toBe(true);
  });

  it('la búsqueda inicial (TEA, Primaria, 20 km de Madrid) devuelve centros oficiales', () => {
    const results = SCHOOLS_DATA.filter(s => matchesCentre(s, INITIAL_SEARCH_STATE));
    expect(results.length).toBeGreaterThan(50);
    expect(results.every(s => s.procedencia === 'oficial')).toBe(true);
  });

  it('la búsqueda por municipio ignora tildes (Alcala / Alcalá)', () => {
    const state = {
      ...INITIAL_SEARCH_STATE,
      stages: [],
      locationSource: 'municipality' as const,
      userCoordinates: null,
      municipality: 'Alcala de Henares',
      radiusKm: null
    };
    const results = SCHOOLS_DATA.filter(s => matchesCentre(s, state) && s.procedencia === 'oficial');
    expect(results).toHaveLength(10);
  });
});
