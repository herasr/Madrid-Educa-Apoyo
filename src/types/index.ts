/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Madrid Educa Apoyo - Tipos de dominio y estado de filtros acumulativos
 */

export type NeedId = 
  | 'tea' 
  | 'auditiva' 
  | 'motora' 
  | 'educacion_especial' 
  | 'visual' 
  | 'altas_capacidades'
  | 'tdah'
  | 'tel_lenguaje'
  | 'salud_hospitalaria'
  | 'compensatoria';

export type StageId = 
  | 'infantil' 
  | 'primaria' 
  | 'eso' 
  | 'bachillerato' 
  | 'fp_basica';

export type OwnershipId = 'publico' | 'concertado' | 'privado';

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
  /** Coordenadas del destino cuando proceden de datos reales (si faltan, no se dibuja en el mapa). */
  lat?: number;
  lng?: number;
}

export interface SchoolContinuity {
  /** 'zona': la fuente no publica adscripción; se listan centros con el mismo apoyo en Secundaria en la zona. */
  tipoContinuidad: 'mismo_centro' | 'ceipso_parcial' | 'adscripcion_unica' | 'adscripcion_multiple' | 'zona';
  descripcion: string;
  apoyoEnSecundariaVerificado: boolean | 'no_verificado';
  destinos: AdscripcionDestination[];
}

export interface School {
  id: string;
  codigo: string; // 8 dígitos CAM (ej. 28020941)
  nombre: string;
  titularidad: OwnershipId;
  tipo: 'CEIP' | 'CEIPSO' | 'IES' | 'CEE' | 'Aula Hospitalaria' | 'EOEP Específico' | 'CREACIM' | 'CRE ONCE' | 'IES (Sede PEAC)' | 'Colegio Concertado' | 'Centro Privado';
  modalidad: ModalityId;
  municipio: string;
  distrito?: string;
  barrio?: string;
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
  /** 'oficial' = dato cargado de una fuente pública verificada; 'demo' = dato sintético de demostración. */
  procedencia?: 'oficial' | 'demo';
  /** true cuando lat/lng son el centroide del municipio o distrito y no la dirección real. */
  ubicacionAproximada?: boolean;
  /** Documento oficial del que procede el registro. */
  fuenteUrl?: string;
  /** Fuente del Portal de Datos Abiertos CAM usada para enriquecer dirección y coordenadas. */
  fuenteDatosAbiertos?: string;
  /** Transporte público cercano (Metro/Bus EMT/Cercanías) publicado por el Ayuntamiento de Madrid. */
  transportePublico?: string;
  /** Fuente municipal externa cuando el centro pertenece a Madrid capital y se cruza con datos.madrid.es. */
  fuenteAyuntamiento?: string;
  /** true cuando el registro del Ayuntamiento incluye bloque EQUIPAMIENTO verificando servicios. */
  serviciosConfirmadosAyto?: boolean;
  /** true cuando el registro del Ayuntamiento confirma ACCESIBILIDAD=1 (instalación accesible). */
  accesibilidadConfirmadaAyto?: boolean;
  /** Código literal del campo ACCESIBILIDAD en datos.madrid.es (0..6 según estructura_ds_conjuntodatos.pdf). */
  accesibilidadCodigoAyto?: string;
  /** Situación administrativa en el catálogo oficial CAM (ALTA / EN TRÁMITE). */
  situacionOficial?: string;
  /** Nombre y tipo exactamente como figuran en la fuente oficial. */
  nombreOficial?: string;
  tipoOficial?: string;
  /** Denominación extendida oficial del tipo de centro en Datos Abiertos CAM. */
  tipoGeneralOficial?: string;
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
