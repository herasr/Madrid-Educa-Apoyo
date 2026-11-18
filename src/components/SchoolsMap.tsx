/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mapa Georreferenciado Oficial (OpenStreetMap & Leaflet)
 * Marcadores sencillos y limpios:
 * - Círculo con borde sólido verde = Confirmado para esta etapa (A1)
 * - Círculo con borde discontinuo ámbar = Por comprobar etapa o vigencia (A2)
 * - Halo destacado para centro enfocado o seleccionado
 * - Leyenda visible e interactiva (desplegada por defecto, minimizable)
 * - Popup directo y claro con botón prioritario [Ver ficha completa]
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { School, SearchState } from '../types';
import { MUNICIPALITIES, calculateHaversineDistance } from '../data/municipalities';
import { simplifySchoolTitle } from '../utils/textSimplifier';
import { MapPin, Layers, X, ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';

interface SchoolsMapProps {
  schools: School[];
  state: SearchState;
  selectedSchoolId?: string | null;
  onSelectSchool: (school: School) => void;
  onOpenWhyAppears: (school: School) => void;
  onToggleCompare?: (school: School) => void;
  isSchoolCompared?: (schoolId: string) => boolean;
  isEasyReadMode?: boolean;
  height?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const escapeHtml = (unsafe: string) =>
  unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export const SchoolsMap: React.FC<SchoolsMapProps> = ({
  schools,
  state,
  selectedSchoolId,
  onSelectSchool,
  onOpenWhyAppears,
  isEasyReadMode = false,
  height = '480px',
  isExpanded = false,
  onToggleExpand
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const spiderLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const onSelectSchoolRef = useRef(onSelectSchool);
  const onOpenWhyAppearsRef = useRef(onOpenWhyAppears);
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  useEffect(() => {
    onSelectSchoolRef.current = onSelectSchool;
  }, [onSelectSchool]);

  useEffect(() => {
    onOpenWhyAppearsRef.current = onOpenWhyAppears;
  }, [onOpenWhyAppears]);

  // Inicialización del mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = 40.4168;
      const initialLng = -3.7038;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 12,
        scrollWheelZoom: false
      });

      const enableScrollZoom = () => map.scrollWheelZoom.enable();
      const disableScrollZoom = () => map.scrollWheelZoom.disable();
      map.on('click focus', enableScrollZoom);
      map.on('blur mouseout', disableScrollZoom);

      // Teselas limpias de OpenStreetMap
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      const spiderGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      spiderLayerRef.current = spiderGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        spiderLayerRef.current = null;
        radiusCircleRef.current = null;
      }
    };
  }, []);

  // Actualizar marcadores, círculo de radio, encuadre y arañas adaptativas al zoom
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    const spiderGroup = spiderLayerRef.current;
    if (!map || !markersGroup || !spiderGroup) return;

    markersGroup.clearLayers();
    spiderGroup.clearLayers();

    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    // Ubicación de referencia (Browser GPS o Municipio)
    let refCoords: { lat: number; lng: number; label: string } | null = null;

    if (state.locationSource === 'browser' && state.userCoordinates) {
      refCoords = state.userCoordinates;
    } else if (state.municipality) {
      const munObj = MUNICIPALITIES.find(
        m => m.id.toLowerCase() === state.municipality?.toLowerCase() ||
             m.nombre.toLowerCase() === state.municipality?.toLowerCase()
      );
      if (munObj) {
        refCoords = { lat: munObj.lat, lng: munObj.lng, label: munObj.nombre };
      }
    }

    // Dibujar círculo de radio geodésico
    if (refCoords && state.radiusKm && state.radiusKm > 0) {
      const radiusMeters = state.radiusKm * 1000;
      const circle = L.circle([refCoords.lat, refCoords.lng], {
        radius: radiusMeters,
        color: '#2563eb',
        weight: 2,
        dashArray: '6, 8',
        fillColor: '#3b82f6',
        fillOpacity: 0.06
      }).addTo(map);

      radiusCircleRef.current = circle;

      // Marcador central de referencia (◎ Tu ubicación o Municipio)
      const centerIcon = L.divIcon({
        className: 'custom-center-pin',
        html: `
          <div style="
            display: flex;
            align-items: center;
            gap: 4px;
            background: #0f172a;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 9999px;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            white-space: nowrap;
            transform: translate(-50%, -50%);
          ">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #38bdf8;"></span>
            <span>◎ ${escapeHtml(refCoords.label)}</span>
          </div>
        `,
        iconSize: [0, 0]
      });

      L.marker([refCoords.lat, refCoords.lng], { icon: centerIcon, zIndexOffset: 1000 }).addTo(markersGroup);
    }

    const NEED_CONFIGS: Record<string, { bgColor: string; tag: string; name: string }> = {
      tea: { bgColor: '#1d4ed8', tag: 'TEA', name: 'Atención preferente TEA' },
      auditiva: { bgColor: '#0284c7', tag: 'AUD', name: 'Discapacidad auditiva' },
      motora: { bgColor: '#7c3aed', tag: 'MOT', name: 'Discapacidad motora' },
      visual: { bgColor: '#2563eb', tag: 'VIS', name: 'Discapacidad visual' },
      altas_capacidades: { bgColor: '#9333ea', tag: 'AAC', name: 'Altas capacidades' },
      tdah: { bgColor: '#d97706', tag: 'TDA', name: 'TDAH y Conducta' },
      tel_lenguaje: { bgColor: '#0891b2', tag: 'TEL', name: 'Trastorno del Lenguaje' },
      salud_hospitalaria: { bgColor: '#dc2626', tag: 'HOSP', name: 'Atención Hospitalaria' },
      compensatoria: { bgColor: '#4f46e5', tag: 'BIENV', name: 'Escuelas de Bienvenida' },
      educacion_especial: { bgColor: '#059669', tag: 'CEE', name: 'Educación Especial' }
    };

    const createSchoolMarker = (school: School, lat: number, lng: number) => {
      const currentSupport = state.need
        ? school.apoyos.find(a => a.needId === state.need) || school.apoyos[0]
        : school.apoyos[0];

      const needId = currentSupport?.needId || 'tea';
      const isA1 = currentSupport?.evidencia === 'A1';
      const isFocused = selectedSchoolId === school.id;

      const config = NEED_CONFIGS[needId] || NEED_CONFIGS.tea;
      const borderStyle = isA1 ? '3px solid #10b981' : '3px dashed #f59e0b';
      const haloStyle = isFocused
        ? 'box-shadow: 0 0 0 6px rgba(37,99,235,0.4), 0 4px 12px rgba(0,0,0,0.3);'
        : 'box-shadow: 0 3px 8px rgba(0,0,0,0.25);';

      const icon = L.divIcon({
        className: `clean-school-marker pin-${school.id}`,
        html: `
          <div style="
            position: relative;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: ${config.bgColor};
            border: ${borderStyle};
            ${haloStyle}
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: -0.5px;
            cursor: pointer;
            transition: transform 0.15s ease;
          ">
            <span>${config.tag}</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16]
      });

      const marker = L.marker([lat, lng], { icon });

      let distanceText = school.municipio;
      if (refCoords) {
        const d = calculateHaversineDistance(refCoords.lat, refCoords.lng, school.lat, school.lng);
        const displayKm = school.ubicacionAproximada || d >= 10 ? Math.round(d) : d;
        distanceText = `${school.ubicacionAproximada ? '≈ ' : ''}${displayKm} km`;
      }

      const stageLabels = (currentSupport?.etapasConApoyo || school.etapas).map(s => {
        if (s === 'infantil') return 'Infantil';
        if (s === 'primaria') return 'Primaria';
        if (s === 'eso') return 'ESO';
        if (s === 'bachillerato') return 'Bach.';
        return 'FP';
      }).join(', ');

      const locationLine = school.direccion
        ? `${escapeHtml(school.direccion)} · ${escapeHtml(school.municipio)}${school.distrito ? ` (${escapeHtml(school.distrito)})` : ''}`
        : `${escapeHtml(school.municipio)}${school.distrito ? ` (${escapeHtml(school.distrito)})` : ''}`;

      const ownershipLabel =
        school.titularidad === 'publico'
          ? 'Público'
          : school.titularidad === 'concertado'
          ? 'Concertado'
          : 'Privado';

      const displayTitle = isEasyReadMode ? simplifySchoolTitle(school.nombre) : school.nombre;

      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; min-width: 220px; max-width: 270px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 4px;">
            <span style="font-size: 12px; font-weight: 700; color: #334155;">
              ${escapeHtml(school.tipo)} · ${ownershipLabel}
            </span>
            <span style="font-size: 12px; font-weight: 800; padding: 1px 6px; border-radius: 4px; background: ${isA1 ? '#ecfdf5' : '#fffbeb'}; color: ${isA1 ? '#065f46' : '#78350f'}; border: 1px solid ${isA1 ? '#a7f3d0' : '#fde68a'};">
              ${isA1 ? 'Confirmado (A1)' : 'Por comprobar (A2)'}
            </span>
          </div>

          <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.25;">
            ${escapeHtml(displayTitle)}
          </h3>

          <div style="font-size: 12px; color: #334155; margin-bottom: 6px; line-height: 1.35;">
            ${locationLine}${refCoords ? ` · <strong>${escapeHtml(distanceText)}</strong>` : ''}
          </div>
          <div style="font-size: 12px; margin-bottom: 6px; color: #065f46; font-weight: 600;">
            ${school.ubicacionAproximada
              ? 'Dato oficial · ubicación aproximada'
              : 'Dato oficial · Datos Abiertos CAM'}
          </div>

          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 6px 8px; font-size: 12px; margin-bottom: 8px;">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 1px;">
              ${config.name}
            </div>
            <div style="color: #334155; font-size: 12px;">
              ${needId === 'tea' ? 'Etapas en listado TEA:' : 'Etapas oficiales:'} <strong>${stageLabels}</strong>
            </div>
          </div>

          <div style="display: flex; gap: 6px; margin-top: 4px;">
            <button id="btn-detail-${school.id}" style="
              flex: 1;
              background: #1d4ed8;
              color: #ffffff;
              border: none;
              border-radius: 6px;
              padding: 7px 10px;
              font-size: 12px;
              font-weight: 700;
              cursor: pointer;
            ">
              Ver Ficha Completa →
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('popupopen', () => {
        const btnDetail = document.getElementById(`btn-detail-${school.id}`);
        if (btnDetail) {
          btnDetail.onclick = () => onSelectSchoolRef.current(school);
        }
      });

      return marker;
    };

    // Agrupación espacial por proximidad (< ~35 m) para evitar solapamientos
    const clusteredGroups: School[][] = [];
    const visited = new Set<string>();
    const PROXIMITY_THRESHOLD_DEG = 0.00035;

    for (let i = 0; i < schools.length; i++) {
      const base = schools[i];
      if (visited.has(base.id)) continue;
      visited.add(base.id);
      const group = [base];
      for (let j = i + 1; j < schools.length; j++) {
        const candidate = schools[j];
        if (visited.has(candidate.id)) continue;
        if (
          Math.abs(candidate.lat - base.lat) < PROXIMITY_THRESHOLD_DEG &&
          Math.abs(candidate.lng - base.lng) < PROXIMITY_THRESHOLD_DEG
        ) {
          visited.add(candidate.id);
          group.push(candidate);
        }
      }
      clusteredGroups.push(group);
    }

    const latLngs: L.LatLngExpression[] = [];
    const spiderItems: Array<{
      anchorLat: number;
      anchorLng: number;
      angle: number;
      radiusPx: number;
      marker: L.Marker;
      spoke: L.Polyline;
    }> = [];

    const computeSpiderPosition = (anchorLat: number, anchorLng: number, angle: number, radiusPx: number, zoom: number) => {
      const degLngPerPx = 360 / (256 * Math.pow(2, zoom));
      const degLatPerPx = degLngPerPx * Math.cos((anchorLat * Math.PI) / 180);
      return {
        lat: anchorLat + Math.sin(angle) * radiusPx * degLatPerPx,
        lng: anchorLng + Math.cos(angle) * radiusPx * degLngPerPx
      };
    };

    clusteredGroups.forEach(group => {
      if (group.length === 1) {
        const school = group[0];
        latLngs.push([school.lat, school.lng]);
        createSchoolMarker(school, school.lat, school.lng).addTo(markersGroup);
        return;
      }

      const anchorLat = group.reduce((acc, s) => acc + s.lat, 0) / group.length;
      const anchorLng = group.reduce((acc, s) => acc + s.lng, 0) / group.length;
      latLngs.push([anchorLat, anchorLng]);

      L.circleMarker([anchorLat, anchorLng], {
        radius: 4,
        color: '#0f172a',
        weight: 1.5,
        fillColor: '#ffffff',
        fillOpacity: 1
      }).addTo(spiderGroup);

      const radiusPx =
        group.length === 2
          ? 22
          : Math.max(24, Math.ceil(36 / (2 * Math.sin(Math.PI / group.length))));

      group.forEach((school, idx) => {
        const angle = (2 * Math.PI * idx) / group.length - Math.PI / 2;
        const initialPos = computeSpiderPosition(anchorLat, anchorLng, angle, radiusPx, map.getZoom());
        const spoke = L.polyline(
          [
            [anchorLat, anchorLng],
            [initialPos.lat, initialPos.lng]
          ],
          {
            color: '#64748b',
            weight: 1.5,
            dashArray: '3, 4',
            opacity: 0.85
          }
        ).addTo(spiderGroup);

        const marker = createSchoolMarker(school, initialPos.lat, initialPos.lng).addTo(spiderGroup);
        spiderItems.push({ anchorLat, anchorLng, angle, radiusPx, marker, spoke });
      });
    });

    const repositionSpiderClusters = () => {
      const currentZoom = map.getZoom();
      spiderItems.forEach(item => {
        const pos = computeSpiderPosition(item.anchorLat, item.anchorLng, item.angle, item.radiusPx, currentZoom);
        item.marker.setLatLng([pos.lat, pos.lng]);
        item.spoke.setLatLngs([
          [item.anchorLat, item.anchorLng],
          [pos.lat, pos.lng]
        ]);
      });
    };

    // Ajuste de encuadre antes de recolocar las arañas con el zoom definitivo
    if (latLngs.length > 0) {
      if (refCoords && state.radiusKm && radiusCircleRef.current) {
        map.fitBounds(radiusCircleRef.current.getBounds(), { padding: [24, 24] });
      } else {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
      }
    } else if (refCoords) {
      map.setView([refCoords.lat, refCoords.lng], 12);
    }

    repositionSpiderClusters();
    map.on('zoomend', repositionSpiderClusters);

    const resizeTimer = window.setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      window.clearTimeout(resizeTimer);
      map.off('zoomend', repositionSpiderClusters);
    };
  }, [schools, state, selectedSchoolId, isEasyReadMode]);

  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (radiusCircleRef.current) {
      map.fitBounds(radiusCircleRef.current.getBounds(), { padding: [24, 24] });
    } else if (schools.length > 0) {
      const bounds = L.latLngBounds(schools.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  };

  return (
    <div className="relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      {/* Barra de control superior del mapa */}
      <div className="bg-slate-50/95 backdrop-blur-xs px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-700" />
          <span className="font-extrabold text-slate-900">Mapa de Centros</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-700 font-medium">
            {schools.length} {schools.length === 1 ? 'centro ubicado' : 'centros ubicados'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón para abrir/cerrar leyenda */}
          <button
            type="button"
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            aria-expanded={isLegendOpen}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-800 font-semibold transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
            <span>Leyenda</span>
            {isLegendOpen ? <ChevronUp className="w-3 h-3" aria-hidden="true" /> : <ChevronDown className="w-3 h-3" aria-hidden="true" />}
          </button>

          <button
            type="button"
            onClick={handleResetView}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-800 font-semibold transition-colors cursor-pointer"
            title="Ajustar encuadre a todos los centros"
          >
            Reencuadrar
          </button>

          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="p-1 text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors cursor-pointer"
              aria-label={isExpanded ? 'Reducir tamaño del mapa' : 'Ampliar mapa'}
              title={isExpanded ? 'Reducir tamaño' : 'Ampliar mapa'}
            >
              <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Contenedor del mapa Leaflet */}
      <div
        ref={mapContainerRef}
        role="region"
        aria-label="Mapa interactivo de centros educativos"
        style={{ height }}
        className="w-full z-10 transition-all duration-300"
      />

      {/* LEYENDA VISIBLE Y FLOTANTE */}
      {isLegendOpen && (
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-slate-300 rounded-xl p-3 shadow-lg max-w-xs text-xs space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 font-bold text-slate-900">
            <span>Leyenda del mapa</span>
            <button
              type="button"
              onClick={() => setIsLegendOpen(false)}
              aria-label="Cerrar leyenda"
              className="text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-1.5 text-xs text-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-700 inline-block shrink-0" aria-hidden="true"></span>
              <span><strong>TEA</strong> · Preferente TEA</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 inline-block shrink-0" aria-hidden="true"></span>
              <span><strong>BIENV</strong> · Escuelas de Bienvenida</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 inline-block shrink-0" aria-hidden="true"></span>
              <span><strong>CEE</strong> · Educación Especial</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-600 inline-block shrink-0" aria-hidden="true"></span>
              <span><strong>HOSP</strong> · Aula Hospitalaria</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-600 inline-block shrink-0" aria-hidden="true"></span>
              <span><strong>VIS</strong> · Discapacidad Visual</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-purple-600 inline-block shrink-0" aria-hidden="true"></span>
              <span><strong>AAC</strong> · Altas Capacidades</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-sky-600 inline-block shrink-0" aria-hidden="true"></span>
              <span><strong>AUD</strong> · EOEP Discapacidad Auditiva</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-violet-600 inline-block shrink-0" aria-hidden="true"></span>
              <span><strong>MOT</strong> · EOEP Discapacidad Motora</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-600 inline-block shrink-0" aria-hidden="true"></span>
              <span><strong>TDA</strong> · EOEP TDAH y Conducta</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-cyan-600 inline-block shrink-0" aria-hidden="true"></span>
              <span><strong>TEL</strong> · EOEP Lenguaje (TDL/TEL)</span>
            </div>

            <div className="border-t border-slate-200 pt-1.5 mt-1.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-500 inline-block shrink-0" aria-hidden="true"></span>
                <span><strong>Confirmado (A1)</strong> (Borde verde continuo)</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-white border-2 border-dashed border-amber-500 inline-block shrink-0" aria-hidden="true"></span>
                <span><strong>Por comprobar vigencia (A2)</strong> (Borde ámbar)</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-400 border border-slate-900 inline-block shrink-0" aria-hidden="true"></span>
                <span><strong>◎ Referencia territorial o GPS</strong></span>
              </div>

              {state.radiusKm !== null && (state.municipality || state.locationSource === 'browser') && (
                <div className="flex items-center gap-2">
                  <span className="w-4 border-t-2 border-dashed border-blue-600 inline-block shrink-0" aria-hidden="true"></span>
                  <span><strong>Radio de búsqueda activo</strong> ({state.radiusKm} km)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
