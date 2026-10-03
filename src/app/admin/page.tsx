'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Save,
  RefreshCw,
  Edit2,
  X,
  Database,
} from 'lucide-react';

interface AdminFareRule {
  id: string;
  name: string;
  category: string;
  baseFare: number;
  baseDistanceKm: number;
  perKmRate: number;
  bookingFee?: number;
  minFare?: number | null;
  maxFare?: number | null;
  perMinuteRate?: number;
  discountEligible: boolean;
  discountPercentage?: number;
  estimatedSpeedKmh: number;
  isVerified: boolean;
  source: string;
  assumptions: string;
  isActive: boolean;
  updatedAt?: string;
}

export default function AdminPage() {
  const [secretInput, setSecretInput] = useState('');
  const [adminSecret, setAdminSecret] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState<AdminFareRule[]>([]);
  const [editingRule, setEditingRule] = useState<AdminFareRule | null>(null);

  const loadRules = React.useCallback(async (secret: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/fares', {
        headers: {
          'x-admin-secret': secret,
        },
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error || 'Authentication failed. Please verify ADMIN_SECRET.');
        setAdminSecret(null);
        sessionStorage.removeItem('admin_secret');
      } else {
        setRules(json.data);
        setAdminSecret(secret);
        sessionStorage.setItem('admin_secret', secret);
      }
    } catch {
      setErrorMsg('Failed to communicate with the fare administration server.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check saved secret from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('admin_secret');
    if (saved) {
      const timer = setTimeout(() => {
        loadRules(saved);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [loadRules]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretInput.trim()) return;
    loadRules(secretInput.trim());
  };

  const handleLogout = () => {
    setAdminSecret(null);
    setRules([]);
    sessionStorage.removeItem('admin_secret');
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule || !adminSecret) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/fares', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify(editingRule),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error || 'Failed to update fare rule.');
      } else {
        setSuccessMsg(`Fare rule "${editingRule.name}" updated successfully!`);
        setEditingRule(null);
        loadRules(adminSecret);
      }
    } catch {
      setErrorMsg('Network error while saving changes.');
    } finally {
      setLoading(false);
    }
  };

  // If not authenticated, render login gate
  if (!adminSecret) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CommutePH Admin Portal</h1>
              <p className="text-xs text-slate-400">Turso Fare Database Management</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-6">
            This administration panel directly manages regulated fare data and formulas in the Turso
            database. Enter your <code className="text-sky-400 bg-slate-800 px-1 py-0.5 rounded">ADMIN_SECRET</code> to proceed.
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                ADMIN_SECRET Key
              </label>
              <input
                type="password"
                value={secretInput}
                onChange={(e) => setSecretInput(e.target.value)}
                placeholder="Enter ADMIN_SECRET..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-medium rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Authenticate & Access
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Commuter App
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const verifiedCount = rules.filter((r) => r.isVerified).length;
  const placeholderCount = rules.filter((r) => !r.isVerified).length;

  return (
    <main className="min-h-screen bg-slate-950 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">Turso Fare Database Admin</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
                  Authenticated
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live NCR transit fare rates, regulations, and placeholders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> App UI
            </Link>
            <button
              onClick={() => adminSecret && loadRules(adminSecret)}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition flex items-center gap-1.5"
              title="Refresh DB Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl border border-rose-500/20 transition"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Stats Strip */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block mb-1">Total Modes</span>
            <span className="text-2xl font-bold text-white">{rules.length}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block mb-1">Verified LTFRB/DOTr</span>
            <span className="text-2xl font-bold text-emerald-400">{verifiedCount}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block mb-1">Placeholders/Estimates</span>
            <span className="text-2xl font-bold text-amber-400">{placeholderCount}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block mb-1">Storage Engine</span>
            <span className="text-sm font-semibold text-sky-400 flex items-center gap-1 mt-1">
              <Database className="w-4 h-4" /> Turso / LibSQL
            </span>
          </div>
        </section>

        {successMsg && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-rose-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Fares Table */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Transit Fare Configurations</h2>
              <p className="text-xs text-slate-400">Strict rule: All prices reside in Turso database</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/50 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Mode / ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Base Fare</th>
                  <th className="py-3 px-4">Per Km</th>
                  <th className="py-3 px-4">Speed</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-medium text-white">
                      <div>{rule.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{rule.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                        {rule.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                      ₱{rule.baseFare.toFixed(2)}{' '}
                      <span className="text-slate-400 text-xs">({rule.baseDistanceKm}km)</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                      ₱{rule.perKmRate.toFixed(2)}/km
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {rule.estimatedSpeedKmh} km/h
                    </td>
                    <td className="py-3.5 px-4">
                      {rule.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[11px]">
                          <AlertTriangle className="w-3 h-3" /> Placeholder
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs max-w-[200px] truncate" title={rule.source}>
                      {rule.source}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setEditingRule({ ...rule })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 rounded-lg text-xs font-medium transition"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Modal for Editing Fare Rule */}
        {editingRule && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">Edit Transit Rule: {editingRule.name}</h3>
                  <p className="text-xs text-slate-400">ID: {editingRule.id}</p>
                </div>
                <button
                  onClick={() => setEditingRule(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveRule} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={editingRule.name}
                      onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Category</label>
                    <select
                      value={editingRule.category}
                      onChange={(e) => setEditingRule({ ...editingRule, category: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="jeepney">Jeepney</option>
                      <option value="bus">Bus</option>
                      <option value="rail">Rail</option>
                      <option value="uv">UV Express</option>
                      <option value="ride_hail">Ride Hail / Taxi</option>
                      <option value="tricycle">Tricycle</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Base Fare (₱)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingRule.baseFare}
                      onChange={(e) =>
                        setEditingRule({ ...editingRule, baseFare: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Base Dist. (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingRule.baseDistanceKm}
                      onChange={(e) =>
                        setEditingRule({
                          ...editingRule,
                          baseDistanceKm: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Per Km Rate (₱)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingRule.perKmRate}
                      onChange={(e) =>
                        setEditingRule({
                          ...editingRule,
                          perKmRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Avg Speed (km/h)</label>
                    <input
                      type="number"
                      step="1"
                      value={editingRule.estimatedSpeedKmh}
                      onChange={(e) =>
                        setEditingRule({
                          ...editingRule,
                          estimatedSpeedKmh: parseFloat(e.target.value) || 20,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Booking / Fee (₱)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={editingRule.bookingFee ?? 0}
                      onChange={(e) =>
                        setEditingRule({
                          ...editingRule,
                          bookingFee: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Min Fare (₱)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={editingRule.minFare ?? ''}
                      onChange={(e) =>
                        setEditingRule({
                          ...editingRule,
                          minFare: e.target.value ? parseFloat(e.target.value) : null,
                        })
                      }
                      placeholder="None"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Max Fare Cap (₱)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={editingRule.maxFare ?? ''}
                      onChange={(e) =>
                        setEditingRule({
                          ...editingRule,
                          maxFare: e.target.value ? parseFloat(e.target.value) : null,
                        })
                      }
                      placeholder="No Cap"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Official Legal Source</label>
                    <input
                      type="text"
                      value={editingRule.source}
                      onChange={(e) => setEditingRule({ ...editingRule, source: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Assumptions & Commuter Notes</label>
                    <textarea
                      rows={2}
                      value={editingRule.assumptions}
                      onChange={(e) => setEditingRule({ ...editingRule, assumptions: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={editingRule.discountEligible}
                      onChange={(e) =>
                        setEditingRule({ ...editingRule, discountEligible: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 bg-slate-950 border-slate-700"
                    />
                    <span>20% Discount Eligible (Student/Senior/PWD)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={editingRule.isVerified}
                      onChange={(e) =>
                        setEditingRule({ ...editingRule, isVerified: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-950 border-slate-700"
                    />
                    <span>Verified Government Rate (LTFRB/DOTr)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={editingRule.isActive}
                      onChange={(e) =>
                        setEditingRule({ ...editingRule, isActive: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 bg-slate-950 border-slate-700"
                    />
                    <span>Active in Public Comparison</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingRule(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Save to Turso DB
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
