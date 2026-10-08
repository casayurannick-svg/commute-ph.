'use client';

import React from 'react';
import { Coffee } from 'lucide-react';

export default function BuyMeCoffeeButton() {
  return (
    <a
      href="https://buymeacoffee.com"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition shadow-sm"
    >
      <Coffee className="w-4 h-4 text-amber-400" />
      <span>Buy Me a Coffee</span>
    </a>
  );
}
