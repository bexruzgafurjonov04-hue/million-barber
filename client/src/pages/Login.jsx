import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Lock, Mail, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Logo } from '../components/Logo.jsx';

export const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, changePassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Force password change state
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const loggedInUser = await login(email.trim(), password);
      if (loggedInUser.forcePasswordChange) {
        setNeedsPasswordChange(true);
        setCurrentPassword(password);
      } else {
        if (loggedInUser.role === 'ADMIN') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/barber/dashboard', { replace: true });
        }
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.error || 'Kirishda xatolik yuz berdi. Email va parolni tekshiring.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Yangi parol kamida 6 belgidan iborat bo\'lishi shart.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Yangi parollar bir-biriga mos kelmadi.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordChangeSuccess(true);
      setTimeout(() => {
        navigate('/admin/dashboard', { replace: true });
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Parolni yangilashda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-950">
      <div className="max-w-md w-full space-y-8 p-8 sm:p-10 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <Logo size="large" />
          <h2 className="mt-6 font-serif text-2xl sm:text-3xl font-bold text-white">
            {needsPasswordChange ? t('auth.forceChangeTitle') : t('auth.loginTitle')}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-400">
            {needsPasswordChange ? t('auth.forceChangeDesc') : t('auth.loginSubtitle')}
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {passwordChangeSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Parol muvaffaqiyatli o'zgartirildi! Dashboardga yo'naltirilmoqda...</span>
          </div>
        )}

        {/* Force Password Change Form */}
        {needsPasswordChange ? (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                {t('auth.currentPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                {t('auth.newPassword')}
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kamida 6 belgi"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                {t('auth.confirmNewPassword')}
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-black transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? 'Saqlanmoqda...' : t('auth.savePasswordBtn')}
            </button>
          </form>
        ) : (
          /* Normal Login Form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@millionbarber.uz"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-neutral-950 hover:opacity-95 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? 'Tekshirilmoqda...' : t('auth.loginBtn')}
            </button>

            <div className="pt-4 text-center border-t border-neutral-800">
              <Link to="/" className="text-xs text-neutral-400 hover:text-amber-400">
                ← Bosh sahifaga qaytish
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
