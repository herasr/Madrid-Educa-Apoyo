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

const escapeHtml = (unsafe: string) =>
  unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export const SchoolMiniMap: React.FC<SchoolMiniMapProps> = ({
  school,
  height = '240px'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const isZoneContinuity = school.continuidad?.tipoContinuidad === 'zona';

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
          font-size: 10px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        ">
          C
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    L.marker([school.lat, school.lng], { icon: mainIcon })
      .bindPopup(
        `<b>${escapeHtml(school.nombre)}</b><br>${
          school.ubicacionAproximada
            ? 'Ubicación aproximada (centro del municipio o distrito)'
            : `${escapeHtml(school.direccion || school.municipio)}${school.codigoPostal ? ` (${escapeHtml(school.codigoPostal)})` : ''}`
        }`
      )
      .addTo(map);

    const bounds = L.latLngBounds([[school.lat, school.lng], [school.lat, school.lng]]);

    // Centros de destino si existen
    if (school.continuidad && school.continuidad.destinos.length > 0) {
      school.continuidad.destinos.forEach((dest, i) => {
        const offsetLat = dest.lat ?? school.lat + (i === 0 ? 0.012 : -0.011);
        const offsetLng = dest.lng ?? school.lng + (i === 0 ? 0.015 : -0.013);

        const destIcon = L.divIcon({
          className: 'adscripcion-dest-pin',
          html: `
            <div style="
              width: 24px;
              height: 24px;
              background: ${dest.tieneMismoApoyo === true ? '#059669' : '#475569'};
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 800;
              font-size: 9px;
              font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            ">
              ESO
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([offsetLat, offsetLng], { icon: destIcon })
          .bindPopup(
            `<b>${escapeHtml(dest.nombre)}</b><br>Etapa: ${escapeHtml(dest.etapa)}<br>${escapeHtml(dest.detallesApoyo || '')}`
          )
          .addTo(map);

        L.polyline([[school.lat, school.lng], [offsetLat, offsetLng]], {
          color: dest.tieneMismoApoyo === true ? '#059669' : '#64748b',
          weight: 2,
          dashArray: '4, 6'
        }).addTo(map);

        bounds.extend([offsetLat, offsetLng]);
      });

      map.fitBounds(bounds, { padding: [30, 30] });
    } else {
      map.setView([school.lat, school.lng], 15);
    }

    const resizeTimer = window.setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      window.clearTimeout(resizeTimer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [school]);

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200">
      <div ref={containerRef} style={{ height }} className="w-full z-10" />
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 font-medium">
        <span>
          <strong className="text-blue-800">C</strong> Centro principal ·{' '}
          <strong className="text-emerald-800">ESO</strong>{' '}
          {isZoneContinuity
            ? 'Centros TEA con Secundaria en la misma zona (no es adscripción)'
            : 'Instituto adscrito (verde: apoyo específico verificado)'}
        </span>
        <span>OpenStreetMap</span>
      </div>
    </div>
  );
};
