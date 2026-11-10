/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Batería de Pruebas oficiales N.10 del Prompt Maestro v2.4.
 * Permite ejecutar y verificar cada uno de los 12 escenarios de prueba con un solo clic.
 */

import { SearchState, TestScenario } from '../types';

export const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'FIL-001',
    code: 'FIL-001',
    titulo: 'TEA + Primaria + Madrid',
    descripcion: 'Búsqueda inicial acumulando necesidad (TEA), etapa (Primaria) y territorio (Madrid).',
    esperado: 'Muestra únicamente centros de atención preferente TEA con etapa Primaria en el ámbito de Madrid.',
    estadoPrueba: {
      need: 'tea',
      stages: ['primaria'],
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
    titulo: 'Añadir Comedor',
    descripcion: 'Añade comedor escolar obligatorio a la consulta anterior.',
    esperado: 'Conserva TEA + Primaria + Madrid y estrecha los resultados a centros con comedor verificado.',
    estadoPrueba: {
      need: 'tea',
      stages: ['primaria'],
      municipality: 'Madrid',
      radiusKm: 20,
      requiredServices: ['comedor']
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
      municipality: 'Madrid',
      radiusKm: 20,
      ownership: ['publico', 'concertado']
    }
  },
  {
    id: 'FIL-004',
    code: 'FIL-004',
    titulo: 'Comedor + Transporte Obligatorios (AND)',
    descripcion: 'Marca simultáneamente comedor escolar y transporte como servicios obligatorios.',
    esperado: 'Aplica operador AND estricto: el centro DEBE disponer de ambos servicios a la vez.',
    estadoPrueba: {
      need: 'tea',
      stages: ['primaria'],
      municipality: 'Madrid',
      radiusKm: 25,
      requiredServices: ['comedor', 'transporte']
    }
  },
  {
    id: 'FIL-005',
    code: 'FIL-005',
    titulo: 'Cambiar Radio',
    descripcion: 'Modifica el radio geodésico a 10 km conservando necesidad y etapa.',
    esperado: 'Conserva necesidad (TEA) y etapa (Primaria); actualiza el recuento territorial.',
    estadoPrueba: {
      need: 'tea',
      stages: ['primaria'],
      municipality: 'Madrid',
      radiusKm: 10
    }
  },
  {
    id: 'FIL-006',
    code: 'FIL-006',
    titulo: 'Volver desde Ficha',
    descripcion: 'Simula la apertura de la ficha detallada de un centro y el retorno a la lista.',
    esperado: 'Conserva todos los filtros intactos, la posición de ordenación y el listado de resultados.',
    estadoPrueba: {
      need: 'tea',
      stages: ['primaria'],
      municipality: 'Madrid',
      radiusKm: 20,
      requiredServices: ['comedor']
    }
  },
  {
    id: 'FIL-007',
    code: 'FIL-007',
    titulo: 'Cero Resultados (No borrado automático)',
    descripcion: 'Combina criterios altamente restrictivos que producen 0 resultados (ej. Discapacidad auditiva + Bachillerato + Radio 5 km).',
    esperado: 'NO elimina filtros automáticamente. Muestra la combinación exacta fallida y botones de relajación asistida.',
    estadoPrueba: {
      need: 'auditiva',
      stages: ['bachillerato'],
      municipality: 'Alcala de Henares',
      radiusKm: 5,
      requiredServices: ['transporte', 'enfermeria'],
      evidence: ['A1']
    }
  },
  {
    id: 'FIL-008',
    code: 'FIL-008',
    titulo: 'Quitar un Chip individual',
    descripcion: 'Elimina únicamente el filtro correspondiente al chip seleccionado (p. ej. retirar comedor).',
    esperado: 'Conserva todos los demás filtros y recalcula el recuento al instante.',
    estadoPrueba: {
      need: 'tea',
      stages: ['primaria', 'eso'],
      municipality: 'Madrid',
      radiusKm: 20,
      ownership: ['publico'],
      requiredServices: ['comedor']
    }
  },
  {
    id: 'FIL-009',
    code: 'FIL-009',
    titulo: 'Recargar / URL Reproducible',
    descripcion: 'Simula restaurar la consulta desde parámetros URL codificados.',
    esperado: 'Restaura exactamente el estado acumulado sin exponer datos de menores ni diagnósticos libres.',
    estadoPrueba: {
      need: 'motora',
      stages: ['primaria'],
      municipality: 'Fuenlabrada',
      radiusKm: 20,
      requiredServices: ['transporte'],
      evidence: ['A1', 'A2']
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
      municipality: 'Madrid',
      radiusKm: 20
    }
  }
];
