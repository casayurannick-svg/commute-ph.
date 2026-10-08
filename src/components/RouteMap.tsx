'use client';

import React, { useEffect, useRef } from 'react';
import Map, { Marker, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { POIItem } from './PlaceSearch';

const MANILA_CENTER = {
  longitude: 120.9842,
  latitude: 14.5995,
  zoom: 11,
};

const OSM_MAP_STYLE = {
  version: 8 as const,
  sources: {
    'osm-tiles': {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster' as const,
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

interface RouteMapProps {
  origin?: POIItem | null;
  destination?: POIItem | null;
}

export default function RouteMap({ origin, destination }: RouteMapProps) {
  const mapRef = useRef<MapRef | null>(null);

  // Automatically adjust bounds when origin or destination changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (origin && destination) {
      const minLng = Math.min(origin.lng, destination.lng);
      const maxLng = Math.max(origin.lng, destination.lng);
      const minLat = Math.min(origin.lat, destination.lat);
      const maxLat = Math.max(origin.lat, destination.lat);

      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 60, duration: 1000, maxZoom: 14 }
      );
    } else if (origin) {
      mapRef.current.flyTo({
        center: [origin.lng, origin.lat],
        zoom: 13,
        duration: 1000,
      });
    } else if (destination) {
      mapRef.current.flyTo({
        center: [destination.lng, destination.lat],
        zoom: 13,
        duration: 1000,
      });
    }
  }, [origin, destination]);

  return (
    <div className="w-full h-[300px] rounded-xl overflow-hidden border border-slate-800 shadow-md relative">
      <Map
        ref={mapRef}
        initialViewState={MANILA_CENTER}
        style={{ width: '100%', height: '100%' }}
        mapStyle={OSM_MAP_STYLE}
      >
        {/* Origin Marker */}
        {origin && (
          <Marker longitude={origin.lng} latitude={origin.lat} anchor="bottom">
            <div className="flex flex-col items-center">
              <span className="bg-emerald-500 text-slate-950 font-extrabold text-[10px] px-1.5 py-0.5 rounded shadow-lg border border-emerald-300">
                A: {origin.name.split(' ')[0]}
              </span>
              <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 shadow-md" />
            </div>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker longitude={destination.lng} latitude={destination.lat} anchor="bottom">
            <div className="flex flex-col items-center">
              <span className="bg-rose-500 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded shadow-lg border border-rose-300">
                B: {destination.name.split(' ')[0]}
              </span>
              <div className="w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-950 shadow-md" />
            </div>
          </Marker>
        )}
      </Map>
    </div>
  );
}
