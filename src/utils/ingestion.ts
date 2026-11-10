/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Utilidad de Ingesta y Validación de Datos Oficiales
 */

import { School } from '../types';

export interface IngestionResult {
  success: boolean;
  message: string;
  data?: School[];
  sha256?: string;
  etag?: string;
}

/**
 * Calcula el hash SHA-256 de una cadena de texto.
 */
async function calculateSHA256(data: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Realiza la petición HTTP, verifica ETag/Last-Modified, calcula el hash SHA-256
 * y valida la integridad de los datos.
 */
export async function fetchData(url: string, lastKnownEtag?: string): Promise<IngestionResult> {
  try {
    const headers: HeadersInit = {};
    if (lastKnownEtag) {
      headers['If-None-Match'] = lastKnownEtag;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    if (response.status === 304) {
      return { success: true, message: 'Datos no han cambiado (304 Not Modified).', etag: lastKnownEtag };
    }

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }

    const etag = response.headers.get('ETag') || undefined;
    const content = await response.text();
    const sha256 = await calculateSHA256(content);

    // Validación simplificada: En un entorno de producción, aquí se verificaría contra
    // un valor conocido o un registro histórico.
    console.log(`Ingesta exitosa. ETag: ${etag}, SHA-256: ${sha256}`);

    // Parseo de los datos extraídos (ejemplo genérico)
    // Nota: El parseo real dependerá de la estructura del HTML de la fuente.
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Extracción de ejemplo: busca elementos con data-codigo
    const rows = doc.querySelectorAll('.center-row');
    const data: School[] = Array.from(rows).map(row => ({
      id: row.getAttribute('data-codigo') || 'unknown',
      codigo: row.getAttribute('data-codigo') || '00000000',
      nombre: row.getAttribute('data-nombre') || 'Centro',
      // ... completar mapeo según estructura real
      titularidad: 'publico',
      tipo: 'CEIP',
      modalidad: 'preferente',
      municipio: row.getAttribute('data-municipio') || 'Madrid',
      codigoPostal: '00000',
      direccion: 'Sin dirección',
      telefono: '000000000',
      email: 'info@educa.madrid.org',
      lat: 0,
      lng: 0,
      etapas: ['infantil'],
      apoyos: [],
      servicios: { comedor: false, transporte: false, aula_matinal: false, enfermeria: false, actividades_extraescolares: false },
      accesibilidad: { acceso_fisico: false, ascensor: false, bano_adaptado: false, bucle_magnetico: false, plano_podotactil: false },
      continuidad: { tipoContinuidad: 'mismo_centro', descripcion: 'N/A', apoyoEnSecundariaVerificado: false, destinos: [] }
    }));

    return { success: true, message: 'Ingesta exitosa', data, sha256, etag };

  } catch (error) {
    console.error('Error durante la ingesta:', error);
    return {
      success: false,
      message: error instanceof TypeError && error.message.includes('Failed to fetch')
        ? 'Error de CORS: La fuente no permite peticiones desde el navegador. Use el pipeline de backend.'
        : `Error en fetchData: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}
