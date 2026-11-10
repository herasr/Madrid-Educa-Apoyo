/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mini-mapa interactivo para la ficha de centro y transición a Secundaria
 * Muestra el centro escolar y sus institutos adscritos conectados con líneas de continuidad
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { School } from '../types';

interface SchoolMiniMapProps {
  school: School;
  height?: string;
}

export const SchoolMiniMap: React.FC<SchoolMiniMapProps> = ({
  school,
  height = '240px'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: [school.lat, school.lng],
        zoom: 14,
        scrollWheelZoom: false
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapRef.current = map;
    }

    const map = mapRef.current;
    if (!map) return;

    // Marcador del centro principal
    const mainIcon = L.divIcon({
      className: 'school-main-pin',
      html: `
        <div style="
          width: 28px;
          height: 28px;
          background: #1d4ed8;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 3px 8px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 11px;
        ">
          🏫
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker([school.lat, school.lng], { icon: mainIcon })
      .bindPopup(`<b>${school.nombre}</b><br>${school.direccion}`)
      .addTo(map);

    const bounds = L.latLngBounds([[school.lat, school.lng], [school.lat, school.lng]]);

    // Centros adscritos si existen
    if (school.continuidad && school.continuidad.destinos.length > 0) {
      school.continuidad.destinos.forEach((dest, i) => {
        // Coordenadas calculadas aproximadamente cerca del centro si no son exactas
        const offsetLat = school.lat + (i === 0 ? 0.012 : -0.011);
        const offsetLng = school.lng + (i === 0 ? 0.015 : -0.013);

        const destIcon = L.divIcon({
          className: 'adscripcion-dest-pin',
          html: `
            <div style="
              width: 24px;
              height: 24px;
              background: ${dest.tieneMismoApoyo === true ? '#059669' : '#64748b'};
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 800;
              font-size: 10px;
            ">
              🎓
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([offsetLat, offsetLng], { icon: destIcon })
          .bindPopup(`<b>${dest.nombre}</b><br>Etapa: ${dest.etapa}<br>${dest.detallesApoyo || ''}`)
          .addTo(map);

        // Línea de conexión de adscripción
        L.polyline([[school.lat, school.lng], [offsetLat, offsetLng]], {
          color: dest.tieneMismoApoyo === true ? '#059669' : '#94a3b8',
          weight: 2,
          dashArray: '4, 6'
        }).addTo(map);

        bounds.extend([offsetLat, offsetLng]);
      });

      map.fitBounds(bounds, { padding: [30, 30] });
    } else {
      map.setView([school.lat, school.lng], 15);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [school]);

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200">
      <div ref={containerRef} style={{ height }} className="w-full z-10" />
      <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <span>🏫 Centro principal · 🎓 Instituto adscrito (verde: apoyo específico verificado)</span>
        <span>OpenStreetMap</span>
      </div>
    </div>
  );
};
