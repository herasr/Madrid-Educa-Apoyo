/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Procedimientos oficiales, marcos normativos y advertencias legales
 * conforme a la especificación oficial Madrid Educa Apoyo v2.4.
 */

export const LEGAL_DISCLAIMER = 
  "La aplicación orienta. No diagnostica, no asigna centro y no garantiza plaza.";

export const OFFICIAL_SOURCES_INFO = [
  {
    prioridad: 1,
    organismo: "Comunidad de Madrid",
    descripcion: "Especialización nominal de centros, etapas autorizadas, modalidades publicadas en BOCM y resoluciones anuales de admisión.",
    ambito: "Oficial vinculante (Resoluciones D.G. de Educación Infantil, Primaria y Especial)."
  },
  {
    prioridad: 2,
    organismo: "Ayuntamiento de Madrid",
    descripcion: "Datos prácticos, geoposición de equipamientos públicos y privados concertados, accesibilidad de accesos en vía pública y datos de distrito.",
    ambito: "Geodatos Madrid (Madrid Capital)."
  },
  {
    prioridad: 3,
    organismo: "EDUCAbase (Ministerio de Educación)",
    descripcion: "Estructura taxonómica, códigos nacionales oficiales de centro (RCEE) y contexto agregado de etapas educativas.",
    ambito: "Taxonomía oficial; nunca especialización nominal directa."
  }
];

export const SPECIAL_PROCEDURES = {
  visual: {
    titulo: "Discapacidad Visual: Equipo Específico (EOEP) y Convenio CAM-ONCE",
    subtitulo: "Medidas inclusivas sin red de centros preferentes nominales fijos",
    resumen: "En la Comunidad de Madrid, la atención al alumnado con discapacidad visual no se organiza en una red de centros preferentes cerrados, sino a través del Equipo de Orientación Educativa y Psicopedagógica Específico de Discapacidad Visual (EOEP Visual), con sede central y ámbito regional, en estrecha colaboración con la ONCE.",
    comoFunciona: [
      "El menor puede escolarizarse en cualquier centro ordinario de la Comunidad de Madrid.",
      "El EOEP Específico de Discapacidad Visual evalúa las necesidades y asigna maestros itinerantes de apoyo especializado (profesorado de la CAM y de la ONCE).",
      "Se dota al centro y al alumno de tiflotecnología, adaptación de libros de texto a braille o caracteres ampliados y formación al claustro docente.",
      "Para solicitar esta atención es preceptiva la valoración oftalmológica y la tramitación del dictamen de escolarización por el EOEP de sector o DO."
    ],
    tramiteEnlace: "https://www.comunidad.madrid/servicios/educacion/atencion-diferencias-individuales",
    contacto: "Equipo Específico Discapacidad Visual CAM: C/ Paseo de la Habana 140, Madrid."
  },
  altas_capacidades: {
    titulo: "Altas Capacidades: Programa PEAC, CREACIM y Medidas Oficiales",
    subtitulo: "Programa extracurricular y adaptaciones curriculares en centros ordinarios",
    resumen: "El alumnado con Altas Capacidades Intelectuales no acude a centros preferentes cerrados. Permanece escolarizado en su centro ordinario, donde se aplican adaptaciones curriculares de enriquecimiento o flexibilización de curso, y tiene acceso al Programa de Enriquecimiento Educativo de la Comunidad de Madrid (PEAC).",
    comoFunciona: [
      "Detección y Evaluación Psicopedagógica: Realizada por el Equipo de Orientación (EOEP) o el Departamento de Orientación del propio centro.",
      "Propuesta al PEAC: El centro tramita la incorporación a través de la Dirección General de Educación Infantil, Primaria y Especial.",
      "Actividades en sedes los sábados: El PEAC se imparte quincenalmente en centros sede comarcales de la Comunidad de Madrid (Madrid Capital, Alcalá, Las Rozas, Móstoles, Leganés).",
      "CREACIM: El Centro Regional para la Evaluación e Innovación de las Altas Capacidades asesora técnica y metodológicamente a los equipos docentes."
    ],
    tramiteEnlace: "https://www.comunidad.madrid/servicios/educacion/programa-enriquecimiento-educativo-alumnos-altas-capacidades",
    contacto: "Unidad Técnica de Orientación y Atención a la Diversidad CAM."
  },
  educacion_especial: {
    titulo: "Modalidad: Centros de Educación Especial (CEE)",
    subtitulo: "Escolarización en centro específico según dictamen técnico colegiado",
    resumen: "La Educación Especial es una modalidad organizativa destinada al alumnado con necesidades educativas especiales permanentes que requieren adaptaciones muy significativas en grado extremo y recursos humanos y materiales que no pueden ser proporcionados en el marco ordinario.",
    comoFunciona: [
      "Requiere Dictamen de Escolarización preceptivo emitido por el Equipo de Orientación de Sector (EOEP) o de Atención Temprana.",
      "Conformidad o audiencia a las familias y resolución expresa de la Dirección de Área Territorial (DAT).",
      "Los CEE ofrecen Educación Infantil Especial, Educación Básica Obligatoria (EBO) y Programas de Transición a la Vida Adulta (PTVA).",
      "Cuentan con dotación intensiva: Maestros PT, AL, Fisioterapeutas, DUE (Enfermería), Técnicos Educativos y TIS."
    ],
    tramiteEnlace: "https://www.comunidad.madrid/servicios/educacion/educacion-especial"
  }
};
