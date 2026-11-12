/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Batería de Pruebas técnicas oficial para demostración (Proyecto DataMad 2026).
 * Permite ejecutar y verificar cada uno de los 12 escenarios de prueba con un solo clic.
 */

import { SearchState, TestScenario } from '../types';

export const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'FIL-001',
    code: 'FIL-001',
    titulo: 'TEA + Primaria + Madrid',
    descripcion: 'Búsqueda inicial acumulando necesidad (TEA), etapa (Primaria) y territorio (Madrid).',
    esperado: 'Muestra únicamente centros oficiales de atención preferente TEA con etapa Primaria en Madrid.',
    estadoPrueba: {
      need: 'tea',
      stages: ['primaria'],
      locationSource: 'municipality',
      userCoordinates: null,
      municipality: 'Madrid',
      radiusKm: 20,
      ownership: [],
      modalities: [],
      requiredServices: [],
      preferredServices: [],
      accessibilityRequired: [],
      evidence: ['A1', 'A2'],
      searchQuery: ''
    }
  },
  {
    id: 'FIL-002',
    code: 'FIL-002',
    titulo: 'Filtrar por Etapa Secundaria (ESO)',
    descripcion: 'Cambia la etapa a Secundaria (ESO) conservando la necesidad TEA en Madrid.',
    esperado: 'Filtra la lista a centros preferentes TEA que imparten Secundaria en la zona.',
    estadoPrueba: {
      need: 'tea',
      stages: ['eso'],
      locationSource: 'municipality',
      userCoordinates: null,
      municipality: 'Madrid',
      radiusKm: 20,
      ownership: [],
      requiredServices: []
    }
  },
  {
    id: 'FIL-003',
    code: 'FIL-003',
    titulo: 'Público + Concertado (OR)',
    descripcion: 'Selección de ambas titularidades simultáneamente dentro de la misma dimensión.',
    esperado: 'Aplica operador OR: muestra centros públicos O concertados sin excluir ninguno.',
    estadoPrueba: {
      need: 'tea',
      stages: ['primaria'],
      locationSource: 'municipality',
      userCoordinates: null,
      municipality: 'Madrid',
      radiusKm: 20,
      ownership: ['publico', 'concertado']
    }
  },
  {
    id: 'FIL-004',
    code: 'FIL-004',
    titulo: 'Búsqueda de Municipio (Alcalá de Henares)',
    descripcion: 'Selecciona un municipio con normalización de tildes y denominación oficial INE.',
    esperado: 'Muestra los 10 centros oficiales de atención preferente TEA en Alcalá de Henares.',
    estadoPrueba: {
      need: 'tea',
      stages: [],
      locationSource: 'municipality',
      userCoordinates: null,
      municipality: 'Alcala de Henares',
      radiusKm: null,
      ownership: []
    }
  },
  {
    id: 'FIL-005',
    code: 'FIL-005',
    titulo: 'Cambiar Radio Geodésico (10 km)',
    descripcion: 'Modifica el radio geodésico a 10 km conservando necesidad y etapa.',
    esperado: 'Conserva necesidad (TEA) y etapa (Primaria); actualiza la lista al nuevo radio.',
    estadoPrueba: {
      need: 'tea',
      stages: ['primaria'],
      locationSource: 'municipality',
      userCoordinates: null,
      municipality: 'Madrid',
      radiusKm: 10
    }
  },
  {
    id: 'FIL-006',
    code: 'FIL-006',
    titulo: 'Filtrar solo Centros Públicos',
    descripcion: 'Restringe la búsqueda exclusivamente a la red pública de la Consejería de Educación.',
    esperado: 'Muestra los CEIP, IES y CEIPSO públicos con apoyo TEA en la zona.',
    estadoPrueba: {
      need: 'tea',
      stages: ['primaria'],
      locationSource: 'municipality',
      userCoordinates: null,
      municipality: 'Madrid',
      radiusKm: 20,
      ownership: ['publico']
    }
  },
  {
    id: 'FIL-007',
    code: 'FIL-007',
    titulo: 'Cero Resultados (Gestión Asistida)',
    descripcion: 'Selecciona una necesidad pendiente de incorporar (Discapacidad Auditiva).',
    esperado: 'NO elimina filtros. Explica que la necesidad está pendiente y ofrece volver a TEA con 1 clic.',
    estadoPrueba: {
      need: 'auditiva',
      stages: ['primaria'],
      locationSource: 'municipality',
      userCoordinates: null,
      municipality: 'Madrid',
      radiusKm: 20
    }
  },
  {
    id: 'FIL-008',
    code: 'FIL-008',
    titulo: 'Combinar Etapas (Infantil + Primaria)',
    descripcion: 'Selecciona múltiples etapas simultáneamente dentro del catálogo oficial.',
    esperado: 'Conserva ambas etapas y actualiza dinámicamente los recuentos.',
    estadoPrueba: {
      need: 'tea',
      stages: ['infantil', 'primaria'],
      locationSource: 'municipality',
      userCoordinates: null,
      municipality: 'Madrid',
      radiusKm: 20,
      ownership: []
    }
  },
  {
    id: 'FIL-009',
    code: 'FIL-009',
    titulo: 'Recargar / URL Reproducible (Móstoles)',
    descripcion: 'Simula restaurar la consulta desde parámetros URL codificados.',
    esperado: 'Restaura exactamente el estado acumulado para Móstoles (9 centros en Primaria).',
    estadoPrueba: {
      need: 'tea',
      stages: ['primaria'],
      locationSource: 'municipality',
      userCoordinates: null,
      municipality: 'Mostoles',
      radiusKm: null,
      ownership: []
    }
  },
  {
    id: 'FIL-010',
    code: 'FIL-010',
    titulo: 'Pasaporte Local',
    descripcion: 'Genera el pasaporte con filtros, fecha, evidencia y preguntas clave de entrevista.',
    esperado: 'Crea el dossier para la familia con los centros seleccionados y las fuentes oficiales.',
    estadoPrueba: {
      need: 'tea',
      stages: ['primaria'],
      locationSource: 'municipality',
      userCoordinates: null,
      municipality: 'Madrid',
      radiusKm: 20
    }
  },
  {
    id: 'FIL-011',
    code: 'FIL-011',
    titulo: 'Continuidad Educativa',
    descripcion: 'Navega a la vista de continuidad de Primaria a Secundaria/ESO.',
    esperado: 'Hereda necesidad, etapa y territorio; muestra estado del apoyo en Secundaria (CEIPSO vs adscripción).',
    estadoPrueba: {
      need: 'tea',
      stages: ['primaria', 'eso'],
      locationSource: 'municipality',
      userCoordinates: null,
      municipality: 'Madrid',
      radiusKm: 20
    }
  },
  {
    id: 'FIL-012',
    code: 'FIL-012',
    titulo: 'Accesibilidad y Lector de Pantalla',
    descripcion: 'Verifica la emisión de novedades para productos de apoyo con aria-live="polite".',
    esperado: 'El recuento y los cambios de filtro se anuncian inmediatamente en la región aria-live.',
    estadoPrueba: {
      need: 'tea',
      stages: ['primaria'],
      locationSource: 'municipality',
      userCoordinates: null,
      municipality: 'Madrid',
      radiusKm: 20
    }
  }
];
