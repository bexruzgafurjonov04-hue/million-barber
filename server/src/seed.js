import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding MILLION BARBER database ---');

  // 1. Initial Admin
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;
  if (!adminPassword) {
    throw new Error(
      'Missing required environment variable: ADMIN_INITIAL_PASSWORD. Please define it in your server/.env file before running the seed script.'
    );
  }
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_INITIAL_EMAIL || 'admin@millionbarber.uz' },
    update: {
      passwordHash: hashedAdminPassword,
      isActive: true,
      role: 'ADMIN',
    },
    create: {
      name: 'Million Barber Admin',
      email: process.env.ADMIN_INITIAL_EMAIL || 'admin@millionbarber.uz',
      phone: '+998 90 123 45 67',
      passwordHash: hashedAdminPassword,
      role: 'ADMIN',
      isActive: true,
      forcePasswordChange: true, // Forces password change on first login as required!
    },
  });
  console.log(`✓ Admin user created/verified: ${admin.email}`);

  // 2. Barbers
  const barberInitialPassword = process.env.BARBER_INITIAL_PASSWORD;
  if (!barberInitialPassword) {
    throw new Error(
      'Missing required environment variable: BARBER_INITIAL_PASSWORD. Please define it in your server/.env file before running the seed script.'
    );
  }
  const barberPassword = await bcrypt.hash(barberInitialPassword, 10);

  // Barber 1: Bobur Aliyev
  const barberUser1 = await prisma.user.upsert({
    where: { email: 'bobur@millionbarber.uz' },
    update: {
      passwordHash: barberPassword,
      isActive: true,
      role: 'BARBER',
    },
    create: {
      name: 'Bobur Aliyev',
      email: 'bobur@millionbarber.uz',
      phone: '+998 93 111 22 33',
      passwordHash: barberPassword,
      role: 'BARBER',
      isActive: true,
      forcePasswordChange: false,
    },
  });

  const barberProfile1 = await prisma.barberProfile.upsert({
    where: { userId: barberUser1.id },
    update: {},
    create: {
      userId: barberUser1.id,
      slug: 'bobur-aliyev',
      title: 'Bosh Sartarosh & Stilist / Master Barber',
      bioUz: "Bobur Aliyev - 8 yillik xalqaro va milliy tajribaga ega usta sartarosh. Klassik qirqishlar, soqol parvarishi va zamonaviy uslublar bo'yicha yetakchi mutaxassis. Har bir mijozga individual yondashuv.",
      bioRu: "Бобур Алиев — мастер-барбер с 8-летним стажем. Специалист по классическим стрижкам, моделированию бороды и современным мужским стилям. Индивидуальный подход к каждому клиенту.",
      bioEn: "Bobur Aliyev — Master Barber with 8 years of experience. Specialist in classic haircuts, precision beard sculpting, and luxury grooming rituals.",
      experienceYears: 8,
      specialties: 'Classic Cut, Royal Fade, Beard Sculpting, Hot Towel Shave',
      avatarUrl: '/images/barber-bobur.jpg',
      phone: '+998 93 111 22 33',
      instagram: 'bobur_barber_chust',
      slotDurationMinutes: 45,
      isAcceptingBookings: true,
    },
  });

  // Barber 2: Jasur Rustamov
  const barberUser2 = await prisma.user.upsert({
    where: { email: 'jasur@millionbarber.uz' },
    update: {
      passwordHash: barberPassword,
      isActive: true,
      role: 'BARBER',
    },
    create: {
      name: 'Jasur Rustamov',
      email: 'jasur@millionbarber.uz',
      phone: '+998 94 444 55 66',
      passwordHash: barberPassword,
      role: 'BARBER',
      isActive: true,
      forcePasswordChange: false,
    },
  });

  const barberProfile2 = await prisma.barberProfile.upsert({
    where: { userId: barberUser2.id },
    update: {},
    create: {
      userId: barberUser2.id,
      slug: 'jasur-rustamov',
      title: 'Katta Stilist / Senior Stylist',
      bioUz: "Jasur Rustamov - 6 yillik professional amaliyotga ega usta. Skin fade, teksturali zamonaviy turmaklar va soqol shakllantirish bo'yicha ekspert. O'z ishiga san'at sifatida qaraydi.",
      bioRu: "Жасур Рустамов — старший стилист с 6-летним стажем. Эксперт по скин-фейдам, текстурным молодежным стрижкам и оформлению контуров бороды.",
      bioEn: "Jasur Rustamov — Senior Stylist with 6 years of experience. Expert in skin fades, textured cuts, modern styling, and precision beard grooming.",
      experienceYears: 6,
      specialties: 'Skin Fade, Textured Crop, Modern Pompadour, Beard Lineup',
      avatarUrl: '/images/barber-jasur.jpg',
      phone: '+998 94 444 55 66',
      instagram: 'jasur_barber_chust',
      slotDurationMinutes: 45,
      isAcceptingBookings: true,
    },
  });
  console.log('✓ Barbers seeded: Bobur Aliyev, Jasur Rustamov');

  // Schedules for barbers (Mon=1 through Sun=0)
  for (const bp of [barberProfile1, barberProfile2]) {
    for (let day = 0; day <= 6; day++) {
      // Sunday (0) half-day or off, Mon-Sat full working
      const isWorking = day !== 0; // Monday-Saturday
      await prisma.workingSchedule.upsert({
        where: { barberId_dayOfWeek: { barberId: bp.id, dayOfWeek: day } },
        update: {},
        create: {
          barberId: bp.id,
          dayOfWeek: day,
          isWorking: isWorking,
          startTime: '09:00',
          endTime: '20:00',
          breakStartTime: '13:00',
          breakEndTime: '14:00',
        },
      });
    }
  }
  console.log('✓ Working schedules seeded');

  // 3. Services
  const services = [
    {
      id: 'srv-1',
      nameUz: 'Klassik Soch Turmagi',
      nameRu: 'Классическая Стрижка',
      nameEn: 'Classic Haircut',
      descriptionUz: 'Bosh yuvish, individual uslub tanlash, qaychi va mashinka yordamida qirqish, styling.',
      descriptionRu: 'Мытье головы, индивидуальный подбор стиля, стрижка ножницами и машинкой, укладка премиум средствами.',
      descriptionEn: 'Hair wash, personalized consultation, precision scissor & clipper cut, luxury styling finish.',
      price: 70000,
      durationMinutes: 45,
      category: 'Haircut',
      sortOrder: 1,
    },
    {
      id: 'srv-2',
      nameUz: 'Fade / Skin Fade Turmagi',
      nameRu: 'Фейд / Скин Фейд',
      nameEn: 'Skin Fade Haircut',
      descriptionUz: 'Mukammal darajadagi silliq o\'tish (Low, Mid, High Fade), soch chizig\'ini tekislash va styling.',
      descriptionRu: 'Безупречный градиентный переход, четкая окантовка лезвием и премиум укладка.',
      descriptionEn: 'Flawless gradient fade transition, sharp razor outline, and matte styling.',
      price: 80000,
      durationMinutes: 45,
      category: 'Haircut',
      sortOrder: 2,
    },
    {
      id: 'srv-3',
      nameUz: 'Soqol Dizayni va Parvarishi',
      nameRu: 'Моделирование и Уход за Бородой',
      nameEn: 'Beard Styling & Grooming',
      descriptionUz: 'Soqol shaklini tuzatish, bug\'li issiq sochiq, lezviyada toza chiziqlar, moy va balzam surtish.',
      descriptionRu: 'Коррекция формы бороды, распаривание горячим полотенцем, четкие контуры опасной бритвой, питательные масла.',
      descriptionEn: 'Beard sculpting, hot towel steam ritual, straight-razor contours, nourishing oil treatment.',
      price: 50000,
      durationMinutes: 30,
      category: 'Beard',
      sortOrder: 3,
    },
    {
      id: 'srv-4',
      nameUz: 'MILLION VIP Kompleks (Soch + Soqol)',
      nameRu: 'MILLION VIP Комплекс (Стрижка + Борода)',
      nameEn: 'MILLION VIP Combo (Cut + Beard)',
      descriptionUz: 'Premium soch turmagi + soqol dizayni + issiq sochiq + yengil bosh massaji + eksklyuziv parvarish.',
      descriptionRu: 'Премиум стрижка + оформление бороды + горячее полотенце + массаж головы + полный уход.',
      descriptionEn: 'Signature haircut + full beard grooming + hot towel compress + relaxing scalp massage + style.',
      price: 110000,
      durationMinutes: 60,
      category: 'Combo',
      sortOrder: 4,
    },
    {
      id: 'srv-5',
      nameUz: 'Qirollik Qirqish va Issiq Sochiq',
      nameRu: 'Королевское Бритье Опасным Лезвием',
      nameEn: 'Royal Shave Ritual',
      descriptionUz: 'An\'anaviy ochiq lezviyada qirish, ko\'p bosqichli issiq/sovuq sochiq, yumshatuvchi krem va odekolon.',
      descriptionRu: 'Традиционное бритье опасной бритвой с горячим компрессом, массажем и успокаивающим лосьоном.',
      descriptionEn: 'Traditional straight razor shave with aromatherapy hot towel, pre-shave cream, and soothing aftershave balm.',
      price: 60000,
      durationMinutes: 35,
      category: 'Shave',
      sortOrder: 5,
    },
    {
      id: 'srv-6',
      nameUz: 'Bolalar Soch Turmagi',
      nameRu: 'Детская Стрижка (до 12 лет)',
      nameEn: 'Kids Haircut (Under 12)',
      descriptionUz: 'Kichkintoylar uchun ehtiyotkor va zamonaviy soch turmagi, qulay muhitda.',
      descriptionRu: 'Аккуратная и стильная стрижка для юных джентльменов в комфортной дружелюбной обстановке.',
      descriptionEn: 'Patient, trendy haircuts for young gentlemen in a relaxed environment.',
      price: 50000,
      durationMinutes: 30,
      category: 'Haircut',
      sortOrder: 6,
    },
  ];

  for (const srv of services) {
    await prisma.service.upsert({
      where: { id: srv.id },
      update: {},
      create: srv,
    });
  }
  console.log('✓ Services seeded');

  // 4. Shop Images
  const shopImages = [
    {
      id: 'shop-img-1',
      imageUrl: '/images/shop-interior-1.png',
      captionUz: 'MILLION BARBER asosiy zali - zamonaviy qora va oltin dizayn',
      captionRu: 'Главный зал MILLION BARBER — современный дизайн в черных и золотых тонах',
      captionEn: 'MILLION BARBER Main Hall — Modern luxury black & gold aesthetic',
      isFeatured: true,
      sortOrder: 1,
    },
    {
      id: 'shop-img-2',
      imageUrl: '/images/shop-interior-2.png',
      captionUz: 'Premium charm kreslolar va marmar jihozlangan ustaxona',
      captionRu: 'Премиальные кожаные кресла и рабочая зона с отделкой под мрамор',
      captionEn: 'Premium leather barber chairs and luxury marble grooming stations',
      isFeatured: true,
      sortOrder: 2,
    },
    {
      id: 'shop-img-3',
      imageUrl: '/images/hero-bg.png',
      captionUz: 'Mijozlarimiz uchun qulay kutish va dam olish hududi',
      captionRu: 'Комфортная зона ожидания и отдыха для наших гостей',
      captionEn: 'Comfortable client lounge & atmosphere',
      isFeatured: true,
      sortOrder: 3,
    },
  ];

  for (const img of shopImages) {
    await prisma.shopImage.upsert({
      where: { id: img.id },
      update: {},
      create: img,
    });
  }
  console.log('✓ Shop images seeded');

  // 5. Portfolio Images
  const portfolioItems = [
    {
      id: 'port-1',
      barberId: barberProfile1.id,
      imageUrl: '/images/shop-interior-1.png',
      titleUz: 'Royal Fade & Sharp Beard',
      titleRu: 'Роял Фейд и Четкая Борода',
      titleEn: 'Royal Fade & Sharp Beard',
      category: 'FADE',
      isApproved: true,
      isFeatured: true,
    },
    {
      id: 'port-2',
      barberId: barberProfile1.id,
      imageUrl: '/images/barber-bobur.jpg',
      titleUz: 'Klassik Gentleman Cut',
      titleRu: 'Классический Джентльменский Стиль',
      titleEn: 'Classic Gentleman Cut',
      category: 'CLASSIC',
      isApproved: true,
      isFeatured: true,
    },
    {
      id: 'port-3',
      barberId: barberProfile2.id,
      imageUrl: '/images/shop-interior-2.png',
      titleUz: 'Teksturali Crop & Mid Fade',
      titleRu: 'Текстурный Кроп и Мид Фейд',
      titleEn: 'Textured Crop & Mid Fade',
      category: 'TEXTURED',
      isApproved: true,
      isFeatured: true,
    },
    {
      id: 'port-4',
      barberId: barberProfile2.id,
      imageUrl: '/images/barber-jasur.jpg',
      titleUz: 'Premium Soqol Dizayni',
      titleRu: 'Премиальное Моделирование Бороды',
      titleEn: 'Premium Beard Styling',
      category: 'BEARD',
      isApproved: true,
      isFeatured: true,
    },
  ];

  for (const p of portfolioItems) {
    await prisma.portfolioImage.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }
  console.log('✓ Portfolio images seeded');

  // 6. Business Settings
  await prisma.businessSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      shopName: 'MILLION BARBER',
      phone: '+998 90 123 45 67',
      addressUz: 'Chust tumani, Namangan viloyati, O\'zbekiston',
      addressRu: 'Чустский район, Наманганская область, Узбекистан',
      addressEn: 'Chust district, Namangan region, Uzbekistan',
      workingHoursUz: 'Dushanba - Shanba: 09:00 - 20:00 (Yakshanba: Dam olish)',
      workingHoursRu: 'Понедельник - Суббота: 09:00 - 20:00 (Воскресенье: Выходной)',
      workingHoursEn: 'Monday - Saturday: 09:00 - 20:00 (Sunday: Day Off)',
      timezone: 'Asia/Tashkent',
      instagramUrl: 'https://instagram.com/millionbarber_chust',
      telegramUrl: 'https://t.me/millionbarber_chust',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12093.8427771239!2d71.2291!3d41.0094!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x387ca52b2b1a8d0b%3A0x86b0a1a095f939e6!2sChust%2C%20Namangan%20Region%2C%20Uzbekistan!5e0!3m2!1sen!2s!4v1710000000000!5m2!1sen!2s',
      cancellationPolicyUz: 'Bandlikni bekor qilish kamida 2 soat oldin amalga oshirilishi so\'raladi.',
      cancellationPolicyRu: 'Просим производить отмену бронирования минимум за 2 часа до назначенного времени.',
      cancellationPolicyEn: 'We kindly request that cancellations be made at least 2 hours prior to your slot.',
    },
  });
  console.log('✓ Business settings verified');

  // 7. Reviews (Marked as Sample Reviews in compliance with requirement 11)
  const sampleReviews = [
    {
      id: 'rev-1',
      authorName: 'Akmal Tursunov',
      rating: 5,
      commentUz: 'Chustda bunday darajadagi sartaroshxona ochilganidan juda xursandman. Bobur ustaning qo\'li yengil, atmosferasi shohona!',
      commentRu: 'Очень рад, что в Чусте открылся барбершоп такого высокого уровня. У мастера Бобура легкая рука, атмосфера премиальная!',
      commentEn: 'Very glad such a high-class barbershop opened in Chust. Master Bobur has an incredible touch, luxury atmosphere!',
      isVerified: true,
      isSample: true,
    },
    {
      id: 'rev-2',
      authorName: 'Farrux Zokirov',
      rating: 5,
      commentUz: 'Skin fade va soqol shakllantirish bo\'yicha Jasur ustaga teng keladigani yo\'q. Qahva va qulay kutish zali ham ajoyib.',
      commentRu: 'В фейдах и контурах бороды мастеру Жасуру нет равных. Отличный кофе и уютная зона ожидания.',
      commentEn: 'When it comes to skin fades and sharp beard lines, Jasur is top notch. Great coffee and comfortable lounge.',
      isVerified: true,
      isSample: true,
    },
  ];

  for (const rev of sampleReviews) {
    await prisma.review.upsert({
      where: { id: rev.id },
      update: {},
      create: rev,
    });
  }
  console.log('✓ Sample reviews seeded');

  console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
