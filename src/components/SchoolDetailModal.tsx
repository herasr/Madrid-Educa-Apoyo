/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modal de Ficha Completa y Desglose Oficial:
 * "¿Por qué aparece este centro?"
 * Con desglose de fuente oficial, código de 8 dígitos, datos de contacto (Datos Abiertos CAM),
 * etapas, recursos y continuidad Primaria-ESO.
 */

import React from 'react';
import { School, SearchState } from '../types';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  GitCompare,
  BookmarkCheck,
  Building,
  GraduationCap,
  Info
} from 'lucide-react';
import { LEGAL_DISCLAIMER } from '../data/disclaimerAndProcedures';
import { simplifySchoolTitle, simplifyText } from '../utils/textSimplifier';
import { useModalFocusTrap } from '../utils/useModalFocusTrap';
import { lazyWithRetry } from '../utils/lazyWithRetry';

const LazySchoolMiniMap = lazyWithRetry(() =>
  import('./SchoolMiniMap').then(m => ({ default: m.SchoolMiniMap }))
);

const AYTO_ACC_LABELS: Record<string, string> = {
  '0': 'No accesible para movilidad reducida (código 0)',
  '1': 'Accesible para movilidad reducida (código 1)',
  '2': 'Parcialmente accesible PMR (código 2)',
  '3': 'Sin información sobre accesibilidad PMR (código 3)',
  '4': 'Lengua de signos disponible (código 4)',
  '5': 'Señalización podotáctil (código 5)',
  '6': 'Bucle de inducción magnética (código 6)'
};

function formatAytoAccessibilityText(school: School): string {
  const parts = (school.accesibilidadCodigoAyto || '')
    .split(',')
    .map(p => p.trim())
    .filter(Boolean);
  if (parts.length > 0) {
    return `${parts.map(code => AYTO_ACC_LABELS[code] || `Código ${code}`).join(' · ')} en datos.madrid.es.`;
  }
  if (school.accesibilidadConfirmadaAyto) {
    return 'Accesible para movilidad reducida (código oficial ACCESIBILIDAD = 1 en datos.madrid.es).';
  }
  return 'Sin información de accesibilidad PMR en la ficha municipal.';
}

interface SchoolDetailModalProps {
  school: School | null;
  state: SearchState;
  isOpen: boolean;
  initialTab?: 'why' | 'details' | 'continuity';
  isCompared: boolean;
  isInPassport: boolean;
  isEasyReadMode: boolean;
  onClose: () => void;
  onToggleCompare: (school: School) => void;
  onTogglePassport: (school: School) => void;
}

export const SchoolDetailModal: React.FC<SchoolDetailModalProps> = ({
  school,
  state,
  isOpen,
  initialTab = 'details',
  isCompared,
  isInPassport,
  isEasyReadMode,
  onClose,
  onToggleCompare,
  onTogglePassport
}) => {
  const [activeTab, setActiveTab] = React.useState<'why' | 'details' | 'continuity'>(initialTab);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const tabRefs = React.useRef<Record<'why' | 'details' | 'continuity', HTMLButtonElement | null>>({
    why: null,
    details: null,
    continuity: null
  });

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, school]);

  useModalFocusTrap(isOpen && Boolean(school), modalRef, onClose);

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentTab: 'why' | 'details' | 'continuity') => {
    const order: Array<'why' | 'details' | 'continuity'> = ['why', 'details', 'continuity'];
    const idx = order.indexOf(currentTab);
    let nextTab: 'why' | 'details' | 'continuity' | null = null;
    if (e.key === 'ArrowRight') nextTab = order[(idx + 1) % order.length];
    else if (e.key === 'ArrowLeft') nextTab = order[(idx - 1 + order.length) % order.length];
    else if (e.key === 'Home') nextTab = order[0];
    else if (e.key === 'End') nextTab = order[order.length - 1];
    if (nextTab) {
      e.preventDefault();
      setActiveTab(nextTab);
      tabRefs.current[nextTab]?.focus();
    }
  };

  if (!isOpen || !school) return null;

  const currentSupport = state.need
    ? school.apoyos.find(a => a.needId === state.need) || school.apoyos[0]
    : school.apoyos[0];

  const evidenceLevel = currentSupport?.evidencia || 'A2';
  const needId = currentSupport?.needId || 'tea';
  const isOfficial = school.procedencia === 'oficial';
  const OFFICIAL_SEARCH_URL = 'https://www.comunidad.madrid/educacion/buscador-centros-educativos';
  const formatText = (text: string) => (isEasyReadMode ? simplifyText(text) : text);
  const displayName = isEasyReadMode ? simplifySchoolTitle(school.nombre) : school.nombre;
  const normalizedWebUrl = school.web
    ? school.web.startsWith('http://') || school.web.startsWith('https://')
      ? school.web
      : `https://${school.web}`
    : '';
  const hasContactData = Boolean(school.telefono || school.email || normalizedWebUrl);
  const ownershipLabel =
    school.titularidad === 'publico'
      ? 'Centro Público'
      : school.titularidad === 'concertado'
      ? 'Privado Concertado'
      : 'Centro Privado';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-700"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-school-title"
      >
        {/* Cabecera del Modal */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 mb-1">
              <span className="font-mono text-slate-900 font-bold">Cód. Oficial: {school.codigo}</span>
              <span aria-hidden="true">·</span>
              <span>{ownershipLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{formatText(school.tipo)}</span>
              {school.situacionOficial && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-800 font-semibold">{school.situacionOficial}</span>
                </>
              )}
            </div>

            <h2 id="modal-school-title" className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
              {displayName}
            </h2>

            <div className="flex items-start gap-2 text-xs text-slate-700 mt-1.5">
              <MapPin className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                {school.direccion
                  ? `${school.direccion}${school.codigoPostal ? `, ${school.codigoPostal}` : ''} · `
                  : ''}
                {school.municipio}
                {school.distrito ? ` (${school.distrito}${school.barrio ? ` · ${school.barrio}` : ''})` : ''}
                {!school.direccion && (
                  <span className="text-slate-600"> · dirección postal no disponible en el catálogo</span>
                )}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {isOfficial && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                  Dato oficial · Consejería de Educación CAM
                </span>
              )}
              {school.fuenteDatosAbiertos && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  Datos Abiertos CAM (CC BY 4.0)
                </span>
              )}
              {school.fuenteAyuntamiento && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  Ayto. de Madrid (datos.madrid.es)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pestañas de navegación interna del modal */}
        <div
          className="flex items-center px-4 sm:px-6 border-b border-slate-200 bg-white gap-3 sm:gap-6 text-xs font-semibold overflow-x-auto"
          role="tablist"
          aria-label="Secciones de la ficha del centro"
        >
          <button
            ref={el => { tabRefs.current.why = el; }}
            id="school-tab-why"
            type="button"
            role="tab"
            aria-selected={activeTab === 'why'}
            aria-controls="school-tabpanel-why"
            tabIndex={activeTab === 'why' ? 0 : -1}
            onClick={() => setActiveTab('why')}
            onKeyDown={e => handleTabKeyDown(e, 'why')}
            className={`py-3 border-b-2 cursor-pointer flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'why'
                ? 'border-blue-700 text-blue-900 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" aria-hidden="true" />
            <span>Evidencia (¿Por qué?)</span>
          </button>

          <button
            ref={el => { tabRefs.current.details = el; }}
            id="school-tab-details"
            type="button"
            role="tab"
            aria-selected={activeTab === 'details'}
            aria-controls="school-tabpanel-details"
            tabIndex={activeTab === 'details' ? 0 : -1}
            onClick={() => setActiveTab('details')}
            onKeyDown={e => handleTabKeyDown(e, 'details')}
            className={`py-3 border-b-2 cursor-pointer flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'details'
                ? 'border-blue-700 text-blue-900 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4 text-slate-600 shrink-0" aria-hidden="true" />
            <span>Ficha y Contacto</span>
          </button>

          <button
            ref={el => { tabRefs.current.continuity = el; }}
            id="school-tab-continuity"
            type="button"
            role="tab"
            aria-selected={activeTab === 'continuity'}
            aria-controls="school-tabpanel-continuity"
            tabIndex={activeTab === 'continuity' ? 0 : -1}
            onClick={() => setActiveTab('continuity')}
            onKeyDown={e => handleTabKeyDown(e, 'continuity')}
            className={`py-3 border-b-2 cursor-pointer flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'continuity'
                ? 'border-blue-700 text-blue-900 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-slate-600 shrink-0" aria-hidden="true" />
            <span>{needId === 'tea' ? 'Continuidad ESO' : 'Trayectoria Escolar'}</span>
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-sm text-slate-800">
          {/* Advertencia orientativa visible y bien ubicada */}
          <div className="bg-amber-50 border border-amber-300 rounded-xl px-3.5 py-2.5 text-xs text-amber-950 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-800 shrink-0" aria-hidden="true" />
            <span className="font-medium">{LEGAL_DISCLAIMER}</span>
          </div>

          {/* TAB 1: ¿POR QUÉ APARECE ESTE CENTRO? */}
          {activeTab === 'why' && (
            <div
              role="tabpanel"
              id="school-tabpanel-why"
              aria-labelledby="school-tab-why"
              className="space-y-5"
            >
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {evidenceLevel === 'A1' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                        Confirmado Oficial Vigente (A1)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-950 bg-white px-2 py-0.5 rounded border border-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-700" aria-hidden="true" />
                        {isOfficial ? 'Oficial · por comprobar vigencia (A2)' : 'Por comprobar vigencia (A2)'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-700 font-mono">Corte: {currentSupport?.fechaCorte}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {formatText('Por qué aparece este centro')}
                </h3>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {formatText(currentSupport?.detallesResolucion || '')}
                </p>
              </div>

              {/* Datos de publicación oficial */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Fuente y Soporte Documental
                </h3>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-slate-600 font-medium">Organismo Emisor:</dt>
                    <dd className="font-semibold text-slate-900 mt-0.5">{currentSupport?.fuenteOficial}</dd>
                  </div>

                  <div>
                    <dt className="text-slate-600 font-medium">Documento o Catálogo Oficial:</dt>
                    <dd className="font-semibold text-slate-900 mt-0.5">
                      {school.fuenteUrl ? (
                        <a href={school.fuenteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-900 hover:underline inline-flex items-center gap-1">
                          {needId === 'tea'
                            ? 'Relación de centros preferentes TEA (PDF 2024/25)'
                            : needId === 'compensatoria'
                            ? 'Resolución Aulas de Enlace 2026/27 (PDF oficial)'
                            : 'Portal de Datos Abiertos CAM (centros_educativos)'}
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </a>
                      ) : (
                        'Catálogo oficial CAM'
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-slate-600 font-medium">Geolocalización y Contacto:</dt>
                    <dd className="font-semibold text-slate-900 mt-0.5">
                      {school.ubicacionAproximada ? (
                        'Centroide municipal de referencia (coordenadas UTM no disponibles en CKAN)'
                      ) : school.fuenteDatosAbiertos ? (
                        <a
                          href="https://datos.comunidad.madrid/catalogo/dataset/centros_educativos"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-900 hover:underline inline-flex items-center gap-1"
                        >
                          Portal de Datos Abiertos CAM (CC BY 4.0)
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </a>
                      ) : (
                        'Referencia geográfica municipal/distrito'
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-slate-600 font-medium">
                      {needId === 'tea' ? 'Etapas con Apoyo TEA (listado oficial):' : 'Etapas oficiales incluidas:'}
                    </dt>
                    <dd className="font-semibold text-blue-950 mt-0.5 uppercase">
                      {currentSupport?.etapasConApoyo.join(', ')}
                    </dd>
                  </div>

                  {school.fuenteAyuntamiento && (
                    <div className="sm:col-span-2">
                      <dt className="text-slate-600 font-medium">Fuente municipal complementaria (Madrid capital):</dt>
                      <dd className="font-semibold text-slate-900 mt-0.5">
                        <a
                          href="https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=b33290e5b4e4d410VgnVCM2000000c205a0aRCRD"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-900 hover:underline inline-flex items-center gap-1"
                        >
                          {school.fuenteAyuntamiento}
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Dotación de Recursos Profesionales */}
              <div className="border border-slate-200 rounded-xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Dotación de Personal Especializado
                </h3>
                {currentSupport && currentSupport.recursosOficiales.length === 0 && (
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {formatText(
                      needId === 'educacion_especial'
                        ? 'Los Centros de Educación Especial (CEE) cuentan con equipos multiprofesionales estables de Pedagogía Terapéutica (PT), Audición y Lenguaje (AL), Fisioterapia, Enfermería (DUE) y Técnicos Especialistas según la ordenación autonómica.'
                        : needId === 'salud_hospitalaria'
                        ? 'Las Aulas Hospitalarias están atendidas por profesorado especializado de la Consejería de Educación en coordinación con el centro educativo de origen del alumnado hospitalizado.'
                        : needId === 'visual'
                        ? 'Atención prestada mediante convenio CAM–ONCE: profesorado itinerante especialista en tiflotecnología, braille y accesibilidad visual, además de recursos específicos en el C.R.E. «Antonio Vicente Mosquete».'
                        : needId === 'altas_capacidades'
                        ? 'Equipos de orientación especializados, evaluación psicopedagógica y talleres de enriquecimiento científico, artístico y lógico los sábados (Programa PEAC) sin alterar la matrícula en el centro ordinario.'
                        : needId === 'auditiva'
                        ? 'Equipo público regional especializado en discapacidad auditiva: evalúa necesidades auditivas, orienta adaptaciones de acceso y coordina recursos de LSE, audición y lenguaje y equipos FM.'
                        : needId === 'motora'
                        ? 'Equipo público regional especializado en discapacidad motora: valora adaptaciones de acceso físico, movilidad, fisioterapia y dotación de auxiliares técnicos educativos (ATU).'
                        : needId === 'tdah' || needId === 'tel_lenguaje'
                        ? 'Equipo técnico regional de orientación que asesora a orientadores y centros ordinarios en evaluación e intervención educativa para TDAH, trastornos del lenguaje (TDL/TEL) y dificultades de aprendizaje.'
                        : needId === 'compensatoria'
                        ? 'Aula de Enlace (Escuelas de Bienvenida, Decreto 23/2023): profesorado especialista para el aprendizaje intensivo de español como lengua vehicular y acogida socioeducativa en grupos reducidos, coordinado con el grupo ordinario.'
                        : 'El listado oficial no detalla el personal concreto de cada aula. Con carácter general en la Comunidad de Madrid, las aulas de atención preferente TEA atienden a un máximo de cinco alumnos con apoyo de profesorado PT, AL e integrador social (TIS).'
                    )}
                  </p>
                )}
                {currentSupport && currentSupport.recursosOficiales.length > 0 && (
                  <ul className="space-y-1.5 text-xs text-slate-800">
                    {currentSupport.recursosOficiales.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-800 font-bold shrink-0 mt-0.5">✓</span>
                        <span>{formatText(rec)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Recordatorio de procedimiento */}
              <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-700 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-1">Requisitos para la Asignación de Plaza</h3>
                <p className="leading-relaxed">
                  {formatText(
                    needId === 'salud_hospitalaria'
                      ? 'La incorporación al Aula Hospitalaria es automática durante el periodo de convalecencia médica en el hospital correspondiente, coordinándose directamente con el centro de matrícula del alumno.'
                      : needId === 'visual'
                      ? 'La atención visual se activa tras valoración oftalmológica y dictamen o informe del EOEP de sector, coordinándose entre el EOEP Específico Visual (CAM) y la ONCE para apoyar al alumno en su centro ordinario o en el C.R.E. de Moratalaz.'
                      : needId === 'altas_capacidades'
                      ? 'El acceso al Programa PEAC requiere detección e informe psicopedagógico del EOEP o Departamento de Orientación del centro ordinario y propuesta oficial de incorporación. El CREACIM atiende consultas técnicas de centros y familias.'
                      : needId === 'auditiva'
                      ? 'Este EOEP Específico (código 28700741) evalúa y orienta de forma regional; la asignación de plaza en centro preferente auditivo se tramita mediante dictamen de escolarización y el SAE de tu Dirección de Área Territorial (DAT).'
                      : needId === 'motora'
                      ? 'Este EOEP Específico (código 28700763) valora necesidades de acceso, fisioterapia y personal ATU para orientar la escolarización en centro ordinario o preferente motórico ante la DAT / SAE correspondiente.'
                      : needId === 'tdah' || needId === 'tel_lenguaje'
                      ? 'Equipo técnico regional de orientación (código 28701214). La atención directa al alumnado se presta en el centro ordinario mediante el EOEP de sector, Departamento de Orientación y profesorado especialista en PT y AL.'
                      : needId === 'compensatoria'
                      ? 'Centro privado concertado autorizado por Resolución de 25/08/2026 (curso 2026/2027). La incorporación al Aula de Enlace (habitualmente hasta 9 meses, desde 3.º de Primaria o ESO) se gestiona mediante valoración e informe del Servicio de Apoyo a la Escolarización (SAE) / DAT.'
                      : 'Para acceder a los recursos de atención preferente TEA o a un Centro de Educación Especial (CEE) es necesario disponer del Dictamen de Escolarización emitido por el EOEP o Departamento de Orientación competente, validado ante el SAE o la DAT correspondiente.'
                  )}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: FICHA, CONTACTO Y MAPA */}
          {activeTab === 'details' && (
            <div
              role="tabpanel"
              id="school-tabpanel-details"
              aria-labelledby="school-tab-details"
              className="space-y-5"
            >
              {/* Etapas autorizadas */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  {needId === 'tea'
                    ? 'Etapas con apoyo TEA en el listado oficial (curso 2024/25)'
                    : 'Etapas y ámbito educativo registrado'}
                </h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  {school.etapas.map(st => (
                    <span key={st} className="bg-slate-100 text-slate-900 font-semibold px-2.5 py-1 rounded-md border border-slate-300">
                      {st === 'infantil' ? 'Educación Infantil' :
                       st === 'primaria' ? 'Educación Primaria' :
                       st === 'eso' ? 'E.S.O.' :
                       st === 'bachillerato' ? 'Bachillerato' : 'FP Básica'}
                    </span>
                  ))}
                </div>
                {school.tipoGeneralOficial && (
                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                    <span className="font-semibold text-slate-900">Denominación oficial en Datos Abiertos:</span>{' '}
                    {formatText(school.tipoGeneralOficial)}.
                    {needId === 'tea'
                      ? ' Los colegios públicos de Infantil y Primaria (CEIP) escolarizan también segundo ciclo de Infantil, aunque el listado de vacantes TEA suela consignar «Primaria».'
                      : ''}
                  </p>
                )}
              </div>

              {/* Datos de Contacto Oficiales (Datos Abiertos CAM) */}
              {hasContactData && (
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                    Datos de Contacto Oficiales (Portal de Datos Abiertos CAM)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    {school.telefono && (
                      <div className="flex items-center gap-2 text-slate-800 min-w-0">
                        <Phone className="w-4 h-4 text-slate-600 shrink-0" aria-hidden="true" />
                        <a href={`tel:${school.telefono.replace(/\s+/g, '')}`} className="font-semibold text-blue-900 hover:underline whitespace-nowrap">
                          {school.telefono}
                        </a>
                      </div>
                    )}
                    {school.email && (
                      <div className="flex items-center gap-2 text-slate-800 min-w-0">
                        <Mail className="w-4 h-4 text-slate-600 shrink-0" aria-hidden="true" />
                        <a href={`mailto:${school.email}`} className="text-blue-900 hover:underline truncate">
                          {school.email}
                        </a>
                      </div>
                    )}
                    {normalizedWebUrl && (
                      <div className="flex items-center gap-2 sm:col-span-2 min-w-0 text-blue-900 font-semibold">
                        <ExternalLink className="w-4 h-4 text-blue-800 shrink-0" aria-hidden="true" />
                        <a href={normalizedWebUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                          {normalizedWebUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Datos municipales verificados en Ayuntamiento de Madrid (datos.madrid.es) */}
              {(school.fuenteAyuntamiento || school.transportePublico || school.serviciosConfirmadosAyto || school.accesibilidadConfirmadaAyto || Boolean(school.accesibilidadCodigoAyto)) && (
                <div className="border-t border-slate-200 pt-4 space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Transporte Público, Equipamiento y Accesibilidad (Ayuntamiento de Madrid · datos.madrid.es)
                  </h3>
                  <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 text-xs text-slate-800 space-y-2">
                    {school.transportePublico && (
                      <div>
                        <span className="font-bold text-slate-900">Transporte público cercano: </span>
                        <span>{school.transportePublico}</span>
                      </div>
                    )}
                    {school.serviciosConfirmadosAyto ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-slate-900 mr-1">Equipamiento declarado:</span>
                        {school.servicios.comedor && (
                          <span className="bg-white border border-blue-300 text-blue-950 font-semibold px-2 py-0.5 rounded">
                            Comedor escolar
                          </span>
                        )}
                        {school.servicios.aula_matinal && (
                          <span className="bg-white border border-blue-300 text-blue-950 font-semibold px-2 py-0.5 rounded">
                            Horario ampliado / Aula matinal
                          </span>
                        )}
                        {school.servicios.transporte && (
                          <span className="bg-white border border-blue-300 text-blue-950 font-semibold px-2 py-0.5 rounded">
                            Transporte escolar
                          </span>
                        )}
                        {!school.servicios.comedor && !school.servicios.aula_matinal && !school.servicios.transporte && (
                          <span className="text-slate-700">Sin comedor/transporte/horario ampliado declarado en la ficha municipal.</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span className="font-bold text-slate-900">Equipamiento declarado: </span>
                        <span className="text-slate-700">Sin datos de servicios en las fuentes oficiales para este centro.</span>
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-slate-900">Accesibilidad declarada (Ayto. Madrid): </span>
                      <span>{formatAytoAccessibilityText(school)}</span>
                    </div>
                  </div>
                </div>
              )}

              {isOfficial && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed">
                  La dirección postal, teléfono, correo, web y coordenadas proceden del catálogo{' '}
                  <a
                    href="https://datos.comunidad.madrid/catalogo/dataset/centros_educativos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-900 hover:underline"
                  >
                    Centros educativos de la Comunidad de Madrid (Datos Abiertos CAM)
                  </a>
                  {school.fuenteAyuntamiento
                    ? ', complementados con transporte público y equipamiento publicados por datos.madrid.es.'
                    : '. Los servicios complementarios (comedor, transporte, enfermería) y la accesibilidad física no figuran en las fuentes abiertas fuera de Madrid capital; consulta el '}
                  {!school.fuenteAyuntamiento && (
                    <>
                      <a href={OFFICIAL_SEARCH_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-900 hover:underline">
                        buscador oficial de centros
                      </a>{' '}
                      con el código <span className="font-mono font-bold">{school.codigo}</span>.
                    </>
                  )}
                </div>
              )}

              {school.observacionesOficiales && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-950 flex items-start gap-2 leading-relaxed">
                  <Info className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="font-bold">Nota del documento oficial: </span>
                    <span>{formatText(school.observacionesOficiales)}</span>
                  </div>
                </div>
              )}

              {/* Ubicación y Mapa Georreferenciado */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  {school.ubicacionAproximada
                    ? 'Ubicación aproximada (centro del municipio)'
                    : 'Ubicación Oficial Georreferenciada (Datos Abiertos CAM · OpenStreetMap)'}
                </h3>
                <React.Suspense
                  fallback={
                    <div className="h-[200px] rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-600">
                      Cargando mapa del centro...
                    </div>
                  }
                >
                  <LazySchoolMiniMap school={school} height="200px" />
                </React.Suspense>
              </div>
            </div>
          )}

          {/* TAB 3: CONTINUIDAD PRIMARIA - SECUNDARIA */}
          {activeTab === 'continuity' && (
            <div
              role="tabpanel"
              id="school-tabpanel-continuity"
              aria-labelledby="school-tab-continuity"
              className="space-y-4"
            >
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {needId === 'tea'
                    ? 'Transición Escolar y Continuidad del Apoyo'
                    : 'Trayectoria Educativa y Modalidad'}
                </h3>
                <p className="text-xs text-slate-800 leading-relaxed mb-3">
                  {formatText(school.continuidad.descripcion)}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-700 font-medium">Evaluación oficial:</span>
                  <span className={`font-bold ${
                    school.continuidad.apoyoEnSecundariaVerificado === true
                      ? 'text-emerald-800'
                      : 'text-amber-900'
                  }`}>
                    {needId === 'educacion_especial'
                      ? 'Escolarización específica continuada (Infantil Especial, EBO y PTVA hasta los 21 años)'
                      : needId === 'salud_hospitalaria'
                      ? 'Coordinación académica directa con el centro de matrícula'
                      : needId === 'visual'
                      ? 'Apoyo itinerante CAM–ONCE en centro ordinario o escolarización en C.R.E. Moratalaz'
                      : needId === 'altas_capacidades'
                      ? 'Continuidad en centro ordinario complementada con Programa PEAC (Primaria, ESO y Bachillerato)'
                      : needId === 'auditiva' || needId === 'motora' || needId === 'tdah' || needId === 'tel_lenguaje'
                      ? 'Asesoramiento técnico y valoración regional a través de todas las etapas escolares'
                      : needId === 'compensatoria'
                      ? 'Programa de acogida lingüística (hasta 9 meses) y transición a aula ordinaria'
                      : school.continuidad.apoyoEnSecundariaVerificado === true
                      ? 'Apoyo TEA en Secundaria según el listado oficial'
                      : 'Continuidad no verificada documentalmente (nunca inexistencia afirmada)'}
                  </span>
                </div>
              </div>

              {/* Centros de destino adscritos o de la misma zona */}
              {school.continuidad.destinos.length > 0 ? (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    {school.continuidad.tipoContinuidad === 'zona'
                      ? 'Centros preferentes TEA con Secundaria en la misma zona (no es adscripción)'
                      : 'Institutos de Educación Secundaria (IES) de Adscripción'}
                  </h3>
                  <div className="space-y-2">
                    {school.continuidad.destinos.map((dest, i) => (
                      <div key={i} className="border border-slate-200 rounded-xl p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-700">
                            <span className="font-mono text-slate-900 font-semibold">Cód. {dest.codigo}</span>
                            <span aria-hidden="true">·</span>
                            <span>{dest.etapa}</span>
                            {dest.distanciaKm !== undefined && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono text-blue-950 font-semibold">{dest.distanciaKm} km</span>
                              </>
                            )}
                          </div>
                          <div className="text-sm font-bold text-slate-900 mt-0.5">
                            {isEasyReadMode ? simplifySchoolTitle(dest.nombre) : dest.nombre}
                          </div>
                          <p className="text-xs text-slate-700 mt-1">{formatText(dest.detallesApoyo || '')}</p>
                        </div>

                        <div className="shrink-0">
                          {dest.tieneMismoApoyo === true ? (
                            <span className="inline-block text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded">
                              Apoyo TEA específico
                            </span>
                          ) : (
                            <span className="inline-block text-xs font-medium text-slate-700 bg-slate-100 border border-slate-300 px-2 py-1 rounded">
                              Apoyo ordinario
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                  <div className="font-bold mb-1">
                    {needId === 'educacion_especial'
                      ? 'Continuidad en el propio Centro de Educación Especial:'
                      : needId === 'salud_hospitalaria'
                      ? 'Reincorporación al centro ordinario o de referencia:'
                      : needId === 'visual'
                      ? 'Seguimiento en centro ordinario o recurso específico:'
                      : needId === 'altas_capacidades'
                      ? 'Compatibilidad con el centro ordinario:'
                      : needId === 'auditiva' || needId === 'motora' || needId === 'tdah' || needId === 'tel_lenguaje'
                      ? 'Cobertura regional en todas las etapas:'
                      : needId === 'compensatoria'
                      ? 'Programa de acogida y lengua vehicular:'
                      : 'Centro con Primaria y Secundaria (o etapa ESO directa):'}
                  </div>
                  <p>
                    {formatText(
                      needId === 'educacion_especial'
                        ? 'Los CEE escolarizan todo el itinerario específico desde Infantil Especial hasta los Programas de Transición a la Vida Adulta (PTVA).'
                        : needId === 'salud_hospitalaria'
                        ? 'Al recibir el alta hospitalaria, el alumnado retoma la docencia en su centro educativo de matrícula habitual (o solicita atención educativa domiciliaria si procede).'
                        : needId === 'visual'
                        ? 'El EOEP Específico y los equipos CAM–ONCE acompañan al alumnado durante todas las etapas obligatorias en su centro ordinario, o en el C.R.E. «Antonio Vicente Mosquete».'
                        : needId === 'altas_capacidades'
                        ? 'Las actividades del programa PEAC se celebran los sábados por la mañana para que el alumnado mantenga su escolarización habitual de lunes a viernes en su centro ordinario.'
                        : needId === 'auditiva' || needId === 'motora' || needId === 'tdah' || needId === 'tel_lenguaje'
                        ? 'Los EOEP Específicos operan con ámbito regional: no escolarizan alumnado directamente, sino que orientan a los centros ordinarios, preferentes y familias en toda la Comunidad de Madrid.'
                        : needId === 'compensatoria'
                        ? 'Tras la fase intensiva en el Aula de Enlace (máximo orientativo de 9 meses), el alumnado se incorpora plenamente al aula ordinaria que corresponda a su nivel.'
                        : 'El alumnado puede cursar la etapa de Educación Secundaria Obligatoria en el propio recinto escolar sin cambiar de centro.'
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pie del modal con acciones */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onTogglePassport(school)}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer flex-1 sm:flex-none ${
              isInPassport
                ? 'bg-emerald-700 text-white border-emerald-800'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <BookmarkCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{isInPassport ? 'En Pasaporte' : 'Pasaporte'}</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleCompare(school)}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer flex-1 sm:flex-none ${
              isCompared
                ? 'bg-red-700 text-white border-red-800 shadow-xs'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <GitCompare className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{isCompared ? 'En Comparador' : 'Comparar'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-200 hover:bg-slate-300 transition-colors cursor-pointer shrink-0"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
