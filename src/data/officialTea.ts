/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ARCHIVO GENERADO AUTOMÁTICAMENTE por scripts/build_app_data.py — no editar a mano.
 * Los 470 registros completos se publican en public/data/centros.json para descarga
 * asíncrona e independiente de la caché del código JavaScript.
 *
 * Datos procedentes exclusivamente de fuentes públicas oficiales (con detección de conflictos en data/review/):
 * - 336 centros de atención preferente TEA (Consejería de Educación CAM, 2024/2025)
 * - 47 Escuelas de Bienvenida / Aulas de Enlace en centros concertados (Resolución CAM 2026/2027)
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
  "aulasEnlaceUrl": "https://site.educa.madrid.org/dg.concertada-becasyayudas/index.php/programas-educativos-2/atencion-a-las-diferencias-individuales/medidas-y-programas/aulas-de-enlace/",
  "aulasEnlaceResolucionUrl": "https://site.educa.madrid.org/dg.concertada-becasyayudas//wp-content/uploads/dg.concertada-becasyayudas/2026/10/2026.08_Resolucion_Aulas_Enlace_2026-27__62493703.pdf",
  "cursoAulasEnlace": "2026/2027",
  "fechaAulasEnlace": "25/08/2026",
  "datosAbiertosTitulo": "Centros educativos de la Comunidad de Madrid",
  "datosAbiertosUrl": "https://datos.comunidad.madrid/catalogo/dataset/centros_educativos",
  "datosAbiertosLicencia": "CC BY 4.0",
  "ayuntamientoUrl": "https://datos.madrid.es/egob/catalogo/300614-0-centros-educativos.csv",
  "curso": "2024/2025",
  "fechaInformacion": "22/03/2024",
  "fechaDatosAbiertos": "18/11/2026",
  "totalCentros": 336,
  "totalCompensatoria": 47,
  "totalCentrosCatalogo": 470,
  "totalCee": 69,
  "totalHospitalarias": 14,
  "totalVisual": 3,
  "totalAltasCapacidades": 10,
  "totalAuditiva": 1,
  "totalMotora": 1,
  "totalTdah": 1,
  "totalTelLenguaje": 1,
  "totalConUbicacionExacta": 336,
  "totalConUbicacionExactaCatalogo": 469,
  "totalConTransporteAyto": 178,
  "totalConServiciosAyto": 143,
  "totalConAccesibilidadAyto": 17,
  "estadoVerificacion": "SNAPSHOT_VERSIONADO",
  "estadoAulasEnlace": "PDF_OFICIAL_VERIFICADO",
  "estadoDatosAbiertos": "CKAN_EN_VIVO",
  "estadoAyuntamiento": "AYTO_MADRID_EN_VIVO",
  "alcance": "El documento NO es el catálogo completo (la Comunidad declara 682 centros preferentes TEA y 855 aulas). Recoge los centros en los que el número de alumnos atendidos en el aula de apoyo extenso y especializado era menor de cinco a 22/03/2024, es decir, centros con plazas previsibles en el aula TEA para el proceso de admisión 2024/2025. Incluye también los centros y aulas nuevos previstos para ese curso.",
  "alcanceAulasEnlace": "Recoge las 47 Aulas de Enlace autorizadas en centros privados sostenidos con fondos públicos (concertados) para el curso escolar 2026-2027 (Anexo I de la Resolución de 25/08/2026). Las Aulas de Enlace de centros públicos (CEIP/IES) se asignan por las Direcciones de Área Territorial (DAT) y Servicios de Apoyo a la Escolarización (SAE) sin listado abierto descargable publicado por la Consejería.",
  "listadoCompletoUrl": "https://www.comunidad.madrid/servicios/educacion/atencion-preferente-necesidades-educativas-especiales"
} as const;

export const OFFICIAL_MUNICIPALITIES: MunicipalityOption[] = [
  {
    "id": "Ajalvir",
    "nombre": "Ajalvir",
    "lat": 40.52509,
    "lng": -3.48081
  },
  {
    "id": "Alameda del Valle",
    "nombre": "Alameda del Valle",
    "lat": 40.92139,
    "lng": -3.85123
  },
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
    "id": "Aldea del Fresno",
    "nombre": "Aldea del Fresno",
    "lat": 40.30988,
    "lng": -4.22348
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
    "id": "Ambite",
    "nombre": "Ambite",
    "lat": 40.34028,
    "lng": -3.17643
  },
  {
    "id": "Anchuelo",
    "nombre": "Anchuelo",
    "lat": 40.46543,
    "lng": -3.27518
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
    "id": "Batres",
    "nombre": "Batres",
    "lat": 40.22051,
    "lng": -3.92619
  },
  {
    "id": "Becerril de la Sierra",
    "nombre": "Becerril de la Sierra",
    "lat": 40.70656,
    "lng": -3.93483
  },
  {
    "id": "Belmonte de Tajo",
    "nombre": "Belmonte de Tajo",
    "lat": 40.13694,
    "lng": -3.33343
  },
  {
    "id": "Berzosa del Lozoya",
    "nombre": "Berzosa del Lozoya",
    "lat": 40.97326,
    "lng": -3.526
  },
  {
    "id": "Boadilla del Monte",
    "nombre": "Boadilla del Monte",
    "lat": 40.42144,
    "lng": -3.89209
  },
  {
    "id": "Braojos",
    "nombre": "Braojos",
    "lat": 41.06021,
    "lng": -3.66
  },
  {
    "id": "Brea de Tajo",
    "nombre": "Brea de Tajo",
    "lat": 40.24002,
    "lng": -3.12062
  },
  {
    "id": "Brunete",
    "nombre": "Brunete",
    "lat": 40.39797,
    "lng": -3.99483
  },
  {
    "id": "Buitrago del Lozoya",
    "nombre": "Buitrago del Lozoya",
    "lat": 40.98804,
    "lng": -3.62811
  },
  {
    "id": "Bustarviejo",
    "nombre": "Bustarviejo",
    "lat": 40.84199,
    "lng": -3.72791
  },
  {
    "id": "Cabanillas de la Sierra",
    "nombre": "Cabanillas de la Sierra",
    "lat": 40.82564,
    "lng": -3.63586
  },
  {
    "id": "Cadalso de los Vidrios",
    "nombre": "Cadalso de los Vidrios",
    "lat": 40.29904,
    "lng": -4.43317
  },
  {
    "id": "Camarma de Esteruelas",
    "nombre": "Camarma de Esteruelas",
    "lat": 40.5624,
    "lng": -3.37616
  },
  {
    "id": "Campo Real",
    "nombre": "Campo Real",
    "lat": 40.32284,
    "lng": -3.37312
  },
  {
    "id": "Canencia",
    "nombre": "Canencia",
    "lat": 40.89288,
    "lng": -3.7608
  },
  {
    "id": "Carabaña",
    "nombre": "Carabaña",
    "lat": 40.25568,
    "lng": -3.24601
  },
  {
    "id": "Casarrubuelos",
    "nombre": "Casarrubuelos",
    "lat": 40.17284,
    "lng": -3.83428
  },
  {
    "id": "Cenicientos",
    "nombre": "Cenicientos",
    "lat": 40.24388,
    "lng": -4.50801
  },
  {
    "id": "Cercedilla",
    "nombre": "Cercedilla",
    "lat": 40.75651,
    "lng": -4.06033
  },
  {
    "id": "Cervera de Buitrago",
    "nombre": "Cervera de Buitrago",
    "lat": 40.91765,
    "lng": -3.52478
  },
  {
    "id": "Chapinería",
    "nombre": "Chapinería",
    "lat": 40.37109,
    "lng": -4.21159
  },
  {
    "id": "Chinchón",
    "nombre": "Chinchón",
    "lat": 40.16184,
    "lng": -3.47654
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
    "id": "Collado Mediano",
    "nombre": "Collado Mediano",
    "lat": 40.69416,
    "lng": -4.03104
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
    "id": "Colmenar de Oreja",
    "nombre": "Colmenar de Oreja",
    "lat": 40.08089,
    "lng": -3.45257
  },
  {
    "id": "Colmenar del Arroyo",
    "nombre": "Colmenar del Arroyo",
    "lat": 40.40555,
    "lng": -4.19335
  },
  {
    "id": "Colmenarejo",
    "nombre": "Colmenarejo",
    "lat": 40.53761,
    "lng": -4.01882
  },
  {
    "id": "Corpa",
    "nombre": "Corpa",
    "lat": 40.41871,
    "lng": -3.24948
  },
  {
    "id": "Coslada",
    "nombre": "Coslada",
    "lat": 40.42736,
    "lng": -3.55289
  },
  {
    "id": "Cubas de la Sagra",
    "nombre": "Cubas de la Sagra",
    "lat": 40.19091,
    "lng": -3.84004
  },
  {
    "id": "Daganzo de Arriba",
    "nombre": "Daganzo de Arriba",
    "lat": 40.55983,
    "lng": -3.44385
  },
  {
    "id": "El Atazar",
    "nombre": "El Atazar",
    "lat": 40.93908,
    "lng": -3.46615
  },
  {
    "id": "El Berrueco",
    "nombre": "El Berrueco",
    "lat": 40.88287,
    "lng": -3.55644
  },
  {
    "id": "El Boalo",
    "nombre": "El Boalo",
    "lat": 40.70896,
    "lng": -3.92239
  },
  {
    "id": "El Escorial",
    "nombre": "El Escorial",
    "lat": 40.58586,
    "lng": -4.09472
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
    "id": "Estremera",
    "nombre": "Estremera",
    "lat": 40.14637,
    "lng": -3.10964
  },
  {
    "id": "Fresnedillas de la Oliva",
    "nombre": "Fresnedillas de la Oliva",
    "lat": 40.47848,
    "lng": -4.18323
  },
  {
    "id": "Fresno de Torote",
    "nombre": "Fresno de Torote",
    "lat": 40.61002,
    "lng": -3.40898
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
    "id": "Garganta de los Montes",
    "nombre": "Garganta de los Montes",
    "lat": 40.92816,
    "lng": -3.68505
  },
  {
    "id": "Gargantilla del Lozoya y Pinilla de Buitrago",
    "nombre": "Gargantilla del Lozoya y Pinilla de Buitrago",
    "lat": 40.96675,
    "lng": -3.7034
  },
  {
    "id": "Gascones",
    "nombre": "Gascones",
    "lat": 41.03624,
    "lng": -3.67426
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
    "id": "Guadarrama",
    "nombre": "Guadarrama",
    "lat": 40.67651,
    "lng": -4.10712
  },
  {
    "id": "Horcajo de la Sierra-Aoslos",
    "nombre": "Horcajo de la Sierra-Aoslos",
    "lat": 41.07972,
    "lng": -3.58188
  },
  {
    "id": "Horcajuelo de la Sierra",
    "nombre": "Horcajuelo de la Sierra",
    "lat": 41.09317,
    "lng": -3.54358
  },
  {
    "id": "Hoyo de Manzanares",
    "nombre": "Hoyo de Manzanares",
    "lat": 40.61454,
    "lng": -3.89344
  },
  {
    "id": "Humanes de Madrid",
    "nombre": "Humanes de Madrid",
    "lat": 40.25191,
    "lng": -3.82688
  },
  {
    "id": "La Acebeda",
    "nombre": "La Acebeda",
    "lat": 41.09311,
    "lng": -3.63478
  },
  {
    "id": "La Cabrera",
    "nombre": "La Cabrera",
    "lat": 40.86392,
    "lng": -3.61314
  },
  {
    "id": "La Hiruela",
    "nombre": "La Hiruela",
    "lat": 41.06729,
    "lng": -3.45575
  },
  {
    "id": "La Serna del Monte",
    "nombre": "La Serna del Monte",
    "lat": 41.03542,
    "lng": -3.62351
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
    "id": "Los Molinos",
    "nombre": "Los Molinos",
    "lat": 40.72103,
    "lng": -4.09196
  },
  {
    "id": "Los Santos de la Humosa",
    "nombre": "Los Santos de la Humosa",
    "lat": 40.51314,
    "lng": -3.25459
  },
  {
    "id": "Lozoya",
    "nombre": "Lozoya",
    "lat": 40.96193,
    "lng": -3.78489
  },
  {
    "id": "Lozoyuela-Navas-Sieteiglesias",
    "nombre": "Lozoyuela-Navas-Sieteiglesias",
    "lat": 40.91697,
    "lng": -3.62178
  },
  {
    "id": "Madarcos",
    "nombre": "Madarcos",
    "lat": 41.04315,
    "lng": -3.57198
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
    "id": "Montejo de la Sierra",
    "nombre": "Montejo de la Sierra",
    "lat": 41.09376,
    "lng": -3.51055
  },
  {
    "id": "Moraleja de Enmedio",
    "nombre": "Moraleja de Enmedio",
    "lat": 40.25702,
    "lng": -3.882
  },
  {
    "id": "Moralzarzal",
    "nombre": "Moralzarzal",
    "lat": 40.66605,
    "lng": -3.94719
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
    "id": "Navacerrada",
    "nombre": "Navacerrada",
    "lat": 40.74722,
    "lng": -4.00622
  },
  {
    "id": "Navalafuente",
    "nombre": "Navalafuente",
    "lat": 40.81736,
    "lng": -3.67771
  },
  {
    "id": "Navalagamella",
    "nombre": "Navalagamella",
    "lat": 40.43857,
    "lng": -4.12962
  },
  {
    "id": "Navalcarnero",
    "nombre": "Navalcarnero",
    "lat": 40.28878,
    "lng": -4.01292
  },
  {
    "id": "Navarredonda y San Mamés",
    "nombre": "Navarredonda y San Mamés",
    "lat": 41.0053,
    "lng": -3.7289
  },
  {
    "id": "Navas del Rey",
    "nombre": "Navas del Rey",
    "lat": 40.38296,
    "lng": -4.27052
  },
  {
    "id": "Nuevo Baztán",
    "nombre": "Nuevo Baztán",
    "lat": 40.37576,
    "lng": -3.25119
  },
  {
    "id": "Olmeda de las Fuentes",
    "nombre": "Olmeda de las Fuentes",
    "lat": 40.36828,
    "lng": -3.20595
  },
  {
    "id": "Orusco de Tajuña",
    "nombre": "Orusco de Tajuña",
    "lat": 40.28994,
    "lng": -3.20853
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
    "id": "Patones",
    "nombre": "Patones",
    "lat": 40.88156,
    "lng": -3.48653
  },
  {
    "id": "Pedrezuela",
    "nombre": "Pedrezuela",
    "lat": 40.74141,
    "lng": -3.62531
  },
  {
    "id": "Pelayos de la Presa",
    "nombre": "Pelayos de la Presa",
    "lat": 40.3607,
    "lng": -4.32617
  },
  {
    "id": "Perales de Tajuña",
    "nombre": "Perales de Tajuña",
    "lat": 40.22575,
    "lng": -3.35239
  },
  {
    "id": "Pezuela de las Torres",
    "nombre": "Pezuela de las Torres",
    "lat": 40.40802,
    "lng": -3.17786
  },
  {
    "id": "Pinilla del Valle",
    "nombre": "Pinilla del Valle",
    "lat": 40.93661,
    "lng": -3.83027
  },
  {
    "id": "Pinto",
    "nombre": "Pinto",
    "lat": 40.24682,
    "lng": -3.68602
  },
  {
    "id": "Piñuécar-Gandullas",
    "nombre": "Piñuécar-Gandullas",
    "lat": 41.02938,
    "lng": -3.59909
  },
  {
    "id": "Pozuelo de Alarcón",
    "nombre": "Pozuelo de Alarcón",
    "lat": 40.42808,
    "lng": -3.81532
  },
  {
    "id": "Pozuelo del Rey",
    "nombre": "Pozuelo del Rey",
    "lat": 40.36049,
    "lng": -3.30807
  },
  {
    "id": "Prádena del Rincón",
    "nombre": "Prádena del Rincón",
    "lat": 41.03895,
    "lng": -3.51278
  },
  {
    "id": "Puebla de la Sierra",
    "nombre": "Puebla de la Sierra",
    "lat": 41.00288,
    "lng": -3.45205
  },
  {
    "id": "Puentes Viejas",
    "nombre": "Puentes Viejas",
    "lat": 40.97831,
    "lng": -3.56062
  },
  {
    "id": "Quijorna",
    "nombre": "Quijorna",
    "lat": 40.41785,
    "lng": -4.06074
  },
  {
    "id": "Rascafría",
    "nombre": "Rascafría",
    "lat": 40.86378,
    "lng": -3.89581
  },
  {
    "id": "Redueña",
    "nombre": "Redueña",
    "lat": 40.81601,
    "lng": -3.59392
  },
  {
    "id": "Ribatejada",
    "nombre": "Ribatejada",
    "lat": 40.66225,
    "lng": -3.41254
  },
  {
    "id": "Rivas-Vaciamadrid",
    "nombre": "Rivas-Vaciamadrid",
    "lat": 40.34091,
    "lng": -3.52689
  },
  {
    "id": "Robledillo de la Jara",
    "nombre": "Robledillo de la Jara",
    "lat": 40.94787,
    "lng": -3.52008
  },
  {
    "id": "Robledo de Chavela",
    "nombre": "Robledo de Chavela",
    "lat": 40.48202,
    "lng": -4.2405
  },
  {
    "id": "Robregordo",
    "nombre": "Robregordo",
    "lat": 41.12338,
    "lng": -3.60524
  },
  {
    "id": "Rozas de Puerto Real",
    "nombre": "Rozas de Puerto Real",
    "lat": 40.30264,
    "lng": -4.51708
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
    "id": "San Martín de Valdeiglesias",
    "nombre": "San Martín de Valdeiglesias",
    "lat": 40.36223,
    "lng": -4.36442
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
    "id": "Santa María de la Alameda",
    "nombre": "Santa María de la Alameda",
    "lat": 40.59505,
    "lng": -4.24426
  },
  {
    "id": "Santorcaz",
    "nombre": "Santorcaz",
    "lat": 40.4709,
    "lng": -3.22198
  },
  {
    "id": "Serranillos del Valle",
    "nombre": "Serranillos del Valle",
    "lat": 40.20825,
    "lng": -3.8899
  },
  {
    "id": "Sevilla la Nueva",
    "nombre": "Sevilla la Nueva",
    "lat": 40.35383,
    "lng": -4.04155
  },
  {
    "id": "Somosierra",
    "nombre": "Somosierra",
    "lat": 41.1423,
    "lng": -3.5692
  },
  {
    "id": "Soto del Real",
    "nombre": "Soto del Real",
    "lat": 40.74702,
    "lng": -3.78747
  },
  {
    "id": "Talamanca de Jarama",
    "nombre": "Talamanca de Jarama",
    "lat": 40.73711,
    "lng": -3.48959
  },
  {
    "id": "Tielmes",
    "nombre": "Tielmes",
    "lat": 40.23471,
    "lng": -3.30187
  },
  {
    "id": "Titulcia",
    "nombre": "Titulcia",
    "lat": 40.14725,
    "lng": -3.55839
  },
  {
    "id": "Torrejón de Ardoz",
    "nombre": "Torrejón de Ardoz",
    "lat": 40.47111,
    "lng": -3.45991
  },
  {
    "id": "Torrejón de Velasco",
    "nombre": "Torrejón de Velasco",
    "lat": 40.17374,
    "lng": -3.7479
  },
  {
    "id": "Torrejón de la Calzada",
    "nombre": "Torrejón de la Calzada",
    "lat": 40.19957,
    "lng": -3.80152
  },
  {
    "id": "Torrelaguna",
    "nombre": "Torrelaguna",
    "lat": 40.82343,
    "lng": -3.54591
  },
  {
    "id": "Torrelodones",
    "nombre": "Torrelodones",
    "lat": 40.57576,
    "lng": -3.92645
  },
  {
    "id": "Torremocha de Jarama",
    "nombre": "Torremocha de Jarama",
    "lat": 40.83515,
    "lng": -3.50047
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
    "id": "Valdaracete",
    "nombre": "Valdaracete",
    "lat": 40.1987,
    "lng": -3.1993
  },
  {
    "id": "Valdeavero",
    "nombre": "Valdeavero",
    "lat": 40.62393,
    "lng": -3.35065
  },
  {
    "id": "Valdelaguna",
    "nombre": "Valdelaguna",
    "lat": 40.17548,
    "lng": -3.37228
  },
  {
    "id": "Valdemanco",
    "nombre": "Valdemanco",
    "lat": 40.86346,
    "lng": -3.66536
  },
  {
    "id": "Valdemaqueda",
    "nombre": "Valdemaqueda",
    "lat": 40.5075,
    "lng": -4.29854
  },
  {
    "id": "Valdemorillo",
    "nombre": "Valdemorillo",
    "lat": 40.50345,
    "lng": -4.06853
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
    "id": "Valdepiélagos",
    "nombre": "Valdepiélagos",
    "lat": 40.76557,
    "lng": -3.47297
  },
  {
    "id": "Valdetorres de Jarama",
    "nombre": "Valdetorres de Jarama",
    "lat": 40.6916,
    "lng": -3.50998
  },
  {
    "id": "Valdilecha",
    "nombre": "Valdilecha",
    "lat": 40.29559,
    "lng": -3.30342
  },
  {
    "id": "Valverde de Alcalá",
    "nombre": "Valverde de Alcalá",
    "lat": 40.40503,
    "lng": -3.29945
  },
  {
    "id": "Velilla de San Antonio",
    "nombre": "Velilla de San Antonio",
    "lat": 40.36486,
    "lng": -3.47532
  },
  {
    "id": "Venturada",
    "nombre": "Venturada",
    "lat": 40.79764,
    "lng": -3.61986
  },
  {
    "id": "Villa del Prado",
    "nombre": "Villa del Prado",
    "lat": 40.2744,
    "lng": -4.30573
  },
  {
    "id": "Villaconejos",
    "nombre": "Villaconejos",
    "lat": 40.11217,
    "lng": -3.50004
  },
  {
    "id": "Villalbilla",
    "nombre": "Villalbilla",
    "lat": 40.44334,
    "lng": -3.32887
  },
  {
    "id": "Villamanrique de Tajo",
    "nombre": "Villamanrique de Tajo",
    "lat": 40.07651,
    "lng": -3.24844
  },
  {
    "id": "Villamanta",
    "nombre": "Villamanta",
    "lat": 40.29246,
    "lng": -4.12111
  },
  {
    "id": "Villamantilla",
    "nombre": "Villamantilla",
    "lat": 40.34269,
    "lng": -4.14277
  },
  {
    "id": "Villanueva de Perales",
    "nombre": "Villanueva de Perales",
    "lat": 40.37324,
    "lng": -4.08974
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
    "id": "Villar del Olmo",
    "nombre": "Villar del Olmo",
    "lat": 40.33166,
    "lng": -3.24206
  },
  {
    "id": "Villarejo de Salvanés",
    "nombre": "Villarejo de Salvanés",
    "lat": 40.13007,
    "lng": -3.26848
  },
  {
    "id": "Villaviciosa de Odón",
    "nombre": "Villaviciosa de Odón",
    "lat": 40.36175,
    "lng": -3.938
  },
  {
    "id": "Villavieja del Lozoya",
    "nombre": "Villavieja del Lozoya",
    "lat": 41.0293,
    "lng": -3.70422
  },
  {
    "id": "Zarzalejo",
    "nombre": "Zarzalejo",
    "lat": 40.54519,
    "lng": -4.17881
  }
];
