/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Utilidad de simplificación de lenguaje técnico para el modo Lectura Fácil
 */

export const TERMINOLOGY_MAP: Record<string, { plain: string, desc: string }> = {
    'PT': { plain: 'Maestro de Apoyo', desc: 'Maestro de Pedagogía Terapéutica: maestro especializado en dar apoyo a alumnos con dificultades de aprendizaje.' },
    'AL': { plain: 'Maestro de Lenguaje', desc: 'Maestro de Audición y Lenguaje: maestro especializado en ayudar con el habla y la comunicación.' },
    'TIS': { plain: 'Técnico de Integración', desc: 'Técnico de Integración Social: profesional que ayuda en la autonomía y participación social.' },
    'BOCM': { plain: 'Boletín Oficial', desc: 'Boletín Oficial de la Comunidad de Madrid: documento donde se publican las normas oficiales.' },
    'SAAC': { plain: 'Sistemas de Comunicación', desc: 'Sistemas Aumentativos y Alternativos de Comunicación: formas de comunicarse sin usar solo el habla (pictogramas, signos).' },
    'EOEP': { plain: 'Equipo de Orientación', desc: 'Equipo de Orientación Educativa y Psicopedagógica: grupo de expertos que valora las necesidades de los alumnos.' }
};

export function simplifyText(text: string): string {
    let simplified = text;
    Object.entries(TERMINOLOGY_MAP).forEach(([key, value]) => {
        // Replace acronyms with plain text, keeping them readable
        const regex = new RegExp(`\\b${key}\\b`, 'gi');
        simplified = simplified.replace(regex, `${value.plain}`);
    });
    return simplified;
}
