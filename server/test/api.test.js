import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/prisma.js';

describe('MILLION BARBER Full Project Audit & Concurrency Verification Test Suite', () => {
  let adminToken = '';
  let barberToken1 = '';
  let barberToken2 = '';
  let barber1Id = '';
  let barber2Id = '';
  let createdBarberId = '';
  let firstApptId = '';
  let firstApptRef = '';
  let cancellableApptId = '';
  let cancellableApptRef = '';

  const testDate = '2026-11-25'; // Wednesday (Working day for both barbers)

  beforeAll(async () => {
    // Clean up test appointments on test date to have a clean state
    await prisma.appointment.deleteMany({
      where: { date: testDate },
    });

    // Ensure test barbers exist
    const barbers = await prisma.barberProfile.findMany({
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
    expect(barbers.length).toBeGreaterThanOrEqual(2);
    barber1Id = barbers[0].id;
    barber2Id = barbers[1].id;
  });

  afterAll(async () => {
    // Clean up created test entities
    if (createdBarberId) {
      await prisma.appointment.deleteMany({ where: { barberId: createdBarberId } });
      await prisma.workingSchedule.deleteMany({ where: { barberId: createdBarberId } });
      const bp = await prisma.barberProfile.findUnique({ where: { id: createdBarberId } });
      if (bp) {
        await prisma.barberProfile.delete({ where: { id: createdBarberId } });
        await prisma.user.delete({ where: { id: bp.userId } });
      }
    }
    await prisma.appointment.deleteMany({ where: { date: testDate } });
    await prisma.$disconnect();
  });

  // =========================================================================
  // 1. BARBERLAR RO'YXATINI OLISH (GET BARBERS LIST)
  // =========================================================================
  it('1. should retrieve list of active barbers with status 200', async () => {
    const res = await request(app).get('/api/barbers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.barbers)).toBe(true);
    expect(res.body.barbers.length).toBeGreaterThanOrEqual(2);

    const first = res.body.barbers[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('experienceYears');
    expect(first).toHaveProperty('todayAvailability');
  });

  // =========================================================================
  // 2. ADMIN BARBER YARATISHI VA TAHRIRLASHI (ADMIN CREATE & EDIT BARBER)
  // =========================================================================
  it('2a. should reject login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@millionbarber.uz', password: 'wrong_password_999' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('2b. should allow admin to login and obtain JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@millionbarber.uz', password: 'million2026' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('ADMIN');
    adminToken = res.body.token;
  });

  it('2c. should allow admin to create a new barber profile', async () => {
    const randomSuffix = Math.floor(Math.random() * 10000);
    const newBarberPayload = {
      name: `Sanjar Test ${randomSuffix}`,
      email: `sanjar${randomSuffix}@millionbarber.uz`,
      phone: `+99890${randomSuffix.toString().padStart(7, '0')}`,
      password: 'initialPass123',
      title: 'Top Barber & Stylist',
      experienceYears: 4,
      specialties: 'Fade, Scissor Cut',
      bioUz: 'Sanjar - tajribali yosh usta.',
      bioRu: 'Санжар - опытный мастер.',
      bioEn: 'Sanjar - experienced young barber.',
    };

    const res = await request(app)
      .post('/api/admin/barbers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newBarberPayload);

    expect(res.status).toBe(201);
    expect(res.body.barber).toBeDefined();
    expect(res.body.barber.user.name).toBe(newBarberPayload.name);
    createdBarberId = res.body.barber.id;
  });

  it('2d. should allow admin to edit an existing barber profile', async () => {
    const res = await request(app)
      .put(`/api/admin/barbers/${createdBarberId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Sanjar Updated Name',
        title: 'Master VIP Barber',
        experienceYears: 5,
        phone: '+998909990011',
      });

    expect(res.status).toBe(200);
    expect(res.body.barber.user.name).toBe('Sanjar Updated Name');
    expect(res.body.barber.title).toBe('Master VIP Barber');
    expect(res.body.barber.experienceYears).toBe(5);
  });

  it('2e. should allow admin to toggle barber active status', async () => {
    const res = await request(app)
      .put(`/api/admin/barbers/${createdBarberId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.barber.user.isActive).toBe(false);

    // Toggle back to active
    const res2 = await request(app)
      .put(`/api/admin/barbers/${createdBarberId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: true });

    expect(res2.status).toBe(200);
    expect(res2.body.barber.user.isActive).toBe(true);
  });

  // =========================================================================
  // 3. LOGIN VA RUXSATLAR (LOGIN & PERMISSIONS)
  // =========================================================================
  it('3a. should log in barber 1 and return role BARBER', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bobur@millionbarber.uz', password: 'barber123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('BARBER');
    barberToken1 = res.body.token;
  });

  it('3b. should log in barber 2', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jasur@millionbarber.uz', password: 'barber123' });

    expect(res.status).toBe(200);
    barberToken2 = res.body.token;
  });

  it('3c. should reject non-admin from accessing admin endpoints (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${barberToken1}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBeDefined();
  });

  it('3d. should allow admin to access admin stats', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.stats).toBeDefined();
    expect(res.body.stats.totalBarbers).toBeGreaterThanOrEqual(2);
  });

  // =========================================================================
  // 4. BIR VAQTGA BIRINCHI BOOKING MUVAFFAQIYATLI BO'LISHI
  // =========================================================================
  it('4. should successfully book an initial appointment (201 Created)', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({
        barberId: barber1Id,
        customerName: 'Mijoz Birinchi',
        customerPhone: '+998901110001',
        date: testDate,
        startTime: '10:00',
      });

    expect(res.status).toBe(201);
    expect(res.body.booking).toBeDefined();
    expect(res.body.booking.bookingReference).toMatch(/^MB-\d{5}$/);
    expect(res.body.booking.status).toBe('CONFIRMED');
    expect(res.body.booking.startTime).toBe('10:00');

    firstApptId = res.body.booking.id;
    firstApptRef = res.body.booking.bookingReference;
  });

  // =========================================================================
  // 5. AYNAN SHU VAQTGA IKKINCHI BOOKING RAD ETILISHI (EXACT SLOT CONFLICT)
  // =========================================================================
  it('5. should reject second booking for EXACT SAME slot with exact error message', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({
        barberId: barber1Id,
        customerName: 'Mijoz Ikkinchi',
        customerPhone: '+998902220002',
        date: testDate,
        startTime: '10:00',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Bu vaqt boshqa mijoz tomonidan band qilindi. Boshqa vaqtni tanlang.');
  });

  // =========================================================================
  // 6. BIR VAQTDA YUBORILGAN IKKI PARALLEL BOOKING (CONCURRENCY CONTROL)
  // =========================================================================
  it('6. should handle concurrent parallel bookings: exactly 1 succeeds, 1 rejected', async () => {
    const slotTime = '15:00';

    const reqA = request(app)
      .post('/api/appointments')
      .send({
        barberId: barber1Id,
        customerName: 'Parallel Client A',
        customerPhone: '+998905550001',
        date: testDate,
        startTime: slotTime,
      });

    const reqB = request(app)
      .post('/api/appointments')
      .send({
        barberId: barber1Id,
        customerName: 'Parallel Client B',
        customerPhone: '+998905550002',
        date: testDate,
        startTime: slotTime,
      });

    const [resA, resB] = await Promise.all([reqA, reqB]);

    const statuses = [resA.status, resB.status];
    expect(statuses).toContain(201);
    expect(statuses).toContain(400);

    const failedRes = resA.status === 400 ? resA : resB;
    expect(failedRes.body.error).toBe('Bu vaqt boshqa mijoz tomonidan band qilindi. Boshqa vaqtni tanlang.');
  });

  // =========================================================================
  // 7. USTMA-UST KELUVCHI VAQT ORALIG'I RAD ETILISHI (INTERVAL OVERLAP)
  // =========================================================================
  it('7. should reject an overlapping appointment interval (e.g. 10:30 overlaps 10:00-10:45)', async () => {
    // 10:00 appointment occupies 10:00 to 10:45 (slotDuration 45 min)
    // Booking at 10:30 overlaps with 10:00 - 10:45
    const res = await request(app)
      .post('/api/appointments')
      .send({
        barberId: barber1Id,
        customerName: 'Overlapping Client',
        customerPhone: '+998903330003',
        date: testDate,
        startTime: '10:30',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Bu vaqt boshqa mijoz tomonidan band qilindi. Boshqa vaqtni tanlang.');
  });

  // =========================================================================
  // 8. CANCELLED BOOKING VAQTINING QAYTA OCHILISHI (CANCEL RE-OPENS SLOT)
  // =========================================================================
  it('8. should re-open time slot after booking is CANCELLED', async () => {
    // First, book 11:00
    const bookRes = await request(app)
      .post('/api/appointments')
      .send({
        barberId: barber1Id,
        customerName: 'Cancel Test Client',
        customerPhone: '+998904440004',
        date: testDate,
        startTime: '11:00',
      });

    expect(bookRes.status).toBe(201);
    cancellableApptId = bookRes.body.booking.id;
    cancellableApptRef = bookRes.body.booking.bookingReference;

    // Verify trying to book 11:00 now fails
    const failRes = await request(app)
      .post('/api/appointments')
      .send({
        barberId: barber1Id,
        customerName: 'Another Client',
        customerPhone: '+998907770007',
        date: testDate,
        startTime: '11:00',
      });
    expect(failRes.status).toBe(400);

    // Now cancel the appointment
    const cancelRes = await request(app)
      .post(`/api/appointments/${cancellableApptId}/cancel`)
      .send({
        bookingReference: cancellableApptRef,
        customerPhone: '+998904440004',
        reason: 'Customer rescheduled plans',
      });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.booking.status).toBe('CANCELLED');

    // Now re-booking 11:00 MUST succeed
    const rebookRes = await request(app)
      .post('/api/appointments')
      .send({
        barberId: barber1Id,
        customerName: 'New Client Taking Cancelled Slot',
        customerPhone: '+998908880008',
        date: testDate,
        startTime: '11:00',
      });

    expect(rebookRes.status).toBe(201);
    expect(rebookRes.body.booking.startTime).toBe('11:00');
  });

  // =========================================================================
  // 9. BOSHQА BARBER UCHUN SHU VAQTGA BOOKING MUMKINLIGI
  // =========================================================================
  it('9. should allow booking the SAME time slot for a DIFFERENT barber', async () => {
    // Barber 1 is booked at 10:00 on testDate.
    // Booking Barber 2 at 10:00 on testDate MUST succeed!
    const res = await request(app)
      .post('/api/appointments')
      .send({
        barberId: barber2Id,
        customerName: 'Barber Two Client',
        customerPhone: '+998909990009',
        date: testDate,
        startTime: '10:00',
      });

    expect(res.status).toBe(201);
    expect(res.body.booking.barberName).toBeDefined();
    expect(res.body.booking.startTime).toBe('10:00');
  });

  // =========================================================================
  // 10. RESCHEDULE OPERATSIYASIDA TO'QNASHUVLARNI TEKSHIRISH
  // =========================================================================
  it('10a. should reject rescheduling an appointment to an already-booked slot', async () => {
    // Attempt to reschedule Barber 2 appointment from 10:00 (which is booked) - wait,
    // let's book Barber 1 at 16:00 and try to reschedule firstAppt (at 10:00) to 16:00.
    const tempBook = await request(app)
      .post('/api/appointments')
      .send({
        barberId: barber1Id,
        customerName: 'Temp 16:00 Client',
        customerPhone: '+998901616161',
        date: testDate,
        startTime: '16:00',
      });
    expect(tempBook.status).toBe(201);

    // Try to reschedule firstAppt (which was 10:00) to 16:00 -> must fail with conflict
    const rescheduleRes = await request(app)
      .post(`/api/appointments/${firstApptId}/reschedule`)
      .send({
        newDate: testDate,
        newStartTime: '16:00',
        bookingReference: firstApptRef,
        customerPhone: '+998901110001',
      });

    expect(rescheduleRes.status).toBe(400);
    expect(rescheduleRes.body.error).toBe('Bu vaqt boshqa mijoz tomonidan band qilindi. Boshqa vaqtni tanlang.');
  });

  it('10b. should successfully reschedule appointment to a valid free slot', async () => {
    // Reschedule firstAppt (10:00) to 17:00 (free slot)
    const rescheduleRes = await request(app)
      .post(`/api/appointments/${firstApptId}/reschedule`)
      .send({
        newDate: testDate,
        newStartTime: '17:00',
        bookingReference: firstApptRef,
        customerPhone: '+998901110001',
      });

    expect(rescheduleRes.status).toBe(200);
    expect(rescheduleRes.body.booking.startTime).toBe('17:00');

    // And now 10:00 must be open again!
    const rebook10 = await request(app)
      .post('/api/appointments')
      .send({
        barberId: barber1Id,
        customerName: 'Client for Opened 10:00 Slot',
        customerPhone: '+998901010101',
        date: testDate,
        startTime: '10:00',
      });

    expect(rebook10.status).toBe(201);
  });
});
