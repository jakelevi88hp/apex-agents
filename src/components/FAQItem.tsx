'use client';

import { useState } from 'react';

export default function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        aria-expanded={open}
      >
        <span className="font-semibold text-white group-hover:text-purple-300 transition-colors">
          {q}
        </span>
        <span
          className={`flex-shrink-0 text-purple-400 text-lg leading-none transition-transform duration-200 ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {open && (
        <p className="pb-5 text-gray-400 text-sm leading-relaxed pr-8">{a}</p>
      )}
    </div>
  );
}
