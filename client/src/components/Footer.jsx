import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Clock, Send, Shield } from 'lucide-react';
import { Logo } from './Logo.jsx';
import { InstagramIcon } from './Icons.jsx';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-black text-neutral-400 border-t border-neutral-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <Logo size="large" />
            <p className="text-sm text-neutral-400 leading-relaxed pr-4">
              {t('hero.subtitle')}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com/millionbarber_chust"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center text-neutral-300 hover:text-amber-400 hover:bg-neutral-800 transition-colors border border-neutral-800"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href="https://t.me/millionbarber_chust"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center text-neutral-300 hover:text-amber-400 hover:bg-neutral-800 transition-colors border border-neutral-800"
                aria-label="Telegram"
              >
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="font-serif text-base font-bold text-neutral-100 uppercase tracking-wider mb-4 border-l-2 border-amber-400 pl-3">
              Sahifalar / Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-400 transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/barbers" className="hover:text-amber-400 transition-colors">
                  {t('nav.barbers')}
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-amber-400 transition-colors">
                  {t('nav.shop')}
                </Link>
              </li>
              <li>
                <Link to="/works" className="hover:text-amber-400 transition-colors">
                  {t('nav.works')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-400 transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                <Link to="/book" className="text-amber-400 font-semibold hover:underline">
                  {t('nav.bookNow')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Hours */}
          <div>
            <h3 className="font-serif text-base font-bold text-neutral-100 uppercase tracking-wider mb-4 border-l-2 border-amber-400 pl-3">
              Manzil & Ish Vaqti
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span>Chust tumani, Namangan viloyati, O'zbekiston</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-400 shrink-0" />
                <a href="tel:+998901234567" className="hover:text-amber-300">
                  +998 90 123 45 67
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Har kuni: 09:00 - 21:00</span>
              </div>
            </div>
          </div>

          {/* Col 4: Booking & Management */}
          <div>
            <h3 className="font-serif text-base font-bold text-neutral-100 uppercase tracking-wider mb-4 border-l-2 border-amber-400 pl-3">
              Online Navbat
            </h3>
            <p className="text-sm text-neutral-400 mb-4">
              Usta va vaqtni tanlang, hech qanday to'siqsiz oldindan navbatga yoziling.
            </p>
            <Link
              to="/book"
              className="inline-block w-full text-center px-4 py-2.5 rounded-lg text-sm font-bold bg-amber-500 hover:bg-amber-400 text-black transition-colors shadow-md"
            >
              {t('nav.bookNow')}
            </Link>
            <div className="mt-4 pt-4 border-t border-neutral-900 flex items-center justify-between">
              <Link
                to="/login"
                className="text-xs text-neutral-500 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Usta / Admin Kirish</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© 2026 MILLION BARBER. Barcha huquqlar himoyalangan.</p>
          <p className="flex items-center gap-2">
            <span>Chust, Namangan</span>
            <span>•</span>
            <span className="text-amber-400/80">Premium Barbershop Platform</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
