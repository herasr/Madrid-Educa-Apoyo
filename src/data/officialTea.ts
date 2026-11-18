/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ARCHIVO GENERADO AUTOMÁTICAMENTE por scripts/build_app_data.py — no editar a mano.
 * Los 433 registros completos se publican en public/data/centros.json para descarga
 * asíncrona e independiente de la caché del código JavaScript.
 *
 * Datos procedentes exclusivamente de fuentes públicas oficiales (con detección de conflictos en data/review/):
 * - 336 centros de atención preferente TEA (Consejería de Educación CAM, 2024/2025)
 * - 69 Centros de Educación Especial (CEE) en situación ALTA (Datos Abiertos CAM, CC BY 4.0)
 * - 14 Aulas Hospitalarias no anuladas (Datos Abiertos CAM, CC BY 4.0)
 * - 3 recursos oficiales para Discapacidad Visual (EOEP Visuales + CRE ONCE Madrid)
 * - 10 centros y sedes oficiales para Altas Capacidades (CREACIM + EOEP + 8 sedes PEAC)
 * - EOEP Específicos regionales en situación ALTA: Auditiva (1), Motora (1), TDAH (1) y Trastornos del Lenguaje (1)
 * - Enriquecimiento de Madrid capital (transporte público, barrio, equipamiento y códigos ACCESIBILIDAD 0..6): Ayuntamiento de Madrid (datos.madrid.es).
 */

import { MunicipalityOption } from '../types';

export const OFFICIAL_TEA_SOURCE = {
  "titulo": "Escolarización en centros de atención preferente para alumnado con TEA",
  "organismo": "Comunidad de Madrid · Consejería de Educación",
  "url": "https://comunidad.madrid/sites/default/files/informacion_centros_preferentes_tea_curso_2024-25_0.pdf",
  "datosAbiertosTitulo": "Centros educativos de la Comunidad de Madrid",
  "datosAbiertosUrl": "https://datos.comunidad.madrid/catalogo/dataset/centros_educativos",
  "datosAbiertosLicencia": "CC BY 4.0",
  "ayuntamientoUrl": "https://datos.madrid.es/egob/catalogo/300614-0-centros-educativos.csv",
  "curso": "2024/2025",
  "fechaInformacion": "22/03/2024",
  "fechaDatosAbiertos": "17/11/2026",
  "totalCentros": 336,
  "totalCentrosCatalogo": 433,
  "totalCee": 69,
  "totalHospitalarias": 14,
  "totalVisual": 3,
  "totalAltasCapacidades": 10,
  "totalAuditiva": 1,
  "totalMotora": 1,
  "totalTdah": 1,
  "totalTelLenguaje": 1,
  "totalConUbicacionExacta": 336,
  "totalConUbicacionExactaCatalogo": 432,
  "totalConTransporteAyto": 151,
  "totalConServiciosAyto": 122,
  "totalConAccesibilidadAyto": 17,
  "estadoVerificacion": "SNAPSHOT_VERSIONADO",
  "estadoDatosAbiertos": "CKAN_EN_VIVO",
  "estadoAyuntamiento": "AYTO_MADRID_EN_VIVO",
  "alcance": "El documento NO es el catálogo completo (la Comunidad declara 682 centros preferentes TEA y 855 aulas). Recoge los centros en los que el número de alumnos atendidos en el aula de apoyo extenso y especializado era menor de cinco a 22/03/2024, es decir, centros con plazas previsibles en el aula TEA para el proceso de admisión 2024/2025. Incluye también los centros y aulas nuevos previstos para ese curso.",
  "listadoCompletoUrl": "https://www.comunidad.madrid/servicios/educacion/atencion-preferente-necesidades-educativas-especiales"
} as const;

export const OFFICIAL_MUNICIPALITIES: MunicipalityOption[] = [
  {
    "id": "Alcalá de Henares",
    "nombre": "Alcalá de Henares",
    "lat": 40.49435,
    "lng": -3.36923
  },
  {
    "id": "Alcobendas",
    "nombre": "Alcobendas",
    "lat": 40.53491,
    "lng": -3.62958
  },
  {
    "id": "Alcorcón",
    "nombre": "Alcorcón",
    "lat": 40.35931,
    "lng": -3.8371
  },
  {
    "id": "Algete",
    "nombre": "Algete",
    "lat": 40.60786,
    "lng": -3.5307
  },
  {
    "id": "Alpedrete",
    "nombre": "Alpedrete",
    "lat": 40.66153,
    "lng": -4.0218
  },
  {
    "id": "Aranjuez",
    "nombre": "Aranjuez",
    "lat": 39.99378,
    "lng": -3.68016
  },
  {
    "id": "Arganda del Rey",
    "nombre": "Arganda del Rey",
    "lat": 40.29135,
    "lng": -3.44481
  },
  {
    "id": "Arroyomolinos",
    "nombre": "Arroyomolinos",
    "lat": 40.28202,
    "lng": -3.91504
  },
  {
    "id": "Boadilla del Monte",
    "nombre": "Boadilla del Monte",
    "lat": 40.42144,
    "lng": -3.89209
  },
  {
    "id": "Campo Real",
    "nombre": "Campo Real",
    "lat": 40.32284,
    "lng": -3.37312
  },
  {
    "id": "Ciempozuelos",
    "nombre": "Ciempozuelos",
    "lat": 40.15077,
    "lng": -3.60715
  },
  {
    "id": "Cobeña",
    "nombre": "Cobeña",
    "lat": 40.56827,
    "lng": -3.50967
  },
  {
    "id": "Collado Villalba",
    "nombre": "Collado Villalba",
    "lat": 40.64282,
    "lng": -3.98896
  },
  {
    "id": "Colmenar Viejo",
    "nombre": "Colmenar Viejo",
    "lat": 40.66442,
    "lng": -3.74552
  },
  {
    "id": "Colmenarejo",
    "nombre": "Colmenarejo",
    "lat": 40.53761,
    "lng": -4.01882
  },
  {
    "id": "Coslada",
    "nombre": "Coslada",
    "lat": 40.42736,
    "lng": -3.55289
  },
  {
    "id": "Daganzo de Arriba",
    "nombre": "Daganzo de Arriba",
    "lat": 40.55983,
    "lng": -3.44385
  },
  {
    "id": "El Boalo",
    "nombre": "El Boalo",
    "lat": 40.70896,
    "lng": -3.92239
  },
  {
    "id": "El Molar",
    "nombre": "El Molar",
    "lat": 40.70108,
    "lng": -3.57194
  },
  {
    "id": "El Vellón",
    "nombre": "El Vellón",
    "lat": 40.76925,
    "lng": -3.56021
  },
  {
    "id": "El Álamo",
    "nombre": "El Álamo",
    "lat": 40.23192,
    "lng": -3.98823
  },
  {
    "id": "Fuenlabrada",
    "nombre": "Fuenlabrada",
    "lat": 40.2838,
    "lng": -3.79644
  },
  {
    "id": "Fuente el Saz de Jarama",
    "nombre": "Fuente el Saz de Jarama",
    "lat": 40.64239,
    "lng": -3.52414
  },
  {
    "id": "Fuentidueña de Tajo",
    "nombre": "Fuentidueña de Tajo",
    "lat": 40.11015,
    "lng": -3.15945
  },
  {
    "id": "Galapagar",
    "nombre": "Galapagar",
    "lat": 40.57587,
    "lng": -3.98566
  },
  {
    "id": "Getafe",
    "nombre": "Getafe",
    "lat": 40.29946,
    "lng": -3.67362
  },
  {
    "id": "Griñón",
    "nombre": "Griñón",
    "lat": 40.21792,
    "lng": -3.84318
  },
  {
    "id": "Guadalix de la Sierra",
    "nombre": "Guadalix de la Sierra",
    "lat": 40.76887,
    "lng": -3.68263
  },
  {
    "id": "Humanes de Madrid",
    "nombre": "Humanes de Madrid",
    "lat": 40.25191,
    "lng": -3.82688
  },
  {
    "id": "La Cabrera",
    "nombre": "La Cabrera",
    "lat": 40.86392,
    "lng": -3.61314
  },
  {
    "id": "Las Rozas de Madrid",
    "nombre": "Las Rozas de Madrid",
    "lat": 40.52266,
    "lng": -3.89204
  },
  {
    "id": "Leganés",
    "nombre": "Leganés",
    "lat": 40.33101,
    "lng": -3.77065
  },
  {
    "id": "Loeches",
    "nombre": "Loeches",
    "lat": 40.38291,
    "lng": -3.41899
  },
  {
    "id": "Majadahonda",
    "nombre": "Majadahonda",
    "lat": 40.46956,
    "lng": -3.89474
  },
  {
    "id": "Manzanares el Real",
    "nombre": "Manzanares el Real",
    "lat": 40.7508,
    "lng": -3.87768
  },
  {
    "id": "Meco",
    "nombre": "Meco",
    "lat": 40.55598,
    "lng": -3.32245
  },
  {
    "id": "Mejorada del Campo",
    "nombre": "Mejorada del Campo",
    "lat": 40.4013,
    "lng": -3.47573
  },
  {
    "id": "Miraflores de la Sierra",
    "nombre": "Miraflores de la Sierra",
    "lat": 40.7968,
    "lng": -3.77692
  },
  {
    "id": "Moraleja de Enmedio",
    "nombre": "Moraleja de Enmedio",
    "lat": 40.25702,
    "lng": -3.882
  },
  {
    "id": "Morata de Tajuña",
    "nombre": "Morata de Tajuña",
    "lat": 40.22999,
    "lng": -3.44818
  },
  {
    "id": "Móstoles",
    "nombre": "Móstoles",
    "lat": 40.31956,
    "lng": -3.88949
  },
  {
    "id": "Navalcarnero",
    "nombre": "Navalcarnero",
    "lat": 40.28878,
    "lng": -4.01292
  },
  {
    "id": "Nuevo Baztán",
    "nombre": "Nuevo Baztán",
    "lat": 40.37576,
    "lng": -3.25119
  },
  {
    "id": "Paracuellos de Jarama",
    "nombre": "Paracuellos de Jarama",
    "lat": 40.51419,
    "lng": -3.52448
  },
  {
    "id": "Parla",
    "nombre": "Parla",
    "lat": 40.22947,
    "lng": -3.76803
  },
  {
    "id": "Pelayos de la Presa",
    "nombre": "Pelayos de la Presa",
    "lat": 40.3607,
    "lng": -4.32617
  },
  {
    "id": "Pinto",
    "nombre": "Pinto",
    "lat": 40.24682,
    "lng": -3.68602
  },
  {
    "id": "Pozuelo de Alarcón",
    "nombre": "Pozuelo de Alarcón",
    "lat": 40.42808,
    "lng": -3.81532
  },
  {
    "id": "Rivas-Vaciamadrid",
    "nombre": "Rivas-Vaciamadrid",
    "lat": 40.34091,
    "lng": -3.52689
  },
  {
    "id": "Robledo de Chavela",
    "nombre": "Robledo de Chavela",
    "lat": 40.48202,
    "lng": -4.2405
  },
  {
    "id": "San Agustín del Guadalix",
    "nombre": "San Agustín del Guadalix",
    "lat": 40.68611,
    "lng": -3.63207
  },
  {
    "id": "San Fernando de Henares",
    "nombre": "San Fernando de Henares",
    "lat": 40.4362,
    "lng": -3.48586
  },
  {
    "id": "San Lorenzo de El Escorial",
    "nombre": "San Lorenzo de El Escorial",
    "lat": 40.6181,
    "lng": -4.13222
  },
  {
    "id": "San Martín de la Vega",
    "nombre": "San Martín de la Vega",
    "lat": 40.243,
    "lng": -3.56128
  },
  {
    "id": "San Sebastián de los Reyes",
    "nombre": "San Sebastián de los Reyes",
    "lat": 40.57458,
    "lng": -3.60097
  },
  {
    "id": "Serranillos del Valle",
    "nombre": "Serranillos del Valle",
    "lat": 40.20825,
    "lng": -3.8899
  },
  {
    "id": "Talamanca de Jarama",
    "nombre": "Talamanca de Jarama",
    "lat": 40.73711,
    "lng": -3.48959
  },
  {
    "id": "Torrejón de Ardoz",
    "nombre": "Torrejón de Ardoz",
    "lat": 40.47111,
    "lng": -3.45991
  },
  {
    "id": "Torrelodones",
    "nombre": "Torrelodones",
    "lat": 40.57576,
    "lng": -3.92645
  },
  {
    "id": "Torres de la Alameda",
    "nombre": "Torres de la Alameda",
    "lat": 40.40941,
    "lng": -3.3657
  },
  {
    "id": "Tres Cantos",
    "nombre": "Tres Cantos",
    "lat": 40.61223,
    "lng": -3.72756
  },
  {
    "id": "Valdemoro",
    "nombre": "Valdemoro",
    "lat": 40.18361,
    "lng": -3.65751
  },
  {
    "id": "Valdeolmos-Alalpardo",
    "nombre": "Valdeolmos-Alalpardo",
    "lat": 40.63622,
    "lng": -3.46258
  },
  {
    "id": "Velilla de San Antonio",
    "nombre": "Velilla de San Antonio",
    "lat": 40.36486,
    "lng": -3.47532
  },
  {
    "id": "Villa del Prado",
    "nombre": "Villa del Prado",
    "lat": 40.2744,
    "lng": -4.30573
  },
  {
    "id": "Villanueva de la Cañada",
    "nombre": "Villanueva de la Cañada",
    "lat": 40.44775,
    "lng": -3.98345
  },
  {
    "id": "Villanueva del Pardillo",
    "nombre": "Villanueva del Pardillo",
    "lat": 40.49083,
    "lng": -3.96831
  },
  {
    "id": "Villaviciosa de Odón",
    "nombre": "Villaviciosa de Odón",
    "lat": 40.36175,
    "lng": -3.938
  }
];
