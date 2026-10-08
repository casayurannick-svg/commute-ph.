'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Compass,
  Bus,
  Train,
  Car,
  Bike,
  ShieldCheck,
  AlertTriangle,
  ArrowUpDown,
  Clock,
  Coins,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Info,
  ExternalLink,
  Sparkles,
  Zap,
  Tag,
  RefreshCw,
} from 'lucide-react';
import {
  FareRule,
  TripInput,
  PassengerProfile,
  TransitCategory,
  SortOption,
  FareCalculationResult,
} from '@/lib/engine/types';
import { compareModes } from '@/lib/engine/compare';

// Preset distances in Metro Manila
const NCR_PRESETS = [
  { label: 'Short Feeder', km: 2.0, hint: 'Tricycle / Jeepney' },
  { label: 'City Hop', km: 5.0, hint: 'e.g. Makati to BGC' },
  { label: 'EDSA Corridor', km: 12.0, hint: 'e.g. Pasay to Cubao' },
  { label: 'Across Metro', km: 24.0, hint: 'e.g. QC to Alabang' },
];

export default function CommuterHomePage() {
  // Input states
  const [distanceKm, setDistanceKm] = useState<number>(7.5);
  const [profile, setProfile] = useState<PassengerProfile>('regular');
  const [sortBy, setSortBy] = useState<SortOption>('cost_asc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);

  // Data states (Loaded strictly from Turso /api/prices)
  const [fareRules, setFareRules] = useState<FareRule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Fetch prices on mount from Turso DB via /api/prices
  useEffect(() => {
    async function fetchFareData() {
      try {
        setLoading(true);
        const res = await fetch('/api/prices');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setFareRules(json.data);
        } else {
          setError('Hindi makuha ang mga presyo mula sa database.');
        }
      } catch (err) {
        console.error('Failed to load fares:', err);
        setError('May problemang naganap habang kumokonekta sa database.');
      } finally {
        setLoading(false);
      }
    }

    fetchFareData();
  }, []);

  // Compute comparison using pure engine functions and Turso fare rules
  const comparisonResult = useMemo(() => {
    if (!fareRules || fareRules.length === 0) return null;

    const trip: TripInput = {
      distanceKm: Math.max(0.1, distanceKm),
      profile,
    };

    const categoriesFilter =
      selectedCategory !== 'all' ? ([selectedCategory] as TransitCategory[]) : undefined;

    return compareModes(fareRules, trip, {
      sortBy,
      filterCategories: categoriesFilter,
      onlyVerified,
    });
  }, [fareRules, distanceKm, profile, sortBy, selectedCategory, onlyVerified]);

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'rail':
        return <Train className="w-5 h-5 text-sky-400" />;
      case 'bus':
        return <Bus className="w-5 h-5 text-emerald-400" />;
      case 'jeepney':
        return <Compass className="w-5 h-5 text-amber-400" />;
      case 'uv':
        return <Car className="w-5 h-5 text-violet-400" />;
      case 'ride_hail':
        return <Bike className="w-5 h-5 text-rose-400" />;
      case 'tricycle':
        return <Compass className="w-5 h-5 text-orange-400" />;
      default:
        return <Bus className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Banner / Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-amber-500 p-0.5 shadow-md shadow-sky-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-sky-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Commute<span className="text-sky-400">PH</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  NCR MVP
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Official LTFRB &amp; DOTr Fare Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="text-xs font-medium text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 transition flex items-center gap-1"
            >
              <Tag className="w-3 h-3 text-sky-400" /> Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Intro Hero */}
        <section className="bg-gradient-to-b from-sky-950/40 to-slate-900/40 border border-sky-900/30 rounded-2xl p-4 sm:p-5">
          <h1 className="text-lg sm:text-xl font-bold text-white mb-1">
            Kalkulahin ang Pinakamura at Pinakamabilis na Byahe
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            I-kumpara ang pamasahe sa LRT, MRT, Bus, Jeepney, UV Express, at Grab/Angkas base sa opisyal
            na taripa ng gobyerno. Zero hardcoded prices
          </p>
        </section>

        {/* Form Card (Mobile-First) */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
          {/* Distance Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="distance-input" className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-sky-400" /> Distansya ng Byahe (Kilometro)
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="distance-input"
                  type="number"
                  step="0.5"
                  min="0.1"
                  max="150"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-right text-sm font-mono font-bold text-sky-400 focus:outline-none focus:border-sky-500"
                />
                <span className="text-xs text-slate-400 font-medium">km</span>
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="0.5"
              max="50"
              step="0.5"
              value={distanceKm}
              onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
              aria-label="Distansya ng Byahe sa Kilometro"
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:outline-none"
            />

            {/* Quick Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              {NCR_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setDistanceKm(preset.km)}
                  className={`px-2.5 py-1.5 rounded-xl text-left border transition text-xs ${
                    distanceKm === preset.km
                      ? 'bg-sky-600/20 border-sky-500 text-sky-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <div className="font-semibold">{preset.label}</div>
                  <div className="text-[10px] text-slate-500">{preset.km} km</div>
                </button>
              ))}
            </div>
          </div>

          {/* Passenger Profile (Discounts under RA 9994 / RA 10931) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Pasahero (Diskwento)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'regular', label: 'Regular', discount: 'Regular Fare' },
                { id: 'student', label: 'Estudyante', discount: '20% Off (RA 10931)' },
                { id: 'senior', label: 'Senior Citizen', discount: '20% Off (RA 9994)' },
                { id: 'pwd', label: 'PWD', discount: '20% Off' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProfile(p.id as PassengerProfile)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    profile === p.id
                      ? 'bg-sky-500/10 border-sky-500 text-sky-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{p.label}</div>
                  <div className="text-[10px] text-sky-400/80 font-medium">{p.discount}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Filter & Sort Controls */}
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> Pagsunod-sunod:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Pagsunod-sunod ng mga resulta"
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="cost_asc">Pinakamura (Lowest Fare)</option>
                <option value="speed_asc">Pinakamabilis (Estimated Time)</option>
                <option value="cost_desc">Pinakamataas (Highest Cost)</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Uri:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Piliin ang Uri ng Sasakyan"
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="all">Lahat ng Sasakyan</option>
                <option value="jeepney">Jeepney (Tradisyunal / Modern)</option>
                <option value="rail">Tren (LRT / MRT)</option>
                <option value="bus">Bus (Ordinary / Aircon)</option>
                <option value="uv">UV Express</option>
                <option value="ride_hail">Taxi / MC Taxi / Grab</option>
                <option value="tricycle">Tricycle</option>
              </select>
            </div>
          </div>

          {/* Only Verified Toggle */}
          <div className="flex items-center justify-between pt-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 bg-slate-950 border-slate-700"
              />
              <span>Ipakita lamang ang opisyal na LTFRB/DOTr verified fares</span>
            </label>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Data source: Turso Database
            </span>
          </div>
        </section>

        {/* Loading / Error States */}
        {loading && (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
            <p className="text-sm text-slate-400">Kinukuha ang pinakabagong pamasahe mula sa Turso...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Highlights: Cheapest vs Fastest */}
        {comparisonResult && comparisonResult.results.length > 0 && (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {comparisonResult.cheapest && (
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> Pinakamura (Cheapest)
                  </div>
                  <div className="text-white font-bold text-sm">
                    {comparisonResult.cheapest.modeName}
                  </div>
                  <div className="text-xs text-slate-400">
                    Est. {comparisonResult.cheapest.estimatedDurationMinutes} mins
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    ₱{comparisonResult.cheapest.totalCost.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400">Kabuuang Bayad</div>
                </div>
              </div>
            )}

            {comparisonResult.fastest && (
              <div className="bg-sky-950/30 border border-sky-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <Zap className="w-3.5 h-3.5" /> Pinakamabilis (Fastest)
                  </div>
                  <div className="text-white font-bold text-sm">
                    {comparisonResult.fastest.modeName}
                  </div>
                  <div className="text-xs text-slate-400">
                    Pamasahe: ₱{comparisonResult.fastest.totalCost.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-sky-400">
                    {comparisonResult.fastest.estimatedDurationMinutes}{' '}
                    <span className="text-xs font-sans text-slate-400">min</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Tinatayang Oras</div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Results List */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mga Opsyon sa Byahe ({comparisonResult?.results.length ?? 0})
            </h2>
            <span className="text-[11px] text-slate-500">
              {profile !== 'regular' ? `${profile.toUpperCase()} 20% discount applied` : 'Standard Fare'}
            </span>
          </div>

          {comparisonResult?.results.length === 0 && !loading && (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
              Walang transit option na tumutugma sa kasalukuyang filter.
            </div>
          )}

          {comparisonResult?.results.map((item: FareCalculationResult) => {
            const isExpanded = !!expandedCards[item.modeId];
            const isCheapest = comparisonResult.cheapest?.modeId === item.modeId;
            const isFastest = comparisonResult.fastest?.modeId === item.modeId;

            return (
              <article
                key={item.modeId}
                className={`bg-slate-900 border rounded-2xl transition overflow-hidden shadow-lg ${
                  isCheapest
                    ? 'border-emerald-500/40 bg-gradient-to-r from-slate-900 to-emerald-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Main Card Header */}
                <div
                  className="p-4 sm:p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  onClick={() => toggleExpand(item.modeId)}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5 sm:mt-0">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="text-sm sm:text-base font-bold text-white">
                          {item.modeName}
                        </span>

                        {isCheapest && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> MURA
                          </span>
                        )}

                        {isFastest && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5" /> MABILIS
                          </span>
                        )}

                        {item.isVerified ? (
                          <span className="text-[10px] px-1.5 py-0.2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded">
                            Verified
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded">
                            Placeholder
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          Est. {item.estimatedDurationMinutes} mins
                        </span>
                        <span className="capitalize text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded text-[11px]">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fare Display */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                    <div className="text-left sm:text-right">
                      <div className="text-2xl font-black font-mono text-white">
                        ₱{item.totalCost.toFixed(2)}
                      </div>
                      {item.discountAmount > 0 && (
                        <div className="text-[11px] text-emerald-400 font-medium">
                          Nakatipid ng ₱{item.discountAmount.toFixed(2)} (20%)
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      aria-label="Toggle details"
                      className="p-1.5 rounded-lg bg-slate-800/60 text-slate-400 hover:text-white"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details: Assumptions & Official Sources */}
                {isExpanded && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-3 text-xs">
                    {/* Breakdown */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                      <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-sky-400" /> Paliwanag sa Kwenta (Fare Formula)
                      </div>
                      <p className="text-slate-400 font-mono text-[11px] leading-relaxed">
                        {item.breakdownDescription}
                      </p>
                    </div>

                    {/* Legal Source */}
                    <div className="flex items-start gap-2 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-200">Legal Source &amp; Regulatory Order:</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{item.source}</div>
                      </div>
                    </div>

                    {/* Commuter Assumptions */}
                    <div className="flex items-start gap-2 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
                      <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-200">Assumptions &amp; Commuter Experience:</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{item.assumptions}</div>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <div className="max-w-3xl mx-auto px-4 space-y-2">
          <p>
            CommutePH — Open Source Philippine Commute &amp; Fare Engine. Fares are stored dynamically in Turso.
          </p>
          <div className="flex items-center justify-center gap-4 text-slate-400">
            <Link href="/admin" className="hover:text-slate-300 transition">
              Turso Fare Admin
            </Link>
            <span>•</span>
            <a
              href="https://ltfrb.gov.ph"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition inline-flex items-center gap-1"
            >
              LTFRB <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <a
              href="https://dotr.gov.ph"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition inline-flex items-center gap-1"
            >
              DOTr <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
