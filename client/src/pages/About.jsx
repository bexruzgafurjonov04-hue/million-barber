import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Award,
  Sparkles,
  Users,
  CheckCircle2,
  Calendar,
  ArrowRight,
} from 'lucide-react';

export const About = () => {
  const { t } = useTranslation();

  return (
    <div className="py-16 sm:py-24 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('about.badge')}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            {t('about.title')}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-400 leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-6 border-l-4 border-amber-400 pl-4">
              {t('about.storyTitle')}
            </h2>
            <div className="space-y-4 text-neutral-300 text-sm sm:text-base leading-relaxed">
              <p>{t('about.storyP1')}</p>
              <p>{t('about.storyP2')}</p>
              <p>{t('about.storyP3')}</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/barbers"
                className="px-6 py-3 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-black transition-colors flex items-center gap-2"
              >
                <span>{t('about.ctaBarbers')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/book"
                className="px-6 py-3 rounded-xl text-sm font-semibold text-neutral-200 bg-neutral-900 border border-neutral-700 hover:border-amber-400 transition-colors"
              >
                {t('about.ctaBook')}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">
              <img
                src="/images/shop-interior-2.png"
                alt="MILLION BARBER Interior"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
            </div>
          </div>
        </div>

        {/* Hygiene and Sterilization Standards */}
        <div className="rounded-3xl bg-neutral-900/60 border border-neutral-800 p-8 sm:p-12 mb-20">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              {t('about.hygieneTitle')}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-neutral-400">
              {t('about.hygieneSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800/80">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-3" />
              <h3 className="font-serif text-lg font-bold text-white mb-2">{t('about.hygiene1Title')}</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                {t('about.hygiene1Desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800/80">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-3" />
              <h3 className="font-serif text-lg font-bold text-white mb-2">{t('about.hygiene2Title')}</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                {t('about.hygiene2Desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800/80">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-3" />
              <h3 className="font-serif text-lg font-bold text-white mb-2">{t('about.hygiene3Title')}</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                {t('about.hygiene3Desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Shop Atmosphere Photo Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative h-72 rounded-2xl overflow-hidden border border-neutral-800">
            <img
              src="/images/shop-interior-1.png"
              alt="Shop Main Hall"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-6">
              <p className="font-serif text-lg font-bold text-white">MILLION BARBER</p>
              <p className="text-xs text-amber-400">Chust, Namangan</p>
            </div>
          </div>

          <div className="relative h-72 rounded-2xl overflow-hidden border border-neutral-800">
            <img
              src="/images/hero-bg.png"
              alt="Barber Station"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-6">
              <p className="font-serif text-lg font-bold text-white">{t('home.why3Title')}</p>
              <p className="text-xs text-amber-400">{t('home.why3Desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
