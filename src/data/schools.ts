/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Cargador asíncrono del catálogo oficial de centros educativos (Madrid Educa Apoyo).
 * Los 470 registros oficiales se sirven desde `public/data/centros.json` para reducir el
 * tamaño del bundle inicial y mantener su caché independiente de los despliegues de UI.
 */

import { School } from '../types';

/** Colección vacía: se han eliminado todos los centros de muestra simulados. */
export const DEMO_SCHOOLS: School[] = [];

let cachedCatalogPromise: Promise<School[]> | null = null;

export function resolveCatalogUrl(): string {
  const base = import.meta.env.BASE_URL || './';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}data/centros.json`;
}

/**
 * Carga y memoriza los 470 centros y equipos oficiales desde `data/centros.json`.
 */
export async function loadSchoolsCatalog(): Promise<School[]> {
  if (!cachedCatalogPromise) {
    cachedCatalogPromise = fetch(resolveCatalogUrl(), {
      headers: { Accept: 'application/json' }
    })
      .then(async response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} al cargar el catálogo oficial`);
        }
        const data = (await response.json()) as School[];
        if (!Array.isArray(data)) {
          throw new Error('El formato de centros.json no es una lista válida');
        }
        return data;
      })
      .catch(err => {
        cachedCatalogPromise = null;
        throw err;
      });
  }
  return cachedCatalogPromise;
}
