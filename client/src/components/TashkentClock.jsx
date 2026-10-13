import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const TashkentClock = ({ compact = false }) => {
  const { t } = useTranslation();
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format time in Asia/Tashkent
      const timeFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Tashkent',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      const dateFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Tashkent',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const currentFormatted = timeFormatter.format(now);
      setTimeStr(currentFormatted);
      setDateStr(dateFormatter.format(now));

      // Barbershop open from 09:00 to 21:00
      const [hours] = currentFormatted.split(':').map(Number);
      setIsOpen(hours >= 9 && hours < 21);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs font-mono text-neutral-300 bg-neutral-900/80 px-2.5 py-1 rounded-full border border-neutral-800">
        <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>{timeStr || '--:--:--'}</span>
        <span
          className={`w-2 h-2 rounded-full ${
            isOpen ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-rose-500 ring-2 ring-rose-500/20'
          }`}
          title={isOpen ? 'Currently Open' : 'Currently Closed'}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-neutral-900/90 border border-neutral-800/80 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Clock className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="text-xs text-neutral-400 font-medium">
            {t('contact.localClock')} (Asia/Tashkent)
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-amber-300">
            {timeStr || 'Loading...'}
          </div>
          <div className="text-xs text-neutral-400">{dateStr}</div>
        </div>
      </div>

      <div className="mt-3 sm:mt-0 flex items-center gap-2">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
            isOpen
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`}
          />
          {isOpen ? 'Hozir Ochiq / Open' : 'Hozir Yopiq / Closed'}
        </span>
      </div>
    </div>
  );
};
