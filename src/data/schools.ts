/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Base de datos oficial de centros con evidencia de atención preferente
 * en la Comunidad de Madrid (Corte curso 2025/2026).
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
  }
];
