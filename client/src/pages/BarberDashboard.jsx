import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  Calendar,
  Clock,
  Image,
  KeyRound,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Trash2,
  Plus,
  Save,
  LogOut,
} from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export const BarberDashboard = () => {
  const { t, i18n } = useTranslation();
  const { user, logout, changePassword } = useAuth();

  const [activeTab, setActiveTab] = useState('bookings'); // bookings | profile | schedule | blocked | portfolio | password
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Data states
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [portfolio, setPortfolio] = useState([]);

  // Profile Form state
  const [profName, setProfName] = useState('');
  const [profTitle, setProfTitle] = useState('');
  const [profBioUz, setProfBioUz] = useState('');
  const [profBioRu, setProfBioRu] = useState('');
  const [profBioEn, setProfBioEn] = useState('');
  const [profExp, setProfExp] = useState(5);
  const [profSpecs, setProfSpecs] = useState('');
  const [profPhone, setProfPhone] = useState('');
  const [profInstagram, setProfInstagram] = useState('');

  // Password state
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // New Blocked Date state
  const [blockDate, setBlockDate] = useState('');
  const [blockReason, setBlockReason] = useState('');

  // New Portfolio Upload state
  const [portFile, setPortFile] = useState(null);
  const [portTitle, setPortTitle] = useState('');
  const [portCategory, setPortCategory] = useState('FADE');

  // Load barber's data
  const loadBarberData = async () => {
    setLoading(true);
    try {
      const [pRes, aRes, sRes, bRes, portRes] = await Promise.all([
        api.get('/barber/profile'),
        api.get('/appointments/barber/me'),
        api.get('/barber/schedule'),
        api.get('/barber/blocked-times'),
        api.get('/barber/portfolio'),
      ]);

      if (pRes.data?.profile) {
        const p = pRes.data.profile;
        setProfile(p);
        setProfName(p.user?.name || '');
        setProfTitle(p.title || '');
        setProfBioUz(p.bioUz || '');
        setProfBioRu(p.bioRu || '');
        setProfBioEn(p.bioEn || '');
        setProfExp(p.experienceYears || 5);
        setProfSpecs(p.specialties || '');
        setProfPhone(p.phone || '');
        setProfInstagram(p.instagram || '');
      }

      if (aRes.data?.appointments) setAppointments(aRes.data.appointments);
      if (sRes.data?.schedules) setSchedules(sRes.data.schedules);
      if (bRes.data?.blockedTimes) setBlockedTimes(bRes.data.blockedTimes);
      if (portRes.data?.portfolio) setPortfolio(portRes.data.portfolio);
    } catch (err) {
      console.error('Barber dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBarberData();
  }, []);

  const showFeedback = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  // 1. Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/barber/profile', {
        name: profName,
        title: profTitle,
        bioUz: profBioUz,
        bioRu: profBioRu,
        bioEn: profBioEn,
        experienceYears: Number(profExp),
        specialties: profSpecs,
        phone: profPhone,
        instagram: profInstagram,
      });
      showFeedback('success', 'Profil ma\'lumotlari muvaffaqiyatli saqlandi!');
    } catch (err) {
      showFeedback('error', err.response?.data?.error || 'Profilni saqlashda xatolik yuz berdi.');
    }
  };

  // 2. Upload Avatar
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/barber/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile((prev) => ({ ...prev, avatarUrl: res.data.avatarUrl }));
      showFeedback('success', 'Profil rasmi yangilandi!');
    } catch (err) {
      showFeedback('error', 'Rasm yuklashda xatolik yuz berdi.');
    }
  };

  // 3. Update Schedules
  const handleScheduleChange = (dayIndex, field, value) => {
    setSchedules((prev) =>
      prev.map((s, idx) => (idx === dayIndex ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveSchedules = async () => {
    try {
      await api.put('/barber/schedule', { schedules });
      showFeedback('success', 'Ish grafigi saqlandi!');
    } catch (err) {
      showFeedback('error', 'Grafikni saqlashda xatolik yuz berdi.');
    }
  };

  // 4. Block Date
  const handleAddBlockedDate = async (e) => {
    e.preventDefault();
    if (!blockDate) return;
    try {
      const res = await api.post('/barber/blocked-times', {
        date: blockDate,
        isFullDay: true,
        reason: blockReason || 'Dam olish kuni',
      });
      setBlockedTimes((prev) => [...prev, res.data.blockedTime]);
      setBlockDate('');
      setBlockReason('');
      showFeedback('success', 'Dam olish kuni bloklandi!');
    } catch (err) {
      showFeedback('error', 'Bloklashda xatolik.');
    }
  };

  const handleDeleteBlockedDate = async (id) => {
    try {
      await api.delete(`/barber/blocked-times/${id}`);
      setBlockedTimes((prev) => prev.filter((b) => b.id !== id));
      showFeedback('success', 'Bloklangan sana o\'chirildi.');
    } catch (err) {
      showFeedback('error', 'O\'chirishda xatolik.');
    }
  };

  // 5. Update Booking Status
  const handleAppointmentStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/barber/${id}/status`, { status });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      showFeedback('success', `Navbat holati: ${status}`);
    } catch (err) {
      showFeedback('error', err.response?.data?.error || 'Holatni yangilashda xatolik.');
    }
  };

  // 6. Portfolio Upload & Delete
  const handleUploadPortfolio = async (e) => {
    e.preventDefault();
    if (!portFile) return;

    const formData = new FormData();
    formData.append('image', portFile);
    formData.append('titleUz', portTitle);
    formData.append('category', portCategory);

    try {
      const res = await api.post('/barber/portfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPortfolio((prev) => [res.data.item, ...prev]);
      setPortFile(null);
      setPortTitle('');
      showFeedback('success', 'Yangi ish portfolioingizga qo\'shildi!');
    } catch (err) {
      showFeedback('error', 'Rasm yuklashda xatolik yuz berdi.');
    }
  };

  const handleDeletePortfolio = async (id) => {
    if (!window.confirm('Haqiqatan ham ushbu ishni o\'chirmoqchimisiz?')) return;
    try {
      await api.delete(`/barber/portfolio/${id}`);
      setPortfolio((prev) => prev.filter((p) => p.id !== id));
      showFeedback('success', 'Ish o\'chirildi.');
    } catch (err) {
      showFeedback('error', 'O\'chirishda xatolik.');
    }
  };

  // 7. Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      showFeedback('error', 'Yangi parollar mos kelmadi.');
      return;
    }
    try {
      await changePassword(currPass, newPass);
      showFeedback('success', 'Parolingiz muvaffaqiyatli almashtirildi!');
      setCurrPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err) {
      showFeedback('error', err.response?.data?.error || 'Parol yangilanmadi.');
    }
  };

  const daysByLang = {
    uz: ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'],
    ru: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  };
  const daysLabels = daysByLang[i18n.language] || daysByLang.uz;

  return (
    <div className="py-12 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-8 border-b border-neutral-800 gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={profile?.avatarUrl || '/images/barber-bobur.jpg'}
                alt={user?.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400/60 shadow-lg"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                title="Rasmni almashtirish"
              >
                <Upload className="w-5 h-5 text-amber-400" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold uppercase tracking-wider">
                  {t('barber.dashboardTitle')}
                </span>
                <span className="text-xs text-neutral-400">@{profile?.slug}</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                {user?.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-rose-400 border border-neutral-800 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('auth.logout')}</span>
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {msg.text && (
          <div
            className={`p-4 rounded-xl text-xs sm:text-sm font-semibold mb-6 flex items-center gap-2 animate-in fade-in ${
              msg.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
            }`}
          >
            {msg.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Dashboard Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 p-1.5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'bookings'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('dashboard.bookings')} ({appointments.filter((a) => a.status === 'CONFIRMED').length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('dashboard.profile')}
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'schedule'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('dashboard.schedule')}
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'blocked'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('barber.blockedDates')}
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'portfolio'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('dashboard.portfolio')} ({portfolio.length})
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'password'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('dashboard.password')}
          </button>
        </div>

        {/* TAB 1: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-white mb-4">
              {t('barber.myBookingsTitle')}
            </h2>

            {appointments.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400">
                <Calendar className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                <p>{t('barber.noBookings')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-sm font-bold text-amber-400">
                          {appt.bookingReference}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            appt.status === 'CONFIRMED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : appt.status === 'COMPLETED'
                              ? 'bg-blue-950 text-blue-400 border border-blue-500/30'
                              : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-white">
                        {appt.customerName}
                      </h3>
                      <p className="text-xs text-amber-300 font-mono mt-0.5">
                        {appt.customerPhone}
                      </p>

                      <div className="mt-4 pt-3 border-t border-neutral-800 space-y-1 text-xs text-neutral-300">
                        <p>
                          <strong className="text-neutral-500">{t('dashboard.service')}:</strong> {appt.serviceName}
                        </p>
                        <p>
                          <strong className="text-neutral-500">{t('dashboard.date')} & {t('dashboard.time')}:</strong> {appt.date} |{' '}
                          {appt.startTime} - {appt.endTime}
                        </p>
                        {appt.customerNotes && (
                          <p className="text-neutral-400 italic">
                            <strong className="text-neutral-500 not-italic">{t('book.yourNotes')}:</strong> "{appt.customerNotes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {appt.status === 'CONFIRMED' && (
                      <div className="mt-6 pt-4 border-t border-neutral-800 flex gap-2">
                        <button
                          onClick={() => handleAppointmentStatus(appt.id, 'COMPLETED')}
                          className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900"
                        >
                          {t('barber.markCompleted')}
                        </button>
                        <button
                          onClick={() => handleAppointmentStatus(appt.id, 'CANCELLED')}
                          className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-950 text-rose-400 border border-rose-500/30 hover:bg-rose-900"
                        >
                          {t('barber.cancelBooking')}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl rounded-3xl bg-neutral-900 border border-neutral-800 p-8 shadow-2xl">
            <h2 className="font-serif text-2xl font-bold text-white mb-6">
              {t('barber.editProfileTitle')}
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    {t('barber.fullName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    {t('barber.titlePost')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={profTitle}
                    onChange={(e) => setProfTitle(e.target.value)}
                    placeholder="Bosh Sartarosh & Stilist"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    {t('barber.experienceYears')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={profExp}
                    onChange={(e) => setProfExp(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    {t('barber.phone')}
                  </label>
                  <input
                    type="tel"
                    value={profPhone}
                    onChange={(e) => setProfPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    {t('barber.instagram')}
                  </label>
                  <input
                    type="text"
                    value={profInstagram}
                    onChange={(e) => setProfInstagram(e.target.value)}
                    placeholder="bobur_barber"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  {t('barber.specialtiesLabel')}
                </label>
                <input
                  type="text"
                  value={profSpecs}
                  onChange={(e) => setProfSpecs(e.target.value)}
                  placeholder="Classic Cut, Royal Fade, Beard Sculpting"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  {t('barber.bioUz')} *
                </label>
                <textarea
                  rows="3"
                  required
                  value={profBioUz}
                  onChange={(e) => setProfBioUz(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  {t('barber.bioRu')}
                </label>
                <textarea
                  rows="2"
                  value={profBioRu}
                  onChange={(e) => setProfBioRu(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  {t('barber.bioEn')}
                </label>
                <textarea
                  rows="2"
                  value={profBioEn}
                  onChange={(e) => setProfBioEn(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{t('barber.saveChanges')}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="max-w-4xl rounded-3xl bg-neutral-900 border border-neutral-800 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white">
                  {t('barber.scheduleTitle')}
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  {t('barber.scheduleDesc')}
                </p>
              </div>
              <button
                onClick={handleSaveSchedules}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{t('barber.saveSchedule')}</span>
              </button>
            </div>

            <div className="space-y-4">
              {schedules.map((sched, idx) => (
                <div
                  key={sched.id || idx}
                  className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 w-40">
                    <input
                      type="checkbox"
                      checked={sched.isWorking}
                      onChange={(e) => handleScheduleChange(idx, 'isWorking', e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span
                      className={`text-sm font-bold ${
                        sched.isWorking ? 'text-white' : 'text-neutral-500 line-through'
                      }`}
                    >
                      {daysLabels[sched.dayOfWeek]}
                    </span>
                  </div>

                  {sched.isWorking ? (
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400">Ish:</span>
                        <input
                          type="time"
                          value={sched.startTime}
                          onChange={(e) => handleScheduleChange(idx, 'startTime', e.target.value)}
                          className="px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-white font-mono"
                        />
                        <span>-</span>
                        <input
                          type="time"
                          value={sched.endTime}
                          onChange={(e) => handleScheduleChange(idx, 'endTime', e.target.value)}
                          className="px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-white font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400">Tushlik:</span>
                        <input
                          type="time"
                          value={sched.breakStartTime || ''}
                          onChange={(e) => handleScheduleChange(idx, 'breakStartTime', e.target.value)}
                          className="px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-white font-mono"
                        />
                        <span>-</span>
                        <input
                          type="time"
                          value={sched.breakEndTime || ''}
                          onChange={(e) => handleScheduleChange(idx, 'breakEndTime', e.target.value)}
                          className="px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-white font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-500 font-semibold">Dam Olish Kuni</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BLOCKED TIMES / HOLIDAYS */}
        {activeTab === 'blocked' && (
          <div className="max-w-3xl rounded-3xl bg-neutral-900 border border-neutral-800 p-8 shadow-2xl space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-white mb-2">
                {t('barber.blockDateTitle')}
              </h2>
              <p className="text-xs text-neutral-400">
                {t('barber.blockDateDesc')}
              </p>
            </div>

            <form onSubmit={handleAddBlockedDate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <input
                  type="date"
                  required
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder={t('barber.reason')}
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('barber.blockDate')}</span>
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                {t('barber.blockedList')}
              </h3>
              {blockedTimes.length === 0 ? (
                <p className="text-xs text-neutral-500">{t('barber.noBlocked')}</p>
              ) : (
                blockedTimes.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-white mr-3">{b.date}</span>
                      <span className="text-neutral-400">({b.reason || t('barber.dayOff')})</span>
                    </div>
                    <button
                      onClick={() => handleDeleteBlockedDate(b.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-neutral-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <div className="space-y-8">
            {/* Upload form */}
            <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl max-w-3xl">
              <h2 className="font-serif text-2xl font-bold text-white mb-2">
                {t('barber.uploadPortfolioTitle')}
              </h2>
              <p className="text-xs text-neutral-400 mb-6">
                {t('barber.uploadPortfolioDesc')}
              </p>

              <form onSubmit={handleUploadPortfolio} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      {t('barber.uploadWork')} *
                    </label>
                    <input
                      type="file"
                      required
                      accept="image/*"
                      onChange={(e) => setPortFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-neutral-400 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-neutral-800 file:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      {t('barber.caption')}
                    </label>
                    <input
                      type="text"
                      placeholder="Royal Fade, Beard Trim..."
                      value={portTitle}
                      onChange={(e) => setPortTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      {t('barber.category')}
                    </label>
                    <select
                      value={portCategory}
                      onChange={(e) => setPortCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                    >
                      <option value="FADE">FADE</option>
                      <option value="CLASSIC">CLASSIC</option>
                      <option value="TEXTURED">TEXTURED</option>
                      <option value="BEARD">BEARD</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!portFile}
                  className="px-6 py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-40 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{t('barber.uploadWork')}</span>
                </button>
              </form>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {portfolio.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 relative group shadow-lg"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.titleUz || 'Haircut'}
                    className="w-full h-56 object-cover"
                  />
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-amber-400 font-bold block uppercase">
                        {item.category}
                      </span>
                      <h4 className="text-xs font-semibold text-white">
                        {item.titleUz || 'Soch turmagi'}
                      </h4>
                    </div>
                    <button
                      onClick={() => handleDeletePortfolio(item.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/80 transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SECURITY / PASSWORD */}
        {activeTab === 'password' && (
          <div className="max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-8 shadow-2xl">
            <h2 className="font-serif text-2xl font-bold text-white mb-2">
              {t('barber.changePasswordTitle')}
            </h2>
            <p className="text-xs text-neutral-400 mb-6">
              {t('barber.changePasswordDesc')}
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  {t('auth.currentPassword')}
                </label>
                <input
                  type="password"
                  required
                  value={currPass}
                  onChange={(e) => setCurrPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  {t('auth.newPassword')}
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  {t('auth.confirmNewPassword')}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-black transition-colors"
              >
                {t('auth.savePasswordBtn')}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
