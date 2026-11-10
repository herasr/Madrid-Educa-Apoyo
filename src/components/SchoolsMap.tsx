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
import { ShieldCheck, AlertTriangle, Maximize2, MapPin, Layers, X, ChevronDown, ChevronUp } from 'lucide-react';

interface SchoolsMapProps {
  schools: School[];
  state: SearchState;
  selectedSchoolId?: string | null;
  onSelectSchool: (school: School) => void;
  onOpenWhyAppears: (school: School) => void;
  onToggleCompare?: (school: School) => void;
  isSchoolCompared?: (schoolId: string) => boolean;
  height?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const SchoolsMap: React.FC<SchoolsMapProps> = ({
  schools,
  state,
  selectedSchoolId,
  onSelectSchool,
  onOpenWhyAppears,
  height = '480px',
  isExpanded = false,
  onToggleExpand
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  // Inicialización del mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = 40.4168;
      const initialLng = -3.7038;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 12,
        scrollWheelZoom: true
      });

      // Teselas limpias de OpenStreetMap
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        radiusCircleRef.current = null;
      }
    };
  }, []);

  // Actualizar marcadores, círculo de radio y encuadre
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

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
            <span>◎ ${refCoords.label}</span>
          </div>
        `,
        iconSize: [0, 0]
      });

      L.marker([refCoords.lat, refCoords.lng], { icon: centerIcon, zIndexOffset: 1000 }).addTo(markersGroup);
    }

    // Colección de límites geográficos para ajustar zoom
    const latLngs: L.LatLngExpression[] = [];

    // Añadir centros escolares con diseño simplificado de marcadores
    schools.forEach((school, index) => {
      latLngs.push([school.lat, school.lng]);

      const currentSupport = state.need
        ? school.apoyos.find(a => a.needId === state.need) || school.apoyos[0]
        : school.apoyos[0];

      const needId = currentSupport?.needId || 'tea';
      const isA1 = currentSupport?.evidencia === 'A1';
      const isFocused = selectedSchoolId === school.id;

      // Configuración de marcadores
      const NEED_CONFIGS: Record<string, { bgColor: string, tag: string, name: string }> = {
        tea: { bgColor: '#1d4ed8', tag: 'TEA', name: 'Atención preferente TEA' },
        auditiva: { bgColor: '#0284c7', tag: 'AUD', name: 'Discapacidad auditiva' },
        motora: { bgColor: '#7c3aed', tag: 'MOT', name: 'Discapacidad motora' },
        visual: { bgColor: '#2563eb', tag: 'VIS', name: 'Discapacidad visual' },
        altas_capacidades: { bgColor: '#9333ea', tag: 'AAC', name: 'Altas capacidades' },
        tdah: { bgColor: '#d97706', tag: 'TDA', name: 'TDAH y Conducta' },
        tel_lenguaje: { bgColor: '#0891b2', tag: 'TEL', name: 'Trastorno del Lenguaje' },
        salud_hospitalaria: { bgColor: '#dc2626', tag: 'HOSP', name: 'Atención Hospitalaria' },
        compensatoria: { bgColor: '#4f46e5', tag: 'COMP', name: 'Compensación Educativa' },
        educacion_especial: { bgColor: '#059669', tag: 'CEE', name: 'Educación Especial' }
      };

      const config = NEED_CONFIGS[needId] || NEED_CONFIGS.tea;
      const bgColor = config.bgColor;
      const needTag = config.tag;
      const needDisplayName = config.name;


      // Estilo de borde: Sólido para A1 (Confirmado), Discontinuo para A2 (En comprobación)
      const borderStyle = isA1 ? '3px solid #10b981' : '3px dashed #f59e0b';
      const haloStyle = isFocused ? 'box-shadow: 0 0 0 6px rgba(37,99,235,0.4), 0 4px 12px rgba(0,0,0,0.3);' : 'box-shadow: 0 3px 8px rgba(0,0,0,0.25);';

      const icon = L.divIcon({
        className: `clean-school-marker pin-${school.id}`,
        html: `
          <div style="
            position: relative;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: ${bgColor};
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
            <span>${needTag}</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16]
      });

      const marker = L.marker([school.lat, school.lng], { icon });

      // Cálculo de distancia para el popup
      let distanceText = school.municipio;
      if (refCoords) {
        const d = calculateHaversineDistance(refCoords.lat, refCoords.lng, school.lat, school.lng);
        distanceText = `${d} km aprox.`;
      }

      const stageLabels = (currentSupport?.etapasConApoyo || school.etapas).map(s => {
        if (s === 'infantil') return 'Infantil';
        if (s === 'primaria') return 'Primaria';
        if (s === 'eso') return 'ESO';
        if (s === 'bachillerato') return 'Bach.';
        return 'FP';
      }).join(', ');

      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; min-width: 220px; max-width: 270px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; color: #64748b;">
              ${school.tipo} · ${school.titularidad === 'publico' ? 'Público' : 'Concertado'}
            </span>
            <span style="font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: 4px; background: ${isA1 ? '#ecfdf5' : '#fffbeb'}; color: ${isA1 ? '#065f46' : '#92400e'}; border: 1px solid ${isA1 ? '#a7f3d0' : '#fde68a'};">
              ${isA1 ? '✓ Confirmado' : '⚡ Por comprobar'}
            </span>
          </div>

          <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0 0 3px 0; line-height: 1.25;">
            ${school.nombre}
          </h4>

          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
            📍 ${school.municipio}${school.distrito ? ` (${school.distrito})` : ''} · <strong>${distanceText}</strong>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 8px; font-size: 11px; margin-bottom: 8px;">
            <div style="font-weight: 700; color: #1e293b; margin-bottom: 1px;">
              ${needDisplayName}
            </div>
            <div style="color: #64748b; font-size: 10px;">
              Etapas confirmadas: <strong>${stageLabels}</strong>
            </div>
          </div>

          <div style="display: flex; gap: 6px; margin-top: 4px;">
            <button id="btn-detail-${school.id}" style="
              flex: 1;
              background: #1d4ed8;
              color: #ffffff;
              border: none;
              border-radius: 6px;
              padding: 6px 8px;
              font-size: 11px;
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
          btnDetail.onclick = () => onSelectSchool(school);
        }
      });

      marker.addTo(markersGroup);
    });

    // Ajuste de encuadre
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

    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }, [schools, state, onSelectSchool, onOpenWhyAppears, selectedSchoolId]);

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
          <span className="text-slate-400">·</span>
          <span className="text-slate-600 font-medium">
            {schools.length} {schools.length === 1 ? 'centro ubicado' : 'centros ubicados'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón para abrir/cerrar leyenda */}
          <button
            type="button"
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Leyenda</span>
            {isLegendOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={handleResetView}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold transition-colors cursor-pointer"
            title="Ajustar encuadre a todos los centros"
          >
            Reencuadrar
          </button>

          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors cursor-pointer"
              title={isExpanded ? 'Reducir tamaño' : 'Ampliar mapa'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Contenedor del mapa Leaflet */}
      <div
        ref={mapContainerRef}
        style={{ height }}
        className="w-full z-10 transition-all duration-300"
      />

      {/* LEYENDA VISIBLE Y FLOTANTE (Requisito P0) */}
      {isLegendOpen && (
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-slate-300 rounded-xl p-3 shadow-lg max-w-xs text-xs space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 font-bold text-slate-900">
            <span>Leyenda del mapa</span>
            <button
              type="button"
              onClick={() => setIsLegendOpen(false)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-700 border-2 border-emerald-500 inline-block shrink-0"></span>
              <span><strong>Confirmado para esta etapa</strong> (Borde verde continuo)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-700 border-2 border-dashed border-amber-500 inline-block shrink-0"></span>
              <span><strong>Por comprobar etapa o vigencia</strong> (Borde ámbar discontinuo)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-400 border border-slate-900 inline-block shrink-0"></span>
              <span><strong>◎ Tu ubicación o municipio</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-4 border-t-2 border-dashed border-blue-600 inline-block shrink-0"></span>
              <span><strong>Radio de búsqueda activo</strong> ({state.radiusKm ?? 20} km)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
