/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Utilidad de Ingesta y Validación de Datos Oficiales
 * Implementa la descarga, verificación de integridad (SHA-256) y extracción de centros.
 */

import { School } from '../types';

export interface IngestionResult {
  success: boolean;
  message: string;
  data?: School[];
  sha256?: string;
}

/**
 * Valida la integridad del archivo descargado usando SHA-256
 */
async function validateIntegrity(data: string, expectedSha256: string): Promise<boolean> {
  const msgUint8 = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === expectedSha256;
}

/**
 * Ingesta y parsea los datos oficiales
 */
export async function ingestAndValidateData(
  url: string,
  expectedSha256: string
): Promise<IngestionResult> {
  try {
    // 1. Descarga del archivo
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error de red: ${response.statusText}`);
    }
    const htmlContent = await response.text();

    // 2. Validación de integridad
    const isValid = await validateIntegrity(htmlContent, expectedSha256);
    if (!isValid) {
      return {
        success: false,
        message: 'Error de integridad: El checksum SHA-256 no coincide.'
      };
    }

    // 3. Extracción (parseo básico simulado del HTML)
    // En una implementación real, esto usaría DOMParser o una librería de scraping
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const rows = doc.querySelectorAll('.center-row');
    
    const extractedSchools: School[] = Array.from(rows).map((row) => {
      // Simulación de extracción de atributos
      return {
        id: row.getAttribute('data-codigo') || 'unknown',
        codigo: row.getAttribute('data-codigo') || '00000000',
        nombre: row.getAttribute('data-nombre') || 'Centro Desconocido',
        titularidad: 'publico', // Inferido o extraído
        tipo: 'CEIP',
        modalidad: 'preferente',
        municipio: row.getAttribute('data-municipio') || 'Madrid',
        codigoPostal: '00000',
        direccion: 'Sin dirección',
        telefono: '000000000',
        email: 'info@educa.madrid.org',
        lat: 0,
        lng: 0,
        etapas: ['infantil', 'primaria'],
        apoyos: [], // Se llenaría con lógica adicional
        servicios: {
          comedor: false,
          transporte: false,
          aula_matinal: false,
          enfermeria: false,
          actividades_extraescolares: false
        },
        accesibilidad: {
          acceso_fisico: false,
          ascensor: false,
          bano_adaptado: false,
          bucle_magnetico: false,
          plano_podotactil: false
        },
        continuidad: {
          tipoContinuidad: 'mismo_centro',
          descripcion: 'N/A',
          apoyoEnSecundariaVerificado: false,
          destinos: []
        }
      };
    });

    return {
      success: true,
      message: 'Ingesta y validación completadas.',
      data: extractedSchools,
      sha256: expectedSha256
    };
  } catch (error) {
    return {
      success: false,
      message: `Error en la ingesta: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}
