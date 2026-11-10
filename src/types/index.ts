/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Madrid Educa Apoyo - Tipos de dominio y estado de filtros acumulativos (v2.4)
 */

export type NeedId = 
  | 'tea' 
  | 'auditiva' 
  | 'motora' 
  | 'educacion_especial' 
  | 'visual' 
  | 'altas_capacidades';

export type StageId = 
  | 'infantil' 
  | 'primaria' 
  | 'eso' 
  | 'bachillerato' 
  | 'fp_basica';

export type OwnershipId = 'publico' | 'concertado';

export type ModalityId = 'preferente' | 'especial' | 'ordinaria';

export type ServiceId = 
  | 'comedor' 
  | 'transporte' 
  | 'aula_matinal' 
  | 'enfermeria' 
  | 'actividades_extraescolares';

export type AccessibilityId = 
  | 'acceso_fisico' 
  | 'ascensor' 
  | 'bano_adaptado' 
  | 'bucle_magnetico' 
  | 'plano_podotactil';

export type EvidenceId = 'A1' | 'A2';

export interface NeedSupport {
  needId: NeedId;
  evidencia: EvidenceId;
  etapasConApoyo: StageId[];
  aulaNombre?: string;
  recursosOficiales: string[];
  fuenteOficial: string;
  resolucionBOCM?: string;
  fechaCorte: string;
  detallesResolucion: string;
}

export interface AdscripcionDestination {
  codigo: string;
  nombre: string;
  etapa: string;
  municipio: string;
  distrito?: string;
  tieneMismoApoyo: boolean | 'no_verificado';
  detallesApoyo?: string;
  distanciaKm?: number;
}

export interface SchoolContinuity {
  tipoContinuidad: 'mismo_centro' | 'ceipso_parcial' | 'adscripcion_unica' | 'adscripcion_multiple';
  descripcion: string;
  apoyoEnSecundariaVerificado: boolean | 'no_verificado';
  destinos: AdscripcionDestination[];
}

export interface School {
  id: string;
  codigo: string; // 8 dígitos CAM (ej. 28020941)
  nombre: string;
  titularidad: OwnershipId;
  tipo: 'CEIP' | 'CEIPSO' | 'IES' | 'CEE' | 'Colegio Concertado';
  modalidad: ModalityId;
  municipio: string;
  distrito?: string;
  codigoPostal: string;
  direccion: string;
  telefono: string;
  email: string;
  web?: string;
  lat: number;
  lng: number;
  etapas: StageId[];
  apoyos: NeedSupport[];
  servicios: Record<ServiceId, boolean>;
  accesibilidad: Record<AccessibilityId, boolean>;
  continuidad: SchoolContinuity;
  observacionesOficiales?: string;
}

export interface SearchState {
  need: NeedId | null;
  stages: StageId[];
  stageMatchMode?: 'any' | 'all';
  municipality: string | null;
  district: string | null;
  radiusKm: number | null;
  locationSource?: 'browser' | 'municipality';
  userCoordinates?: { lat: number; lng: number; label: string } | null;
  ownership: OwnershipId[];
  modalities: ModalityId[];
  requiredServices: ServiceId[];
  preferredServices: ServiceId[];
  accessibilityRequired: AccessibilityId[];
  evidence: EvidenceId[];
  searchQuery: string;
  sort: 'evidence_then_distance' | 'distance' | 'alphabetical';
}

export interface DynamicCounts {
  needs: Record<NeedId, number>;
  stages: Record<StageId, number>;
  ownership: Record<OwnershipId, number>;
  modalities: Record<ModalityId, number>;
  requiredServices: Record<ServiceId, number>;
  preferredServices: Record<ServiceId, number>;
  accessibility: Record<AccessibilityId, number>;
  evidence: Record<EvidenceId, number>;
}

export interface RelaxationOption {
  id: string;
  label: string;
  description: string;
  actionType: 'remove_filter' | 'expand_radius' | 'demote_service' | 'include_a2';
  filterKey?: string;
  resultingCount: number;
  apply: (prevState: SearchState) => SearchState;
}

export interface ZeroResultsAnalysis {
  reason: string;
  failingConditions: string[];
  relaxations: RelaxationOption[];
}

export interface MunicipalityOption {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  distritos?: string[];
}

export interface TestScenario {
  id: string;
  code: string; // e.g. "FIL-001"
  titulo: string;
  descripcion: string;
  esperado: string;
  estadoPrueba: Partial<SearchState>;
}
