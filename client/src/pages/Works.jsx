import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Scissors, ZoomIn, User, Sparkles, Filter } from 'lucide-react';
import api from '../api/axios.js';
import { Lightbox } from '../components/Lightbox.jsx';

export const Works = () => {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      try {
        const query = selectedCategory === 'ALL' ? '' : `?category=${selectedCategory}`;
        const res = await api.get(`/portfolio${query}`);
        if (res.data?.portfolio) {
          setItems(res.data.portfolio);
        }
      } catch (err) {
        console.error('Portfolio fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [selectedCategory]);

  const categories = [
    { key: 'ALL', label: t('works.filterAll') },
    { key: 'FADE', label: t('works.filterFade') },
    { key: 'CLASSIC', label: t('works.filterClassic') },
    { key: 'TEXTURED', label: t('works.filterTextured') },
    { key: 'BEARD', label: t('works.filterBeard') },
    { key: 'OTHER', label: t('works.filterOther') },
  ];

  const getLocalizedTitle = (item) => {
    const lang = i18n.language;
    if (lang === 'ru') return item.titleRu || item.titleUz;
    if (lang === 'en') return item.titleEn || item.titleUz;
    return item.titleUz;
  };

  return (
    <div className="py-16 sm:py-24 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Barber Portfolio</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            {t('works.title')}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-400 leading-relaxed">
            {t('works.subtitle')}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-14">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                selectedCategory === cat.key
                  ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                  : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-amber-500/50 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        {loading ? (
          <div className="py-24 flex justify-center">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/30 rounded-3xl border border-neutral-800 max-w-md mx-auto">
            <Scissors className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-400 text-sm">{t('barbers.noBarbersFound')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 transition-all duration-300 shadow-xl flex flex-col"
              >
                {/* Image */}
                <div
                  className="relative h-80 overflow-hidden cursor-pointer"
                  onClick={() =>
                    setLightboxImage({
                      imageUrl: item.imageUrl,
                      title: getLocalizedTitle(item),
                      barberName: item.barberName,
                    })
                  }
                >
                  <img
                    src={item.imageUrl}
                    alt={getLocalizedTitle(item) || 'Haircut'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                  {/* Category Pill */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-neutral-700 text-xs font-semibold text-amber-400">
                    {item.category}
                  </div>

                  <div className="absolute top-4 right-4 p-2 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>

                {/* Footer details */}
                <div className="p-5 bg-neutral-950 flex items-center justify-between border-t border-neutral-850">
                  <div>
                    <h3 className="font-serif text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                      {getLocalizedTitle(item)}
                    </h3>
                    <Link
                      to={`/barbers/${item.barberSlug || item.barberId}`}
                      className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-400 mt-1 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <span>{item.barberName}</span>
                    </Link>
                  </div>

                  <Link
                    to={`/book?barber=${item.barberId}`}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-black transition-all"
                  >
                    {t('barbers.bookAppointment')}
                  </Link>
                </div>
              </div>
            ))}
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
