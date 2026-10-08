'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import poiData from '@/data/manila-poi.json';

export interface POIItem {
  id: string;
  name: string;
  category: string;
  lng: number;
  lat: number;
}

interface PlaceSearchProps {
  label: string;
  placeholder?: string;
  onSelectPlace: (poi: POIItem | null) => void;
  selectedPlace: POIItem | null;
}

export default function PlaceSearch({
  label,
  placeholder = 'Maghanap ng lugar o landmark...',
  onSelectPlace,
  selectedPlace,
}: PlaceSearchProps) {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<POIItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Synchronize local query text with selected place
  useEffect(() => {
    if (selectedPlace) {
      setQuery(selectedPlace.name);
    }
  }, [selectedPlace]);

  // Debounced search logic against offline POI dataset
  useEffect(() => {
    if (!query.trim() || (selectedPlace && query === selectedPlace.name)) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      const filtered = (poiData as POIItem[]).filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
      setResults(filtered);
      setIsOpen(filtered.length > 0);
    }, 250);

    return () => clearTimeout(timer);
  }, [query, selectedPlace]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (poi: POIItem) => {
    setQuery(poi.name);
    onSelectPlace(poi);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onSelectPlace(null);
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-sky-400" /> {label}
      </label>

      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selectedPlace && e.target.value !== selectedPlace.name) {
              onSelectPlace(null);
            }
          }}
          placeholder={placeholder}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 pl-9 pr-8 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
        />

        <Search className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Clear selection"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <ul className="absolute z-50 w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-800/60 text-xs">
          {results.map((poi) => (
            <li key={poi.id}>
              <button
                type="button"
                onClick={() => handleSelect(poi)}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-800 flex items-center justify-between transition text-slate-200"
              >
                <div>
                  <div className="font-semibold text-slate-100">{poi.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {poi.category.replace('_', ' ')}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-sky-400/80 bg-sky-950/60 border border-sky-800/40 px-1.5 py-0.5 rounded">
                  {poi.lat.toFixed(4)}, {poi.lng.toFixed(4)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
