/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Catálogo de centros educativos de la aplicación Madrid Educa Apoyo.
 * POLÍTICA DE DATOS ESTRICTA: 100% DATOS REALES Y VERIFICADOS.
 * Cero datos inventados o sintéticos.
 *
 * Fuentes integradas:
 * - Consejería de Educación CAM: 336 centros de atención preferente TEA (curso 2024/25).
 * - Portal de Datos Abiertos CAM (CC BY 4.0) + RCD Ministerio: 69 CEE (ALTA) y 14 Aulas Hospitalarias.
 * - Ayuntamiento de Madrid (datos.madrid.es 300614-0): enriquecimiento para Madrid capital.
 */

import { School } from '../types';
import { OFFICIAL_ALL_SCHOOLS, OFFICIAL_TEA_SCHOOLS } from './officialTea';

export { OFFICIAL_TEA_SCHOOLS, OFFICIAL_ALL_SCHOOLS };

/** Colección vacía: se han eliminado todos los centros de muestra simulados. */
export const DEMO_SCHOOLS: School[] = [];

/**
 * Catálogo completo utilizado por la aplicación:
 * Contiene exclusivamente los 419 centros reales oficiales verificados.
 */
export const SCHOOLS_DATA: School[] = [...OFFICIAL_ALL_SCHOOLS];
