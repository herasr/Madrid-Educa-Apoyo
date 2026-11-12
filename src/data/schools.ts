/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Catálogo de centros educativos de la aplicación Madrid Educa Apoyo.
 * POLÍTICA DE DATOS ESTRICTA: 100% DATOS REALES Y VERIFICADOS.
 * Cero datos inventados o sintéticos.
 *
 * Fuente: Relación oficial de centros de atención preferente TEA de la
 * Comunidad de Madrid (curso 2024/2025, información a 22/03/2024).
 * Total: 336 centros reales catalogados.
 */

import { School } from '../types';
import { OFFICIAL_TEA_SCHOOLS } from './officialTea';

export { OFFICIAL_TEA_SCHOOLS };

/** Colección vacía: se han eliminado todos los centros de muestra simulados. */
export const DEMO_SCHOOLS: School[] = [];

/**
 * Catálogo completo utilizado por la aplicación:
 * Contiene EXCLUSIVAMENTE los 336 centros reales oficiales.
 */
export const SCHOOLS_DATA: School[] = [...OFFICIAL_TEA_SCHOOLS];
