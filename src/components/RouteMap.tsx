'use client';

import React from 'react';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

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

export default function RouteMap() {
  return (
    <div className="w-full h-[300px] rounded-xl overflow-hidden border border-slate-800 shadow-md">
      <Map
        initialViewState={MANILA_CENTER}
        style={{ width: '100%', height: '100%' }}
        mapStyle={OSM_MAP_STYLE}
      />
    </div>
  );
}
