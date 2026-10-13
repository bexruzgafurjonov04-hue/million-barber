import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Scissors,
  Calendar,
  Sparkles,
  ShieldCheck,
  Coffee,
  Award,
  ChevronRight,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import api from '../api/axios.js';
import { TashkentClock } from '../components/TashkentClock.jsx';
import { Lightbox } from '../components/Lightbox.jsx';

export const Home = () => {
  const { t, i18n } = useTranslation();
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [shopImages, setShopImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barbersRes, servicesRes, portRes, shopRes] = await Promise.all([
          api.get('/barbers'),
          api.get('/services'),
          api.get('/portfolio?limit=6'),
          api.get('/shop/info'),
        ]);

        if (barbersRes.data?.barbers) setBarbers(barbersRes.data.barbers.slice(0, 3));
        if (servicesRes.data?.services) setServices(servicesRes.data.services.slice(0, 4));
        if (portRes.data?.portfolio) setPortfolio(portRes.data.portfolio);
        if (shopRes.data?.shopImages) setShopImages(shopRes.data.shopImages);
        if (shopRes.data?.reviews) setReviews(shopRes.data.reviews);
      } catch (err) {
        console.error('Home data load error:', err);
      }
    };

    fetchData();
  }, []);

  const getLocalized = (item, prefix) => {
    const lang = i18n.language;
    if (lang === 'ru') return item?.[`${prefix}Ru`] || item?.[`${prefix}Uz`] || '';
    if (lang === 'en') return item?.[`${prefix}En`] || item?.[`${prefix}Uz`] || '';
    return item?.[`${prefix}Uz`] || '';
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-neutral-950">
        {/* Background Image with luxury dark gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-bg.png"
            alt="MILLION BARBER Luxury Interior"
            className="w-full h-full object-cover object-center opacity-30 transform scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-6 shadow-lg shadow-amber-500/10">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t('hero.badge')}</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase leading-none mb-6">
            MILLION <span className="text-gold-gradient">BARBER</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl text-base sm:text-lg md:text-xl text-neutral-300 font-light leading-relaxed mb-10">
            {t('hero.subtitle')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              to="/book"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-neutral-950 hover:shadow-xl hover:shadow-amber-500/30 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Calendar className="w-5 h-5 text-neutral-950" />
              <span>{t('hero.ctaBook')}</span>
            </Link>

            <Link
              to="/barbers"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-neutral-200 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/80 hover:border-amber-500/50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>{t('hero.ctaBarbers')}</span>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 mt-16 pt-10 border-t border-neutral-800/80 w-full max-w-4xl">
            <div>
              <div className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-400">8+</div>
              <div className="text-xs uppercase tracking-wider text-neutral-400 mt-1">{t('hero.statYears')}</div>
            </div>
            <div>
              <div className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-400">100%</div>
              <div className="text-xs uppercase tracking-wider text-neutral-400 mt-1">Steril Standart</div>
            </div>
            <div>
              <div className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-400">5,000+</div>
              <div className="text-xs uppercase tracking-wider text-neutral-400 mt-1">{t('hero.statClients')}</div>
            </div>
            <div>
              <div className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-400 flex items-center justify-center gap-1">
                5.0 <Star className="w-5 h-5 fill-amber-400 text-amber-400 inline" />
              </div>
              <div className="text-xs uppercase tracking-wider text-neutral-400 mt-1">{t('hero.statRating')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SELECTED BARBERS SECTION */}
      <section className="py-20 bg-neutral-900/40 border-y border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
                MILLION BARBER TEAM
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                {t('home.barbersTitle')}
              </h2>
              <p className="text-neutral-400 mt-2 max-w-xl text-sm sm:text-base">
                {t('home.barbersSubtitle')}
              </p>
            </div>
            <Link
              to="/barbers"
              className="mt-4 md:mt-0 inline-flex items-center gap-1 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>Barcha ustalarni ko'rish</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                className="group relative rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-amber-500/10 flex flex-col"
              >
                {/* Photo */}
                <div className="relative h-80 overflow-hidden bg-neutral-900">
                  <img
                    src={barber.avatarUrl || '/images/barber-bobur.jpg'}
                    alt={barber.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                  
                  {/* Experience Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-neutral-700 text-xs font-semibold text-amber-400">
                    {barber.experienceYears} {t('barbers.expYears')}
                  </div>

                  {/* Availability badge */}
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                      ● {t('barbers.availableToday')}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                      {barber.name}
                    </h3>
                    <p className="text-xs text-amber-400/90 font-medium uppercase tracking-wider mt-1">
                      {barber.title}
                    </p>
                    <p className="text-sm text-neutral-400 mt-3 line-clamp-3 leading-relaxed">
                      {getLocalized(barber, 'bio')}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-900 flex items-center justify-between gap-3">
                    <Link
                      to={`/barbers/${barber.slug || barber.id}`}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors"
                    >
                      {t('barbers.viewProfile')}
                    </Link>
                    <Link
                      to={`/book?barber=${barber.id}`}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition-colors shadow-sm"
                    >
                      {t('barbers.bookAppointment')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED SERVICES */}
      <section className="py-20 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
              MEN'S GROOMING
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              {t('shop.servicesTitle')}
            </h2>
            <p className="text-neutral-400 mt-2 text-sm sm:text-base">
              Har bir xizmatimiz eng yuqori sifat, gigiyena va mahorat bilan taqdim etiladi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-serif text-lg font-bold text-white">
                      {getLocalized(srv, 'name')}
                    </h3>
                    <div className="font-mono text-base font-bold text-amber-400 shrink-0">
                      {srv.price?.toLocaleString()} {t('shop.sum')}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
                    {getLocalized(srv, 'description')}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {srv.durationMinutes} {t('shop.duration')}
                  </span>
                  <Link
                    to={`/book?service=${srv.id}`}
                    className="text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    Band Qilish →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-neutral-200 bg-neutral-900 border border-neutral-700 hover:border-amber-400 transition-colors"
            >
              <span>Barcha xizmatlar va narxlarni ko'rish</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE MILLION BARBER */}
      <section className="py-20 bg-neutral-900/30 border-y border-neutral-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
              EXCELLENCE & INTEGRITY
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              {t('home.whyTitle')}
            </h2>
            <p className="text-neutral-400 mt-2 text-sm sm:text-base">
              {t('home.whyDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800/80 hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 border border-amber-500/20">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-2">
                {t('home.why1Title')}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                {t('home.why1Desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800/80 hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 border border-amber-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-2">
                {t('home.why2Title')}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                {t('home.why2Desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800/80 hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 border border-amber-500/20">
                <Coffee className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-2">
                {t('home.why3Title')}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                {t('home.why3Desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800/80 hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 border border-amber-500/20">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-2">
                {t('home.why4Title')}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                {t('home.why4Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SHOP ATMOSPHERE & GALLERY SECTION */}
      <section className="py-20 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
                LUXURY INTERIOR
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                {t('home.shopTitle')}
              </h2>
              <p className="text-neutral-400 mt-2 max-w-xl text-sm sm:text-base">
                {t('home.shopSubtitle')}
              </p>
            </div>
            <Link
              to="/shop"
              className="mt-4 md:mt-0 inline-flex items-center gap-1 text-sm font-semibold text-amber-400 hover:text-amber-300"
            >
              <span>Sartaroshxona haqida to'liq</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="md:col-span-2 relative h-80 md:h-96 rounded-2xl overflow-hidden group cursor-pointer border border-neutral-800"
              onClick={() =>
                setLightboxImage({
                  imageUrl: '/images/shop-interior-1.png',
                  title: 'MILLION BARBER Asosiy zali',
                })
              }
            >
              <img
                src="/images/shop-interior-1.png"
                alt="MILLION BARBER Interior"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                  Chust, Namangan
                </span>
                <h4 className="font-serif text-xl font-bold text-white mt-1">
                  Oliy Darajadagi Zamonaviy Zal
                </h4>
              </div>
            </div>

            <div
              className="relative h-80 md:h-96 rounded-2xl overflow-hidden group cursor-pointer border border-neutral-800"
              onClick={() =>
                setLightboxImage({
                  imageUrl: '/images/shop-interior-2.png',
                  title: 'MILLION BARBER Kreslolar & Jihozlar',
                })
              }
            >
              <img
                src="/images/shop-interior-2.png"
                alt="Barber chairs"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                  Comfort
                </span>
                <h4 className="font-serif text-xl font-bold text-white mt-1">
                  Marmar & Oltin Jihozlar
                </h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. REAL-TIME CLOCK & LOCATION BANNER */}
      <section className="py-12 bg-neutral-900/60 border-y border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
                <MapPin className="w-4 h-4" />
                <span>O'zbekiston, Namangan viloyati, Chust tumani</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                MILLION BARBER Sartaroshxonasi Sizni Kutadi
              </h3>
              <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
                Har kuni soat 09:00 dan 21:00 gacha xizmatingizdamiz. Navbatsiz kelish uchun online vaqtni band qiling.
              </p>
            </div>
            <div>
              <TashkentClock />
            </div>
          </div>
        </div>
      </section>

      {/* 7. REVIEWS SECTION */}
      <section className="py-20 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
              TESTIMONIALS
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              {t('home.reviewsTitle')}
            </h2>
            <p className="text-neutral-400 mt-2 text-sm sm:text-base">
              {t('home.reviewsSubtitle')}
            </p>
            <div className="mt-3 text-xs text-neutral-500 italic">
              ℹ {t('home.sampleNotice')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-neutral-300 text-sm italic leading-relaxed">
                    "{getLocalized(rev, 'comment')}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{rev.authorName}</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[11px]">
                    {rev.isSample ? 'Namuna Sharh / Sample' : 'Tasdiqlangan Mijoz'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FINAL APPOINTMENT CTA BANNER */}
      <section className="relative py-20 bg-gradient-to-b from-neutral-950 via-amber-950/20 to-neutral-950 border-t border-amber-500/20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Scissors className="w-10 h-10 text-amber-400 mx-auto mb-4 rotate-90" />
          <h2 className="font-serif text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            {t('home.ctaBannerTitle')}
          </h2>
          <p className="text-neutral-300 mt-4 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            {t('home.ctaBannerSubtitle')}
          </p>
          <div className="mt-8">
            <Link
              to="/book"
              className="inline-flex items-center gap-3 px-9 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-neutral-950 hover:shadow-2xl hover:shadow-amber-500/40 transform hover:-translate-y-1 transition-all duration-300"
            >
              <Calendar className="w-5 h-5 text-neutral-950" />
              <span>{t('home.ctaBannerBtn')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={!!lightboxImage}
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
};
