import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Users,
  Calendar,
  Clock,
  Sparkles,
  Scissors,
  MessageSquare,
  Settings,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  LogOut,
  Save,
  KeyRound,
  Eye,
  Check,
} from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user, logout, changePassword } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // overview | barbers | bookings | services | portfolio | gallery | messages | settings
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Data states
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [shopImages, setShopImages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [settings, setSettings] = useState({});

  // Filter states for bookings
  const [filterBarberId, setFilterBarberId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Create barber modal/form state
  const [showCreateBarber, setShowCreateBarber] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [newBarber, setNewBarber] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    title: 'Master Barber',
    bioUz: '',
    bioRu: '',
    bioEn: '',
    experienceYears: 5,
    specialties: 'Classic Cut, Fade, Beard',
  });

  // Create/Edit service modal/form
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    nameUz: '',
    nameRu: '',
    nameEn: '',
    descriptionUz: '',
    price: 70000,
    durationMinutes: 45,
    category: 'Haircut',
  });

  // Upload shop image file
  const [shopImageFile, setShopImageFile] = useState(null);
  const [shopImageCaption, setShopImageCaption] = useState('');

  // Admin password state
  const [adminCurrentPass, setAdminCurrentPass] = useState('');
  const [adminNewPass, setAdminNewPass] = useState('');
  const [adminConfirmPass, setAdminConfirmPass] = useState('');

  const showFeedback = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [stRes, bRes, aRes, srvRes, portRes, galRes, msgRes, setRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/barbers'),
        api.get('/admin/appointments'),
        api.get('/services'),
        api.get('/admin/portfolio'),
        api.get('/admin/shop-images'),
        api.get('/admin/messages'),
        api.get('/admin/settings'),
      ]);

      if (stRes.data?.stats) setStats(stRes.data.stats);
      if (stRes.data?.recentAppointments) setRecentAppointments(stRes.data.recentAppointments);
      if (bRes.data?.barbers) setBarbers(bRes.data.barbers);
      if (aRes.data?.appointments) setAllAppointments(aRes.data.appointments);
      if (srvRes.data?.services) setServices(srvRes.data.services);
      if (portRes.data?.portfolio) setPortfolio(portRes.data.portfolio);
      if (galRes.data?.images) setShopImages(galRes.data.images);
      if (msgRes.data?.messages) setMessages(msgRes.data.messages);
      if (setRes.data?.settings) setSettings(setRes.data.settings);
    } catch (err) {
      console.error('Admin data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // --- ACTIONS ---

  // 1. Create Barber
  const handleCreateBarber = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/barbers', {
        name: newBarber.name.trim(),
        email: newBarber.email.trim(),
        password: newBarber.password,
        phone: newBarber.phone?.trim() || undefined,
        title: newBarber.title?.trim() || 'Master Barber',
        experienceYears: Number(newBarber.experienceYears) || 0,
        specialties: newBarber.specialties?.trim() || 'Classic Cut, Fade, Beard',
        bioUz: newBarber.bioUz?.trim() || `${newBarber.name} - Master Barber.`,
        bioRu: newBarber.bioRu?.trim() || newBarber.bioUz?.trim() || `${newBarber.name} - Master Barber.`,
        bioEn: newBarber.bioEn?.trim() || newBarber.bioUz?.trim() || `${newBarber.name} - Master Barber.`,
      });
      showFeedback('success', t('admin.barberCreated', 'Yangi usta hisobi yaratildi!'));
      setShowCreateBarber(false);
      setNewBarber({
        name: '',
        email: '',
        password: '',
        phone: '',
        title: 'Master Barber',
        bioUz: '',
        bioRu: '',
        bioEn: '',
        experienceYears: 5,
        specialties: 'Classic Cut, Fade, Beard',
      });
      loadAllAdminData();
    } catch (err) {
      showFeedback('error', err.response?.data?.error || t('common.error'));
    }
  };

  // 1.1 Update Barber
  const handleUpdateBarberSubmit = async (e) => {
    e.preventDefault();
    if (!editingBarber) return;
    try {
      await api.put(`/admin/barbers/${editingBarber.id}`, {
        name: editingBarber.name.trim(),
        phone: editingBarber.phone?.trim() || null,
        title: editingBarber.title?.trim() || 'Master Barber',
        experienceYears: Number(editingBarber.experienceYears) || 0,
        specialties: editingBarber.specialties?.trim() || '',
        bioUz: editingBarber.bioUz?.trim() || '',
        bioRu: editingBarber.bioRu?.trim() || editingBarber.bioUz?.trim() || '',
        bioEn: editingBarber.bioEn?.trim() || editingBarber.bioUz?.trim() || '',
        isAcceptingBookings: editingBarber.isAcceptingBookings,
      });
      showFeedback('success', t('admin.barberUpdated', 'Usta ma\'lumotlari yangilandi!'));
      setEditingBarber(null);
      loadAllAdminData();
    } catch (err) {
      showFeedback('error', err.response?.data?.error || t('common.error'));
    }
  };

  // 2. Toggle Barber Active State
  const handleToggleBarberActive = async (barber) => {
    try {
      await api.put(`/admin/barbers/${barber.id}`, {
        isActive: !barber.user.isActive,
      });
      showFeedback('success', 'Usta holati yangilandi.');
      loadAllAdminData();
    } catch (err) {
      showFeedback('error', 'Holatni o\'zgartirishda xatolik.');
    }
  };

  // 3. Reset Barber Password
  const handleResetBarberPassword = async (barberId) => {
    const newPass = window.prompt('Usta uchun yangi parolni kiriting (kamida 6 belgi):');
    if (!newPass) return;
    try {
      await api.post(`/admin/barbers/${barberId}/reset-password`, { newPassword: newPass });
      showFeedback('success', 'Usta paroli yangilandi!');
    } catch (err) {
      showFeedback('error', err.response?.data?.error || 'Parolni yangilashda xatolik.');
    }
  };

  // 4. Update Appointment Status
  const handleUpdateAppointmentStatus = async (id, status) => {
    try {
      await api.patch(`/admin/appointments/${id}/status`, { status });
      setAllAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      showFeedback('success', 'Navbat holati yangilandi.');
    } catch (err) {
      showFeedback('error', 'Xatolik yuz berdi.');
    }
  };

  // 5. Create or Edit Service
  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      if (editingServiceId) {
        await api.put(`/services/${editingServiceId}`, {
          ...serviceForm,
          price: Number(serviceForm.price),
          durationMinutes: Number(serviceForm.durationMinutes),
        });
        showFeedback('success', 'Xizmat yangilandi.');
      } else {
        await api.post('/services', {
          ...serviceForm,
          nameRu: serviceForm.nameRu || serviceForm.nameUz,
          nameEn: serviceForm.nameEn || serviceForm.nameUz,
          price: Number(serviceForm.price),
          durationMinutes: Number(serviceForm.durationMinutes),
        });
        showFeedback('success', 'Yangi xizmat qo\'shildi.');
      }
      setShowServiceForm(false);
      setEditingServiceId(null);
      loadAllAdminData();
    } catch (err) {
      showFeedback('error', 'Xizmatni saqlashda xatolik.');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Ushbu xizmatni o\'chirmoqchimisiz?')) return;
    try {
      await api.delete(`/services/${id}`);
      showFeedback('success', 'Xizmat o\'chirildi.');
      loadAllAdminData();
    } catch (err) {
      showFeedback('error', 'Xizmatni o\'chirishda xatolik.');
    }
  };

  // 6. Portfolio Moderation
  const handleTogglePortfolioApprove = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/portfolio/${id}/toggle`, { isApproved: !currentStatus });
      setPortfolio((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isApproved: !currentStatus } : p))
      );
      showFeedback('success', 'Portfolio elementi holati o\'zgartirildi.');
    } catch (err) {
      showFeedback('error', 'Holatni yangilashda xatolik.');
    }
  };

  const handleDeletePortfolioItem = async (id) => {
    if (!window.confirm('Ushbu ishni portfolio dan o\'chirmoqchimisiz?')) return;
    try {
      await api.delete(`/admin/portfolio/${id}`);
      setPortfolio((prev) => prev.filter((p) => p.id !== id));
      showFeedback('success', 'Ish o\'chirildi.');
    } catch (err) {
      showFeedback('error', 'O\'chirishda xatolik.');
    }
  };

  // 7. Shop Gallery
  const handleUploadShopImage = async (e) => {
    e.preventDefault();
    if (!shopImageFile) return;

    const formData = new FormData();
    formData.append('image', shopImageFile);
    formData.append('captionUz', shopImageCaption);

    try {
      await api.post('/admin/shop-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showFeedback('success', 'Sartaroshxona surati yuklandi!');
      setShopImageFile(null);
      setShopImageCaption('');
      loadAllAdminData();
    } catch (err) {
      showFeedback('error', 'Rasm yuklashda xatolik.');
    }
  };

  const handleDeleteShopImage = async (id) => {
    try {
      await api.delete(`/admin/shop-images/${id}`);
      setShopImages((prev) => prev.filter((img) => img.id !== id));
      showFeedback('success', 'Rasm o\'chirildi.');
    } catch (err) {
      showFeedback('error', 'O\'chirishda xatolik.');
    }
  };

  // 8. Contact Messages
  const handleMarkMessageRead = async (id) => {
    try {
      await api.patch(`/admin/messages/${id}/read`);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
    } catch (err) {
      // Ignore
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      await api.delete(`/admin/messages/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      showFeedback('success', 'Xabar o\'chirildi.');
    } catch (err) {
      showFeedback('error', 'O\'chirishda xatolik.');
    }
  };

  // 9. Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.put('/admin/settings', settings);
      showFeedback('success', 'Sozlamalar saqlandi!');
    } catch (err) {
      showFeedback('error', 'Sozlamalarni saqlashda xatolik.');
    }
  };

  // 10. Change Admin Password
  const handleChangeAdminPassword = async (e) => {
    e.preventDefault();
    if (adminNewPass !== adminConfirmPass) {
      showFeedback('error', 'Yangi parollar mos kelmadi.');
      return;
    }
    try {
      await changePassword(adminCurrentPass, adminNewPass);
      showFeedback('success', 'Administrator paroli muvaffaqiyatli yangilandi!');
      setAdminCurrentPass('');
      setAdminNewPass('');
      setAdminConfirmPass('');
    } catch (err) {
      showFeedback('error', err.response?.data?.error || 'Parol yangilanmadi.');
    }
  };

  const filteredBookings = allAppointments.filter((a) => {
    if (filterBarberId && a.barberId !== filterBarberId) return false;
    if (filterStatus && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="py-12 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-8 border-b border-neutral-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold uppercase tracking-wider">
                  {t('nav.admin')}
                </span>
                <span className="text-xs text-neutral-400">{user?.email}</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-black text-white mt-1">
                MILLION BARBER {t('nav.admin')}
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
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('dashboard.overview')}
          </button>
          <button
            onClick={() => setActiveTab('barbers')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'barbers'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('dashboard.barbers')} ({barbers.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'bookings'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('dashboard.bookings')} ({allAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'services'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('dashboard.services')} ({services.length})
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
            onClick={() => setActiveTab('gallery')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'gallery'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('dashboard.gallery')}
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'messages'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('dashboard.messages')} ({messages.filter((m) => !m.isRead).length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('dashboard.settings')}
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <span className="text-xs text-neutral-400 font-semibold block">{t('admin.statsBarbers')}</span>
                <span className="font-serif text-3xl font-black text-amber-400 mt-2 block">
                  {stats?.totalBarbers || 0}
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <span className="text-xs text-neutral-400 font-semibold block">{t('admin.statsToday')}</span>
                <span className="font-serif text-3xl font-black text-amber-400 mt-2 block">
                  {stats?.todayBookings || 0}
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <span className="text-xs text-neutral-400 font-semibold block">{t('admin.statsUpcoming')}</span>
                <span className="font-serif text-3xl font-black text-emerald-400 mt-2 block">
                  {stats?.upcomingBookings || 0}
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <span className="text-xs text-neutral-400 font-semibold block">{t('admin.statsCompleted')}</span>
                <span className="font-serif text-3xl font-black text-blue-400 mt-2 block">
                  {stats?.completedBookings || 0}
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <span className="text-xs text-neutral-400 font-semibold block">{t('admin.statsCancelled')}</span>
                <span className="font-serif text-3xl font-black text-rose-400 mt-2 block">
                  {stats?.cancelledBookings || 0}
                </span>
              </div>
            </div>

            {/* Recent Bookings Table */}
            <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6 shadow-xl">
              <h2 className="font-serif text-xl font-bold text-white mb-4">
                {t('admin.recentBookings')}
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3 rounded-l-xl">Ref</th>
                      <th className="p-3">{t('dashboard.customer')}</th>
                      <th className="p-3">{t('dashboard.barber')}</th>
                      <th className="p-3">{t('dashboard.service')}</th>
                      <th className="p-3">{t('dashboard.date')} & {t('dashboard.time')}</th>
                      <th className="p-3">{t('dashboard.status')}</th>
                      <th className="p-3 rounded-r-xl">{t('dashboard.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {recentAppointments.map((a) => (
                      <tr key={a.id} className="hover:bg-neutral-800/40">
                        <td className="p-3 font-mono font-bold text-amber-400">
                          {a.bookingReference}
                        </td>
                        <td className="p-3 font-semibold text-white">
                          {a.customerName}
                          <span className="block text-[11px] text-neutral-500 font-normal">
                            {a.customerPhone}
                          </span>
                        </td>
                        <td className="p-3">{a.barber?.user?.name}</td>
                        <td className="p-3">{a.serviceName}</td>
                        <td className="p-3 font-mono">
                          {a.date} | {a.startTime}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              a.status === 'CONFIRMED'
                                ? 'bg-emerald-950 text-emerald-400'
                                : a.status === 'COMPLETED'
                                ? 'bg-blue-950 text-blue-400'
                                : 'bg-rose-950 text-rose-400'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {a.status === 'CONFIRMED' && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleUpdateAppointmentStatus(a.id, 'COMPLETED')}
                                className="px-2 py-1 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-900"
                                title="Bajarildi"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => handleUpdateAppointmentStatus(a.id, 'CANCELLED')}
                                className="px-2 py-1 rounded bg-rose-950 text-rose-400 hover:bg-rose-900"
                                title="Bekor qilish"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BARBERS MANAGEMENT */}
        {activeTab === 'barbers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-white">
                Sartaroshxona Ustalari Boshqaruvi
              </h2>
              <button
                onClick={() => setShowCreateBarber(!showCreateBarber)}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi Usta Qo'shish</span>
              </button>
            </div>

            {/* Create Barber Form Modal/Card */}
            {showCreateBarber && (
              <div className="p-8 rounded-3xl bg-neutral-900 border border-amber-500/40 shadow-2xl animate-in fade-in">
                <h3 className="font-serif text-xl font-bold text-white mb-4">
                  Yangi Usta Uchun Hisob Yaratish
                </h3>
                <form onSubmit={handleCreateBarber} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Ism Sharif *
                      </label>
                      <input
                        type="text"
                        required
                        value={newBarber.name}
                        onChange={(e) => setNewBarber({ ...newBarber, name: e.target.value })}
                        placeholder="Masalan: Sardor Komilov"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Email (Kirish logini) *
                      </label>
                      <input
                        type="email"
                        required
                        value={newBarber.email}
                        onChange={(e) => setNewBarber({ ...newBarber, email: e.target.value })}
                        placeholder="sardor@millionbarber.uz"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Dastlabki Parol *
                      </label>
                      <input
                        type="password"
                        required
                        value={newBarber.password}
                        onChange={(e) => setNewBarber({ ...newBarber, password: e.target.value })}
                        placeholder="Kamida 6 belgi"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Telefon Raqam
                      </label>
                      <input
                        type="tel"
                        value={newBarber.phone}
                        onChange={(e) => setNewBarber({ ...newBarber, phone: e.target.value })}
                        placeholder="+998 90 ..."
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Unvon / Lavozim *
                      </label>
                      <input
                        type="text"
                        required
                        value={newBarber.title}
                        onChange={(e) => setNewBarber({ ...newBarber, title: e.target.value })}
                        placeholder="Master Barber & Stylist"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Tajriba (Yil)
                      </label>
                      <input
                        type="number"
                        value={newBarber.experienceYears}
                        onChange={(e) =>
                          setNewBarber({ ...newBarber, experienceYears: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Mutaxassislik yo'nalishlari
                    </label>
                    <input
                      type="text"
                      value={newBarber.specialties}
                      onChange={(e) => setNewBarber({ ...newBarber, specialties: e.target.value })}
                      placeholder="Classic, Fade, Beard"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Tarjimai hol (O'zbekcha) *
                    </label>
                    <textarea
                      rows="2"
                      required
                      value={newBarber.bioUz}
                      onChange={(e) =>
                        setNewBarber({
                          ...newBarber,
                          bioUz: e.target.value,
                          bioRu: newBarber.bioRu || e.target.value,
                          bioEn: newBarber.bioEn || e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateBarber(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 text-neutral-300"
                    >
                      {t('admin.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-black"
                    >
                      {t('admin.saveBarber')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Edit Barber Modal/Card */}
            {editingBarber && (
              <div className="p-8 rounded-3xl bg-neutral-900 border border-amber-500/50 shadow-2xl animate-in fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-xl font-bold text-white">
                    {t('admin.editBarberTitle')} ({editingBarber.name})
                  </h3>
                  <button
                    onClick={() => setEditingBarber(null)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleUpdateBarberSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        {t('admin.name')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingBarber.name}
                        onChange={(e) => setEditingBarber({ ...editingBarber, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        {t('admin.phone')}
                      </label>
                      <input
                        type="tel"
                        value={editingBarber.phone}
                        onChange={(e) => setEditingBarber({ ...editingBarber, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        {t('admin.title')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingBarber.title}
                        onChange={(e) => setEditingBarber({ ...editingBarber, title: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        {t('admin.experienceYears')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={editingBarber.experienceYears}
                        onChange={(e) =>
                          setEditingBarber({ ...editingBarber, experienceYears: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        {t('admin.specialties')}
                      </label>
                      <input
                        type="text"
                        value={editingBarber.specialties}
                        onChange={(e) =>
                          setEditingBarber({ ...editingBarber, specialties: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        {t('admin.bioUz')}
                      </label>
                      <textarea
                        rows="2"
                        value={editingBarber.bioUz}
                        onChange={(e) =>
                          setEditingBarber({ ...editingBarber, bioUz: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        {t('admin.bioRu')}
                      </label>
                      <textarea
                        rows="2"
                        value={editingBarber.bioRu}
                        onChange={(e) =>
                          setEditingBarber({ ...editingBarber, bioRu: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        {t('admin.bioEn')}
                      </label>
                      <textarea
                        rows="2"
                        value={editingBarber.bioEn}
                        onChange={(e) =>
                          setEditingBarber({ ...editingBarber, bioEn: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="accepting-bookings"
                      checked={editingBarber.isAcceptingBookings}
                      onChange={(e) =>
                        setEditingBarber({ ...editingBarber, isAcceptingBookings: e.target.checked })
                      }
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <label htmlFor="accepting-bookings" className="text-xs text-neutral-300 font-medium cursor-pointer">
                      Mijozlar tomonidan band qilishga ruxsat berish (Qabulga ochiq)
                    </label>
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingBarber(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 text-neutral-300"
                    >
                      {t('admin.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-black"
                    >
                      {t('admin.updateBarber')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Barbers Table */}
            <div className="rounded-3xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Usta</th>
                      <th className="p-4">Lavozim</th>
                      <th className="p-4">Aloqa</th>
                      <th className="p-4">Tajriba</th>
                      <th className="p-4">Holat</th>
                      <th className="p-4">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {barbers.map((b) => (
                      <tr key={b.id} className="hover:bg-neutral-800/40">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={b.avatarUrl || '/images/barber-bobur.jpg'}
                            alt={b.user?.name}
                            className="w-10 h-10 rounded-xl object-cover border border-neutral-700"
                          />
                          <div>
                            <span className="font-semibold text-white block">{b.user?.name}</span>
                            <span className="text-[11px] text-neutral-500">{b.user?.email}</span>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-amber-300">{b.title}</td>
                        <td className="p-4">{b.user?.phone || '—'}</td>
                        <td className="p-4 font-semibold">{b.experienceYears} yil</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              b.user?.isActive
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {b.user?.isActive ? 'FAOL' : 'NOFAOL'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/barbers/${b.slug || b.id}`}
                              target="_blank"
                              className="p-1.5 rounded-lg bg-neutral-950 text-neutral-300 hover:text-amber-400 border border-neutral-800"
                              title={t('admin.viewProfile')}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() =>
                                setEditingBarber({
                                  id: b.id,
                                  name: b.user?.name || '',
                                  phone: b.user?.phone || b.phone || '',
                                  title: b.title || 'Master Barber',
                                  experienceYears: b.experienceYears || 5,
                                  specialties: b.specialties || '',
                                  bioUz: b.bioUz || '',
                                  bioRu: b.bioRu || '',
                                  bioEn: b.bioEn || '',
                                  isAcceptingBookings: b.isAcceptingBookings ?? true,
                                })
                              }
                              className="p-1.5 rounded-lg bg-neutral-950 text-neutral-300 hover:text-amber-400 border border-neutral-800"
                              title={t('admin.editBarber')}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleResetBarberPassword(b.id)}
                              className="p-1.5 rounded-lg bg-neutral-950 text-neutral-300 hover:text-amber-400 border border-neutral-800"
                              title={t('admin.changePassword')}
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleBarberActive(b)}
                              className={`p-1.5 rounded-lg text-xs font-semibold ${
                                b.user?.isActive
                                  ? 'bg-rose-950 text-rose-400 hover:bg-rose-900'
                                  : 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900'
                              }`}
                              title={b.user?.isActive ? 'Deaktivatsiya' : 'Aktivlashtirish'}
                            >
                              {b.user?.isActive ? 'Nofaol qilish' : 'Faollashtirish'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BOOKINGS MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="font-serif text-2xl font-bold text-white">
                Barcha Navbatlar Ro'yxati
              </h2>

              <div className="flex gap-3">
                <select
                  value={filterBarberId}
                  onChange={(e) => setFilterBarberId(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:border-amber-400"
                >
                  <option value="">Barcha Ustalar</option>
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.user?.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:border-amber-400"
                >
                  <option value="">Barcha Holatlar</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            <div className="rounded-3xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Kod</th>
                      <th className="p-4">Mijoz</th>
                      <th className="p-4">Usta</th>
                      <th className="p-4">Xizmat</th>
                      <th className="p-4">Sana & Vaqt</th>
                      <th className="p-4">Narx</th>
                      <th className="p-4">Holat</th>
                      <th className="p-4">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {filteredBookings.map((a) => (
                      <tr key={a.id} className="hover:bg-neutral-800/40">
                        <td className="p-4 font-mono font-bold text-amber-400">
                          {a.bookingReference}
                        </td>
                        <td className="p-4 font-semibold text-white">
                          {a.customerName}
                          <span className="block text-[11px] text-neutral-500 font-normal">
                            {a.customerPhone}
                          </span>
                        </td>
                        <td className="p-4">{a.barber?.user?.name}</td>
                        <td className="p-4">{a.serviceName}</td>
                        <td className="p-4 font-mono">
                          {a.date} | {a.startTime}
                        </td>
                        <td className="p-4 font-bold text-amber-300">
                          {a.totalPrice?.toLocaleString()} so'm
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              a.status === 'CONFIRMED'
                                ? 'bg-emerald-950 text-emerald-400'
                                : a.status === 'COMPLETED'
                                ? 'bg-blue-950 text-blue-400'
                                : 'bg-rose-950 text-rose-400'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleUpdateAppointmentStatus(a.id, 'COMPLETED')}
                              className="px-2 py-1 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-900"
                              title="Bajarildi"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleUpdateAppointmentStatus(a.id, 'CANCELLED')}
                              className="px-2 py-1 rounded bg-rose-950 text-rose-400 hover:bg-rose-900"
                              title="Bekor qilish"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SERVICES MANAGEMENT */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-white">
                Xizmatlar & Narxlar Ro'yxati
              </h2>
              <button
                onClick={() => {
                  setEditingServiceId(null);
                  setServiceForm({
                    nameUz: '',
                    nameRu: '',
                    nameEn: '',
                    descriptionUz: '',
                    price: 70000,
                    durationMinutes: 45,
                    category: 'Haircut',
                  });
                  setShowServiceForm(true);
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi Xizmat Qo'shish</span>
              </button>
            </div>

            {/* Service Form */}
            {showServiceForm && (
              <div className="p-8 rounded-3xl bg-neutral-900 border border-amber-500/40 shadow-2xl max-w-2xl animate-in fade-in">
                <h3 className="font-serif text-xl font-bold text-white mb-4">
                  {editingServiceId ? 'Xizmatni Tahrirlash' : 'Yangi Xizmat Qo\'shish'}
                </h3>
                <form onSubmit={handleSaveService} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Xizmat Nomi (O'zbekcha) *
                    </label>
                    <input
                      type="text"
                      required
                      value={serviceForm.nameUz}
                      onChange={(e) => setServiceForm({ ...serviceForm, nameUz: e.target.value })}
                      placeholder="Klassik Soch Turmagi"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Narxi (So'm) *
                      </label>
                      <input
                        type="number"
                        required
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Davomiyligi (Daqiqa) *
                      </label>
                      <input
                        type="number"
                        required
                        value={serviceForm.durationMinutes}
                        onChange={(e) =>
                          setServiceForm({ ...serviceForm, durationMinutes: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Tavsif (O'zbekcha)
                    </label>
                    <textarea
                      rows="2"
                      value={serviceForm.descriptionUz}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, descriptionUz: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowServiceForm(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 text-neutral-300"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-black"
                    >
                      Saqlash
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-serif text-lg font-bold text-white">{srv.nameUz}</h3>
                      <div className="font-mono text-base font-bold text-amber-400 shrink-0">
                        {srv.price?.toLocaleString()} so'm
                      </div>
                    </div>
                    <p className="text-xs text-neutral-400 mt-2">{srv.descriptionUz}</p>
                    <span className="text-xs text-neutral-500 block mt-2">
                      Davomiyligi: {srv.durationMinutes} daqiqa
                    </span>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingServiceId(srv.id);
                        setServiceForm({
                          nameUz: srv.nameUz,
                          nameRu: srv.nameRu,
                          nameEn: srv.nameEn,
                          descriptionUz: srv.descriptionUz || '',
                          price: srv.price,
                          durationMinutes: srv.durationMinutes,
                          category: srv.category,
                        });
                        setShowServiceForm(true);
                      }}
                      className="p-2 rounded-lg bg-neutral-950 text-neutral-300 hover:text-amber-400 border border-neutral-800"
                      title="Tahrirlash"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(srv.id)}
                      className="p-2 rounded-lg bg-neutral-950 text-rose-400 hover:text-rose-300 border border-neutral-800"
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

        {/* TAB 5: PORTFOLIO MODERATION */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-white">
              Ustalar Yuklagan Portfolio Ishlarini Moderatsiya Qilish
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {portfolio.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-xl flex flex-col justify-between"
                >
                  <div className="relative h-52">
                    <img
                      src={item.imageUrl}
                      alt={item.titleUz || 'Work'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-amber-400">
                      {item.category}
                    </div>
                  </div>

                  <div className="p-4">
                    <h4 className="text-xs font-bold text-white">{item.titleUz || 'Turmak'}</h4>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Usta: <span className="text-amber-300">{item.barber?.user?.name}</span>
                    </p>

                    <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                      <button
                        onClick={() => handleTogglePortfolioApprove(item.id, item.isApproved)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          item.isApproved
                            ? 'bg-emerald-950 text-emerald-400'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {item.isApproved ? 'Tasdiqlangan ✓' : 'Yashirin ✕'}
                      </button>

                      <button
                        onClick={() => handleDeletePortfolioItem(item.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SHOP INTERIOR GALLERY */}
        {activeTab === 'gallery' && (
          <div className="space-y-8">
            <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl max-w-2xl">
              <h3 className="font-serif text-xl font-bold text-white mb-2">
                Salon Interior Fotosuratini Yuklash
              </h3>
              <p className="text-xs text-neutral-400 mb-6">
                Sartaroshxona zali va jihozlari rasmini qo'shing.
              </p>

              <form onSubmit={handleUploadShopImage} className="space-y-4">
                <div>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={(e) => setShopImageFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-neutral-400 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-neutral-800 file:text-white"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Rasm izohi (masalan: VIP kreslolar va yoritish)"
                    value={shopImageCaption}
                    onChange={(e) => setShopImageCaption(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!shopImageFile}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-40 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Rasmni Yuklash</span>
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {shopImages.map((img) => (
                <div
                  key={img.id}
                  className="rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-xl"
                >
                  <img src={img.imageUrl} alt="Shop" className="w-full h-56 object-cover" />
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-xs text-neutral-300 truncate pr-2">
                      {img.captionUz || 'Salon fotosurati'}
                    </span>
                    <button
                      onClick={() => handleDeleteShopImage(img.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: MESSAGES */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-white">
              Sayt Orqali Kelgan Murojaatlar
            </h2>

            {messages.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400">
                <MessageSquare className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                <p>Hozircha xabarlar mavjud emas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-6 rounded-2xl border transition-all ${
                      m.isRead
                        ? 'bg-neutral-900/60 border-neutral-800'
                        : 'bg-neutral-900 border-amber-500/40 shadow-lg'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <span className="font-serif text-base font-bold text-white mr-3">
                          {m.name}
                        </span>
                        <a
                          href={`tel:${m.phone}`}
                          className="font-mono text-xs text-amber-400 hover:underline"
                        >
                          {m.phone}
                        </a>
                        {m.email && (
                          <span className="text-xs text-neutral-400 ml-2">({m.email})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-neutral-500">
                          {new Date(m.createdAt).toLocaleString()}
                        </span>
                        {!m.isRead && (
                          <button
                            onClick={() => handleMarkMessageRead(m.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-400"
                          >
                            O'qildi
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMessage(m.id)}
                          className="p-1 text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-amber-300 font-semibold mb-1">
                      Mavzu: {m.subject}
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed bg-neutral-950 p-4 rounded-xl border border-neutral-850">
                      {m.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: SETTINGS & PASSWORD */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* General Settings */}
            <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl">
              <h2 className="font-serif text-xl font-bold text-white mb-6">
                Sartaroshxona Asosiy Sozlamalari
              </h2>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Telefon Raqam
                  </label>
                  <input
                    type="text"
                    value={settings.phone || ''}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Manzil (O'zbekcha)
                  </label>
                  <input
                    type="text"
                    value={settings.addressUz || ''}
                    onChange={(e) => setSettings({ ...settings, addressUz: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Ish Vaqti
                  </label>
                  <input
                    type="text"
                    value={settings.workingHoursUz || ''}
                    onChange={(e) => setSettings({ ...settings, workingHoursUz: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Instagram Havolasi
                  </label>
                  <input
                    type="text"
                    value={settings.instagramUrl || ''}
                    onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Telegram Havolasi
                  </label>
                  <input
                    type="text"
                    value={settings.telegramUrl || ''}
                    onChange={(e) => setSettings({ ...settings, telegramUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Google Maps / OpenStreetMap Embed Havolasi
                  </label>
                  <input
                    type="text"
                    value={settings.mapEmbedUrl || ''}
                    onChange={(e) => setSettings({ ...settings, mapEmbedUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Sozlamalarni Saqlash</span>
                </button>
              </form>
            </div>

            {/* Admin Password Change */}
            <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl h-fit">
              <h2 className="font-serif text-xl font-bold text-white mb-2">
                Administrator Parolini Yangilash
              </h2>
              <p className="text-xs text-neutral-400 mb-6">
                Xavfsizlikni ta'minlash uchun parolingizni doimiy yangilab turing.
              </p>

              <form onSubmit={handleChangeAdminPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Hozirgi Parol
                  </label>
                  <input
                    type="password"
                    required
                    value={adminCurrentPass}
                    onChange={(e) => setAdminCurrentPass(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Yangi Parol
                  </label>
                  <input
                    type="password"
                    required
                    value={adminNewPass}
                    onChange={(e) => setAdminNewPass(e.target.value)}
                    placeholder="Kamida 6 belgi"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Yangi Parolni Qayta Kiriting
                  </label>
                  <input
                    type="password"
                    required
                    value={adminConfirmPass}
                    onChange={(e) => setAdminConfirmPass(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-black"
                >
                  Parolni Almashtirish
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
