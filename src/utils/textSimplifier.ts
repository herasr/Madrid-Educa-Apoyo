/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Utilidad de simplificación de lenguaje técnico para el modo Lectura Fácil.
 */

export const TERMINOLOGY_MAP: Record<string, { plain: string; desc: string }> = {
  CEIPSO: {
    plain: 'Colegio Público de Infantil, Primaria y ESO',
    desc: 'Centro público donde el alumnado puede cursar Infantil, Primaria y Secundaria Obligatoria sin cambiar de centro.',
  },
  CEIP: {
    plain: 'Colegio Público de Infantil y Primaria',
    desc: 'Centro público de Educación Infantil y Primaria.',
  },
  SIES: {
    plain: 'Sección de Instituto de Secundaria',
    desc: 'Extensión de un Instituto público de Educación Secundaria.',
  },
  IES: {
    plain: 'Instituto de Secundaria',
    desc: 'Centro público de Educación Secundaria Obligatoria.',
  },
  CPR: {
    plain: 'Centro Privado Concertado',
    desc: 'Colegio concertado sostenido con fondos públicos.',
  },
  TEA: {
    plain: 'Autismo (TEA)',
    desc: 'Trastorno del Espectro del Autismo: aulas de apoyo especializado en centros ordinarios.',
  },
  PT: {
    plain: 'Profesorado de Pedagogía Terapéutica',
    desc: 'Docente especializado en apoyar los aprendizajes individuales.',
  },
  AL: {
    plain: 'Profesorado de Audición y Lenguaje',
    desc: 'Docente especializado en habla, lenguaje y comunicación.',
  },
  TIS: {
    plain: 'Técnico de Integración Social',
    desc: 'Profesional que apoya la autonomía diaria y la relación en recreos y transiciones.',
  },
  BOCM: {
    plain: 'Boletín Oficial de Madrid',
    desc: 'Publicación oficial donde salen las normas de la Comunidad de Madrid.',
  },
  SAAC: {
    plain: 'Sistemas Alternativos de Comunicación',
    desc: 'Formas de apoyo para comunicarse (pictogramas, signos o tabletas).',
  },
  EOEP: {
    plain: 'Equipo de Orientación Educativa',
    desc: 'Equipo público que valora las necesidades educativas del alumno.',
  },
  SAE: {
    plain: 'Servicio de Apoyo a la Escolarización (SAE)',
    desc: 'Oficina que informa sobre plazas vacantes y tramita la admisión.',
  },
  DAT: {
    plain: 'Dirección de Área Territorial',
    desc: 'Oficina territorial de educación de la Comunidad de Madrid.',
  },
  CEE: {
    plain: 'Colegio de Educación Especial',
    desc: 'Centro específico para alumnado que requiere apoyos muy intensos o permanentes.',
  },
  CREACIM: {
    plain: 'Centro Regional de Altas Capacidades',
    desc: 'Centro público especializado en orientación y seguimiento de altas capacidades en Madrid.',
  },
  PEAC: {
    plain: 'Programa de Enriquecimiento (Altas Capacidades)',
    desc: 'Talleres gratuitos los sábados en institutos públicos para alumnado con altas capacidades.',
  },
  TDL: {
    plain: 'Trastorno del Desarrollo del Lenguaje',
    desc: 'Dificultad persistente en la comprensión o expresión del lenguaje oral.',
  },
  TEL: {
    plain: 'Trastorno Específico del Lenguaje',
    desc: 'Denominación equivalente a TDL para dificultades específicas del lenguaje.',
  },
  EAT: {
    plain: 'Equipo de Atención Temprana (0-6 años)',
    desc: 'Equipo público que orienta y valora las necesidades educativas en Educación Infantil.',
  },
  PMR: {
    plain: 'Personas con Movilidad Reducida',
    desc: 'Condiciones físicas del edificio (cota cero, ascensor o baño adaptado) para moverse sin barreras.',
  },
  PTVA: {
    plain: 'Programa de Transición a la Vida Adulta',
    desc: 'Etapa en Colegios de Educación Especial orientada a la autonomía personal y laboral (16-21 años).',
  },
};

export function simplifyText(text: string): string {
  if (!text) return text;
  let simplified = text;
  Object.entries(TERMINOLOGY_MAP).forEach(([key, value]) => {
    const regex = new RegExp(`\\b${key}\\b`, 'g');
    simplified = simplified.replace(regex, value.plain);
  });
  return simplified;
}

export function simplifySchoolTitle(name: string): string {
  if (!name) return name;
  return name
    .replace(/^CEIPSO\b/i, 'Colegio Público (Infantil, Primaria y ESO)')
    .replace(/^CEIP\b/i, 'Colegio Público')
    .replace(/^SIES\b/i, 'Sección de Instituto (ESO)')
    .replace(/^IES\b/i, 'Instituto de Secundaria');
}
