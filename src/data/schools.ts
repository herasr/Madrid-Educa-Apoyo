/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Catálogo de centros educativos de la aplicación Madrid Educa Apoyo.
 * Criterio de calidad: catálogo basado exclusivamente en ficheros públicos oficiales verificables
 * y cruce automático con control de conflictos y límites documentados.
 *
 * Fuentes integradas (433 entidades oficiales):
 * - Consejería de Educación CAM: 336 centros de atención preferente TEA (curso 2024/25).
 * - Portal de Datos Abiertos CAM (CC BY 4.0): 69 CEE (ALTA), 14 Aulas Hospitalarias,
 *   3 recursos de Discapacidad Visual, 10 de Altas Capacidades y 3 EOEP Específicos regionales.
 * - Ayuntamiento de Madrid (datos.madrid.es 300614-0): enriquecimiento para Madrid capital.
 */

import { School } from '../types';
import { OFFICIAL_ALL_SCHOOLS, OFFICIAL_TEA_SCHOOLS } from './officialTea';

export { OFFICIAL_TEA_SCHOOLS, OFFICIAL_ALL_SCHOOLS };

/** Colección vacía: se han eliminado todos los centros de muestra simulados. */
export const DEMO_SCHOOLS: School[] = [];

/**
 * Catálogo completo utilizado por la aplicación:
 * Contiene las 433 entidades oficiales verificadas en el catálogo abierto.
 */
export const SCHOOLS_DATA: School[] = [...OFFICIAL_ALL_SCHOOLS];
