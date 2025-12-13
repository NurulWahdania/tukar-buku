// src/layouts/MainLayouts.jsx

import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate, Link, useSearchParams } from 'react-router-dom';
import bg from '../assets/latar.png';

// Komponen Sidebar Kiri (sederhana: Beranda + Tentang)
function GuestSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  return (
    <aside className="hidden lg:flex fixed left-8 top-28 w-60 flex-col gap-2 z-40">
      <button
        type="button"
        onClick={() => navigate('/category')}
        className={`w-60 h-12 px-3 py-4 rounded-xl inline-flex items-center gap-2.5 ${currentPath.startsWith('/category') || currentPath === '/' ? 'bg-white/5 outline outline-1 outline-offset-[-1px] outline-white/0 backdrop-blur-[10px]' : ''}`}
      >
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#FFE4C7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 11l9-7 9 7" />
            <path d="M5 11v8a2 2 0 002 2h3v-6h4v6h3a2 2 0 002-2v-8" />
          </svg>
          <div className="text-[#FFE4C7] text-base font-normal font-['Inter']">Beranda</div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => navigate('/about')}
        className={`w-60 h-12 px-3 py-4 rounded-xl inline-flex items-center gap-2.5 ${currentPath.startsWith('/about') ? 'bg-white/5 outline outline-1 outline-offset-[-1px] outline-white/0 backdrop-blur-[10px]' : ''}`}
      >
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#FFE4C7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8h.01M12 12v5" />
          </svg>
          <div className="text-[#FFE4C7] text-base font-normal font-['Inter']">Tentang</div>
        </div>
      </button>
    </aside>
  );
}

// Komponen Navigasi Mobile (Bottom Navigation)
function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-lg border-t border-white/10 flex items-center justify-around z-50">
      <button
        onClick={() => navigate('/category')}
        className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors ${
          currentPath.startsWith('/category') || currentPath === '/' ? 'text-[#FFE4C7]' : 'text-zinc-400'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11l9-7 9 7" />
          <path d="M5 11v8a2 2 0 002 2h3v-6h4v6h3a2 2 0 002-2v-8" />
        </svg>
        <span className="text-[10px] font-medium font-['Inter']">Beranda</span>
      </button>
      <button
        onClick={() => navigate('/about')}
        className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors ${
          currentPath.startsWith('/about') ? 'text-[#FFE4C7]' : 'text-zinc-400'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8h.01M12 12v5" />
        </svg>
        <span className="text-[10px] font-medium font-['Inter']">Tentang</span>
      </button>
    </nav>
  );
}

export default function MainLayouts() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || "");
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    // Live search: navigate immediately with replace to avoid history clutter
    navigate(`/?search=${encodeURIComponent(val)}`, { replace: true });
  };

  return (
    <div className="relative min-h-screen min-w-full bg-black overflow-auto font-inter">
      {/* Background */}
      <img className="absolute inset-0 w-full h-full object-cover z-0" src={bg} alt="background" />

      {/* Navbar: logo left, search center, auth buttons right */}
      <header className="fixed top-6 left-6 right-6 z-50 hidden lg:flex items-center gap-4">
        <div className="text-[#FFE4C7] text-3xl font-bold font-['Inter']">TUKAR BUKU</div>

        {/* Search block (504px) matching provided markup */}
        <div className="mx-auto">
          <div className="w-[504px] h-10 relative">
            <div className="absolute inset-0 bg-white/5 rounded-[20px] border border-white/10" />
            {/* search icon */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FFE4C7]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="6" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              value={search}
              onChange={handleSearchChange}
              className="absolute left-[44px] top-1/2 -translate-y-1/2 w-[420px] bg-transparent outline-none text-[#FFE4C7] text-xs placeholder:text-[#CDBA9A] px-0"
              placeholder="Cari judul buku atau penulis..."
            />
          </div>
        </div>

        {/* Auth buttons right */}
        <div className="flex items-center gap-3">
          <Link to="/login" className="w-24 h-8 px-7 py-2 bg-white/5 rounded outline outline-1 outline-offset-[-1px] outline-[#FFE4C7] inline-flex items-center justify-center">
            <div className="text-[#FFE4C7] text-xs font-medium font-['Inter']">Masuk</div>
          </Link>
          <Link to="/register" className="w-24 h-8 px-7 py-2 bg-[#FFE4C7] rounded inline-flex items-center justify-center">
            <div className="text-black text-xs font-medium font-['Inter']">Registrasi</div>
          </Link>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[#FFE4C7] text-xl font-bold font-['Inter']">TUKAR BUKU</div>
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-3 py-1.5 bg-white/5 rounded border border-[#FFE4C7] text-[#FFE4C7] text-[10px] font-medium font-['Inter']">
                Masuk
              </Link>
              <Link to="/register" className="px-3 py-1.5 bg-[#FFE4C7] rounded text-black text-[10px] font-medium font-['Inter']">
                Daftar
              </Link>
            </div>
          </div>
          
          {/* Mobile Search */}
          <div className="w-full h-9 relative">
            <div className="absolute inset-0 bg-white/5 rounded-[20px] border border-white/10" />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FFE4C7]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="6" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              value={search}
              onChange={handleSearchChange}
              className="absolute left-[36px] top-1/2 -translate-y-1/2 w-[calc(100%-48px)] bg-transparent outline-none text-[#FFE4C7] text-xs placeholder:text-[#CDBA9A] px-0"
              placeholder="Cari judul buku atau penulis..."
            />
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <GuestSidebar />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Main content: offset by sidebar and header; scrollable */}
      <main className="absolute left-0 lg:left-[300px] top-[110px] lg:top-28 right-0 lg:right-6 bottom-16 lg:bottom-14 overflow-auto px-4 lg:px-0">
        <div className="max-w-[1020px] mx-auto py-4">
          <Outlet />
        </div>
      </main>

      {/* Footer: center, thin divider and copyright block */}
      <footer className="hidden lg:block fixed bottom-4 left-6 right-6 z-50 pointer-events-none">
        <div className="max-w-[1372px] mx-auto">
          <div className="h-px w-full bg-white/10 mb-3" />
          <div className="flex items-center justify-center gap-2 pointer-events-auto">
            <div className="text-[#FFE4C7] text-sm font-['Inter']">Copyright ©</div>
            <div className="text-[#FFE4C7] text-sm font-['Inter']">Tukar Buku 2025</div>
          </div>
        </div>
      </footer>
    </div>
  );
}