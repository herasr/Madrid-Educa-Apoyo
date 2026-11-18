/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Procedimientos oficiales, marcos normativos y advertencias legales
 * para Madrid Educa Apoyo (Proyecto DataMad 2026).
 */

export const LEGAL_DISCLAIMER = 
  "La aplicación orienta. No diagnostica, no asigna centro y no garantiza plaza.";

export const OFFICIAL_SOURCES_INFO = [
  {
    prioridad: 1,
    organismo: "Portal de Datos Abiertos CAM · Centros educativos",
    descripcion: "Conjunto abierto oficial 'Centros educativos de la Comunidad de Madrid' (CC BY 4.0). Es la fuente maestra de denominación, titularidad, tipo actualizado (CEIP, CEIPSO, IES, CEE...), contacto y coordenadas UTM (ETRS89) para los 69 Centros de Educación Especial (ALTA), 14 Aulas Hospitalarias, 3 recursos de Discapacidad Visual (EOEP + C.R.E. ONCE), 10 recursos/sedes de Altas Capacidades (CREACIM + EOEP + 8 sedes PEAC) y los 3 EOEP Específicos regionales para Auditivas (28700741), Motóricas (28700763) y Lenguaje/TDAH (28701214).",
    ambito: "Datos Abiertos CAM (CC BY 4.0)."
  },
  {
    prioridad: 2,
    organismo: "Comunidad de Madrid · Consejería de Educación (TEA, Aulas de Enlace, PEAC y Equipos Específicos)",
    descripcion: "Relación oficial de centros de atención preferente TEA con plazas previsibles (curso 2024/2025, 336 centros), Resolución de 25/08/2026 de Escuelas de Bienvenida / Aulas de Enlace en centros concertados (curso 2026/2027, 47 centros autorizados), red regional PEAC (8 sedes IES), CREACIM y EOEP Específicos. Si un código difiere nominalmente respecto al registro CKAN (caso 28020120 / 28011258), prevalece el registro maestro y se notifica la discrepancia en la ficha.",
    ambito: "Información pública CAM (Ley 37/2007)."
  },
  {
    prioridad: 3,
    organismo: "Ayuntamiento de Madrid · Portal de Datos Abiertos (datos.madrid.es)",
    descripcion: "Conjunto 'Centros educativos en Madrid' (300614-0): aporta líneas de Metro, EMT y Cercanías, barrio, servicios declarados (comedor, horario ampliado, transporte) y códigos oficiales de ACCESIBILIDAD según estructura_ds_conjuntodatos.pdf (0: No accesible, 1: Accesible, 2: Parcialmente accesible PMR, 3: Sin información sobre accesibilidad PMR, 4: Lengua de signos, 5: Señalización podotáctil, 6: Bucle magnético) exclusivamente para centros de Madrid capital.",
    ambito: "Datos Abiertos Ayto. Madrid (solo capital)."
  },
  {
    prioridad: 4,
    organismo: "Convenio CAM–ONCE y Nomenclátor Geográfico INE / IGN",
    descripcion: "Integración de los centros del C.R.E. «Antonio Vicente Mosquete» (ONCE) presentes en el catálogo oficial CAM para apoyo visual, junto con centroides oficiales municipales de respaldo y toponimia normalizada de los 179 municipios y 21 distritos de Madrid.",
    ambito: "Información pública CAM–ONCE e IGN/INE."
  }
];

export const SPECIAL_PROCEDURES = {
  visual: {
    titulo: "Discapacidad Visual: Equipo Específico (EOEP) y C.R.E. ONCE",
    subtitulo: "Atención itinerante en cualquier centro ordinario y sede específica C.R.E. ONCE",
    resumen: "En la Comunidad de Madrid, el alumnado con discapacidad visual puede escolarizarse en cualquier centro ordinario apoyado por el Equipo Específico de Deficiencias Visuales (convenio CAM–ONCE) o en los centros de recursos del C.R.E. «Antonio Vicente Mosquete» de la ONCE en Moratalaz (código 28021070 para CEE y 28067501 para Primaria/ESO).",
    comoFunciona: [
      "El menor puede escolarizarse en cualquier centro ordinario de la Comunidad de Madrid sin depender de un listado de colegios preferentes.",
      "El EOEP Específico de Deficiencias Visuales (Avda. de Canillejas a Vicálvaro, 82) evalúa las necesidades y asigna maestros itinerantes de apoyo (profesorado de la CAM y de la ONCE).",
      "Se dota al centro y al alumnado de tiflotecnología, adaptación de materiales a braille o caracteres ampliados y asesoramiento al equipo docente.",
      "El C.R.E. «Antonio Vicente Mosquete» (ONCE) funciona además como centro educativo específico y de recursos en Moratalaz."
    ],
    tramiteEnlace: "https://www.once.es/servicios-sociales/educacion-inclusiva",
    tramiteEtiqueta: "Ver programa educativo inclusivo en portal oficial ONCE",
    contacto: "EOEP Específico de Deficiencias Visuales CAM: Avda. de Canillejas a Vicálvaro, 82, 28022 Madrid (Tel. 91 350 62 88) · C.R.E. «Antonio Vicente Mosquete» ONCE: Avda. del Doctor García Tapia, 210, 28030 Moratalaz (Tel. 91 353 56 28)."
  },
  altas_capacidades: {
    titulo: "Altas Capacidades: CREACIM, EOEP Específico y Red de 8 Sedes PEAC",
    subtitulo: "Escolarización ordinaria complementada con evaluación regional y talleres de los sábados (PEAC)",
    resumen: "El alumnado con Altas Capacidades Intelectuales permanece escolarizado en su centro ordinario con medidas de enriquecimiento o flexibilización curricular. Esta aplicación muestra los 10 recursos y sedes oficiales verificadas en Datos Abiertos CAM: el centro regional CREACIM, el EOEP Específico y las 8 sedes IES comarcales del Programa PEAC (sábados).",
    comoFunciona: [
      "Detección y evaluación psicopedagógica: realizada por el EOEP de sector o Departamento de Orientación, con asesoramiento del EOEP Específico de Altas Capacidades.",
      "Propuesta al Programa PEAC: el centro escolar solicita la incorporación tras la evaluación psicopedagógica y el visto bueno familiar.",
      "Asistencia los sábados (quincenal, Primaria/ESO/Bachillerato): en 8 institutos sede oficiales (Madrid Centro/Arganzuela, Salamanca, Alcalá de Henares, Leganés, Móstoles, Las Rozas, Pozuelo y San Sebastián de los Reyes).",
      "CREACIM (Complejo Educativo El Sol): centro regional público especializado en evaluación, asesoramiento e innovación educativa para Altas Capacidades."
    ],
    tramiteEnlace: "https://www.comunidad.madrid/servicios/educacion/programa-enriquecimiento-educativo-alumnos-altas-capacidades",
    tramiteEtiqueta: "Ver trámite en portal oficial Comunidad de Madrid",
    contacto: "CREACIM y EOEP Específico de Altas Capacidades: Avda. de Canillejas a Vicálvaro, 82 (Complejo Educativo El Sol), 28022 Madrid."
  },
  auditiva: {
    titulo: "Discapacidad Auditiva: EOEP Específico y Centros Preferentes",
    subtitulo: "Equipo público regional en Datos Abiertos CAM (cód. 28700741); red de preferentes sujeta a consulta por DAT/SAE",
    resumen: "La Comunidad de Madrid no publica todavía un CSV abierto descargable con el listado nominativo actualizado de centros preferentes para alumnado sordo o con hipoacusia. En el catálogo oficial CKAN (ALTA) sí figura el EOEP Específico de Deficiencias Auditivas (código 28700741), que cubre toda la región.",
    comoFunciona: [
      "El EOEP de sector o EAT inicia la valoración psicopedagógica en coordinación con el EOEP Específico de Deficiencias Auditivas.",
      "El equipo específico orienta sobre el código de comunicación idóneo (lengua oral, Lengua de Signos Española - LSE o bilingüe) y ayudas técnicas (emisoras FM / bucle).",
      "Si el dictamen propone escolarización preferente en sordera, el Servicio de Apoyo a la Escolarización (SAE) o el buscador oficial de centros CAM asignan plaza según DAT.",
      "Por rigor deontológico, la web no carga listas parciales o desactualizadas; puedes contactar directamente con el EOEP Auditivas o consultar el buscador web CAM."
    ],
    tramiteEnlace: "https://www.comunidad.madrid/servicios/educacion/atencion-preferente-necesidades-educativas-especiales",
    tramiteEtiqueta: "Ver atención preferente en portal oficial CAM",
    contacto: "EOEP Específico de Deficiencias Auditivas (cód. 28700741): Avda. de Canillejas a Vicálvaro, 82, 28022 Madrid · Tel. 91 760 15 21 · eoep.auditivas.madrid@educa.madrid.org."
  },
  motora: {
    titulo: "Discapacidad Motora: EOEP Específico, Fisioterapia y Personal ATU",
    subtitulo: "Equipo público regional en Datos Abiertos CAM (cód. 28700763); centros preferentes consultables vía DAT/SAE",
    resumen: "La Consejería no publica aún un fichero abierto autonómico descargable con todos los colegios e institutos preferentes de discapacidad motora. El catálogo oficial CAM (CC BY 4.0) sí registra en situación ALTA el EOEP Específico de Deficiencias Motóricas (código 28700763) de ámbito regional.",
    comoFunciona: [
      "Valoración conjunta del EOEP de sector / EAT y del EOEP Específico de Deficiencias Motóricas sobre necesidades de desplazamiento, postura y comunicación.",
      "El dictamen de escolarización determina si requiere centro preferente motórico con dotación de fisioterapeuta, auxiliar técnico educativo (ATU) y ascensor/baño adaptado.",
      "La solicitud de plaza con recursos motóricos se canaliza ante la Dirección de Área Territorial (DAT) y el Servicio de Apoyo a la Escolarización (SAE) de cada zona.",
      "En centros situados en Madrid capital puedes activar además el filtro 'Acceso a cota cero' procedente de datos.madrid.es cuando selecciones otras líneas."
    ],
    tramiteEnlace: "https://www.comunidad.madrid/servicios/educacion/atencion-preferente-necesidades-educativas-especiales",
    tramiteEtiqueta: "Ver centros de integración preferente en portal CAM",
    contacto: "EOEP Específico de Deficiencias Motóricas (cód. 28700763): Avda. de Canillejas a Vicálvaro, 82, 28022 Madrid · Tel. 91 306 07 30 · eoep.motoricas.madrid@educa.madrid.org."
  },
  tdah: {
    titulo: "TDAH y Dificultades de Aprendizaje: EOEP Específico Regional",
    subtitulo: "Atención en cualquier centro ordinario + asesoramiento del EOEP Específico (cód. 28701214)",
    resumen: "En la Comunidad de Madrid no existe una red separada de centros preferentes para TDAH o dislexia: las medidas metodológicas, adaptaciones de acceso y apoyo específico se aplican en cualquier colegio o instituto ordinario, con asesoramiento técnico del EOEP Específico regional (código 28701214).",
    comoFunciona: [
      "El tutor y el EOEP de sector o Departamento de Orientación del centro ordinario evalúan las necesidades de apoyo educativo y diseñan medidas organizativas y curriculares.",
      "Para alumnado con necesidades específicas derivadas de TDAH o dificultades de aprendizaje, el equipo docente puede requerir asesoramiento técnico al EOEP Específico (28701214).",
      "El alumnado tiene derecho a adaptaciones metodológicas y de evaluación (tiempo adicional, formato accesible) durante Primaria, ESO y Bachillerato / EvAU.",
      "Las familias mantienen la escolarización ordinaria habitual sin necesidad de traslado a centros específicos."
    ],
    tramiteEnlace: "https://www.educa2.madrid.org/web/eoep.tdah.madrid",
    tramiteEtiqueta: "Visitar web oficial del EOEP Dificultades y TDAH",
    contacto: "EOEP Específico de Dificultades de Aprendizaje, Trastornos del Lenguaje y TDAH (cód. 28701214): Avda. de Canillejas a Vicálvaro, 82, 28022 Madrid · eoep.tdah.madrid@educa.madrid.org."
  },
  tel_lenguaje: {
    titulo: "Trastornos del Lenguaje (TDL/TEL): EOEP Específico y Especialista AL",
    subtitulo: "Atención en centro ordinario + orientación del EOEP Específico de Lenguaje y TDAH (cód. 28701214)",
    resumen: "Los Trastornos del Desarrollo del Lenguaje (TDL/TEL) no cuentan con un fichero descargable autonómico separado porque se atienden habitualmente dentro de los centros ordinarios con profesorado especialista en Audición y Lenguaje (AL) y el asesoramiento técnico del EOEP Específico (código 28701214).",
    comoFunciona: [
      "El EOEP de Atención Temprana (0-6 años) o EOEP de sector valora la presencia de necesidades específicas de apoyo en comunicación y lenguaje.",
      "El centro escolar asigna apoyos de Audición y Lenguaje (AL) y Pedagogía Terapéutica (PT) dentro de la modalidad ordinaria.",
      "El EOEP Específico de Dificultades de Aprendizaje, Trastornos del Lenguaje y TDAH (28701214) orienta de manera regional a orientadores, maestros AL y familias.",
      "En casos graves que precisen adaptación curricular extrema, se valora la coordinación interequipos con otros recursos preferentes o específicos."
    ],
    tramiteEnlace: "https://www.educa2.madrid.org/web/eoep.tdah.madrid",
    tramiteEtiqueta: "Visitar web oficial del EOEP Lenguaje y TDAH",
    contacto: "EOEP Específico de Dificultades de Aprendizaje, Trastornos del Lenguaje y TDAH (cód. 28701214): Avda. de Canillejas a Vicálvaro, 82, 28022 Madrid · eoep.tdah.madrid@educa.madrid.org."
  },
  compensatoria: {
    titulo: "Escuelas de Bienvenida y Aulas de Enlace (2026/27 + Red Pública DAT/SAE)",
    subtitulo: "47 centros concertados autorizados cargados (Resolución 25/08/2026) + red pública asignada vía SAE/DAT",
    resumen: "El programa «Escuelas de Bienvenida» (Aulas de Enlace para alumnado de incorporación tardía al sistema educativo con desconocimiento de la lengua española, Decreto 23/2023) incorpora en esta aplicación los 47 centros privados concertados autorizados por Resolución de 25/08/2026 para el curso 2026/2027 (Nivel A1). Las Aulas de Enlace en colegios e institutos públicos (CEIP/IES) se autorizan y asignan cada curso desde las Direcciones de Área Territorial (DAT) y los Servicios de Apoyo a la Escolarización (SAE) sin listado abierto descargable.",
    comoFunciona: [
      "El Servicio de Apoyo a la Escolarización (SAE) de la zona valora al alumno recién llegado e indica si precisa plaza en un Aula de Enlace de su área territorial.",
      "La estancia en el Aula de Enlace (habitualmente hasta nueve meses) facilita el aprendizaje intensivo de la lengua vehicular y la posterior integración en su grupo ordinario.",
      "Los 47 centros concertados con Aula de Enlace de la Resolución 2026/2027 ya pueden filtrarse y consultarse directamente en el mapa y listado (A1).",
      "Si buscas un CEIP o IES público con Aula de Enlace activa en tu localidad hoy, consulta con el SAE de tu municipio o distrito."
    ],
    tramiteEnlace: "https://site.educa.madrid.org/dg.concertada-becasyayudas/index.php/programas-educativos-2/atencion-a-las-diferencias-individuales/medidas-y-programas/aulas-de-enlace/",
    tramiteEtiqueta: "Ver programa Aulas de Enlace en portal oficial CAM"
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
} as const;

export type ProcedureTopic = keyof typeof SPECIAL_PROCEDURES;

