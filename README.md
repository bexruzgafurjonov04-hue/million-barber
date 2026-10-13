# 💈 MILLION BARBER — Full-Stack Web Application

**MILLION BARBER** is a luxury barbershop and online appointment management web application tailored for **MILLION BARBER** located in Chust district, Namangan region, Uzbekistan.

This is a real, complete, production-ready full-stack application featuring:
- **Cinematic Frontend** built with React, Vite, Tailwind CSS, Lucide React, and Framer Motion.
- **Robust Express Backend** built with Node.js ES modules, Helmet, CORS, and Rate Limiting.
- **PostgreSQL Database** managed via **Prisma ORM** with relational integrity, transactions, and locking.
- **Real Appointment Booking System** with Asia/Tashkent (+05:00) timezone calculations, dynamic slot generation, and concurrent double-booking conflict prevention.
- **Role-Based Authorization (RBAC)** for Admin and Barbers with secure bcrypt hashing and HTTP-only JWT cookies/tokens.
- **Enforced Security**: Initial admin account (`admin@millionbarber.uz` with default password `million2026`) forces password change on first login.
- **Barber Personal Dashboard**: Manage schedule, break times, holidays, bookings, photo portfolio, and profile.
- **Administrator Dashboard**: Full management of barbers, all appointments, pricing, services, portfolio moderation, shop interior images, contact messages, and settings.
- **Three-Language Support (i18n)**: Uzbek (Latin, default), Russian, and English.
- **Theme**: Luxury dark aesthetic (default) with working Light theme toggle.

---

## 🛠 Technology Stack

### Frontend
- **React 19** with **Vite 8** (JavaScript)
- **Tailwind CSS v4** with `@tailwindcss/vite`
- **React Router DOM v7**
- **Lucide React** (clean scalable icons)
- **i18next & react-i18next** (Uzbek, Russian, English)
- **Axios** (API requests with credentials & interceptors)

### Backend
- **Node.js** (v24+) & **Express.js** (ES Modules)
- **PostgreSQL** database
- **Prisma ORM** (migrations, models, schema)
- **Bcrypt.js** (password hashing)
- **JSON Web Tokens (JWT)** & **Cookie-Parser**
- **Multer** (safe image file uploads with MIME validation)
- **Zod** (runtime schema validation)
- **Dayjs** (Asia/Tashkent timezone calculations)
- **Supertest & Vitest** (automated test suite)

---

## 🚀 Quick Start (Windows PowerShell)

### 1. Prerequisites
- **Node.js**: v18 or higher (tested on Node v24.18.0)
- **PostgreSQL**: Running on `localhost:5432`

### 2. Install All Dependencies
Run this single command from the project root:
```powershell
npm run install:all
```
*(Or install manually: `npm install`, `cd server; npm install`, `cd ../client; npm install`)*

### 3. Database Setup & Migrations
Ensure PostgreSQL service is running. Then synchronize the database schema:
```powershell
npm run prisma:push
```

### 4. Seed Development & Initial Data
Populate the database with services, master barbers, default schedules, luxury interior photos, and the administrator account:
```powershell
npm run seed
```

### 5. Run Automated Tests
Execute the automated test suite covering authentication, RBAC, appointment booking, and double-booking conflict prevention:
```powershell
npm test
```

### 6. Start Full Application (Development)
Launch both the Express backend (`http://localhost:5000`) and the Vite React frontend (`http://localhost:5173`) concurrently:
```powershell
npm run dev
```

Open your browser and navigate to: **`http://localhost:5173`**

---

## 🔑 Default Accounts & Credentials

### 1. Administrator Account
- **Email**: `admin@millionbarber.uz`
- **Initial Password**: `million2026`
- **Role**: `ADMIN`
- **Note**: The application enforces a **mandatory password change** on the first login to protect the shop owner.

### 2. Barber Accounts
- **Master Barber Bobur Aliyev**:
  - Email: `bobur@millionbarber.uz`
  - Password: `barber123`
- **Senior Stylist Jasur Rustamov**:
  - Email: `jasur@millionbarber.uz`
  - Password: `barber123`

---

## 📂 Project Structure

```
cut shop/
├── package.json              # Root orchestrator with concurrently scripts
├── README.md                 # Complete documentation
├── client/                   # Vite + React Frontend
│   ├── public/
│   │   ├── favicon.svg       # MB Monogram gold favicon
│   │   └── images/           # Authentic barbershop imagery
│   ├── src/
│   │   ├── api/axios.js      # Configured Axios with interceptors
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Logo.jsx      # MB Monogram & brand wordmark
│   │   │   ├── Navbar.jsx    # Sticky responsive navigation & language switcher
│   │   │   ├── Footer.jsx    # Brand footer with Chust location & hours
│   │   │   ├── TashkentClock.jsx # Live Asia/Tashkent digital clock
│   │   │   ├── Lightbox.jsx  # Fullscreen image viewer
│   │   │   └── ProtectedRoute.jsx # RBAC route guard
│   │   ├── context/          # Auth & Theme context providers
│   │   ├── i18n/             # UZ, RU, EN translation dictionaries
│   │   ├── pages/            # Public & dashboard pages
│   │   │   ├── Home.jsx      # Cinematic landing page
│   │   │   ├── About.jsx     # Brand story & hygiene standards
│   │   │   ├── Barbers.jsx   # Directory with real availability filters
│   │   │   ├── BarberProfile.jsx # Bio, schedules & completed haircuts
│   │   │   ├── Shop.jsx      # Salon interior, pricing & map embed
│   │   │   ├── Works.jsx     # Filterable haircut portfolio gallery
│   │   │   ├── Contact.jsx   # Live clock, map & contact form
│   │   │   ├── Book.jsx      # 4-step real appointment booking wizard
│   │   │   ├── Login.jsx     # Portal login with password change enforcement
│   │   │   ├── BarberDashboard.jsx # Barber management panel
│   │   │   └── AdminDashboard.jsx  # Complete administration dashboard
│   │   ├── App.jsx           # Application routes
│   │   └── index.css         # Luxury gold design system & theme variables
│   └── vite.config.js        # Vite config with proxy to Express backend
└── server/                   # Express + Prisma Backend
    ├── prisma/
    │   └── schema.prisma     # Normalized PostgreSQL schema
    ├── uploads/              # Dynamic image upload storage
    ├── test/
    │   └── api.test.js       # Vitest automated test suite (14 tests)
    └── src/
        ├── middleware/       # Auth, Multer upload & Rate limiters
        ├── routes/           # REST API endpoints
        ├── utils/            # Asia/Tashkent slot generation algorithms
        ├── seed.js           # Database seed script
        ├── app.js            # Express application setup
        └── server.js         # HTTP server listener
```

---

## 🔒 Security & Concurrency Design

1. **Double-Booking Prevention**:
   - Time slots are checked on load, then validated **again** in an interactive database transaction at submission time.
   - Any overlap (`startDateTime < newEndDateTime AND endDateTime > newStartDateTime`) throws an immediate rejection, guaranteeing only one customer gets the slot under concurrent requests.
2. **Password Security**:
   - Passwords hashed with bcrypt (12 rounds for admin, 10 rounds for staff).
   - Passwords never logged or exposed in API responses.
3. **Asia/Tashkent Timezone Integrity**:
   - Dates and time intervals are parsed with strict UTC offsets matching `Asia/Tashkent` (+05:00), ensuring schedules never drift.

---

## 📍 Location & Physical Salon Information
- **Location**: Chust district, Namangan region, Uzbekistan (*Chust tumani, Namangan viloyati, O'zbekiston*)
- **Working Hours**: Daily 09:00 - 21:00
- **Phone**: +998 90 123 45 67
