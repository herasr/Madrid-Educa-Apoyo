/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Municipios de la Comunidad de Madrid y distritos de Madrid capital
 * con coordenadas geográficas de referencia para cálculo geodésico (Haversine).
 */

import { MunicipalityOption } from '../types';
import { OFFICIAL_MUNICIPALITIES } from './officialTea';

export const MADRID_DISTRICTS = [
  'Arganzuela',
  'Barajas',
  'Carabanchel',
  'Centro',
  'Chamartín',
  'Chamberí',
  'Ciudad Lineal',
  'Fuencarral-El Pardo',
  'Hortaleza',
  'Latina',
  'Moncloa-Aravaca',
  'Moratalaz',
  'Puente de Vallecas',
  'Retiro',
  'Salamanca',
  'San Blas-Canillejas',
  'Tetuán',
  'Usera',
  'Vicálvaro',
  'Villa de Vallecas',
  'Villaverde'
];

const BASE_MUNICIPALITIES: MunicipalityOption[] = [
  {
    id: 'Madrid',
    nombre: 'Madrid (Capital)',
    lat: 40.4168,
    lng: -3.7038,
    distritos: MADRID_DISTRICTS
  },
  {
    id: 'Alcala de Henares',
    nombre: 'Alcalá de Henares',
    lat: 40.4820,
    lng: -3.3644
  },
  {
    id: 'Alcobendas',
    nombre: 'Alcobendas',
    lat: 40.5475,
    lng: -3.6420
  },
  {
    id: 'Alcorcon',
    nombre: 'Alcorcón',
    lat: 40.3458,
    lng: -3.8249
  },
  {
    id: 'Fuenlabrada',
    nombre: 'Fuenlabrada',
    lat: 40.2842,
    lng: -3.7942
  },
  {
    id: 'Getafe',
    nombre: 'Getafe',
    lat: 40.3083,
    lng: -3.7327
  },
  {
    id: 'Leganes',
    nombre: 'Leganés',
    lat: 40.3280,
    lng: -3.7635
  },
  {
    id: 'Mostoles',
    nombre: 'Móstoles',
    lat: 40.3222,
    lng: -3.8649
  },
  {
    id: 'Parla',
    nombre: 'Parla',
    lat: 40.2372,
    lng: -3.7742
  },
  {
    id: 'Pozuelo de Alarcon',
    nombre: 'Pozuelo de Alarcón',
    lat: 40.4354,
    lng: -3.8136
  },
  {
    id: 'Las Rozas de Madrid',
    nombre: 'Las Rozas de Madrid',
    lat: 40.4929,
    lng: -3.8738
  },
  {
    id: 'San Sebastian de los Reyes',
    nombre: 'San Sebastián de los Reyes',
    lat: 40.5478,
    lng: -3.6264
  },
  {
    id: 'Torrejon de Ardoz',
    nombre: 'Torrejón de Ardoz',
    lat: 40.4578,
    lng: -3.4795
  },
  {
    id: 'Coslada',
    nombre: 'Coslada',
    lat: 40.4258,
    lng: -3.5658
  },
  {
    id: 'Rivas-Vaciamadrid',
    nombre: 'Rivas-Vaciamadrid',
    lat: 40.3524,
    lng: -3.5350
  },
  {
    id: 'Valdemoro',
    nombre: 'Valdemoro',
    lat: 40.1909,
    lng: -3.6766
  },
  {
    id: 'Collado Villalba',
    nombre: 'Collado Villalba',
    lat: 40.6319,
    lng: -3.9928
  },
  {
    id: 'Majadahonda',
    nombre: 'Majadahonda',
    lat: 40.4728,
    lng: -3.8719
  },
  {
    id: 'Boadilla del Monte',
    nombre: 'Boadilla del Monte',
    lat: 40.4069,
    lng: -3.8753
  },
  {
    id: 'Pinto',
    nombre: 'Pinto',
    lat: 40.2415,
    lng: -3.7001
  },
  {
    id: 'Colmenar Viejo',
    nombre: 'Colmenar Viejo',
    lat: 40.6586,
    lng: -3.7661
  },
  {
    id: 'Tres Cantos',
    nombre: 'Tres Cantos',
    lat: 40.6067,
    lng: -3.7061
  },
  {
    id: 'Arganda del Rey',
    nombre: 'Arganda del Rey',
    lat: 40.3006,
    lng: -3.4389
  },
  {
    id: 'San Fernando de Henares',
    nombre: 'San Fernando de Henares',
    lat: 40.4256,
    lng: -3.5350
  },
  {
    id: 'Aranjuez',
    nombre: 'Aranjuez',
    lat: 40.0336,
    lng: -3.6025
  }
];

/** Normaliza nombres para compararlos sin tildes ni mayúsculas ("Alcalá" = "alcala"). */
export function normalizeName(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/**
 * Municipios seleccionables: la lista base más los municipios que aparecen en los
 * datos oficiales (coordenadas: centroide IGN del término municipal).
 */
export const MUNICIPALITIES: MunicipalityOption[] = [
  ...BASE_MUNICIPALITIES,
  ...OFFICIAL_MUNICIPALITIES.filter(
    om => !BASE_MUNICIPALITIES.some(b => normalizeName(b.nombre) === normalizeName(om.nombre))
  )
].sort((a, b) => (a.id === 'Madrid' ? -1 : b.id === 'Madrid' ? 1 : a.nombre.localeCompare(b.nombre, 'es')));

/** Busca un municipio por id o nombre, sin distinguir tildes ni mayúsculas. */
export function findMunicipality(nameOrId: string | null | undefined): MunicipalityOption | undefined {
  if (!nameOrId) return undefined;
  const key = normalizeName(nameOrId);
  return MUNICIPALITIES.find(m => normalizeName(m.id) === key || normalizeName(m.nombre) === key);
}

/**
 * Cálculo de distancia Haversine en kilómetros entre dos coordenadas geográficas.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Estimación de tiempo de viaje en transporte público colectivo (Bus EMT / Metro CRTM).
 */
export function estimateTransitMinutes(distanceKm: number): number {
  if (distanceKm <= 0) return 3;
  const minutes = 7 + (distanceKm / 18) * 60;
  return Math.round(minutes);
}

/**
 * Estimación de tiempo de viaje en vehículo adaptado / coche.
 */
export function estimateCarMinutes(distanceKm: number): number {
  if (distanceKm <= 0) return 2;
  const minutes = 3 + (distanceKm / 28) * 60;
  return Math.round(minutes);
}
