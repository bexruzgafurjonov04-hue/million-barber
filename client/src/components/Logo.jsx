import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';

export const Logo = ({ size = 'normal', showSubtitle = true }) => {
  const isLarge = size === 'large';

  return (
    <Link to="/" className="flex items-center gap-3 group select-none">
      {/* MB Monogram Emblem */}
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-amber-500/40 group-hover:border-amber-400 transition-all duration-300 shadow-md ${
          isLarge ? 'w-13 h-13' : 'w-10 h-10'
        }`}
      >
        <span
          className={`font-serif font-black tracking-tighter text-gold-gradient ${
            isLarge ? 'text-2xl' : 'text-lg'
          }`}
        >
          MB
        </span>
        <Scissors
          className={`absolute -bottom-1 -right-1 text-amber-400 rotate-45 transform group-hover:rotate-90 transition-transform duration-300 ${
            isLarge ? 'w-4 h-4' : 'w-3 h-3'
          }`}
        />
      </div>

      {/* Wordmark */}
      <div className="flex flex-col">
        <span
          className={`font-serif tracking-wider font-extrabold uppercase transition-colors text-slate-100 group-hover:text-amber-400 ${
            isLarge ? 'text-xl' : 'text-base sm:text-lg'
          }`}
        >
          MILLION <span className="text-amber-400">BARBER</span>
        </span>
        {showSubtitle && (
          <span className="text-[10px] tracking-[0.25em] text-neutral-400 uppercase font-medium">
            Chust • Namangan
          </span>
        )}
      </div>
    </Link>
  );
};
