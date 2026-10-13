import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Calendar, ChevronRight, Star, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/axios.js';

export const Barbers = () => {
  const { t, i18n } = useTranslation();
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const res = await api.get('/barbers');
        if (res.data?.barbers) {
          setBarbers(res.data.barbers);
        }
      } catch (err) {
        console.error('Fetch barbers error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBarbers();
  }, []);

  const getLocalizedBio = (barber) => {
    const lang = i18n.language;
    if (lang === 'ru') return barber.bioRu || barber.bioUz;
    if (lang === 'en') return barber.bioEn || barber.bioUz;
    return barber.bioUz;
  };

  const filteredBarbers = barbers.filter((b) => {
    const matchName =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.specialties.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (availabilityFilter === 'AVAILABLE') {
      return matchName && b.todayAvailability === 'available';
    }
    return matchName;
  });

  return (
    <div className="py-16 sm:py-20 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
            MASTER ARTISANS
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            {t('barbers.title')}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-400 leading-relaxed">
            {t('barbers.subtitle')}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="max-w-2xl mx-auto mb-14 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('barbers.searchPlaceholder')}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-sm transition-colors"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setAvailabilityFilter('ALL')}
              className={`px-4 py-3 rounded-xl text-xs font-semibold transition-colors flex-1 sm:flex-initial ${
                availabilityFilter === 'ALL'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {t('barbers.filterAll')}
            </button>
            <button
              onClick={() => setAvailabilityFilter('AVAILABLE')}
              className={`px-4 py-3 rounded-xl text-xs font-semibold transition-colors flex-1 sm:flex-initial ${
                availabilityFilter === 'AVAILABLE'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {t('barbers.availableToday')}
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredBarbers.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/30 rounded-2xl border border-neutral-800 max-w-lg mx-auto">
            <AlertCircle className="w-10 h-10 text-neutral-500 mx-auto mb-3" />
            <p className="text-neutral-400 text-sm">{t('barbers.noBarbersFound')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {filteredBarbers.map((barber) => (
              <div
                key={barber.id}
                className="group rounded-3xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/50 transition-all duration-300 overflow-hidden shadow-xl flex flex-col sm:flex-row"
              >
                {/* Photo */}
                <div className="sm:w-1/2 relative min-h-[300px] overflow-hidden bg-neutral-950">
                  <img
                    src={barber.avatarUrl || '/images/barber-bobur.jpg'}
                    alt={barber.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-neutral-700 text-xs font-semibold text-amber-400">
                    {barber.experienceYears} {t('barbers.expYears')}
                  </div>
                </div>

                {/* Details */}
                <div className="sm:w-1/2 p-6 flex flex-col justify-between">
                  <div>
                    {/* Availability status badge */}
                    <div className="mb-2">
                      {barber.todayAvailability === 'available' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {t('barbers.availableToday')}
                        </span>
                      ) : barber.todayAvailability === 'off_today' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-neutral-800 text-neutral-400">
                          {t('barbers.offToday')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/30">
                          {t('barbers.fullyBooked')}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
                      {barber.name}
                    </h3>
                    <p className="text-xs text-amber-400/90 font-medium uppercase tracking-wider mt-1">
                      {barber.title}
                    </p>

                    <p className="text-xs sm:text-sm text-neutral-400 mt-3 line-clamp-3 leading-relaxed">
                      {getLocalizedBio(barber)}
                    </p>

                    {barber.specialties && (
                      <div className="mt-4 pt-3 border-t border-neutral-800">
                        <div className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5 font-bold">
                          {t('barbers.specialties')}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {barber.specialties.split(',').map((spec, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300"
                            >
                              {spec.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center gap-3">
                    <Link
                      to={`/barbers/${barber.slug || barber.id}`}
                      className="flex-1 text-center py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 transition-colors"
                    >
                      {t('barbers.viewProfile')}
                    </Link>
                    <Link
                      to={`/book?barber=${barber.id}`}
                      className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition-colors shadow-md"
                    >
                      {t('barbers.bookAppointment')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
