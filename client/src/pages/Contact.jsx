import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Phone,
  Clock,
  Send,
  Mail,
  Navigation,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import api from '../api/axios.js';
import { TashkentClock } from '../components/TashkentClock.jsx';
import { InstagramIcon } from '../components/Icons.jsx';

export const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await api.post('/contact', formData);
      setSubmitted(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      setErrorMessage(
        err.response?.data?.error || 'Xabar yuborishda xatolik yuz berdi. Qaytadan urinib ko\'ring.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 sm:py-24 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
            GET IN TOUCH
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            {t('contact.title')}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-400 leading-relaxed">
            {t('contact.subtitle')}
          </p>
        </div>

        {/* Real-time Clock Banner */}
        <div className="max-w-4xl mx-auto mb-16">
          <TashkentClock />
        </div>

        {/* Main Grid: Info + Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
          {/* Left Info Column */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <h3 className="font-serif text-xl font-bold text-white mb-6 border-l-2 border-amber-400 pl-3">
                Aloqa Ma'lumotlari
              </h3>

              <div className="space-y-4 text-sm text-neutral-300">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-neutral-400 block mb-0.5">
                      Manzil
                    </span>
                    <span className="font-medium">Chust tumani, Namangan viloyati, O'zbekiston</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-neutral-400 block mb-0.5">
                      Telefon
                    </span>
                    <a
                      href="tel:+998901234567"
                      className="font-medium text-amber-300 hover:underline"
                    >
                      +998 90 123 45 67
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-neutral-400 block mb-0.5">
                      Ish Vaqti
                    </span>
                    <span className="font-medium">Har kuni: 09:00 - 21:00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <h3 className="font-serif text-lg font-bold text-white mb-4 border-l-2 border-amber-400 pl-3">
                {t('contact.socialLinks')}
              </h3>
              <div className="flex items-center gap-4">
                <a
                  href="https://instagram.com/millionbarber_chust"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 hover:text-amber-400 hover:border-amber-500/40 transition-colors text-xs font-semibold"
                >
                  <InstagramIcon className="w-4 h-4 text-pink-500" />
                  <span>Instagram</span>
                </a>
                <a
                  href="https://t.me/millionbarber_chust"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 hover:text-amber-400 hover:border-amber-500/40 transition-colors text-xs font-semibold"
                >
                  <Send className="w-4 h-4 text-sky-400" />
                  <span>Telegram</span>
                </a>
              </div>
            </div>

            {/* Map preview */}
            <div className="rounded-2xl overflow-hidden border border-neutral-800 h-52 relative">
              <iframe
                title="Mini Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12093.8427771239!2d71.2291!3d41.0094!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x387ca52b2b1a8d0b%3A0x86b0a1a095f939e6!2sChust%2C%20Namangan%20Region%2C%20Uzbekistan!5e0!3m2!1sen!2s!4v1710000000000!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                loading="lazy"
              />
            </div>
          </div>

          {/* Right Form Column */}
          <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl">
            <h3 className="font-serif text-2xl font-bold text-white mb-2">
              Bizga Xabar Qoldiring
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              Savolingiz yoki taklifingiz bormi? Quyidagi formani to'ldiring.
            </p>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center animate-in fade-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h4 className="font-serif text-lg font-bold text-white">
                  Xabaringiz Qabul Qilindi!
                </h4>
                <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                  {t('contact.successMsg')}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-5 px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                >
                  Yana boshqa xabar yozish
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    {t('contact.formName')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Masalan: Sardor Rahimov"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 text-sm transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      {t('contact.formPhone')} *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+998 90 123 45 67"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 text-sm transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      {t('contact.formEmail')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@mail.com"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 text-sm transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    {t('contact.formSubject')}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Savol yoki taklif"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 text-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    {t('contact.formMessage')} *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Xabaringizni bu yerga yozing..."
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 text-sm transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:opacity-95 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? t('contact.submitting') : t('contact.submitBtn')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
