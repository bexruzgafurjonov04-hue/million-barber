import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  Sparkles,
  Scissors,
  CheckCircle,
  ZoomIn,
} from 'lucide-react';
import api from '../api/axios.js';
import { Lightbox } from '../components/Lightbox.jsx';

export const Shop = () => {
  const { t, i18n } = useTranslation();
  const [shopData, setShopData] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shopRes, servicesRes] = await Promise.all([
          api.get('/shop/info'),
          api.get('/services'),
        ]);

        if (shopRes.data) setShopData(shopRes.data);
        if (servicesRes.data?.services) setServices(servicesRes.data.services);
      } catch (err) {
        console.error('Shop page data load error:', err);
      } finally {
        setLoading(false);
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

  const settings = shopData?.settings || {};
  const shopImages = shopData?.shopImages || [];

  return (
    <div className="py-16 sm:py-24 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chust, Namangan</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            {t('shop.title')}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-400 leading-relaxed">
            {t('shop.subtitle')}
          </p>
        </div>

        {/* Info Cards Grid: Address, Working Hours, Phone */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                {t('shop.addressTitle')}
              </h3>
              <p className="text-sm font-medium text-white leading-relaxed">
                {getLocalized(settings, 'address') || "Chust tumani, Namangan viloyati, O'zbekiston"}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                {t('shop.hoursTitle')}
              </h3>
              <p className="text-sm font-medium text-white leading-relaxed">
                {getLocalized(settings, 'workingHours') || 'Har kuni: 09:00 - 21:00'}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                {t('shop.phoneTitle')}
              </h3>
              <a
                href={`tel:${settings.phone || '+998901234567'}`}
                className="text-sm font-medium text-white hover:text-amber-400 transition-colors"
              >
                {settings.phone || '+998 90 123 45 67'}
              </a>
            </div>
          </div>
        </div>

        {/* Interior Gallery with Lightbox */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                {t('shop.galleryTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Bizning zalimiz va jihozlarimiz bilan tanishing
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shopImages.map((img) => (
              <div
                key={img.id}
                onClick={() =>
                  setLightboxImage({
                    imageUrl: img.imageUrl,
                    title: getLocalized(img, 'caption'),
                  })
                }
                className="group relative h-72 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 cursor-pointer shadow-xl transition-all"
              >
                <img
                  src={img.imageUrl}
                  alt="Shop Interior"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex items-end p-5">
                  <p className="text-xs font-medium text-white leading-snug">
                    {getLocalized(img, 'caption')}
                  </p>
                </div>
                <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services & Pricing Menu */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-3xl font-bold text-white">
              {t('shop.servicesTitle')}
            </h2>
            <p className="text-neutral-400 text-sm mt-2">
              Barcha narxlar ochiq va shaffof, qo'shimcha yashirin to'lovlarsiz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between"
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
                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {srv.durationMinutes} {t('shop.duration')}
                  </span>
                  <Link
                    to={`/book?service=${srv.id}`}
                    className="font-bold text-amber-400 hover:text-amber-300"
                  >
                    {t('shop.bookService')} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map & Directions Section */}
        <div className="rounded-3xl bg-neutral-900/50 border border-neutral-800 p-8 sm:p-12 mb-16">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
                LOCATION & MAP
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                MILLION BARBER Xaritada
              </h2>
              <p className="text-neutral-400 text-sm mt-1">
                Chust markazida, qulay avtoturargoh va transport qatnovi bilan
              </p>
            </div>

            <a
              href="https://maps.google.com/?q=Chust,+Namangan+Region,+Uzbekistan"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-amber-500/40 hover:border-amber-400 transition-colors shadow-lg"
            >
              <Navigation className="w-4 h-4 text-amber-400" />
              <span>{t('shop.getDirections')}</span>
            </a>
          </div>

          {/* Interactive Map Embed */}
          <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-neutral-800 shadow-xl">
            <iframe
              title="MILLION BARBER Location Map"
              src={
                settings.mapEmbedUrl ||
                'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12093.8427771239!2d71.2291!3d41.0094!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x387ca52b2b1a8d0b%3A0x86b0a1a095f939e6!2sChust%2C%20Namangan%20Region%2C%20Uzbekistan!5e0!3m2!1sen!2s!4v1710000000000!5m2!1sen!2s'
              }
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/book"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-base font-bold bg-amber-500 hover:bg-amber-400 text-black transition-all shadow-xl shadow-amber-500/20"
          >
            <Scissors className="w-5 h-5 text-black" />
            <span>{t('nav.bookNow')}</span>
          </Link>
        </div>
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
