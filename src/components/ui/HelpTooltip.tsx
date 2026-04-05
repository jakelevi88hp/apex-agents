'use client';
import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export default function HelpTooltip({ text, position = 'top', className = '' }: HelpTooltipProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setVisible(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <span ref={ref} className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible((v) => !v)}
        className="text-gray-500 hover:text-purple-400 transition-colors focus:outline-none"
        aria-label="Help"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {visible && (
        <div
          className={`absolute z-50 w-64 px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-xs text-gray-300 leading-relaxed shadow-xl pointer-events-none ${positionClasses[position]}`}
        >
          {text}
          <div className={`absolute w-2 h-2 bg-gray-900 border-gray-600 rotate-45 ${
            position === 'top' ? 'border-b border-r -bottom-1 left-1/2 -translate-x-1/2' :
            position === 'bottom' ? 'border-t border-l -top-1 left-1/2 -translate-x-1/2' :
            position === 'left' ? 'border-t border-r -right-1 top-1/2 -translate-y-1/2' :
            'border-b border-l -left-1 top-1/2 -translate-y-1/2'
          }`} />
        </div>
      )}
    </span>
  );
}
