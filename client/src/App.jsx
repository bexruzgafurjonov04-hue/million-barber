import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

// Pages
import { Home } from './pages/Home.jsx';
import { About } from './pages/About.jsx';
import { Barbers } from './pages/Barbers.jsx';
import { BarberProfile } from './pages/BarberProfile.jsx';
import { Shop } from './pages/Shop.jsx';
import { Works } from './pages/Works.jsx';
import { Contact } from './pages/Contact.jsx';
import { Book } from './pages/Book.jsx';
import { Login } from './pages/Login.jsx';
import { BarberDashboard } from './pages/BarberDashboard.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-neutral-950 text-neutral-100 transition-colors duration-200">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/barbers" element={<Barbers />} />
            <Route path="/barbers/:barberId" element={<BarberProfile />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/works" element={<Works />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/book" element={<Book />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<Login />} />

            {/* Protected Barber Dashboard */}
            <Route
              path="/barber/dashboard"
              element={
                <ProtectedRoute requiredRole="BARBER">
                  <BarberDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Dashboard */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 Not Found */}
            <Route
              path="*"
              element={
                <div className="py-32 text-center text-neutral-400">
                  <h1 className="text-4xl font-serif text-white font-bold mb-4">404</h1>
                  <p className="mb-6">Kechirasiz, sahifa topilmadi / Page not found.</p>
                  <a
                    href="/"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-sm"
                  >
                    Bosh sahifaga qaytish
                  </a>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
