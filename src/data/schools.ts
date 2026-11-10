/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Catálogo de Centros de Demostración Técnica — DataMad (Comunidad de Madrid).
 * AVISO: Los centros, ubicaciones, coordenadas y códigos son reales de centros docentes
 * de la Comunidad de Madrid. Las asignaciones específicas de recursos, nombres de aula y
 * resoluciones simuladas son datos sintéticos con fines de evaluación técnica y prototipado.
 * No constituyen oferta vinculante ni registro oficial de la Consejería de Educación.
 */

import { School } from '../types';

export const SCHOOLS_DATA: School[] = [
  {
    id: 'ceip-escuelas-aguirre',
    codigo: '28020941',
    nombre: 'CEIP Escuelas Aguirre',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Retiro',
    codigoPostal: '28009',
    direccion: 'C/ Alcalá, 62',
    telefono: '91 577 40 21',
    email: 'cp.escuelasaguirre.madrid@educa.madrid.org',
    web: 'https://site.educa.madrid.org/cp.escuelasaguirre.madrid/',
    lat: 40.4218,
    lng: -3.6828,
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'tea',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: "Aula de Apoyo Extenso TEA 'El Nido'",
        recursosOficiales: [
          '1 Maestro especialista en Pedagogía Terapéutica (PT) a jornada completa',
          '1 Maestro especialista en Audición y Lenguaje (AL) a jornada completa',
          '1 Técnico Especialista I / Técnico Integrador Social (TIS)',
          'Diplomado Universitario en Enfermería (DUE) escolar'
        ],
        fuenteOficial: 'Comunidad de Madrid · D.G. de Educación Infantil, Primaria y Especial',
        resolucionBOCM: 'Resolución de 28 de mayo de 2018 (BOCM nº 139)',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Centro de escolarización preferente para alumnado con necesidades educativas especiales derivadas de Trastorno del Espectro Autista. Capacidad oficial del aula de apoyo: 5 alumnos simultáneos en régimen de inclusión ordinaria.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: false,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'adscripcion_unica',
      descripcion: 'Adscripción directa al IES Cervantes. El IES de destino cuenta con proyecto y dotación de aula de atención preferente TEA en Secundaria.',
      apoyoEnSecundariaVerificado: true,
      destinos: [
        {
          codigo: '28020953',
          nombre: 'IES Cervantes',
          etapa: 'ESO y Bachillerato',
          municipio: 'Madrid',
          distrito: 'Centro',
          tieneMismoApoyo: true,
          detallesApoyo: 'IES de referencia preferente TEA con dotación de PT y TIS para continuidad en ESO.',
          distanciaKm: 1.8
        }
      ]
    },
    observacionesOficiales: 'Patios inclusivos dinamizados con apoyos visuales (PECS y pictogramas ARASAAC).'
  },

  {
    id: 'ceipso-maestro-rodrigo',
    codigo: '28073521',
    nombre: 'CEIPSO Maestro Rodrigo',
    titularidad: 'publico',
    tipo: 'CEIPSO',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Arganzuela',
    codigoPostal: '28045',
    direccion: 'C/ Embajadores, 168',
    telefono: '91 468 11 32',
    email: 'cp.maestrorodrigo.madrid@educa.madrid.org',
    lat: 40.3958,
    lng: -3.6932,
    etapas: ['infantil', 'primaria', 'eso'],
    apoyos: [
      {
        needId: 'tea',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria', 'eso'],
        aulaNombre: "Aula de Apoyo Extenso TEA 'La Clave'",
        recursosOficiales: [
          '2 Maestros PT (1 Primaria, 1 Secundaria)',
          '1 Maestro AL compartido',
          '2 Técnicos Educativos / TIS',
          'Servicio de Enfermería escolar continuada'
        ],
        fuenteOficial: 'Comunidad de Madrid · Catálogo Oficial de Centros Docentes',
        resolucionBOCM: 'BOCM nº 156 de 2 de julio de 2021',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Centro CEIPSO integrado que garantiza la permanencia sin cambio de centro desde 3 años hasta 4.º de ESO con mantenimiento del recurso específico de aula de apoyo.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: true,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'mismo_centro',
      descripcion: 'Mismo centro cubre Infantil, Primaria y ESO completa con apoyo especializado consolidado en ambas etapas.',
      apoyoEnSecundariaVerificado: true,
      destinos: []
    },
    observacionesOficiales: 'Modelo de continuidad en el propio centro que minimiza las transiciones sensoriales y organizativas del alumnado.'
  },

  {
    id: 'ceip-portugal',
    codigo: '28020965',
    nombre: 'CEIP Portugal',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Latina',
    codigoPostal: '28011',
    direccion: 'Paseo de Extremadura, 22',
    telefono: '91 464 25 10',
    email: 'cp.portugal.madrid@educa.madrid.org',
    lat: 40.4095,
    lng: -3.7315,
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'auditiva',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: 'Aula de Recursos para Alumnado con Discapacidad Auditiva',
        recursosOficiales: [
          '2 Maestros de Audición y Lenguaje especialistas en logopedia auditiva y LSE',
          'Intérprete de Lengua de Signos Española (ILSE) para actos y docencia',
          'Maestro PT de apoyo curricular intensivo',
          'Instalaciones equipadas con bucle de inducción magnética en aulas ordinarias'
        ],
        fuenteOficial: 'Comunidad de Madrid · Red Oficial Centros Preferentes Discapacidad Auditiva',
        resolucionBOCM: 'Orden 2110/2016 de la Consejería de Educación',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Centro bilingüe en LSE (Lengua de Signos Española) y lengua oral. Metodología bimodal con recursos técnicos adaptados (FM, bucles y avisadores luminosos).'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: true,
      plano_podotactil: true
    },
    continuidad: {
      tipoContinuidad: 'adscripcion_unica',
      descripcion: 'Adscripción prioritaria al IES Beatriz Galindo, centro bilingüe de referencia en Discapacidad Auditiva.',
      apoyoEnSecundariaVerificado: true,
      destinos: [
        {
          codigo: '28020977',
          nombre: 'IES Beatriz Galindo',
          etapa: 'ESO y Bachillerato',
          municipio: 'Madrid',
          distrito: 'Salamanca',
          tieneMismoApoyo: true,
          detallesApoyo: 'Red preferente auditiva CAM con intérprete LSE y apoyo curricular en ESO/Bachillerato.',
          distanciaKm: 4.1
        }
      ]
    }
  },

  {
    id: 'ceip-menendez-pelayo',
    codigo: '28021027',
    nombre: 'CEIP Menéndez Pelayo',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Arganzuela',
    codigoPostal: '28045',
    direccion: 'C/ Méndez Álvaro, 16',
    telefono: '91 527 21 04',
    email: 'cp.menendezpelayo.madrid@educa.madrid.org',
    lat: 40.4032,
    lng: -3.6912,
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'tea',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: "Aula de Apoyo Extenso TEA 'El Tren'",
        recursosOficiales: [
          '1 Maestro PT',
          '1 Maestro AL',
          '1 Integrador Social (TIS)',
          'Enfermería escolar'
        ],
        fuenteOficial: 'Comunidad de Madrid · Dirección de Área Territorial Madrid Capital',
        resolucionBOCM: 'BOCM nº 142 de 15 de junio de 2019',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Autorización y dotación de aula de apoyo específico para alumnado con TEA en horario lectivo completo.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: false,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'adscripcion_multiple',
      descripcion: 'Adscripción a IES Cervantes (con apoyo TEA) y al IES Antonio Fraguas Forges (continuidad ordinaria).',
      apoyoEnSecundariaVerificado: true,
      destinos: [
        {
          codigo: '28020953',
          nombre: 'IES Cervantes',
          etapa: 'ESO y Bachillerato',
          municipio: 'Madrid',
          distrito: 'Centro',
          tieneMismoApoyo: true,
          detallesApoyo: 'Plazas de reserva en aula preferente TEA para alumnos procedentes de adscripción.',
          distanciaKm: 2.3
        },
        {
          codigo: '28079140',
          nombre: 'IES Antonio Fraguas Forges',
          etapa: 'ESO',
          municipio: 'Madrid',
          distrito: 'Arganzuela',
          tieneMismoApoyo: 'no_verificado',
          detallesApoyo: 'Apoyo ordinario con Departamento de Orientación; aula TEA no confirmada nominalmente.',
          distanciaKm: 1.1
        }
      ]
    }
  },

  {
    id: 'ies-cervantes',
    codigo: '28020953',
    nombre: 'IES Cervantes',
    titularidad: 'publico',
    tipo: 'IES',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Centro',
    codigoPostal: '28004',
    direccion: 'C/ Embajadores, 70',
    telefono: '91 527 21 00',
    email: 'ies.cervantes.madrid@educa.madrid.org',
    lat: 40.4072,
    lng: -3.7042,
    etapas: ['eso', 'bachillerato'],
    apoyos: [
      {
        needId: 'tea',
        evidencia: 'A1',
        etapasConApoyo: ['eso'],
        aulaNombre: "Aula de Transición y Apoyo Específico TEA 'El Ágora'",
        recursosOficiales: [
          '1 Profesor de Orientación Educativa / Especialista PT Secundaria',
          '1 Técnico Integrador Social (TIS)',
          'Horas de codocencia con departamentos didácticos',
          'Enfermería escolar'
        ],
        fuenteOficial: 'Comunidad de Madrid · Red IES Preferentes de Secundaria',
        resolucionBOCM: 'BOCM nº 178 de 28 de julio de 2020',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Centro de referencia de Educación Secundaria Obligatoria para alumnado con TEA receptor de los CEIP adscritos de la DAT Centro.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: false,
      aula_matinal: false,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'mismo_centro',
      descripcion: 'Centro de secundaria con continuidad de ESO a Bachillerato (en Bachillerato los apoyos se canalizan vía Departamento de Orientación y adaptaciones de acceso EvAU).',
      apoyoEnSecundariaVerificado: true,
      destinos: []
    }
  },

  {
    id: 'colegio-sagrada-familia',
    codigo: '28014522',
    nombre: 'Colegio Concertado Sagrada Familia',
    titularidad: 'concertado',
    tipo: 'Colegio Concertado',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Chamberí',
    codigoPostal: '28010',
    direccion: 'C/ Jorge Juan, 165',
    telefono: '91 401 54 00',
    email: 'info@safamadrid.com',
    lat: 40.4285,
    lng: -3.6702,
    etapas: ['infantil', 'primaria', 'eso'],
    apoyos: [
      {
        needId: 'tea',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria', 'eso'],
        aulaNombre: "Unidad Concertada de Apoyo Específico TEA 'Nazaret'",
        recursosOficiales: [
          'Profesorado de Pedagogía Terapéutica concertado',
          'Profesor de Audición y Lenguaje concertado',
          'Personal auxiliar técnico educativo (ATE)',
          'Gabinete psicopedagógico y enfermería escolar'
        ],
        fuenteOficial: 'Comunidad de Madrid · Concierto Educativo Singular en Inclusión',
        resolucionBOCM: 'BOCM nº 198 de 18 de agosto de 2022',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Unidad de apoyo a la inclusión TEA concertada con dotación oficial de plantilla docente de apoyo.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'mismo_centro',
      descripcion: 'Continuidad directa garantizada en el propio colegio de Infantil a Primaria y ESO en el mismo recinto.',
      apoyoEnSecundariaVerificado: true,
      destinos: []
    }
  },

  {
    id: 'ceip-miguel-hernandez-alcala',
    codigo: '28038917',
    nombre: 'CEIP Miguel Hernández',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Alcala de Henares',
    codigoPostal: '28805',
    direccion: 'C/ Ronda Fiscal, 44',
    telefono: '91 888 12 34',
    email: 'cp.miguelhernandez.alcala@educa.madrid.org',
    lat: 40.4812,
    lng: -3.3688,
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'tea',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: "Aula de Apoyo Extenso TEA 'El Mirador'",
        recursosOficiales: [
          '1 Maestro PT a jornada completa',
          '1 Maestro AL a jornada completa',
          '1 Técnico Integrador Social (TIS)',
          'Enfermería escolar'
        ],
        fuenteOficial: 'Comunidad de Madrid · DAT Madrid Este',
        resolucionBOCM: 'BOCM nº 140 de 12 de junio de 2017',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Centro preferente de referencia en el Corredor del Henares para alumnado con TEA en Infantil y Primaria.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'adscripcion_unica',
      descripcion: 'Adscrito al IES Isidra de Guzmán con aula de apoyo en Secundaria autorizada por la DAT Este.',
      apoyoEnSecundariaVerificado: true,
      destinos: [
        {
          codigo: '28045612',
          nombre: 'IES Isidra de Guzmán',
          etapa: 'ESO y Bachillerato',
          municipio: 'Alcala de Henares',
          tieneMismoApoyo: true,
          detallesApoyo: 'Dotación oficial TEA para la etapa de Educación Secundaria Obligatoria.',
          distanciaKm: 1.5
        }
      ]
    }
  },

  {
    id: 'ceip-dulce-chacon-fuenlabrada',
    codigo: '28060238',
    nombre: 'CEIP Dulce Chacón',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Fuenlabrada',
    codigoPostal: '28942',
    direccion: 'C/ Extremadura, 12',
    telefono: '91 608 45 12',
    email: 'cp.dulcechacon.fuenlabrada@educa.madrid.org',
    lat: 40.2865,
    lng: -3.7915,
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'motora',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: 'Recursos Específicos de Atención a la Discapacidad Motórica',
        recursosOficiales: [
          '1 Fisioterapeuta escolar a jornada completa',
          '1 Técnico Educativo auxiliar para aseo y desplazamientos',
          '1 Maestro PT especialista en adaptación de materiales y productos de apoyo',
          'Enfermería escolar con sala de cura equipada'
        ],
        fuenteOficial: 'Comunidad de Madrid · Red Centros Preferentes Motóricos DAT Sur',
        resolucionBOCM: 'BOCM nº 121 de 22 de mayo de 2015',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Edificio 100% accesible con rampas de pendiente reglamentaria, puertas automáticas, bipedestadores y mesas adaptadas.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: true
    },
    continuidad: {
      tipoContinuidad: 'adscripcion_unica',
      descripcion: 'Adscrito al IES Gaspar Melchor de Jovellanos con itinerarios accesibles y fisioterapia compartida.',
      apoyoEnSecundariaVerificado: true,
      destinos: [
        {
          codigo: '28041289',
          nombre: 'IES Gaspar Melchor de Jovellanos',
          etapa: 'ESO',
          municipio: 'Fuenlabrada',
          tieneMismoApoyo: true,
          detallesApoyo: 'Centro preferente de motóricos en Secundaria con ascensor y transporte adaptado con grúa.',
          distanciaKm: 1.2
        }
      ]
    }
  },

  {
    id: 'ceip-jorge-guillen-getafe',
    codigo: '28037123',
    nombre: 'CEIP Jorge Guillén',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Getafe',
    codigoPostal: '28903',
    direccion: 'C/ Greco, 2',
    telefono: '91 682 34 50',
    email: 'cp.jorgeguillen.getafe@educa.madrid.org',
    lat: 40.3095,
    lng: -3.7298,
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'tea',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: "Aula de Apoyo Extenso TEA 'La Brújula'",
        recursosOficiales: [
          '1 Maestro PT',
          '1 Maestro AL',
          '1 Técnico Integrador Social',
          'Enfermería escolar'
        ],
        fuenteOficial: 'Comunidad de Madrid · Red de Centros Preferentes TEA',
        resolucionBOCM: 'BOCM nº 150 de 25 de junio de 2020',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Aula preferente con dotación completa para alumnado de Getafe y municipios limítrofes.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'adscripcion_unica',
      descripcion: 'Adscrito al IES Altaír (Getafe). Continuidad del recurso TEA verificada oficialmente.',
      apoyoEnSecundariaVerificado: true,
      destinos: [
        {
          codigo: '28042911',
          nombre: 'IES Altaír',
          etapa: 'ESO',
          municipio: 'Getafe',
          tieneMismoApoyo: true,
          detallesApoyo: 'Red preferente TEA Secundaria en Getafe con aula de enlace.',
          distanciaKm: 1.6
        }
      ]
    }
  },

  {
    id: 'ceipso-principe-don-felipe',
    codigo: '28069812',
    nombre: 'CEIPSO Príncipe Don Felipe',
    titularidad: 'publico',
    tipo: 'CEIPSO',
    modalidad: 'preferente',
    municipio: 'Boadilla del Monte',
    codigoPostal: '28660',
    direccion: 'C/ José Antonio, 34',
    telefono: '91 633 12 78',
    email: 'cp.principedonfelipe.boadilla@educa.madrid.org',
    lat: 40.4082,
    lng: -3.8732,
    etapas: ['infantil', 'primaria', 'eso'],
    apoyos: [
      {
        needId: 'tea',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: "Aula de Apoyo TEA 'El Roble'",
        recursosOficiales: [
          '1 Maestro PT en Infantil y Primaria',
          '1 Técnico Integrador Social',
          'Orientadora de sector semanal'
        ],
        fuenteOficial: 'Comunidad de Madrid · D.G. de Educación Primaria y Secundaria',
        resolucionBOCM: 'BOCM nº 167 de 16 de julio de 2021',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'El apoyo con aula preferente está consolidado en Infantil y Primaria. En 1.º y 2.º de ESO se mantiene profesor de apoyo PT ordinario.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: false,
      aula_matinal: true,
      enfermeria: false,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'ceipso_parcial',
      descripcion: 'Centro CEIPSO: cubre Infantil, Primaria y los cursos 1.º y 2.º de ESO. Para 3.º y 4.º de ESO el alumnado se adscribe al IES Profesor Máximo Trueba.',
      apoyoEnSecundariaVerificado: 'no_verificado',
      destinos: [
        {
          codigo: '28045120',
          nombre: 'IES Profesor Máximo Trueba',
          etapa: '3.º-4.º ESO y Bachillerato',
          municipio: 'Boadilla del Monte',
          tieneMismoApoyo: 'no_verificado',
          detallesApoyo: 'Continuidad no verificada documentalmente con aula específica; apoyo ordinario a través del D.O.',
          distanciaKm: 1.4
        }
      ]
    }
  },

  {
    id: 'ceip-clara-campoamor-alcobendas',
    codigo: '28062145',
    nombre: 'CEIP Clara Campoamor',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Alcobendas',
    codigoPostal: '28100',
    direccion: 'C/ Miraflores, 9',
    telefono: '91 661 89 20',
    email: 'cp.claracampoamor.alcobendas@educa.madrid.org',
    lat: 40.5489,
    lng: -3.6391,
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'tea',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: "Aula de Apoyo Extenso TEA 'El Espacio'",
        recursosOficiales: [
          '1 Maestro PT a jornada completa',
          '1 Maestro AL a jornada completa',
          '1 Integrador Social',
          'Enfermería escolar'
        ],
        fuenteOficial: 'Comunidad de Madrid · DAT Norte',
        resolucionBOCM: 'BOCM nº 134 de 7 de junio de 2019',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Centro de atención preferente TEA en Alcobendas.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: false,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'adscripcion_unica',
      descripcion: 'Adscrito al IES Severo Ochoa de Alcobendas (con proyecto preferente TEA en ESO).',
      apoyoEnSecundariaVerificado: true,
      destinos: [
        {
          codigo: '28038101',
          nombre: 'IES Severo Ochoa',
          etapa: 'ESO y Bachillerato',
          municipio: 'Alcobendas',
          tieneMismoApoyo: true,
          detallesApoyo: 'Centro preferente de Secundaria en Alcobendas.',
          distanciaKm: 1.1
        }
      ]
    }
  },

  {
    id: 'ceip-antonio-machado-mostoles',
    codigo: '28039871',
    nombre: 'CEIP Antonio Machado',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Mostoles',
    codigoPostal: '28935',
    direccion: 'C/ Pintor Velázquez, 18',
    telefono: '91 617 89 00',
    email: 'cp.antoniomachado.mostoles@educa.madrid.org',
    lat: 40.3245,
    lng: -3.8682,
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'motora',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: 'Recursos Específicos Discapacidad Motora',
        recursosOficiales: [
          'Fisioterapeuta del Centro Base / CAM',
          'Técnico Especialista en Transporte y Movilidad',
          '1 Maestro PT',
          'Enfermería escolar'
        ],
        fuenteOficial: 'Comunidad de Madrid · DAT Sur',
        resolucionBOCM: 'BOCM nº 109 de 10 de mayo de 2016',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Centro adaptado con acceso rodado sin desniveles y transporte en ruta con rampa hidráulica.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'adscripcion_unica',
      descripcion: 'Adscrito al IES Felipe Trigo con transporte adaptado y accesibilidad motórica.',
      apoyoEnSecundariaVerificado: true,
      destinos: [
        {
          codigo: '28041002',
          nombre: 'IES Felipe Trigo',
          etapa: 'ESO',
          municipio: 'Mostoles',
          tieneMismoApoyo: true,
          detallesApoyo: 'Centro preferente de motóricos en Secundaria para Móstoles.',
          distanciaKm: 1.3
        }
      ]
    }
  },

  {
    id: 'colegio-santa-maria-del-pilar',
    codigo: '28014872',
    nombre: 'Colegio Concertado Santa María del Pilar',
    titularidad: 'concertado',
    tipo: 'Colegio Concertado',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Retiro',
    codigoPostal: '28007',
    direccion: 'C/ Reyes Magos, 3',
    telefono: '91 573 82 00',
    email: 'secretaria@smpilar.es',
    lat: 40.4121,
    lng: -3.6738,
    etapas: ['infantil', 'primaria', 'eso', 'bachillerato'],
    apoyos: [
      {
        needId: 'auditiva',
        evidencia: 'A2',
        etapasConApoyo: ['primaria', 'eso'],
        aulaNombre: 'Unidad de Apoyo a la Hipoacusia y Audición',
        recursosOficiales: [
          'Profesor PT y AL concertado',
          'Instalación de bucles magnéticos en salón de actos y aulas de referencia',
          'Departamento de Orientación con apoyo logopédico'
        ],
        fuenteOficial: 'Comunidad de Madrid · Consejería de Educación',
        resolucionBOCM: 'Resolución provisional de concierto singular (Pendiente de renovación formal de cupo)',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Evidencia A2: Necesidad nominal confirmada con vigencia y cupo específico en proceso de verificación por la inspección de zona.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: true,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'mismo_centro',
      descripcion: 'Centro que abarca desde Infantil hasta Bachillerato en el mismo recinto.',
      apoyoEnSecundariaVerificado: true,
      destinos: []
    }
  },

  {
    id: 'ceip-san-benito-madrid',
    codigo: '28021155',
    nombre: 'CEIP San Benito',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Ciudad Lineal',
    codigoPostal: '28027',
    direccion: 'C/ Hermanos García Noblejas, 40',
    telefono: '91 407 19 03',
    email: 'cp.sanbenito.madrid@educa.madrid.org',
    lat: 40.4312,
    lng: -3.6334,
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'auditiva',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: 'Centro Preferente de Discapacidad Auditiva',
        recursosOficiales: [
          'Maestros AL especialistas en LSE y lenguaje oral',
          'Intérprete de Lengua de Signos',
          'Asesores sordos en proyectos de identidad lingüística',
          'Equipamiento de frecuencia modulada (FM) y bucles'
        ],
        fuenteOficial: 'Comunidad de Madrid · Red Oficial Centros Preferentes Auditivos',
        resolucionBOCM: 'BOCM nº 189 de 11 de agosto de 2014',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Centro de referencia histórica de la Comunidad de Madrid para alumnado con hipoacusia y sordera severa/profunda.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: true,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'adscripcion_unica',
      descripcion: 'Adscrito al IES Marqués de Suanzes, con continuidad bimodal y recursos para sordos en Secundaria.',
      apoyoEnSecundariaVerificado: true,
      destinos: [
        {
          codigo: '28021167',
          nombre: 'IES Marqués de Suanzes',
          etapa: 'ESO y Bachillerato',
          municipio: 'Madrid',
          distrito: 'San Blas-Canillejas',
          tieneMismoApoyo: true,
          detallesApoyo: 'Continuidad de la red preferente auditiva de la DAT Capital.',
          distanciaKm: 1.7
        }
      ]
    }
  },

  {
    id: 'cee-joan-miro-madrid',
    codigo: '28041566',
    nombre: 'CEE Joan Miró',
    titularidad: 'publico',
    tipo: 'CEE',
    modalidad: 'especial',
    municipio: 'Madrid',
    distrito: 'Hortaleza',
    codigoPostal: '28043',
    direccion: 'C/ Machupichu, 32',
    telefono: '91 388 56 12',
    email: 'cee.joanmiro.madrid@educa.madrid.org',
    lat: 40.4632,
    lng: -3.6421,
    etapas: ['infantil', 'primaria', 'eso'],
    apoyos: [
      {
        needId: 'educacion_especial',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria', 'eso'],
        aulaNombre: 'Centro de Educación Especial Específico (EBO y PTVA)',
        recursosOficiales: [
          'Maestros de Pedagogía Terapéutica en cada unidad (ratio reducida 3-5 alumnos)',
          'Maestros de Audición y Lenguaje con comunicación aumentativa y alternativa (SAAC)',
          'Fisioterapeutas colegiados con sala de hidroterapia y motricidad',
          'Diplomados en Enfermería continuada (DUE)',
          'Técnicos Educativos / Auxiliares de Control'
        ],
        fuenteOficial: 'Comunidad de Madrid · Red Pública de Colegios de Educación Especial',
        resolucionBOCM: 'Decreto de creación CEE de la Comunidad de Madrid',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Modalidad de Educación Especial para alumnado con dictamen de escolarización específico emitido por los Equipos de Orientación Educativa y Psicopedagógica.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: false,
      enfermeria: true,
      actividades_extraescolares: false
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: true,
      plano_podotactil: true
    },
    continuidad: {
      tipoContinuidad: 'mismo_centro',
      descripcion: 'El centro imparte Educación Básica Obligatoria (EBO) y Programas de Transición a la Vida Adulta (PTVA) hasta los 21 años.',
      apoyoEnSecundariaVerificado: true,
      destinos: []
    },
    observacionesOficiales: 'Transporte escolar con acompañante y vehículos adaptados con plataforma elevadora.'
  },

  {
    id: 'cee-fray-pedro-ponce-leon',
    codigo: '28020822',
    nombre: 'CEE Fray Pedro Ponce de León',
    titularidad: 'publico',
    tipo: 'CEE',
    modalidad: 'especial',
    municipio: 'Madrid',
    distrito: 'Retiro',
    codigoPostal: '28009',
    direccion: 'C/ Los Madrazo, 24',
    telefono: '91 429 88 12',
    email: 'cee.fraypedroponce.madrid@educa.madrid.org',
    lat: 40.4172,
    lng: -3.6961,
    etapas: ['infantil', 'primaria', 'eso'],
    apoyos: [
      {
        needId: 'educacion_especial',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria', 'eso'],
        aulaNombre: 'Centro Específico de Educación Especial',
        recursosOficiales: [
          'Especialistas en plurideficiencia y sistemas aumentativos de comunicación',
          'Equipo médico y de enfermería de presencia continua',
          'Fisioterapia y estimulación sensorial multisensorial (sala Snoezelen)',
          'Técnicos de integración y auxiliares de enfermería'
        ],
        fuenteOficial: 'Comunidad de Madrid · Consejería de Educación',
        resolucionBOCM: 'Orden de funcionamiento de centros específicos de la CAM',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Modalidad de Educación Especial según dictamen oficial.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: false,
      enfermeria: true,
      actividades_extraescolares: false
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: true,
      plano_podotactil: true
    },
    continuidad: {
      tipoContinuidad: 'mismo_centro',
      descripcion: 'Permanencia hasta los 21 años en programas de transición e inserción social y laboral.',
      apoyoEnSecundariaVerificado: true,
      destinos: []
    }
  },

  {
    id: 'ceip-ciudad-de-jaen-madrid',
    codigo: '28021301',
    nombre: 'CEIP Ciudad de Jaén',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Usera',
    codigoPostal: '28026',
    direccion: 'C/ Jaspe, 1',
    telefono: '91 560 34 11',
    email: 'cp.ciudaddejaen.madrid@educa.madrid.org',
    lat: 40.3812,
    lng: -3.7089,
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'motora',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: 'Centro de Atención Preferente para Alumnado con Discapacidad Motora',
        recursosOficiales: [
          'Fisioterapeuta asignado por la Consejería de Educación',
          'Técnicos Educativos para soporte en aula y comedor',
          'Maestro PT de apoyo curricular',
          'Enfermería escolar jornada lectiva completa'
        ],
        fuenteOficial: 'Comunidad de Madrid · Red Centros Motóricos Capital',
        resolucionBOCM: 'BOCM nº 175 de 24 de julio de 2018',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Eliminación integral de barreras arquitectónicas en accesos, patios, aseos y comedor.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'adscripcion_unica',
      descripcion: 'Adscrito al IES Pradolongo con acceso a cota cero y ascensor adaptado.',
      apoyoEnSecundariaVerificado: true,
      destinos: [
        {
          codigo: '28021313',
          nombre: 'IES Pradolongo',
          etapa: 'ESO',
          municipio: 'Madrid',
          distrito: 'Usera',
          tieneMismoApoyo: true,
          detallesApoyo: 'Centro preferente de motóricos en Secundaria.',
          distanciaKm: 0.9
        }
      ]
    }
  },

  {
    id: 'ceip-federico-garcia-lorca-leganes',
    codigo: '28036541',
    nombre: 'CEIP Federico García Lorca',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Leganes',
    codigoPostal: '28912',
    direccion: 'C/ Santa Teresa, 14',
    telefono: '91 694 22 10',
    email: 'cp.garcialorca.leganes@educa.madrid.org',
    lat: 40.3298,
    lng: -3.7654,
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'tea',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: "Aula de Apoyo Extenso TEA 'Los Colores'",
        recursosOficiales: [
          '1 Maestro PT',
          '1 Maestro AL',
          '1 Técnico Integrador Social',
          'Enfermería escolar'
        ],
        fuenteOficial: 'Comunidad de Madrid · DAT Sur',
        resolucionBOCM: 'BOCM nº 148 de 22 de junio de 2021',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Centro de escolarización preferente TEA con proyecto de recreos estructurados.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: false,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'adscripcion_unica',
      descripcion: 'Adscrito al IES Isaac Albéniz de Leganés (con aula TEA en ESO).',
      apoyoEnSecundariaVerificado: true,
      destinos: [
        {
          codigo: '28039201',
          nombre: 'IES Isaac Albéniz',
          etapa: 'ESO y Bachillerato',
          municipio: 'Leganes',
          tieneMismoApoyo: true,
          detallesApoyo: 'Red de centros preferentes TEA de Educación Secundaria Obligatoria en Leganés.',
          distanciaKm: 1.4
        }
      ]
    }
  },

  {
    id: 'ceip-infanta-elena-pozuelo',
    codigo: '28045981',
    nombre: 'CEIP Infanta Elena',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Pozuelo de Alarcon',
    codigoPostal: '28224',
    direccion: 'C/ Diamante, 1',
    telefono: '91 715 67 00',
    email: 'cp.infantaelena.pozuelo@educa.madrid.org',
    lat: 40.4398,
    lng: -3.8095,
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'tea',
        evidencia: 'A2',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: "Aula de Apoyo TEA 'La Fuente' (Proyecto en consolidación)",
        recursosOficiales: [
          '1 Maestro PT',
          '1 Integrador Social (TIS)',
          'Orientadora asignada por EOEP de Pozuelo'
        ],
        fuenteOficial: 'Comunidad de Madrid · DAT Oeste',
        resolucionBOCM: 'Resolución provisional de dotación de aula de apoyo (A2: etapa o vigencia por comprobar formalmente)',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Evidencia A2: Centro con proyecto de atención preferente en trámite de consolidación y dotación de especialista AL en curso.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: false,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'adscripcion_unica',
      descripcion: 'Adscrito al IES Camilo José Cela de Pozuelo de Alarcón.',
      apoyoEnSecundariaVerificado: 'no_verificado',
      destinos: [
        {
          codigo: '28046122',
          nombre: 'IES Camilo José Cela',
          etapa: 'ESO',
          municipio: 'Pozuelo de Alarcon',
          tieneMismoApoyo: 'no_verificado',
          detallesApoyo: 'Continuidad no verificada en catálogo oficial para Secundaria; cuenta con departamento de orientación ordinario.',
          distanciaKm: 2.1
        }
      ]
    }
  },

  {
    id: 'ceip-san-sebastian-sanse',
    codigo: '28038751',
    nombre: 'CEIP San Sebastián',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'San Sebastian de los Reyes',
    codigoPostal: '28701',
    direccion: 'Avda. de España, 18',
    telefono: '91 652 14 00',
    email: 'cp.sansebastian.sansebastian@educa.madrid.org',
    lat: 40.5495,
    lng: -3.6289,
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'tea',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: "Aula de Apoyo Extenso TEA 'La Cometa'",
        recursosOficiales: [
          '1 Maestro PT a jornada completa',
          '1 Maestro AL a jornada completa',
          '1 Técnico Integrador Social (TIS)',
          'Enfermería escolar'
        ],
        fuenteOficial: 'Comunidad de Madrid · DAT Norte',
        resolucionBOCM: 'BOCM nº 162 de 9 de julio de 2020',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Centro preferente TEA de San Sebastián de los Reyes.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'adscripcion_unica',
      descripcion: 'Adscrito al IES Atenea (San Sebastián de los Reyes) con aula preferente TEA en ESO.',
      apoyoEnSecundariaVerificado: true,
      destinos: [
        {
          codigo: '28039912',
          nombre: 'IES Atenea',
          etapa: 'ESO y Bachillerato',
          municipio: 'San Sebastian de los Reyes',
          tieneMismoApoyo: true,
          detallesApoyo: 'Centro preferente de Secundaria en Sanse.',
          distanciaKm: 1.3
        }
      ]
    }
  },

  {
    id: 'ceip-la-gavia-madrid',
    codigo: '28075191',
    nombre: 'CEIP La Gavia',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Villa de Vallecas',
    codigoPostal: '28051',
    direccion: 'C/ Cerro del Murmullo, 1',
    telefono: '91 385 67 11',
    email: 'cp.lagavia.madrid@educa.madrid.org',
    lat: 40.3685,
    lng: -3.6124,
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'tea',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: "Aula de Apoyo Extenso TEA 'La Estrella'",
        recursosOficiales: [
          '1 Maestro PT',
          '1 Maestro AL',
          '1 Integrador Social (TIS)',
          'Enfermería escolar'
        ],
        fuenteOficial: 'Comunidad de Madrid · Red Centros Preferentes TEA',
        resolucionBOCM: 'BOCM nº 138 de 11 de junio de 2022',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Autorización oficial de aula de apoyo para alumnado con TEA en el Ensanche de Vallecas.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: false,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'adscripcion_unica',
      descripcion: 'Adscrito al IES Villa de Vallecas con aula TEA autorizada en Secundaria.',
      apoyoEnSecundariaVerificado: true,
      destinos: [
        {
          codigo: '28042109',
          nombre: 'IES Villa de Vallecas',
          etapa: 'ESO y Bachillerato',
          municipio: 'Madrid',
          distrito: 'Villa de Vallecas',
          tieneMismoApoyo: true,
          detallesApoyo: 'Red preferente TEA Secundaria en Vallecas.',
          distanciaKm: 2.2
        }
      ]
    }
  },

  {
    id: 'colegio-san-viator-madrid',
    codigo: '28015312',
    nombre: 'Colegio Concertado San Viator',
    titularidad: 'concertado',
    tipo: 'Colegio Concertado',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Usera',
    codigoPostal: '28026',
    direccion: 'Plaza Fernández Ladreda, 2',
    telefono: '91 469 11 00',
    email: 'secretaria@sanviator.es',
    lat: 40.3845,
    lng: -3.7198,
    etapas: ['infantil', 'primaria', 'eso'],
    apoyos: [
      {
        needId: 'tea',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria', 'eso'],
        aulaNombre: "Unidad de Inclusión TEA 'San Viator'",
        recursosOficiales: [
          'Profesorado de Pedagogía Terapéutica concertado',
          'Profesorado de Audición y Lenguaje concertado',
          'Técnicos de apoyo e integración social',
          'Servicio médico y enfermería escolar'
        ],
        fuenteOficial: 'Comunidad de Madrid · Concierto Educativo de Apoyo a NEE',
        resolucionBOCM: 'BOCM nº 171 de 20 de julio de 2021',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Concierto singular de inclusión educativa para alumnado con TEA en Infantil, Primaria y ESO.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'mismo_centro',
      descripcion: 'Continuidad en el propio centro desde los 3 años hasta 4.º de ESO en el mismo complejo escolar.',
      apoyoEnSecundariaVerificado: true,
      destinos: []
    }
  },

  {
    id: 'ceip-pio-baroja-madrid',
    codigo: '28021481',
    nombre: 'CEIP Pío Baroja',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Moratalaz',
    codigoPostal: '28030',
    direccion: 'C/ Arroyo Fontarrón, 114',
    telefono: '91 430 45 60',
    email: 'cp.piobaroja.madrid@educa.madrid.org',
    lat: 40.3995,
    lng: -3.6492,
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'motora',
        evidencia: 'A2',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: 'Apoyo a la Discapacidad Motriz (En renovación técnica)',
        recursosOficiales: [
          'Fisioterapeuta compartido de zona',
          'Técnico Educativo auxiliar',
          'Maestro PT'
        ],
        fuenteOficial: 'Comunidad de Madrid · DAT Capital',
        resolucionBOCM: 'Resolución provisional de dotación y accesibilidad',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Evidencia A2: Centro con adaptación motriz en curso; obras de ascensor y rampa completadas, expediente de consolidación de fisioterapeuta en tramitación.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: false,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'adscripcion_unica',
      descripcion: 'Adscrito al IES Felipe II.',
      apoyoEnSecundariaVerificado: 'no_verificado',
      destinos: [
        {
          codigo: '28021493',
          nombre: 'IES Felipe II',
          etapa: 'ESO',
          municipio: 'Madrid',
          distrito: 'Moratalaz',
          tieneMismoApoyo: 'no_verificado',
          detallesApoyo: 'Continuidad no verificada en catálogo de motóricos para Secundaria.',
          distanciaKm: 1.5
        }
      ]
    }
  },

  {
    id: 'ceip-guindalera-madrid',
    codigo: '28020989',
    nombre: 'CEIP Guindalera',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Salamanca',
    codigoPostal: '28028',
    direccion: 'C/ Boston, 8',
    telefono: '91 725 34 20',
    email: 'cp.guindalera.madrid@educa.madrid.org',
    lat: 40.4365,
    lng: -3.6672,
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'visual',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: 'Centro Ordinario con Apoyo Especializado en Discapacidad Visual (EOEP / ONCE)',
        recursosOficiales: [
          'Profesorado itinerante especialista en ceguera y baja visión (Convenio CAM-ONCE)',
          'Dotación tiflotécnica: adaptadores ópticos, lupas digitales y software de ampliación',
          'Adaptación y transcripción de libros de texto a braille y relieve',
          'Técnico de rehabilitación para orientación y movilidad en el centro',
          'Enfermería escolar'
        ],
        fuenteOficial: 'Comunidad de Madrid · Convenio Marco CAM-ONCE y EOEP Específico de Discapacidad Visual',
        resolucionBOCM: 'Convenio de Colaboración Comunidad de Madrid - ONCE (BOCM nº 241)',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Centro ordinario con intervención coordinada con el Equipo Específico de Discapacidad Visual de la CAM y el Centro de Recursos Educativos (CRE) de la ONCE. Adaptación tiflotécnica de aulas y material curricular.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: true,
      plano_podotactil: true
    },
    continuidad: {
      tipoContinuidad: 'adscripcion_unica',
      descripcion: 'Adscrito al IES Avenida de los Toreros con mantenimiento del apoyo tiflotécnico itinerante en Secundaria.',
      apoyoEnSecundariaVerificado: true,
      destinos: [
        {
          codigo: '28020990',
          nombre: 'IES Avenida de los Toreros',
          etapa: 'ESO y Bachillerato',
          municipio: 'Madrid',
          distrito: 'Salamanca',
          tieneMismoApoyo: true,
          detallesApoyo: 'Continuidad de apoyo tiflotécnico en ESO/Bachillerato por el Equipo Específico de Discapacidad Visual.',
          distanciaKm: 0.9
        }
      ]
    },
    observacionesOficiales: 'Itinerarios interiores con señalización de alto contraste y pavimento podotáctil en accesos principales.'
  },

  {
    id: 'ies-beatriz-galindo-visual',
    codigo: '28020977',
    nombre: 'IES Beatriz Galindo',
    titularidad: 'publico',
    tipo: 'IES',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Salamanca',
    codigoPostal: '28001',
    direccion: 'C/ Goya, 10',
    telefono: '91 576 43 00',
    email: 'ies.beatrizgalindo.madrid@educa.madrid.org',
    lat: 40.4252,
    lng: -3.6874,
    etapas: ['eso', 'bachillerato'],
    apoyos: [
      {
        needId: 'visual',
        evidencia: 'A1',
        etapasConApoyo: ['eso', 'bachillerato'],
        aulaNombre: 'Apoyo Tiflotécnico y Curricular en Educación Secundaria (Convenio ONCE)',
        recursosOficiales: [
          'Profesor de apoyo del Equipo Específico de Discapacidad Visual CAM',
          'Puesto tiflotécnico adaptado (línea braille, lectores de pantalla NVDA/JAWS)',
          'Adaptaciones de acceso a la EvAU coordinadas con la comisión universitaria',
          'Departamento de Orientación con formación específica en baja visión'
        ],
        fuenteOficial: 'Comunidad de Madrid · EOEP Específico de Discapacidad Visual y D.G. Educación Secundaria',
        resolucionBOCM: 'Instrucciones anuales de inicio de curso (Atención a la Diversidad)',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Centro de referencia de Educación Secundaria y Bachillerato para alumnado con discapacidad visual, con adaptaciones tiflotécnicas avanzadas en laboratorios y aulas digitales.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: false,
      aula_matinal: false,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: true,
      plano_podotactil: true
    },
    continuidad: {
      tipoContinuidad: 'mismo_centro',
      descripcion: 'Continuidad directa de ESO a Bachillerato con asesoramiento para el acceso a estudios superiores y EvAU.',
      apoyoEnSecundariaVerificado: true,
      destinos: []
    }
  },

  {
    id: 'ies-san-mateo-madrid',
    codigo: '28074389',
    nombre: 'IES San Mateo',
    titularidad: 'publico',
    tipo: 'IES',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Centro',
    codigoPostal: '28004',
    direccion: 'C/ Beneficencia, 4',
    telefono: '91 532 78 20',
    email: 'ies.sanmateo.madrid@educa.madrid.org',
    lat: 40.4261,
    lng: -3.6998,
    etapas: ['bachillerato'],
    apoyos: [
      {
        needId: 'altas_capacidades',
        evidencia: 'A1',
        etapasConApoyo: ['bachillerato'],
        aulaNombre: 'Centro de Excelencia y Enriquecimiento Curricular (Bachillerato de Excelencia)',
        recursosOficiales: [
          'Profesorado especializado en metodología de profundización e investigación',
          'Proyectos de iniciación a la investigación en colaboración con universidades (UAM, UCM, UPM, CSIC)',
          'Coordinación con CREACIM para programas de tutorización y mentoría',
          'Departamento de Orientación especializado en alumnado de alto rendimiento y altas capacidades'
        ],
        fuenteOficial: 'Comunidad de Madrid · Programa de Bachillerato de Excelencia (Orden 2743/2011)',
        resolucionBOCM: 'Orden 2743/2011 y Orden 2482/2016 de la Consejería de Educación (BOCM nº 193)',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Centro público de referencia regional para Bachillerato de Excelencia y enriquecimiento curricular de alumnado de alto rendimiento intelectual y altas capacidades.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: false,
      aula_matinal: false,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'mismo_centro',
      descripcion: 'Centro especializado en Bachillerato con orientación hacia la carrera investigadora y universitaria.',
      apoyoEnSecundariaVerificado: true,
      destinos: []
    },
    observacionesOficiales: 'Centro público sede del Bachillerato de Excelencia de la Comunidad de Madrid con laboratorios avanzados.'
  },

  {
    id: 'ceip-ramon-y-cajal-madrid',
    codigo: '28021209',
    nombre: 'CEIP Ramón y Cajal',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Chamartín',
    codigoPostal: '28036',
    direccion: 'C/ Marcenado, 28',
    telefono: '91 415 22 10',
    email: 'cp.ramonycajal.madrid@educa.madrid.org',
    lat: 40.4482,
    lng: -3.6741,
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'altas_capacidades',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: 'Centro Sede Programa PEAC y Enriquecimiento Curricular (CREACIM)',
        recursosOficiales: [
          'Centro sede del Programa de Enriquecimiento Educativo para Altas Capacidades (PEAC) de la CAM',
          'Profesorado formado en diferenciación pedagógica, pensamiento divergente y robótica educativa',
          'Talleres quincenales de sábado de creatividad, filosofía para niños y proyectos STEAM',
          'Orientador de sector del EOEP especializado en valoración y seguimiento de altas capacidades'
        ],
        fuenteOficial: 'Comunidad de Madrid · Programa PEAC y CREACIM (D.G. Educación Infantil y Primaria)',
        resolucionBOCM: 'Resolución anual del Programa de Enriquecimiento Educativo (PEAC) CAM',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Centro público seleccionado como sede comarcal del Programa PEAC para Madrid Capital Este, con proyecto de centro de enriquecimiento y agrupamientos flexibles.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'adscripcion_unica',
      descripcion: 'Adscrito al IES Santamarca con programa de continuidad para alumnado de altas capacidades en ESO.',
      apoyoEnSecundariaVerificado: true,
      destinos: [
        {
          codigo: '28021210',
          nombre: 'IES Santamarca',
          etapa: 'ESO y Bachillerato',
          municipio: 'Madrid',
          distrito: 'Chamartín',
          tieneMismoApoyo: true,
          detallesApoyo: 'Proyectos de investigación y flexibilización curricular para alumnado PEAC.',
          distanciaKm: 1.1
        }
      ]
    },
    observacionesOficiales: 'Sede oficial de talleres quincenales del PEAC durante los sábados lectivos.'
  },

  {
    id: 'ceip-los-castillos-alcorcon',
    codigo: '28043120',
    nombre: 'CEIP Los Castillos',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Alcorcon',
    codigoPostal: '28925',
    direccion: 'C/ Los Castillos, 10',
    telefono: '91 643 21 00',
    email: 'cp.loscastillos.alcorcon@educa.madrid.org',
    lat: 40.3482,
    lng: -3.8192,
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'visual',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: 'Atención a la Discapacidad Visual en Aula Ordinaria (EOEP Sur / ONCE)',
        recursosOficiales: [
          'Profesor itinerante de apoyo a la discapacidad visual (Convenio CAM-ONCE)',
          'Equipamiento de magnificación de imagen y adaptaciones tiflotécnicas',
          'Adaptación de libros de texto a relieve y braille',
          'Técnico en orientación y movilidad'
        ],
        fuenteOficial: 'Comunidad de Madrid · Convenio CAM-ONCE y DAT Sur',
        resolucionBOCM: 'Resolución de Coordinación Tiflotécnica DAT Sur',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Centro de referencia en el municipio de Alcorcón para la inclusión de alumnado con ceguera o baja visión con atención de la ONCE.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: true,
      plano_podotactil: true
    },
    continuidad: {
      tipoContinuidad: 'adscripcion_unica',
      descripcion: 'Adscrito al IES Jorge Guillén (Alcorcón) con apoyo de la ONCE.',
      apoyoEnSecundariaVerificado: true,
      destinos: [
        {
          codigo: '28043156',
          nombre: 'IES Jorge Guillén',
          etapa: 'ESO y Bachillerato',
          municipio: 'Alcorcon',
          tieneMismoApoyo: true,
          detallesApoyo: 'Continuidad de apoyo tiflotécnico en Secundaria.',
          distanciaKm: 1.4
        }
      ]
    }
  },

  {
    id: 'ies-arquitecto-ventura-rodriguez-boadilla',
    codigo: '28046101',
    nombre: 'IES Arquitecto Ventura Rodríguez',
    titularidad: 'publico',
    tipo: 'IES',
    modalidad: 'preferente',
    municipio: 'Boadilla del Monte',
    codigoPostal: '28660',
    direccion: 'C/ Santillana del Mar, 2',
    telefono: '91 632 00 12',
    email: 'ies.venturarodriguez.boadilla@educa.madrid.org',
    lat: 40.4121,
    lng: -3.8812,
    etapas: ['eso', 'bachillerato'],
    apoyos: [
      {
        needId: 'altas_capacidades',
        evidencia: 'A1',
        etapasConApoyo: ['eso', 'bachillerato'],
        aulaNombre: 'Centro Sede PEAC Oeste y Proyectos de Enriquecimiento (CREACIM)',
        recursosOficiales: [
          'Centro Sede del Programa PEAC en la DAT Oeste',
          'Talleres de enriquecimiento quincenales en la etapa de ESO',
          'Proyectos de profundización STEAM y ferias de ciencia regional',
          'Departamento de Orientación con protocolo de flexibilización'
        ],
        fuenteOficial: 'Comunidad de Madrid · Programa PEAC y DAT Oeste',
        resolucionBOCM: 'Resolución de Sede PEAC CAM',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Sede comarcal del Programa de Enriquecimiento Educativo para Altas Capacidades para el alumnado de Boadilla, Pozuelo y Majadahonda.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: false,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'mismo_centro',
      descripcion: 'Continuidad en el propio centro desde 1.º de ESO hasta 2.º de Bachillerato.',
      apoyoEnSecundariaVerificado: true,
      destinos: []
    }
  },

  {
    id: 'ceip-joaquin-costa-tdah',
    codigo: '28020931',
    nombre: 'CEIP Joaquín Costa',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Arganzuela',
    codigoPostal: '28045',
    direccion: 'Paseo de las Delicias, 28',
    telefono: '91 527 12 40',
    email: 'cp.joaquincosta.madrid@educa.madrid.org',
    lat: 40.4045,
    lng: -3.6948,
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'tdah',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: 'Programa de Adaptación Metodológica y Apoyo Conductual TDAH',
        recursosOficiales: [
          'Especialista en Pedagogía Terapéutica en apoyo a la autorregulación y funciones ejecutivas',
          'Adaptación de evaluaciones (tiempos ampliados, lecturas fraccionadas y supervisión)',
          'Protocolo activo de coordinación con la Unidad de Salud Mental Infantil y Juvenil (USMIJ)',
          'Tutorías de seguimiento con familias y entrenamiento en agendas visuales'
        ],
        fuenteOficial: 'Comunidad de Madrid · Guía de Actuación con Alumnado TDAH (D.G. Educación Primaria)',
        resolucionBOCM: 'Protocolo de Atención Educativa al Alumnado con TDAH CAM (BOCM nº 156)',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Centro público con proyecto de centro enfocado en la estructuración ambiental, autorregulación emocional y adecuación metodológica para alumnado con TDAH y trastornos de la conducta.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: false,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'adscripcion_unica',
      descripcion: 'Adscrito al IES Cervantes con protocolo de adaptación metodológica TDAH en Secundaria.',
      apoyoEnSecundariaVerificado: true,
      destinos: [
        {
          codigo: '28020953',
          nombre: 'IES Cervantes',
          etapa: 'ESO y Bachillerato',
          municipio: 'Madrid',
          distrito: 'Centro',
          tieneMismoApoyo: true,
          detallesApoyo: 'Continuidad de adaptaciones no significativas y tiempos de examen en ESO.',
          distanciaKm: 1.2
        }
      ]
    }
  },

  {
    id: 'ceip-fernando-el-catolico-tel',
    codigo: '28020846',
    nombre: 'CEIP Fernando el Católico',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Chamberí',
    codigoPostal: '28015',
    direccion: 'C/ Fernando el Católico, 12',
    telefono: '91 445 23 00',
    email: 'cp.fernandoelcatolico.madrid@educa.madrid.org',
    lat: 40.4328,
    lng: -3.7082,
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'tel_lenguaje',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: 'Unidad de Intervención Específica en Trastornos del Lenguaje y Comunicación (TDL/TEL)',
        recursosOficiales: [
          '2 Maestros especialistas en Audición y Lenguaje (AL) en intervención logopédica directa',
          'Uso de Sistemas Alternativos y Aumentativos de Comunicación (SAAC / PECS)',
          '1 Maestro PT especializado en competencia lingüística y lectoescritura',
          'Enfermería escolar'
        ],
        fuenteOficial: 'Comunidad de Madrid · Red Específica de Apoyo a los Trastornos del Lenguaje',
        resolucionBOCM: 'Resolución de Coordinación de Equipos Específicos CAM',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Centro de atención continuada en logopedia y lenguaje para alumnado con Trastorno del Desarrollo del Lenguaje (TDL/TEL) y disfasia.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: true,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'adscripcion_unica',
      descripcion: 'Adscrito al IES Lope de Vega con apoyo lingüístico en Secundaria.',
      apoyoEnSecundariaVerificado: true,
      destinos: [
        {
          codigo: '28020858',
          nombre: 'IES Lope de Vega',
          etapa: 'ESO',
          municipio: 'Madrid',
          distrito: 'Centro',
          tieneMismoApoyo: true,
          detallesApoyo: 'Refuerzo de AL en competencia comunicativa para Secundaria.',
          distanciaKm: 1.1
        }
      ]
    }
  },

  {
    id: 'aula-hospitalaria-la-paz',
    codigo: '28079981',
    nombre: 'CEIP Sede Aula Hospitalaria y Domiciliaria La Paz',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Fuencarral-El Pardo',
    codigoPostal: '28046',
    direccion: 'Paseo de la Castellana, 261 (Hospital La Paz)',
    telefono: '91 727 70 00',
    email: 'ah.lapaz.madrid@educa.madrid.org',
    lat: 40.4802,
    lng: -3.6871,
    etapas: ['infantil', 'primaria', 'eso', 'bachillerato'],
    apoyos: [
      {
        needId: 'salud_hospitalaria',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria', 'eso', 'bachillerato'],
        aulaNombre: 'Unidad de Escolarización Hospitalaria y Servicio de Apoyo Domiciliario (SAED)',
        recursosOficiales: [
          'Maestros y profesores hospitalarios de plantilla fija de la Consejería de Educación',
          'Profesorado de Servicio de Apoyo Educativo Domiciliario (SAED) para convalecencias superiores a 30 días',
          'Coordinación directa con el centro de origen del alumno para seguimiento del currículo ordinario y exámenes',
          'Aulas adaptadas en oncología, pediatría y psiquiatría infantil'
        ],
        fuenteOficial: 'Comunidad de Madrid · Servicio de Apoyo Educativo a Alumnado Enfermo (SAED)',
        resolucionBOCM: 'Orden de Funcionamiento de Aulas Hospitalarias y SAED CAM (BOCM nº 182)',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Sede oficial regional para la atención educativa al alumnado hospitalizado o con enfermedades crónicas/graves que impiden la asistencia regular al colegio.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: false,
      enfermeria: true,
      actividades_extraescolares: false
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: true,
      plano_podotactil: true
    },
    continuidad: {
      tipoContinuidad: 'mismo_centro',
      descripcion: 'Garantiza la continuidad educativa con el centro escolar de origen durante el periodo de ingreso o convalecencia.',
      apoyoEnSecundariaVerificado: true,
      destinos: []
    }
  },

  {
    id: 'ceip-san-cristobal-compensatoria',
    codigo: '28021384',
    nombre: 'CEIP San Cristóbal',
    titularidad: 'publico',
    tipo: 'CEIP',
    modalidad: 'preferente',
    municipio: 'Madrid',
    distrito: 'Villaverde',
    codigoPostal: '28021',
    direccion: 'C/ Rocafort, 5',
    telefono: '91 795 12 30',
    email: 'cp.sancristobal.madrid@educa.madrid.org',
    lat: 40.3421,
    lng: -3.6912,
    etapas: ['infantil', 'primaria'],
    apoyos: [
      {
        needId: 'compensatoria',
        evidencia: 'A1',
        etapasConApoyo: ['infantil', 'primaria'],
        aulaNombre: 'Programa de Compensación Educativa y Aula de Enlace',
        recursosOficiales: [
          'Profesorado de Compensatoria (PTC) especialista en español como segunda lengua',
          'Aula de Enlace para alumnado de incorporación tardía al sistema educativo',
          '1 Maestro PT y 1 Educador Social de apoyo a familias',
          'Comedor e itinerarios socioeducativos integrados'
        ],
        fuenteOficial: 'Comunidad de Madrid · D.G. de Educación Infantil, Primaria y Especial (Compensación)',
        resolucionBOCM: 'Resolución de Autorización de Programa de Compensatoria (BOCM nº 164)',
        fechaCorte: 'Curso 2025/2026',
        detallesResolucion: 'Centro público autorizado con programa intensivo de compensación educativa y adquisición acelerada del idioma para alumnado inmigrante o en riesgo de exclusión social.'
      }
    ],
    servicios: {
      comedor: true,
      transporte: true,
      aula_matinal: true,
      enfermeria: true,
      actividades_extraescolares: true
    },
    accesibilidad: {
      acceso_fisico: true,
      ascensor: true,
      bano_adaptado: true,
      bucle_magnetico: false,
      plano_podotactil: false
    },
    continuidad: {
      tipoContinuidad: 'adscripcion_unica',
      descripcion: 'Adscrito al IES San Cristóbal de los Ángeles con aula de enlace en Secundaria.',
      apoyoEnSecundariaVerificado: true,
      destinos: [
        {
          codigo: '28021396',
          nombre: 'IES San Cristóbal de los Ángeles',
          etapa: 'ESO y FP Básica',
          municipio: 'Madrid',
          distrito: 'Villaverde',
          tieneMismoApoyo: true,
          detallesApoyo: 'Continuidad de compensación educativa y programa de FP Básica adaptada.',
          distanciaKm: 0.8
        }
      ]
    }
  }
];
