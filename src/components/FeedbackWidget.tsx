'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Pakilagay ang pamagat at paglalarawan ng iyong feedback.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setSuccess(true);
        setTitle('');
        setDescription('');
        setTimeout(() => {
          setSuccess(false);
          setIsOpen(false);
        }, 2000);
      } else {
        setError(json.error || 'Hindi maipasa ang feedback. Pakisubukan ulit.');
      }
    } catch (err) {
      console.error('Feedback submit error:', err);
      setError('May problemang naganap habang kumokonekta sa server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition shadow-md"
      >
        <MessageSquare className="w-4 h-4 text-sky-400" />
        <span>Magpadala ng Feedback</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-400" />
                <h2 className="text-base font-bold text-white">Magpadala ng Feedback / Bug Report</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {success ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <p className="text-sm font-bold text-white">Maraming Salamat!</p>
                <p className="text-xs text-slate-400">Naipasa na ang iyong feedback bilang GitHub Issue.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Pamagat (Title)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Mali ang pamasahe sa LRT-1 o kulang ang UV route"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Paglalarawan (Description)
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ipalwanag nang mas detalyado ang iyong punto o rekomendasyon..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    Kanselahin
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>I-submit</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
