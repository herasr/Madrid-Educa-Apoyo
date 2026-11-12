/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Motor de filtros acumulativos para Madrid Educa Apoyo (v2.4)
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
import { calculateHaversineDistance, findMunicipality, normalizeName } from '../data/municipalities';

export const INITIAL_SEARCH_STATE: SearchState = {
  need: 'tea', // Predeterminado en flujo normal según especificación
  stages: ['primaria'],
  stageMatchMode: 'any',
  municipality: 'Madrid',
  district: null,
  radiusKm: 20,
  locationSource: 'browser',
  userCoordinates: {
    lat: 40.4168,
    lng: -3.7038,
    label: 'Tu ubicación actual'
  },
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
    if (state.need === 'educacion_especial') {
      const isEspecial = centre.modalidad === 'especial' || centre.apoyos.some(a => a.needId === 'educacion_especial');
      if (!isEspecial) return false;
    } else {
      const hasNeed = centre.apoyos.some(a => a.needId === state.need);
      if (!hasNeed) return false;
    }
  }

  // 2. Etapas (Modo ANY u OR vs ALL o AND)
  if (state.stages.length > 0) {
    if (state.stageMatchMode === 'all') {
      const hasAllStages = state.stages.every(st => centre.etapas.includes(st));
      if (!hasAllStages) return false;
    } else {
      const hasAnyStage = state.stages.some(st => centre.etapas.includes(st));
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

    // Si es Madrid capital y hay distrito seleccionado, filtrar por distrito
    if (state.district && centre.distrito) {
      if (normalizeName(centre.distrito) !== normalizeName(state.district)) {
        return false;
      }
    }

    if (state.radiusKm !== null && state.radiusKm > 0 && munObj) {
      const distance = calculateHaversineDistance(munObj.lat, munObj.lng, centre.lat, centre.lng);
      if (distance > state.radiusKm) return false;
    } else if (!state.district) {
      // Coincidencia estricta de municipio si no hay radio ni distrito
      const centreMun = normalizeName(centre.municipio);
      const wantedMun = normalizeName(munObj?.nombre || state.municipality);
      const munMatches = centreMun === wantedMun || centreMun.includes(wantedMun) || wantedMun.includes(centreMun);
      if (!munMatches) return false;
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
      if (needSupport && !state.evidence.includes(needSupport.evidencia)) {
        return false;
      }
    } else {
      const hasMatchingEvidence = centre.apoyos.some(a => state.evidence.includes(a.evidencia));
      if (!hasMatchingEvidence) return false;
    }
  }

  // 9. Búsqueda de texto libre (código de centro, nombre, calle)
  if (state.searchQuery && state.searchQuery.trim().length > 0) {
    const query = state.searchQuery.toLowerCase().trim();
    const matchesQuery = 
      centre.nombre.toLowerCase().includes(query) ||
      centre.codigo.includes(query) ||
      centre.direccion.toLowerCase().includes(query) ||
      (centre.distrito && centre.distrito.toLowerCase().includes(query)) ||
      centre.municipio.toLowerCase().includes(query);
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
  const allOwnership: OwnershipId[] = ['publico', 'concertado'];
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
  // Si stageMatchMode es 'all' y hay etapas seleccionadas, calcula cuántos tendrían TODAS más esta etapa.
  // En modo 'any' (predeterminado), indica cuántos centros imparten esta etapa con los filtros actuales.
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
    state.need === 'educacion_especial' ? 'Educación Especial' : 
    state.need === 'tdah' ? 'TDAH y Conducta' : 
    state.need === 'tel_lenguaje' ? 'Trastornos del Lenguaje' : 
    state.need === 'salud_hospitalaria' ? 'Atención Hospitalaria' : 
    state.need === 'compensatoria' ? 'Compensación Educativa' : 
    'la necesidad seleccionada';
  const munName = state.municipality || 'la Comunidad de Madrid';
  const radiusText = state.radiusKm ? ` en ${state.radiusKm} km de ${munName}` : ` en ${munName}`;

  let reason = `No hay centros que cumplan simultáneamente todos los criterios activos para ${needName}${radiusText}`;
  if (state.requiredServices.length > 0) {
    const srvNames = state.requiredServices.map(s => s === 'comedor' ? 'comedor' : s === 'transporte' ? 'transporte escolar' : s).join(' y ');
    reason = `No hay centros ${state.evidence.join('/')} de ${needName} que cumplan ${srvNames}${radiusText}.`;
  }

  // 1. Probar relajación de cada servicio obligatorio
  state.requiredServices.forEach(srv => {
    const srvName = srv === 'comedor' ? 'Comedor' : srv === 'transporte' ? 'Transporte escolar' : srv === 'enfermeria' ? 'Enfermería escolar' : srv;
    
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

  // 4. Probar relajar titularidad si solo hay una seleccionada
  if (state.ownership.length === 1) {
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

  if (state.need) params.set('need', state.need);
  if (state.stages.length > 0) params.set('stage', state.stages.join(','));
  if (state.stageMatchMode && state.stageMatchMode !== 'any') params.set('smode', state.stageMatchMode);
  if (state.locationSource === 'browser') {
    params.set('loc', 'browser');
    if (state.userCoordinates) {
      params.set('lat', state.userCoordinates.lat.toString());
      params.set('lng', state.userCoordinates.lng.toString());
    }
  } else if (state.municipality) {
    params.set('municipality', state.municipality);
    if (state.district) params.set('district', state.district);
  }
  if (state.radiusKm !== null) params.set('radius', state.radiusKm.toString());
  if (state.ownership.length > 0) params.set('ownership', state.ownership.join(','));
  if (state.modalities.length > 0) params.set('modality', state.modalities.join(','));
  if (state.requiredServices.length > 0) params.set('required', state.requiredServices.join(','));
  if (state.preferredServices.length > 0) params.set('preferred', state.preferredServices.join(','));
  if (state.accessibilityRequired.length > 0) params.set('accessibility', state.accessibilityRequired.join(','));
  if (state.evidence.length > 0) params.set('evidence', state.evidence.join(','));
  if (state.searchQuery.trim().length > 0) params.set('q', state.searchQuery.trim());
  if (state.sort !== 'distance') params.set('sort', state.sort);

  return params.toString();
}

export function parseSearchStateFromQuery(queryString: string): SearchState {
  const params = new URLSearchParams(queryString.startsWith('?') ? queryString.slice(1) : queryString);
  const state: SearchState = { ...INITIAL_SEARCH_STATE };

  // Control lists for validation
  const validNeeds: NeedId[] = ['tea', 'auditiva', 'motora', 'educacion_especial', 'visual', 'altas_capacidades', 'tdah', 'tel_lenguaje', 'salud_hospitalaria', 'compensatoria'];
  const validStages: StageId[] = ['infantil', 'primaria', 'eso', 'bachillerato', 'fp_basica'];
  const validOwnership: OwnershipId[] = ['publico', 'concertado'];
  const validModalities: ModalityId[] = ['preferente', 'especial', 'ordinaria'];
  const validServices: ServiceId[] = ['comedor', 'transporte', 'aula_matinal', 'enfermeria', 'actividades_extraescolares'];
  const validAccessibility: AccessibilityId[] = ['acceso_fisico', 'ascensor', 'bano_adaptado', 'bucle_magnetico', 'plano_podotactil'];
  const validEvidence: EvidenceId[] = ['A1', 'A2'];

  const needParam = params.get('need');
  if (needParam && validNeeds.includes(needParam as NeedId)) {
    state.need = needParam as NeedId;
  } else if (needParam === 'null' || needParam === '') {
    state.need = null;
  }

  const stageParam = params.get('stage');
  if (stageParam) {
    const stages = stageParam.split(',').filter(s => validStages.includes(s as StageId)) as StageId[];
    if (stages.length > 0) state.stages = stages;
  }

  const smodeParam = params.get('smode');
  if (smodeParam === 'all' || smodeParam === 'any') {
    state.stageMatchMode = smodeParam;
  }

  const locParam = params.get('loc');
  const latParam = params.get('lat');
  const lngParam = params.get('lng');
  const munParam = params.get('municipality');
  const distParam = params.get('district');

  if (locParam === 'browser' || (latParam && lngParam)) {
    state.locationSource = 'browser';
    state.municipality = null;
    state.district = null;
    if (latParam && lngParam && !isNaN(Number(latParam)) && !isNaN(Number(lngParam))) {
      state.userCoordinates = {
        lat: Number(latParam),
        lng: Number(lngParam),
        label: 'Tu ubicación actual'
      };
    }
  } else if (munParam) {
    state.locationSource = 'municipality';
    state.municipality = munParam;
    state.district = distParam || null;
    state.userCoordinates = null;
  }

  const radiusParam = params.get('radius');
  if (radiusParam && !isNaN(Number(radiusParam))) {
    state.radiusKm = Number(radiusParam);
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
  if (evParam) {
    state.evidence = evParam.split(',').filter(e => validEvidence.includes(e as EvidenceId)) as EvidenceId[];
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
 * Exportación de datos de resultados a CSV con procedencia y metadata
 */
export function downloadResultsCSV(schools: School[], state: SearchState) {
  const headers = [
    'Codigo_Oficial',
    'Nombre_Centro',
    'Titularidad',
    'Tipo_Centro',
    'Municipio',
    'Distrito',
    'Direccion',
    'Etapas_Impartidas',
    'Apoyos_Confirmados',
    'Nivel_Evidencia',
    'Fuente_BOCM',
    'Comedor',
    'Transporte_Adaptado',
    'Enfermeria',
    'Latitud',
    'Longitud',
    'Procedencia',
    'Ubicacion_Aproximada'
  ];

  const rows = schools.map(s => {
    const currentSupport = state.need
      ? s.apoyos.find(a => a.needId === state.need) || s.apoyos[0]
      : s.apoyos[0];

    return [
      `"${s.codigo}"`,
      `"${s.nombre.replace(/"/g, '""')}"`,
      `"${s.titularidad === 'publico' ? 'Público' : 'Concertado'}"`,
      `"${s.tipo}"`,
      `"${s.municipio}"`,
      `"${s.distrito || ''}"`,
      `"${(s.direccion || (s.ubicacionAproximada ? 'Sin dirección en fuente oficial (ubicación aproximada)' : '')).replace(/"/g, '""')}"`,
      `"${s.etapas.join(', ')}"`,
      `"${s.apoyos.map(a => a.needId).join(', ')}"`,
      `"${currentSupport?.evidencia || 'A1'}"`,
      `"${currentSupport?.fuenteOficial || 'Resolución BOCM'}"`,
      `"${s.procedencia === 'oficial' ? 'Sin datos' : s.servicios.comedor ? 'Sí' : 'No'}"`,
      `"${s.procedencia === 'oficial' ? 'Sin datos' : s.servicios.transporte ? 'Sí' : 'No'}"`,
      `"${s.procedencia === 'oficial' ? 'Sin datos' : s.servicios.enfermeria ? 'Sí' : 'No'}"`,
      s.lat,
      s.lng,
      `"${s.procedencia === 'oficial' ? 'Oficial' : 'Demostración'}"`,
      `"${s.ubicacionAproximada ? 'Sí' : 'No'}"`
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `madrid_educa_apoyo_resultados_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exportación de datos de resultados a JSON con metadata oficial
 */
export function downloadResultsJSON(schools: School[], state: SearchState) {
  const exportData = {
    metadata: {
      fuente: "Madrid Educa Apoyo",
      fuentesDatos: {
        oficial: "Comunidad de Madrid · Centros de atención preferente TEA (curso 2024/2025, información a 22/03/2024)",
        demostracion: "Registros sintéticos para necesidades sin listado oficial cargado (procedencia = 'demo')"
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
      direccion: s.direccion || (s.ubicacionAproximada ? 'Sin dirección en fuente oficial (ubicación aproximada)' : null),
      telefono: s.telefono,
      web: s.web || null,
      coordenadas: { lat: s.lat, lng: s.lng, aproximadas: Boolean(s.ubicacionAproximada) },
      procedencia: s.procedencia || 'demo',
      fuenteUrl: s.fuenteUrl || null,
      etapasImpartidas: s.etapas,
      apoyosOficiales: s.apoyos,
      servicios: s.servicios,
      accesibilidad: s.accesibilidad,
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
}
