import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  Award,
  Phone,
  ChevronLeft,
  Scissors,
  CheckCircle2,
  ZoomIn,
} from 'lucide-react';
import api from '../api/axios.js';
import { Lightbox } from '../components/Lightbox.jsx';
import { InstagramIcon } from '../components/Icons.jsx';

export const BarberProfile = () => {
  const { barberId } = useParams();
  const { t, i18n } = useTranslation();
  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    const fetchBarber = async () => {
      try {
        const res = await api.get(`/barbers/${barberId}`);
        if (res.data?.barber) {
          setBarber(res.data.barber);
        }
      } catch (err) {
        console.error('Barber profile load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBarber();
  }, [barberId]);

  if (loading) {
    return (
      <div className="py-32 flex justify-center bg-neutral-950 min-h-screen">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="py-32 text-center bg-neutral-950 min-h-screen text-white">
        <h2 className="text-2xl font-serif">Barber topilmadi / Barber not found</h2>
        <Link to="/barbers" className="mt-4 inline-block text-amber-400 underline">
          Ustalar ro'yxatiga qaytish
        </Link>
      </div>
    );
  }

  const getLocalizedBio = () => {
    const lang = i18n.language;
    if (lang === 'ru') return barber.bioRu || barber.bioUz;
    if (lang === 'en') return barber.bioEn || barber.bioUz;
    return barber.bioUz;
  };

  const daysOfWeekMap = {
    uz: ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'],
    ru: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  };

  const currentDaysList = daysOfWeekMap[i18n.language] || daysOfWeekMap.uz;

  return (
    <div className="py-12 sm:py-20 bg-neutral-950 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/barbers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-amber-400 mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t('profile.back')}</span>
        </Link>

        {/* Profile Header Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start mb-16">
          {/* Avatar Col */}
          <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl">
            <img
              src={barber.avatarUrl || '/images/barber-bobur.jpg'}
              alt={barber.name}
              className="w-full h-96 object-cover object-top"
            />
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-neutral-700 text-xs font-semibold text-amber-400">
              {barber.experienceYears} {t('barbers.expYears')}
            </div>
          </div>

          {/* Info Col */}
          <div className="md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {barber.title}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  barber.isAcceptingBookings
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-950/80 text-rose-400 border-rose-500/30'
                }`}>
                  ● {barber.isAcceptingBookings ? t('profile.available') : t('profile.notAvailable')}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-white">
                {barber.name}
              </h1>

              {/* Bio */}
              <div className="mt-6 text-neutral-300 text-sm sm:text-base leading-relaxed bg-neutral-900/40 p-6 rounded-2xl border border-neutral-800/80">
                <h3 className="font-serif text-base font-bold text-amber-400 uppercase tracking-wider mb-2">
                  {t('profile.about')}
                </h3>
                <p>{getLocalizedBio()}</p>
              </div>

              {/* Specialties */}
              {barber.specialties && (
                <div className="mt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                    {t('profile.specialties')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {barber.specialties.split(',').map((spec, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 font-medium"
                      >
                        ✓ {spec.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact info if public */}
              <div className="mt-6 flex flex-wrap gap-4 text-xs text-neutral-400">
                {barber.phone && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>{barber.phone}</span>
                  </div>
                )}
                {barber.instagram && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <InstagramIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>@{barber.instagram}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action CTA */}
            <div className="mt-8 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row gap-4 items-center">
              <Link
                to={`/book?barber=${barber.id}`}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-neutral-950 shadow-xl shadow-amber-500/20 hover:opacity-95 transition-all text-center"
              >
                {t('profile.bookWithBarber')}
              </Link>
            </div>
          </div>
        </div>

        {/* Working Hours Schedule */}
        <div className="rounded-3xl bg-neutral-900/50 border border-neutral-800 p-8 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-amber-400" />
            <h3 className="font-serif text-2xl font-bold text-white">{t('profile.schedule')}</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
            {barber.schedules?.map((sched) => (
              <div
                key={sched.id}
                className={`p-3.5 rounded-xl border text-center ${
                  sched.isWorking
                    ? 'bg-neutral-950 border-neutral-800'
                    : 'bg-neutral-950/40 border-neutral-900 opacity-50'
                }`}
              >
                <div className="text-xs font-bold text-amber-400 mb-1">
                  {currentDaysList[sched.dayOfWeek]}
                </div>
                {sched.isWorking ? (
                  <>
                    <div className="text-xs font-mono font-bold text-white">
                      {sched.startTime} - {sched.endTime}
                    </div>
                    {sched.breakStartTime && (
                      <div className="text-[10px] text-neutral-500 mt-1">
                        {t('profile.break')} {sched.breakStartTime}-{sched.breakEndTime}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-neutral-500 font-semibold">{t('barber.dayOff')}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Barber's Completed Haircut Portfolio */}
        {barber.portfolio && barber.portfolio.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  {barber.name} — {t('profile.sampleWorks')}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  Usta tomonidan bajarilgan haqiqiy soch va soqol turmaklari
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {barber.portfolio.map((img) => (
                <div
                  key={img.id}
                  onClick={() =>
                    setLightboxImage({
                      imageUrl: img.imageUrl,
                      title: img.titleUz || img.titleRu || img.titleEn,
                      barberName: barber.name,
                    })
                  }
                  className="group relative h-64 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 cursor-pointer shadow-lg transition-all duration-300"
                >
                  <img
                    src={img.imageUrl}
                    alt={img.titleUz || 'Haircut'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        {img.category}
                      </span>
                      <h4 className="text-sm font-semibold text-white">
                        {img.titleUz || img.titleRu || img.titleEn}
                      </h4>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox
        isOpen={!!lightboxImage}
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
};
