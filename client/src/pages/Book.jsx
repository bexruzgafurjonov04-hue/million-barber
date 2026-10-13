import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  Phone,
  FileText,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';
import api from '../api/axios.js';

export const Book = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();

  // Data states
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingBarbers, setLoadingBarbers] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Wizard state: Step 1 (Barber), Step 2 (Service & Date), Step 3 (Time Slot), Step 4 (Confirm)
  const [step, setStep] = useState(1);
  const [selectedBarberId, setSelectedBarberId] = useState(searchParams.get('barber') || '');
  const [selectedServiceId, setSelectedServiceId] = useState(searchParams.get('service') || '');
  
  // Date default: today's date formatted YYYY-MM-DD in local time
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Customer form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+998');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Booking result & status
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [bookingError, setBookingError] = useState('');

  // Lookup existing booking mode
  const [showLookup, setShowLookup] = useState(false);
  const [lookupRef, setLookupRef] = useState('');
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  // Load initial barbers & services
  useEffect(() => {
    const initData = async () => {
      try {
        const [barbersRes, srvRes] = await Promise.all([
          api.get('/barbers'),
          api.get('/services'),
        ]);

        if (barbersRes.data?.barbers) {
          setBarbers(barbersRes.data.barbers);
          // If query param barber matches, auto-select
          const preselected = searchParams.get('barber');
          if (preselected && barbersRes.data.barbers.some((b) => b.id === preselected)) {
            setSelectedBarberId(preselected);
            setStep(2);
          }
        }

        if (srvRes.data?.services) {
          setServices(srvRes.data.services);
          const preSrv = searchParams.get('service');
          if (preSrv) setSelectedServiceId(preSrv);
        }
      } catch (err) {
        console.error('Initial booking data fetch failed:', err);
      } finally {
        setLoadingBarbers(false);
      }
    };

    initData();
  }, [searchParams]);

  // Fetch slots whenever selectedBarberId or selectedDate changes
  useEffect(() => {
    if (!selectedBarberId || !selectedDate) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setAvailableSlots([]);
      setSelectedSlot(null);
      try {
        const res = await api.get(`/barbers/${selectedBarberId}/slots?date=${selectedDate}`);
        if (res.data?.slots) {
          setAvailableSlots(res.data.slots);
        }
      } catch (err) {
        console.error('Slot fetch error:', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedBarberId, selectedDate]);

  const selectedBarber = barbers.find((b) => b.id === selectedBarberId);
  const selectedService = services.find((s) => s.id === selectedServiceId);

  const getLocalized = (item, prefix) => {
    const lang = i18n.language;
    if (lang === 'ru') return item?.[`${prefix}Ru`] || item?.[`${prefix}Uz`] || '';
    if (lang === 'en') return item?.[`${prefix}En`] || item?.[`${prefix}Uz`] || '';
    return item?.[`${prefix}Uz`] || '';
  };

  // Submit appointment to backend with conflict prevention
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setBookingError('');
    setSubmitting(true);

    try {
      const payload = {
        barberId: selectedBarberId,
        serviceId: selectedServiceId || undefined,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail?.trim() || undefined,
        customerNotes: customerNotes?.trim() || undefined,
        date: selectedDate,
        startTime: selectedSlot.time,
      };

      const res = await api.post('/appointments', payload);
      setConfirmedBooking(res.data.booking);
    } catch (err) {
      setBookingError(
        err.response?.data?.error ||
          'Bandlikni saqlashda xatolik yuz berdi. Iltimos boshqa vaqtni tanlang.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Lookup existing booking
  const handleLookup = async (e) => {
    e.preventDefault();
    setLookupError('');
    setCancelSuccessMsg('');
    setLookupLoading(true);
    setLookupResult(null);

    try {
      const res = await api.get(
        `/appointments/lookup?reference=${lookupRef.trim()}&phone=${lookupPhone.trim()}`
      );
      setLookupResult(res.data.booking);
    } catch (err) {
      setLookupError(err.response?.data?.error || 'Bunday ma\'lumotga ega bandlik topilmadi.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Cancel existing booking
  const handleCancelBooking = async (appointmentId) => {
    if (!window.confirm(t('book.cancelConfirm'))) return;

    try {
      await api.post(`/appointments/${appointmentId}/cancel`, {
        bookingReference: lookupRef.trim(),
        customerPhone: lookupPhone.trim(),
      });
      setCancelSuccessMsg('Bandlik bekor qilindi / Appointment cancelled.');
      setLookupResult((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
    } catch (err) {
      alert(err.response?.data?.error || 'Bekor qilishda xatolik yuz berdi.');
    }
  };

  // Reset booking form
  const handleBookAnother = () => {
    setConfirmedBooking(null);
    setStep(1);
    setSelectedSlot(null);
    setCustomerName('');
    setCustomerPhone('+998');
    setCustomerNotes('');
  };

  return (
    <div className="py-16 sm:py-24 bg-neutral-950 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>Online Booking System</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            {t('book.title')}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-neutral-400">
            {t('book.subtitle')}
          </p>

          {/* Toggle Lookup Existing Booking button */}
          <div className="mt-4">
            <button
              onClick={() => setShowLookup(!showLookup)}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline"
            >
              {showLookup ? (t('book.backToBooking') || 'Navbatga yozilishga qaytish') : t('book.lookupTitle')}
            </button>
          </div>
        </div>

        {/* --- LOOKUP EXISTING BOOKING DRAWER / VIEW --- */}
        {showLookup && (
          <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl mb-12 animate-in fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-400" />
                <span>{t('book.lookupTitle')}</span>
              </h2>
              <button
                onClick={() => setShowLookup(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLookup} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <input
                  type="text"
                  required
                  placeholder={t('book.lookupRefPlaceholder')}
                  value={lookupRef}
                  onChange={(e) => setLookupRef(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder={t('book.lookupPhonePlaceholder')}
                  value={lookupPhone}
                  onChange={(e) => setLookupPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={lookupLoading}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-black transition-colors"
                >
                  {lookupLoading ? t('common.loading') : t('book.lookupBtn')}
                </button>
              </div>
            </form>

            {lookupError && (
              <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs">
                {lookupError}
              </div>
            )}

            {cancelSuccessMsg && (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs">
                {cancelSuccessMsg}
              </div>
            )}

            {lookupResult && (
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-lg font-bold text-amber-400">
                    {lookupResult.bookingReference}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      lookupResult.status === 'CONFIRMED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                        : lookupResult.status === 'COMPLETED'
                        ? 'bg-blue-950 text-blue-400 border border-blue-500/40'
                        : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {lookupResult.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-neutral-500 block">{t('dashboard.barber')}:</span>
                    <span className="font-semibold text-white">{lookupResult.barberName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">{t('dashboard.service')}:</span>
                    <span className="font-semibold text-white">{lookupResult.serviceName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">{t('dashboard.date')} & {t('dashboard.time')}:</span>
                    <span className="font-semibold text-white">
                      {lookupResult.date} | {lookupResult.startTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">{t('dashboard.price')}:</span>
                    <span className="font-semibold text-amber-300">
                      {lookupResult.totalPrice?.toLocaleString()} so'm
                    </span>
                  </div>
                </div>

                {lookupResult.status === 'CONFIRMED' && (
                  <div className="pt-4 border-t border-neutral-900">
                    <button
                      onClick={() => handleCancelBooking(lookupResult.id)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-950 text-rose-400 border border-rose-500/40 hover:bg-rose-900 transition-colors"
                    >
                      {t('book.cancelBtn')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- SUCCESSFUL BOOKING CONFIRMATION SCREEN --- */}
        {confirmedBooking ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-neutral-900 border border-amber-500/40 shadow-2xl text-center max-w-2xl mx-auto animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="font-serif text-3xl font-bold text-white mb-2">
              {t('book.bookingSuccessTitle')}
            </h2>
            <p className="text-sm text-neutral-400 mb-8">
              {t('book.bookingNote')}
            </p>

            {/* Reference Badge */}
            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 mb-8 inline-block w-full max-w-md">
              <div className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-1">
                {t('book.bookingRefLabel')}
              </div>
              <div className="font-mono text-3xl font-black text-amber-400 tracking-wider">
                {confirmedBooking.bookingReference}
              </div>
            </div>

            {/* Booking Details Breakdown */}
            <div className="grid grid-cols-2 gap-4 text-left p-6 rounded-2xl bg-neutral-950/60 border border-neutral-800 text-xs sm:text-sm mb-8">
              <div>
                <span className="text-neutral-500 block text-xs">{t('dashboard.barber')}:</span>
                <span className="font-semibold text-white">{confirmedBooking.barberName}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-xs">{t('dashboard.service')}:</span>
                <span className="font-semibold text-white">{confirmedBooking.serviceName}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-xs">{t('dashboard.date')}:</span>
                <span className="font-semibold text-white">{confirmedBooking.date}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-xs">{t('dashboard.time')}:</span>
                <span className="font-semibold text-white">
                  {confirmedBooking.startTime} - {confirmedBooking.endTime}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-xs">{t('dashboard.customer')}:</span>
                <span className="font-semibold text-white">{confirmedBooking.customerName}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-xs">{t('book.total')}</span>
                <span className="font-bold text-amber-400">
                  {confirmedBooking.totalPrice?.toLocaleString()} so'm
                </span>
              </div>
            </div>

            <button
              onClick={handleBookAnother}
              className="px-8 py-3.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-black transition-colors"
            >
              {t('book.bookAnother')}
            </button>
          </div>
        ) : (
          /* --- 4-STEP BOOKING WIZARD --- */
          <div className="rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 sm:p-10">
            {/* Step Indicators */}
            <div className="grid grid-cols-4 gap-2 mb-10 pb-6 border-b border-neutral-800">
              <button
                onClick={() => setStep(1)}
                className={`text-center py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                  step === 1 ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {t('book.step1')}
              </button>
              <button
                onClick={() => selectedBarberId && setStep(2)}
                disabled={!selectedBarberId}
                className={`text-center py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors disabled:opacity-40 ${
                  step === 2 ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {t('book.step2')}
              </button>
              <button
                onClick={() => selectedBarberId && setStep(3)}
                disabled={!selectedBarberId}
                className={`text-center py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors disabled:opacity-40 ${
                  step === 3 ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {t('book.step3')}
              </button>
              <button
                onClick={() => selectedSlot && setStep(4)}
                disabled={!selectedSlot}
                className={`text-center py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors disabled:opacity-40 ${
                  step === 4 ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {t('book.step4')}
              </button>
            </div>

            {/* STEP 1: CHOOSE BARBER */}
            {step === 1 && (
              <div>
                <h2 className="font-serif text-2xl font-bold text-white mb-2">
                  {t('book.chooseBarber')}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 mb-6">
                  Sizga xizmat ko'rsatishini istagan ustangizni tanlang:
                </p>

                {loadingBarbers ? (
                  <div className="py-16 flex justify-center">
                    <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {barbers.map((barber) => (
                      <div
                        key={barber.id}
                        onClick={() => {
                          setSelectedBarberId(barber.id);
                          setStep(2);
                        }}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all flex gap-4 items-center ${
                          selectedBarberId === barber.id
                            ? 'bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/20'
                            : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <img
                          src={barber.avatarUrl || '/images/barber-bobur.jpg'}
                          alt={barber.name}
                          className="w-20 h-20 rounded-xl object-cover border border-neutral-800 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-lg font-bold text-white truncate">
                            {barber.name}
                          </h3>
                          <p className="text-xs text-amber-400 font-medium">{barber.title}</p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {barber.experienceYears} {t('barbers.expYears')}
                          </p>
                          <div className="mt-2">
                            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                              ● {t('barbers.availableToday')}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-neutral-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: SELECT SERVICE & DATE */}
            {step === 2 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-white">
                      {t('book.selectServiceAndDate') || "Xizmat va Sanani Tanlang"}
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      {t('book.selectedBarber') || "Tanlangan usta:"} <strong className="text-amber-400">{selectedBarber?.name}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> {t('book.changeBarber')}
                  </button>
                </div>

                {/* Date Picker */}
                <div className="mb-8 p-6 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                    {t('book.selectDate')} *
                  </label>
                  <input
                    type="date"
                    min={getTodayStr()}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full sm:w-64 px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Services List */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
                    {t('book.selectService')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.map((srv) => (
                      <div
                        key={srv.id}
                        onClick={() => setSelectedServiceId(srv.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                          selectedServiceId === srv.id
                            ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20'
                            : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div>
                          <h4 className="font-serif text-sm font-bold text-white">
                            {getLocalized(srv, 'name')}
                          </h4>
                          <span className="text-xs text-neutral-400 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {srv.durationMinutes} {t('shop.duration')}
                          </span>
                        </div>
                        <div className="font-mono text-sm font-bold text-amber-400 shrink-0">
                          {srv.price?.toLocaleString()} {t('shop.sum')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-800 flex justify-end">
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-3 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-2"
                  >
                    <span>{t('book.proceedToTime')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: AVAILABLE TIME SLOTS */}
            {step === 3 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-white">
                      {t('book.availableSlotsTitle') || "Mavjud Bo'sh Vaqtlar (Slots)"}
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      {selectedDate}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> {t('book.changeDate')}
                  </button>
                </div>

                {loadingSlots ? (
                  <div className="py-16 flex justify-center">
                    <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-400">
                    <AlertCircle className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                    <p className="text-sm">{t('book.noSlots')}</p>
                    <button
                      onClick={() => setStep(2)}
                      className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 text-white"
                    >
                      {t('book.selectAnotherTime') || "Boshqa sana tanlash"}
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-8">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 px-2 rounded-xl text-sm font-mono font-bold transition-all ${
                            selectedSlot?.time === slot.time
                              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 ring-2 ring-amber-400'
                              : 'bg-neutral-950 border border-neutral-800 text-neutral-200 hover:border-amber-500/50 hover:text-white'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-neutral-800 flex justify-between items-center">
                      <div className="text-xs text-neutral-400">
                        {selectedSlot ? (
                          <span>
                            {t('dashboard.time')}: <strong className="text-amber-400">{selectedSlot.time}</strong>
                          </span>
                        ) : (
                          t('book.selectTime')
                        )}
                      </div>

                      <button
                        disabled={!selectedSlot}
                        onClick={() => setStep(4)}
                        className="px-6 py-3 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-40 flex items-center gap-2"
                      >
                        <span>{t('book.proceedToConfirm')}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: CUSTOMER DETAILS & FINAL CONFIRMATION */}
            {step === 4 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-2xl font-bold text-white">
                    {t('book.customerDetails')}
                  </h2>
                  <button
                    onClick={() => setStep(3)}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> {t('book.changeTime')}
                  </button>
                </div>

                {bookingError && (
                  <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs mb-6 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <form onSubmit={handleConfirmBooking} className="space-y-6">
                  {/* Order Summary Box */}
                  <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-neutral-500 block text-xs">{t('dashboard.barber')}:</span>
                      <span className="font-semibold text-white">{selectedBarber?.name}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-xs">{t('dashboard.service')}:</span>
                      <span className="font-semibold text-white">
                        {getLocalized(selectedService, 'name') || 'Standart Xizmat'}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-xs">{t('dashboard.date')} & {t('dashboard.time')}:</span>
                      <span className="font-semibold text-white">
                        {selectedDate} | {selectedSlot?.time}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-xs">{t('book.total')}</span>
                      <span className="font-bold text-amber-400">
                        {selectedService?.price?.toLocaleString() || '70,000'} {t('shop.sum')}
                      </span>
                    </div>
                  </div>

                  {/* Customer Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        {t('book.yourName')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Azizbek"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        {t('book.yourPhone')} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+998 90 123 45 67"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      {t('book.yourNotes')}
                    </label>
                    <textarea
                      rows="2"
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="..."
                      className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-xl font-bold text-base bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-neutral-950 hover:opacity-95 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50"
                  >
                    {submitting ? t('book.submitting') : t('book.confirmBooking')}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
