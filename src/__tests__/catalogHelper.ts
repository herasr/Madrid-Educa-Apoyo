/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Helper de pruebas para leer el catálogo JSON estático (`public/data/centros.json`).
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { School } from '../types';

const catalogPath = resolve(process.cwd(), 'public/data/centros.json');
export const TEST_ALL_SCHOOLS: School[] = JSON.parse(readFileSync(catalogPath, 'utf-8')) as School[];
export const TEST_TEA_SCHOOLS: School[] = TEST_ALL_SCHOOLS.filter(s =>
  s.apoyos.some(a => a.needId === 'tea')
);
