import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  X,
  Sun,
  Moon,
  Calendar,
  Shield,
  User,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { Logo } from './Logo.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, isAdmin, isBarber } = useAuth();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setLangDropdownOpen(false);
  }, [location.pathname]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('million_lang', lng);
    setLangDropdownOpen(false);
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/barbers', label: t('nav.barbers') },
    { to: '/shop', label: t('nav.shop') },
    { to: '/works', label: t('nav.works') },
    { to: '/contact', label: t('nav.contact') },
  ];

  const currentLangLabel = {
    uz: "O'zbek",
    ru: 'Русский',
    en: 'English',
  }[i18n.language] || "O'zbek";

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-neutral-950/95 dark:bg-[#0a0a0d]/95 backdrop-blur-md shadow-xl border-b border-amber-500/20'
          : 'bg-neutral-950/80 dark:bg-[#0a0a0d]/80 backdrop-blur-sm border-b border-neutral-800/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium tracking-wide transition-colors duration-200 relative py-1 ${
                    isActive
                      ? 'text-amber-400 font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-amber-400'
                      : 'text-neutral-300 hover:text-amber-300'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Controls: Lang, Theme, Login, CTA */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-300 bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 hover:text-amber-400 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentLangLabel}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl py-1 z-50">
                  <button
                    onClick={() => changeLanguage('uz')}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-neutral-800 flex items-center justify-between ${
                      i18n.language === 'uz' ? 'text-amber-400 font-bold' : 'text-neutral-300'
                    }`}
                  >
                    <span>O'zbekcha</span>
                    <span className="text-[10px] text-neutral-500 uppercase">UZ</span>
                  </button>
                  <button
                    onClick={() => changeLanguage('ru')}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-neutral-800 flex items-center justify-between ${
                      i18n.language === 'ru' ? 'text-amber-400 font-bold' : 'text-neutral-300'
                    }`}
                  >
                    <span>Русский</span>
                    <span className="text-[10px] text-neutral-500 uppercase">RU</span>
                  </button>
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-neutral-800 flex items-center justify-between ${
                      i18n.language === 'en' ? 'text-amber-400 font-bold' : 'text-neutral-300'
                    }`}
                  >
                    <span>English</span>
                    <span className="text-[10px] text-neutral-500 uppercase">EN</span>
                  </button>
                </div>
              )}
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
              title="Toggle theme"
              aria-label="Toggle dark/light mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-600" />
              )}
            </button>

            {/* Discrete Admin/Barber Login */}
            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin/dashboard' : '/barber/dashboard'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-400 bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/40 transition-colors"
                title={isAdmin ? 'Administrator Dashboard' : 'Barber Dashboard'}
              >
                {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                <span className="hidden xl:inline">{isAdmin ? 'Admin' : user.name?.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
                title="Barber / Admin Login"
                aria-label="Portal Login"
              >
                <Shield className="w-4 h-4" />
              </Link>
            )}

            {/* Primary Book Appointment Button */}
            <Link
              to="/book"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-neutral-950 hover:opacity-95 shadow-lg shadow-amber-500/20 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Calendar className="w-4 h-4" />
              <span>{t('nav.bookNow')}</span>
            </Link>
          </div>

          {/* Mobile Header Buttons */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            <Link
              to="/book"
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-neutral-950 shadow-md"
            >
              {t('nav.bookNow')}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-amber-400"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-neutral-950/98 border-b border-neutral-800 px-4 pt-3 pb-6 space-y-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between py-2 border-b border-neutral-800">
            <span className="text-xs text-neutral-400">Tilni tanlash / Language</span>
            <div className="flex gap-2">
              <button
                onClick={() => changeLanguage('uz')}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  i18n.language === 'uz' ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                UZ
              </button>
              <button
                onClick={() => changeLanguage('ru')}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  i18n.language === 'ru' ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                RU
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  i18n.language === 'en' ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/30'
                      : 'text-neutral-300 hover:bg-neutral-900 hover:text-amber-300'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="pt-2 border-t border-neutral-800 flex flex-col gap-2">
            <Link
              to="/book"
              className="w-full text-center py-3 rounded-lg font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 shadow-lg"
            >
              {t('nav.bookNow')}
            </Link>

            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin/dashboard' : '/barber/dashboard'}
                className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-amber-400 bg-neutral-900 border border-neutral-800"
              >
                {isAdmin ? 'Admin Dashboard' : 'Barber Dashboard'}
              </Link>
            ) : (
              <Link
                to="/login"
                className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-neutral-400 hover:text-amber-400 bg-neutral-900/50"
              >
                Barber / Admin Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
