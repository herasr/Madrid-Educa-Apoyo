/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Motor de filtros acumulativos para Madrid Educa Apoyo
 * Implementa las reglas lógicas N.1 a N.9, contadores dinámicos y sugerencias de relajación.
 */

import {
  AccessibilityId,
  DynamicCounts,
  EvidenceId,
  ModalityId,
  NeedId,
  OwnershipId,
  RelaxationOption,
  School,
  SearchState,
  ServiceId,
  StageId,
  ZeroResultsAnalysis
} from '../types';
import {
  MADRID_DISTRICTS,
  calculateHaversineDistance,
  findMunicipality,
  normalizeName
} from '../data/municipalities';
import { OFFICIAL_TEA_SOURCE } from '../data/officialTea';

export const INITIAL_SEARCH_STATE: SearchState = {
  need: 'tea', // Predeterminado en flujo normal según especificación
  stages: ['primaria'],
  stageMatchMode: 'any',
  municipality: 'Madrid',
  district: null,
  radiusKm: 20,
  locationSource: 'municipality',
  userCoordinates: null,
  ownership: [], // Vacío = cualquier titularidad (público y concertado)
  modalities: [],
  requiredServices: [],
  preferredServices: [],
  accessibilityRequired: [],
  evidence: ['A1', 'A2'],
  searchQuery: '',
  sort: 'distance'
};

/**
 * N.1 Regla lógica de coincidencia de centro
 */
export function matchesCentre(centre: School, state: SearchState): boolean {
  // 1. Necesidad educativa
  if (state.need) {
    const hasNeed = centre.apoyos.some(a => a.needId === state.need);
    if (!hasNeed) return false;
  }

  // 2. Etapas (Modo ANY u OR vs ALL o AND)
  // Si hay una necesidad activa y el centro tiene varios apoyos (ej. TEA + PEAC), evaluar las etapas del apoyo activo
  if (state.stages.length > 0) {
    const activeSupport = state.need ? centre.apoyos.find(a => a.needId === state.need) : undefined;
    const effectiveStages = activeSupport?.etapasConApoyo || centre.etapas;
    if (state.stageMatchMode === 'all') {
      const hasAllStages = state.stages.every(st => effectiveStages.includes(st));
      if (!hasAllStages) return false;
    } else {
      const hasAnyStage = state.stages.some(st => effectiveStages.includes(st));
      if (!hasAnyStage) return false;
    }
  }

  // 3. Territorio (Ubicación de referencia y Radio geodésico)
  if (state.locationSource === 'browser' && state.userCoordinates) {
    if (state.radiusKm !== null && state.radiusKm > 0) {
      const distance = calculateHaversineDistance(
        state.userCoordinates.lat,
        state.userCoordinates.lng,
        centre.lat,
        centre.lng
      );
      if (distance > state.radiusKm) return false;
    }
  } else if (state.municipality) {
    const munObj = findMunicipality(state.municipality);

    // Si hay distrito seleccionado (Madrid capital), exigir coincidencia estricta y excluir otros municipios o sin distrito
    if (state.district) {
      if (
        normalizeName(centre.municipio) !== 'madrid' ||
        !centre.distrito ||
        normalizeName(centre.distrito) !== normalizeName(state.district)
      ) {
        return false;
      }
    } else if (state.radiusKm !== null && state.radiusKm > 0 && munObj) {
      const distance = calculateHaversineDistance(munObj.lat, munObj.lng, centre.lat, centre.lng);
      if (distance > state.radiusKm) return false;
    } else {
      // Coincidencia estricta normalizada de municipio si no hay radio ni distrito
      const centreMun = normalizeName(centre.municipio);
      const wantedMun = normalizeName(munObj?.id || state.municipality);
      if (centreMun !== wantedMun) return false;
    }
  }

  // 4. Titularidad (OR entre opciones seleccionadas)
  if (state.ownership.length > 0) {
    if (!state.ownership.includes(centre.titularidad)) return false;
  }

  // 5. Modalidad (OR entre modalidades seleccionadas)
  if (state.modalities.length > 0) {
    if (!state.modalities.includes(centre.modalidad)) return false;
  }

  // 6. Servicios obligatorios (AND entre servicios)
  if (state.requiredServices.length > 0) {
    const hasAllServices = state.requiredServices.every(srv => centre.servicios[srv] === true);
    if (!hasAllServices) return false;
  }

  // 7. Accesibilidad obligatoria (AND)
  if (state.accessibilityRequired.length > 0) {
    const hasAllAccessibility = state.accessibilityRequired.every(acc => centre.accesibilidad[acc] === true);
    if (!hasAllAccessibility) return false;
  }

  // 8. Evidencia (AND)
  if (state.evidence.length > 0) {
    if (state.need) {
      const needSupport = centre.apoyos.find(a => a.needId === state.need);
      if (!needSupport || !state.evidence.includes(needSupport.evidencia)) {
        return false;
      }
    } else {
      const hasMatchingEvidence = centre.apoyos.some(a => state.evidence.includes(a.evidencia));
      if (!hasMatchingEvidence) return false;
    }
  }

  // 9. Búsqueda de texto libre (código de centro, nombre, municipio o distrito, insensible a tildes)
  if (state.searchQuery && state.searchQuery.trim().length > 0) {
    const rawQuery = state.searchQuery.trim();
    const normQuery = normalizeName(rawQuery);
    const matchesQuery =
      normalizeName(centre.nombre).includes(normQuery) ||
      centre.codigo.includes(rawQuery) ||
      normalizeName(centre.direccion || '').includes(normQuery) ||
      (centre.distrito ? normalizeName(centre.distrito).includes(normQuery) : false) ||
      normalizeName(centre.municipio).includes(normQuery);
    if (!matchesQuery) return false;
  }

  return true;
}

/**
 * Ordenación de resultados
 */
export function sortCentres(centres: School[], state: SearchState): School[] {
  const munObj = findMunicipality(state.municipality) || null;

  const refCoords = (state.locationSource === 'browser' && state.userCoordinates)
    ? { lat: state.userCoordinates.lat, lng: state.userCoordinates.lng }
    : munObj
    ? { lat: munObj.lat, lng: munObj.lng }
    : null;

  return [...centres].sort((a, b) => {
    // 1. Si hay servicios preferidos, priorizar centros que los cumplan
    if (state.preferredServices.length > 0) {
      const scoreA = state.preferredServices.filter(s => a.servicios[s]).length;
      const scoreB = state.preferredServices.filter(s => b.servicios[s]).length;
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
    }

    if (state.sort === 'alphabetical') {
      return a.nombre.localeCompare(b.nombre, 'es');
    }

    if (state.sort === 'evidence_then_distance') {
      const getEvidenceRank = (school: School): number => {
        if (state.need) {
          const support = school.apoyos.find(sup => sup.needId === state.need);
          if (support) return support.evidencia === 'A1' ? 0 : 1;
        }
        return school.apoyos.some(sup => sup.evidencia === 'A1') ? 0 : 1;
      };
      const rankDiff = getEvidenceRank(a) - getEvidenceRank(b);
      if (rankDiff !== 0) {
        return rankDiff;
      }
    }

    // Orden por distancia geodésica
    const distA = refCoords ? calculateHaversineDistance(refCoords.lat, refCoords.lng, a.lat, a.lng) : 0;
    const distB = refCoords ? calculateHaversineDistance(refCoords.lat, refCoords.lng, b.lat, b.lng) : 0;

    return distA - distB;
  });
}

/**
 * N.5 Contadores dinámicos:
 * Calcula cuántos resultados quedarían si se añade/activa cada opción
 * manteniendo todos los demás filtros actuales.
 */
export function computeDynamicCounts(schools: School[], state: SearchState): DynamicCounts {
  const allNeeds: NeedId[] = ['tea', 'auditiva', 'motora', 'educacion_especial', 'visual', 'altas_capacidades', 'tdah', 'tel_lenguaje', 'salud_hospitalaria', 'compensatoria'];
  const allStages: StageId[] = ['infantil', 'primaria', 'eso', 'bachillerato', 'fp_basica'];
  const allOwnership: OwnershipId[] = ['publico', 'concertado', 'privado'];
  const allModalities: ModalityId[] = ['preferente', 'especial', 'ordinaria'];
  const allServices: ServiceId[] = ['comedor', 'transporte', 'aula_matinal', 'enfermeria', 'actividades_extraescolares'];
  const allAccessibility: AccessibilityId[] = ['acceso_fisico', 'ascensor', 'bano_adaptado', 'bucle_magnetico', 'plano_podotactil'];
  const allEvidence: EvidenceId[] = ['A1', 'A2'];

  const counts: DynamicCounts = {
    needs: {} as Record<NeedId, number>,
    stages: {} as Record<StageId, number>,
    ownership: {} as Record<OwnershipId, number>,
    modalities: {} as Record<ModalityId, number>,
    requiredServices: {} as Record<ServiceId, number>,
    preferredServices: {} as Record<ServiceId, number>,
    accessibility: {} as Record<AccessibilityId, number>,
    evidence: {} as Record<EvidenceId, number>
  };

  // 1. Necesidades (reemplazando need en flujo normal)
  allNeeds.forEach(needId => {
    const testState: SearchState = { ...state, need: needId };
    counts.needs[needId] = schools.filter(s => matchesCentre(s, testState)).length;
  });

  // 2. Etapas:
  allStages.forEach(stageId => {
    let testStages: StageId[];
    if (state.stageMatchMode === 'all' && state.stages.length > 0) {
      testStages = state.stages.includes(stageId) ? state.stages : [...state.stages, stageId];
    } else {
      testStages = [stageId];
    }
    const testState: SearchState = { ...state, stages: testStages };
    counts.stages[stageId] = schools.filter(s => matchesCentre(s, testState)).length;
  });

  // 3. Titularidad
  allOwnership.forEach(ownId => {
    const ownership = state.ownership.includes(ownId) ? state.ownership : [...state.ownership, ownId];
    const testState: SearchState = { ...state, ownership };
    counts.ownership[ownId] = schools.filter(s => matchesCentre(s, testState)).length;
  });

  // 4. Modalidad
  allModalities.forEach(modId => {
    const modalities = state.modalities.includes(modId) ? state.modalities : [...state.modalities, modId];
    const testState: SearchState = { ...state, modalities };
    counts.modalities[modId] = schools.filter(s => matchesCentre(s, testState)).length;
  });

  // 5. Servicios obligatorios
  allServices.forEach(srvId => {
    const requiredServices = state.requiredServices.includes(srvId)
      ? state.requiredServices
      : [...state.requiredServices, srvId];
    const testState: SearchState = { ...state, requiredServices };
    counts.requiredServices[srvId] = schools.filter(s => matchesCentre(s, testState)).length;
  });

  // 6. Servicios preferidos (no excluyen)
  allServices.forEach(srvId => {
    counts.preferredServices[srvId] = schools.filter(s => matchesCentre(s, state) && s.servicios[srvId]).length;
  });

  // 7. Accesibilidad
  allAccessibility.forEach(accId => {
    const accessibilityRequired = state.accessibilityRequired.includes(accId)
      ? state.accessibilityRequired
      : [...state.accessibilityRequired, accId];
    const testState: SearchState = { ...state, accessibilityRequired };
    counts.accessibility[accId] = schools.filter(s => matchesCentre(s, testState)).length;
  });

  // 8. Evidencia
  allEvidence.forEach(evId => {
    const evidence = [evId];
    const testState: SearchState = { ...state, evidence };
    counts.evidence[evId] = schools.filter(s => matchesCentre(s, testState)).length;
  });

  return counts;
}

const ACTIVE_CATALOG_NEEDS: NeedId[] = [
  'tea',
  'compensatoria',
  'educacion_especial',
  'salud_hospitalaria',
  'visual',
  'altas_capacidades',
  'auditiva',
  'motora',
  'tdah',
  'tel_lenguaje'
];

/**
 * N.7 Análisis de Cero Resultados y Generación de Relajaciones con 1 Clic
 * "Cuando la intersección acumulativa produce cero resultados, la aplicación no debe borrar
 * criterios automáticamente. Mantener intacta la necesidad educativa."
 */
export function analyzeZeroResults(schools: School[], state: SearchState): ZeroResultsAnalysis {
  const failingConditions: string[] = [];
  const relaxations: RelaxationOption[] = [];

  // Explicación textual de la combinación
  const needName = 
    state.need === 'tea' ? 'TEA' : 
    state.need === 'auditiva' ? 'Discapacidad Auditiva' : 
    state.need === 'motora' ? 'Discapacidad Motora' : 
    state.need === 'visual' ? 'Discapacidad Visual' : 
    state.need === 'altas_capacidades' ? 'Altas Capacidades' : 
    state.need === 'educacion_especial' ? 'Educación Especial (CEE)' : 
    state.need === 'tdah' ? 'TDAH y Conducta' : 
    state.need === 'tel_lenguaje' ? 'Trastornos del Lenguaje' : 
    state.need === 'salud_hospitalaria' ? 'Atención Hospitalaria' : 
    state.need === 'compensatoria' ? 'Escuelas de Bienvenida' : 
    'la necesidad seleccionada';
  const munName = state.municipality || 'la Comunidad de Madrid';
  const radiusText = state.radiusKm ? ` en ${state.radiusKm} km de ${munName}` : ` en ${munName}`;

  let reason = `No hay centros que cumplan simultáneamente todos los criterios activos para ${needName}${radiusText}.`;

  const SERVICE_LABELS: Record<ServiceId, string> = {
    comedor: 'Comedor escolar',
    transporte: 'Transporte escolar',
    aula_matinal: 'Horario ampliado / Aula matinal',
    enfermeria: 'Enfermería escolar',
    actividades_extraescolares: 'Actividades extraescolares'
  };

  if (state.need && !ACTIVE_CATALOG_NEEDS.includes(state.need)) {
    failingConditions.push(`Necesidad sin listado abierto nominativo (${needName})`);
  } else {
    if (state.municipality) {
      failingConditions.push(`Municipio: ${state.municipality}`);
    }
    if (state.district) {
      failingConditions.push(`Distrito: ${state.district}`);
    }
    if (state.radiusKm !== null) {
      failingConditions.push(`Radio: ${state.radiusKm} km`);
    }
    if (state.requiredServices.length > 0) {
      failingConditions.push(
        `Servicios obligatorios: ${state.requiredServices.map(s => SERVICE_LABELS[s] || s).join(', ')}`
      );
    }
    if (state.accessibilityRequired.length > 0) {
      failingConditions.push(`Accesibilidad PMR obligatoria (${state.accessibilityRequired.length})`);
    }
    if (state.evidence.length === 1) {
      failingConditions.push(`Evidencia requerida: ${state.evidence[0]}`);
    }
    if (state.ownership.length > 0) {
      failingConditions.push(`Titularidad: ${state.ownership.join(', ')}`);
    }
  }

  // Caso A: Necesidad sin catálogo oficial descargable incorporado
  if (state.need && !ACTIVE_CATALOG_NEEDS.includes(state.need)) {
    reason = `No existe todavía un conjunto abierto regional descargable con resolución actualizada para ${needName}. Por rigor deontológico, no mostramos centros inventados o desactualizados.`;
    const teaCount = schools.filter(s => matchesCentre(s, { ...state, need: 'tea' })).length;
    const resolvedTeaCount = teaCount > 0 ? teaCount : OFFICIAL_TEA_SOURCE.totalCentros;
    relaxations.push({
      id: 'switch_to_tea',
      label: "Ver centros de Atención Preferente TEA (datos oficiales)",
      description: `Muestra ${resolvedTeaCount} centro(s) oficiales TEA.`,
      actionType: 'remove_filter',
      resultingCount: resolvedTeaCount,
      apply: (prev) => ({ ...prev, need: 'tea' })
    });
    const ceeCount = schools.filter(s => matchesCentre(s, { ...state, need: 'educacion_especial' })).length;
    if (ceeCount > 0) {
      relaxations.push({
        id: 'switch_to_cee',
        label: "Ver Centros de Educación Especial (CEE)",
        description: `Muestra ${ceeCount} centro(s) específicos activos en la zona.`,
        actionType: 'remove_filter',
        resultingCount: ceeCount,
        apply: (prev) => ({ ...prev, need: 'educacion_especial' })
      });
    }
    return { reason, failingConditions, relaxations };
  }

  // Caso B: Aulas de Enlace públicas (sin CSV nominativo), servicios municipales o Evidencia A1
  if (
    state.need === 'compensatoria' &&
    state.ownership.includes('publico') &&
    !state.ownership.includes('concertado')
  ) {
    reason = `Las ${OFFICIAL_TEA_SOURCE.totalCompensatoria} Escuelas de Bienvenida / Aulas de Enlace cargadas (${OFFICIAL_TEA_SOURCE.cursoAulasEnlace}) corresponden a centros concertados autorizados. La Consejería no publica un listado abierto nominativo de Aulas de Enlace en CEIP/IES públicos, que se asignan vía DAT/SAE.`;
  } else if (state.requiredServices.length > 0 || state.accessibilityRequired.length > 0 || (state.evidence.length === 1 && state.evidence[0] === 'A1')) {
    if (state.need === 'tea' && state.evidence.length === 1 && state.evidence[0] === 'A1') {
      reason = `Todos los centros preferentes TEA proceden de la publicación 2024/25 (nivel A2, por comprobar vigencia actual ante el SAE).`;
    } else if (state.requiredServices.length > 0 || state.accessibilityRequired.length > 0) {
      reason = `Los datos de servicios complementarios y accesibilidad física proceden exclusivamente del Ayuntamiento de Madrid (datos.madrid.es) para centros de la capital y no constan para los otros 178 municipios.`;
    }
    
    const stateCleanSrv: SearchState = {
      ...state,
      requiredServices: [],
      accessibilityRequired: [],
      evidence: ['A1', 'A2']
    };
    const countClean = schools.filter(s => matchesCentre(s, stateCleanSrv)).length;
    if (countClean > 0) {
      relaxations.push({
        id: 'clear_unsupported_filters',
        label: "Retirar requisitos de servicios, accesibilidad y evidencia A1",
        description: `Muestra los ${countClean} centros oficiales que cumplen el resto de filtros.`,
        actionType: 'remove_filter',
        resultingCount: countClean,
        apply: (prev) => ({
          ...prev,
          requiredServices: [],
          accessibilityRequired: [],
          evidence: ['A1', 'A2']
        })
      });
    }
  }

  // 1. Probar relajación de cada servicio obligatorio
  state.requiredServices.forEach(srv => {
    const srvName = SERVICE_LABELS[srv] || srv;
    
    // Opción A: Retirar servicio obligatorio
    const stateWithoutSrv: SearchState = {
      ...state,
      requiredServices: state.requiredServices.filter(s => s !== srv)
    };
    const countWithout = schools.filter(s => matchesCentre(s, stateWithoutSrv)).length;
    if (countWithout > 0) {
      relaxations.push({
        id: `remove_srv_${srv}`,
        label: `Retirar filtro obligatorio de ${srvName}`,
        description: `Muestra ${countWithout} centro(s) que cumplen el resto de criterios.`,
        actionType: 'remove_filter',
        filterKey: srv,
        resultingCount: countWithout,
        apply: (prev) => ({
          ...prev,
          requiredServices: prev.requiredServices.filter(s => s !== srv)
        })
      });
    }

    // Opción B: Cambiar servicio obligatorio a preferido
    const stateAsPreferred: SearchState = {
      ...state,
      requiredServices: state.requiredServices.filter(s => s !== srv),
      preferredServices: Array.from(new Set([...state.preferredServices, srv]))
    };
    const countPreferred = schools.filter(s => matchesCentre(s, stateAsPreferred)).length;
    if (countPreferred > 0 && !relaxations.some(r => r.id === `prefer_${srv}`)) {
      relaxations.push({
        id: `prefer_${srv}`,
        label: `Cambiar ${srvName} de obligatorio a preferido`,
        description: `No excluirá centros sin ${srvName}, pero los priorizará arriba (${countPreferred} centros).`,
        actionType: 'demote_service',
        filterKey: srv,
        resultingCount: countPreferred,
        apply: (prev) => ({
          ...prev,
          requiredServices: prev.requiredServices.filter(s => s !== srv),
          preferredServices: Array.from(new Set([...prev.preferredServices, srv]))
        })
      });
    }
  });

  // 2. Probar ampliar radio si hay radio restringido
  if (state.radiusKm !== null && state.radiusKm < 40) {
    const newRadiuses = [state.radiusKm + 15, 35, 50].filter(r => r > (state.radiusKm || 0));
    for (const r of newRadiuses) {
      const stateExpandedRadius: SearchState = { ...state, radiusKm: r };
      const countExpanded = schools.filter(s => matchesCentre(s, stateExpandedRadius)).length;
      if (countExpanded > 0) {
        relaxations.push({
          id: `expand_radius_${r}`,
          label: `Ampliar radio a ${r} km`,
          description: `Extiende la búsqueda territorial a ${r} km (${countExpanded} centro(s)).`,
          actionType: 'expand_radius',
          resultingCount: countExpanded,
          apply: (prev) => ({ ...prev, radiusKm: r })
        });
        break; // Ofrecer la ampliación más cercana útil
      }
    }
  }

  // 3. Probar incluir A2 si sólo se estaba filtrando por A1
  if (state.evidence.length === 1 && state.evidence[0] === 'A1') {
    const stateWithA2: SearchState = { ...state, evidence: ['A1', 'A2'] };
    const countA2 = schools.filter(s => matchesCentre(s, stateWithA2)).length;
    if (countA2 > 0) {
      relaxations.push({
        id: 'include_a2',
        label: 'Incluir evidencia A2 (en proceso de comprobación)',
        description: `Permite centros con resolución o vigencia en tramitación (+${countA2} centros).`,
        actionType: 'include_a2',
        resultingCount: countA2,
        apply: (prev) => ({ ...prev, evidence: ['A1', 'A2'] })
      });
    }
  }

  // 4. Probar relajar titularidad si hay alguna restringida
  if (state.ownership.length > 0) {
    const stateAnyOwnership: SearchState = { ...state, ownership: [] };
    const countOwnership = schools.filter(s => matchesCentre(s, stateAnyOwnership)).length;
    if (countOwnership > 0) {
      relaxations.push({
        id: 'remove_ownership',
        label: 'Admitir tanto centros públicos como concertados',
        description: `Amplía a cualquier régimen de titularidad (${countOwnership} centro(s)).`,
        actionType: 'remove_filter',
        resultingCount: countOwnership,
        apply: (prev) => ({ ...prev, ownership: [] })
      });
    }
  }

  return {
    reason,
    failingConditions,
    relaxations
  };
}

/**
 * N.4 URL Reproducible:
 * Serializa y deserializa el estado de búsqueda a querystring
 * Cumple: No contiene datos personales, valida contra listas controladas.
 */
export function serializeSearchStateToQuery(state: SearchState): string {
  const params = new URLSearchParams();

  params.set('need', state.need ?? 'all');
  params.set('stage', state.stages.length > 0 ? state.stages.join(',') : 'none');
  if (state.stageMatchMode && state.stageMatchMode !== 'any') {
    params.set('smode', state.stageMatchMode);
  }
  // Por privacidad, nunca serializamos coordenadas personales GPS (lat/lng) en la URL compartible.
  if (state.municipality && state.locationSource !== 'browser') {
    params.set('municipality', state.municipality);
    if (state.district) params.set('district', state.district);
  } else {
    params.set('municipality', 'all');
  }
  params.set('radius', state.radiusKm !== null ? String(state.radiusKm) : 'none');
  if (state.ownership.length > 0) params.set('ownership', state.ownership.join(','));
  if (state.modalities.length > 0) params.set('modality', state.modalities.join(','));
  if (state.requiredServices.length > 0) params.set('required', state.requiredServices.join(','));
  if (state.preferredServices.length > 0) params.set('preferred', state.preferredServices.join(','));
  if (state.accessibilityRequired.length > 0) params.set('accessibility', state.accessibilityRequired.join(','));
  params.set('evidence', state.evidence.length > 0 ? state.evidence.join(',') : 'none');
  if (state.searchQuery.trim().length > 0) params.set('q', state.searchQuery.trim());
  if (state.sort !== 'distance') params.set('sort', state.sort);

  return params.toString();
}

export function parseSearchStateFromQuery(queryString: string): SearchState {
  const params = new URLSearchParams(queryString.startsWith('?') ? queryString.slice(1) : queryString);
  const state: SearchState = { ...INITIAL_SEARCH_STATE };

  // Listas controladas para validación estricta de entrada
  const validNeeds: NeedId[] = ['tea', 'auditiva', 'motora', 'educacion_especial', 'visual', 'altas_capacidades', 'tdah', 'tel_lenguaje', 'salud_hospitalaria', 'compensatoria'];
  const validStages: StageId[] = ['infantil', 'primaria', 'eso', 'bachillerato', 'fp_basica'];
  const validOwnership: OwnershipId[] = ['publico', 'concertado', 'privado'];
  const validModalities: ModalityId[] = ['preferente', 'especial', 'ordinaria'];
  const validServices: ServiceId[] = ['comedor', 'transporte', 'aula_matinal', 'enfermeria', 'actividades_extraescolares'];
  const validAccessibility: AccessibilityId[] = ['acceso_fisico', 'ascensor', 'bano_adaptado', 'bucle_magnetico', 'plano_podotactil'];
  const validEvidence: EvidenceId[] = ['A1', 'A2'];

  const needParam = params.get('need');
  if (needParam === 'all' || needParam === 'null' || needParam === '') {
    state.need = null;
  } else if (needParam && validNeeds.includes(needParam as NeedId)) {
    state.need = needParam as NeedId;
  }

  const stageParam = params.get('stage');
  if (stageParam === 'none') {
    state.stages = [];
  } else if (stageParam) {
    const stages = stageParam.split(',').filter(s => validStages.includes(s as StageId)) as StageId[];
    if (stages.length > 0) state.stages = stages;
  }

  const smodeParam = params.get('smode');
  if (smodeParam === 'all' || smodeParam === 'any') {
    state.stageMatchMode = smodeParam;
  }

  // Privacidad: nunca aceptamos ni reconstruimos coordenadas GPS (loc=browser, lat, lng) desde una URL
  state.locationSource = 'municipality';
  state.userCoordinates = null;

  const munParam = params.get('municipality');
  const distParam = params.get('district');

  if (munParam === 'all') {
    state.municipality = null;
    state.district = null;
  } else if (munParam) {
    const validMun = findMunicipality(munParam);
    if (validMun) {
      state.municipality = validMun.id;
      if (validMun.id === 'Madrid' && distParam) {
        const canonicalDistrict = MADRID_DISTRICTS.find(
          d => normalizeName(d) === normalizeName(distParam)
        );
        state.district = canonicalDistrict ?? null;
      } else {
        state.district = null;
      }
    }
  } else if (distParam) {
    const canonicalDistrict = MADRID_DISTRICTS.find(
      d => normalizeName(d) === normalizeName(distParam)
    );
    if (canonicalDistrict) {
      state.municipality = 'Madrid';
      state.district = canonicalDistrict;
    }
  }

  const radiusParam = params.get('radius');
  if (radiusParam === 'none') {
    state.radiusKm = null;
  } else if (radiusParam !== null && radiusParam.trim() !== '') {
    const parsedRadius = Number(radiusParam);
    if (Number.isFinite(parsedRadius)) {
      state.radiusKm = Math.min(100, Math.max(1, Math.round(parsedRadius)));
    }
  } else if (munParam === 'all') {
    state.radiusKm = null;
  }

  const ownParam = params.get('ownership');
  if (ownParam) {
    state.ownership = ownParam.split(',').filter(o => validOwnership.includes(o as OwnershipId)) as OwnershipId[];
  }

  const modParam = params.get('modality');
  if (modParam) {
    state.modalities = modParam.split(',').filter(m => validModalities.includes(m as ModalityId)) as ModalityId[];
  }

  const reqParam = params.get('required');
  if (reqParam) {
    state.requiredServices = reqParam.split(',').filter(s => validServices.includes(s as ServiceId)) as ServiceId[];
  }

  const prefParam = params.get('preferred');
  if (prefParam) {
    state.preferredServices = prefParam.split(',').filter(s => validServices.includes(s as ServiceId)) as ServiceId[];
  }

  const accParam = params.get('accessibility');
  if (accParam) {
    state.accessibilityRequired = accParam.split(',').filter(a => validAccessibility.includes(a as AccessibilityId)) as AccessibilityId[];
  }

  const evParam = params.get('evidence');
  if (evParam === 'none') {
    state.evidence = [];
  } else if (evParam) {
    const parsedEvidence = evParam.split(',').filter(e => validEvidence.includes(e as EvidenceId)) as EvidenceId[];
    if (parsedEvidence.length > 0) state.evidence = parsedEvidence;
  }

  const qParam = params.get('q');
  if (qParam) state.searchQuery = qParam;

  const sortParam = params.get('sort');
  if (sortParam === 'distance' || sortParam === 'alphabetical' || sortParam === 'evidence_then_distance') {
    state.sort = sortParam;
  }

  return state;
}

/**
 * Genera el contenido CSV (UTF-8 con BOM y separador ;) con procedencia, códigos Ayto y observaciones
 */
export function buildResultsCSVContent(schools: School[], state: SearchState): string {
  const headers = [
    'Codigo_Oficial',
    'Nombre_Centro',
    'Titularidad',
    'Tipo_Centro',
    'Municipio',
    'Distrito',
    'Barrio',
    'Codigo_Postal',
    'Direccion',
    'Telefono',
    'Email',
    'Web',
    'Etapas',
    'Apoyos_Confirmados',
    'Nivel_Evidencia',
    'Situacion_Oficial',
    'Fuente_Oficial',
    'Fuente_Municipal',
    'Transporte_Publico',
    'Comedor',
    'Horario_Ampliado',
    'Transporte_Escolar',
    'Enfermeria',
    'Accesibilidad_Fisica',
    'Codigo_Accesibilidad_Ayto',
    'Latitud',
    'Longitud',
    'Procedencia',
    'Ubicacion_Aproximada',
    'Observaciones'
  ];

  const sanitizeCsvFormula = (raw: string): string =>
    raw.length > 0 && /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;

  const escapeCsv = (val: string | undefined | null) =>
    `"${sanitizeCsvFormula(val || '').replace(/"/g, '""')}"`;

  const formatAytoAccessibility = (school: School): string => {
    if (school.procedencia !== 'oficial') {
      return school.accesibilidad.acceso_fisico ? 'Sí' : 'No';
    }
    const rawCode = (school.accesibilidadCodigoAyto || '').trim();
    const parts = rawCode.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.includes('1')) return 'Accesible (cód. 1, Ayto. Madrid)';
    if (parts.includes('2')) return 'Parcialmente accesible PMR (cód. 2, Ayto. Madrid)';
    if (parts.includes('0')) return 'No accesible (cód. 0, Ayto. Madrid)';
    if (parts.includes('3')) return 'Sin información PMR (cód. 3, Ayto. Madrid)';
    if (school.accesibilidadConfirmadaAyto) return 'Accesible (Ayto. Madrid)';
    if (school.fuenteAyuntamiento) return 'Sin información PMR en Ayto. Madrid';
    return 'Sin datos en fuente oficial';
  };

  const rows = schools.map(s => {
    const currentSupport = state.need
      ? s.apoyos.find(a => a.needId === state.need) || s.apoyos[0]
      : s.apoyos[0];

    const ownershipLabel =
      s.titularidad === 'publico'
        ? 'Público'
        : s.titularidad === 'concertado'
        ? 'Concertado'
        : 'Privado';

    const formatSrv = (val: boolean) => {
      if (s.procedencia !== 'oficial') return val ? 'Sí' : 'No';
      if (s.serviciosConfirmadosAyto) return val ? 'Sí (Ayto. Madrid)' : 'No declarado en Ayto.';
      return 'Sin datos en fuente oficial';
    };

    const accLabel = formatAytoAccessibility(s);

    return [
      escapeCsv(s.codigo),
      escapeCsv(s.nombre),
      escapeCsv(ownershipLabel),
      escapeCsv(s.tipo),
      escapeCsv(s.municipio),
      escapeCsv(s.distrito),
      escapeCsv(s.barrio),
      escapeCsv(s.codigoPostal),
      escapeCsv(s.direccion),
      escapeCsv(s.telefono),
      escapeCsv(s.email),
      escapeCsv(s.web),
      escapeCsv(s.etapas.join(', ')),
      escapeCsv(s.apoyos.map(a => a.needId).join(', ')),
      escapeCsv(currentSupport?.evidencia || 'A2'),
      escapeCsv(s.situacionOficial || 'ALTA'),
      escapeCsv(currentSupport?.fuenteOficial || 'Comunidad de Madrid'),
      escapeCsv(s.fuenteAyuntamiento),
      escapeCsv(s.transportePublico),
      escapeCsv(formatSrv(s.servicios.comedor)),
      escapeCsv(formatSrv(s.servicios.aula_matinal)),
      escapeCsv(formatSrv(s.servicios.transporte)),
      escapeCsv(formatSrv(s.servicios.enfermeria)),
      escapeCsv(accLabel),
      escapeCsv(s.accesibilidadCodigoAyto || ''),
      s.lat,
      s.lng,
      escapeCsv(s.procedencia === 'oficial' ? 'Oficial' : 'Demostración'),
      escapeCsv(s.ubicacionAproximada ? 'Sí' : 'No'),
      escapeCsv(s.observacionesOficiales || '')
    ].join(';');
  });

  return '\uFEFF' + [headers.join(';'), ...rows].join('\n');
}

/**
 * Exportación de datos de resultados a CSV con procedencia y metadata
 */
export function downloadResultsCSV(schools: School[], state: SearchState) {
  const csvContent = buildResultsCSVContent(schools, state);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `madrid_educa_apoyo_resultados_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Exportación de datos de resultados a JSON con metadata oficial
 */
export function downloadResultsJSON(schools: School[], state: SearchState) {
  const exportData = {
    metadata: {
      proyecto: "Madrid Educa Apoyo (Proyecto DataMad 2026)",
      fuentesDatos: {
        datosAbiertosCam: "Portal de Datos Abiertos CAM · Centros educativos de la Comunidad de Madrid (CC BY 4.0): directorio maestro, 69 CEE (ALTA), 14 Aulas Hospitalarias, Discapacidad Visual (EOEP + CRE ONCE), Altas Capacidades (CREACIM + EOEP + 8 sedes PEAC) y EOEP Específicos de Auditivas, Motóricas y Lenguaje/TDAH",
        listadoTea: "Comunidad de Madrid · Centros de atención preferente TEA (curso 2024/2025, información a 22/03/2024)",
        aulasEnlace: "Comunidad de Madrid · DG Concertada: Resolución 2026/2027 de Escuelas de Bienvenida / Aulas de Enlace (47 centros privados concertados autorizados, 25/08/2026)",
        onceInclusion: "ONCE · Convenio CAM-ONCE y C.R.E. «Antonio Vicente Mosquete» (Educación Inclusiva)",
        altasCapacidadesPeac: "Comunidad de Madrid · CREACIM, EOEP Específico y 8 sedes IES del Programa PEAC",
        ayuntamientoMadrid: "Portal de Datos Abiertos Ayuntamiento de Madrid (datos.madrid.es, conjunto 300614-0): transporte público, barrio, servicios y códigos oficiales ACCESIBILIDAD (0..6) en Madrid capital"
      },
      fechaExportacion: new Date().toISOString(),
      criteriosFiltro: {
        necesidad: state.need,
        etapas: state.stages,
        modoEtapa: state.stageMatchMode || 'any',
        municipio: state.municipality || 'Toda la Comunidad de Madrid',
        distrito: state.district,
        radioKm: state.radiusKm,
        origenUbicacion: state.locationSource
      },
      totalResultados: schools.length
    },
    centros: schools.map(s => ({
      codigo: s.codigo,
      nombre: s.nombre,
      titularidad: s.titularidad,
      tipo: s.tipo,
      municipio: s.municipio,
      distrito: s.distrito || null,
      barrio: s.barrio || null,
      codigoPostal: s.codigoPostal || "",
      direccion: s.direccion || "",
      telefono: s.telefono || "",
      email: s.email || "",
      web: s.web || null,
      transportePublico: s.transportePublico || null,
      coordenadas: { lat: s.lat, lng: s.lng, aproximadas: Boolean(s.ubicacionAproximada) },
      situacionOficial: s.situacionOficial || null,
      procedencia: s.procedencia || 'oficial',
      fuenteUrl: s.fuenteUrl || null,
      fuenteDatosAbiertos: s.fuenteDatosAbiertos || null,
      fuenteAyuntamiento: s.fuenteAyuntamiento || null,
      etapas: s.etapas,
      apoyosOficiales: s.apoyos,
      servicios: s.serviciosConfirmadosAyto || s.procedencia !== 'oficial' ? s.servicios : null,
      accesibilidad: s.accesibilidadCodigoAyto || s.accesibilidadConfirmadaAyto || s.procedencia !== 'oficial' ? s.accesibilidad : null,
      accesibilidadCodigoAyto: s.accesibilidadCodigoAyto || null,
      observaciones: s.observacionesOficiales || null,
      serviciosAccesibilidadNota: s.serviciosConfirmadosAyto
        ? 'Servicios procedentes del bloque EQUIPAMIENTO de Ayuntamiento de Madrid (datos.madrid.es)'
        : s.fuenteAyuntamiento
        ? 'Centro localizado en datos.madrid.es; sin bloque de equipamiento declarado en fuente municipal'
        : 'No publicados en las fuentes oficiales para este municipio',
      continuidad: s.continuidad
    }))
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `madrid_educa_apoyo_resultados_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
