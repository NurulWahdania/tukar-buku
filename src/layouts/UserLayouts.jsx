// src/layouts/UserLayouts.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import bg from '../assets/latar.png';
import { getMe } from '../api/client'; // Import fungsi API

// Komponen Sidebar Dinamis untuk User
function UserSidebar({ activeKey, setActiveKey }) {
  const location = useLocation();
  const navigate = useNavigate();
  const toTarget = (p) => p;
  const [infoOpen, setInfoOpen] = useState(false);

  const menuItems = [
    { key: 'home', path: '/home', label: 'Beranda' },
    { key: 'about', path: '/user/about', label: 'Tentang' },
    { key: 'wishlist', path: '/wishlist', label: 'Wishlist' },
    { key: 'store', path: '/register-store', label: 'Daftarkan Toko' },
  ];

  const Icon = ({ name }) => {
    const stroke = '#FFE4C7';
    switch (name) {
      case 'Beranda':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#FFE4C7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 11l9-7 9 7" />
            <path d="M5 11v8a2 2 0 002 2h3v-6h4v6h3a2 2 0 002-2v-8" />
          </svg>
        );
      case 'Tentang':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8h.01M12 12v5" />
          </svg>
        );
      case 'Wishlist':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.8 4.6a5 5 0 0 0-7.07 0L12 6.32l-1.73-1.73a5 5 0 0 0-7.07 7.07L12 21.5l8.8-9.83a5 5 0 0 0 0-7.07z" />
          </svg>
        );
      case 'Daftarkan Toko':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41L13 21a2 2 0 0 1-2.83 0L3.41 14.23a2 2 0 0 1 0-2.83L11.99 3.41a2 2 0 0 1 2.83 0L20.59 10.58a2 2 0 0 1 0 2.83z" />
            <circle cx="7.5" cy="7.5" r="1.2" />
          </svg>
        );
      case 'Informasi':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11v2a2 2 0 0 0 2 2h3l7 4V5L8 9H5a2 2 0 0 0-2 2z" />
          </svg>
        );
      case 'Pengumuman':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0v4a6 6 0 0 0 5 5.91V20a1 1 0 0 0 2 0v-2.09A6 6 0 0 0 18 12V8z" />
            <path d="M13 2v4" />
          </svg>
        );
      case 'Tips Keamanan':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l7 4v5c0 5-3.58 9.74-7 11-3.42-1.26-7-6-7-11V6l7-4z" />
          </svg>
        );
      default:
        return <span className="w-4 h-4 bg-[#FFE4C7] rounded-sm" />;
    }
  };

  return (
    <aside className="fixed left-8 top-28 w-60 h-[calc(100vh-220px)] flex flex-col gap-3 z-90 pointer-events-auto">
      {menuItems.map(item => {
        const isActive = activeKey === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setActiveKey(item.key);
              navigate(toTarget(item.path));
            }}
            className={`w-full h-12 px-4 rounded-xl flex items-center gap-3 transition-colors relative z-90 pointer-events-auto ${isActive ? 'bg-white/5 backdrop-blur-[8px] border border-white/10' : 'hover:bg-white/10'}`}
          >
            <Icon name={item.label} />
            <span className="text-[#FFE4C7] text-base">{item.label}</span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setInfoOpen(v => !v); setActiveKey('informasi'); }}
        className={`w-full flex items-center justify-between h-12 px-4 rounded-xl transition-colors relative z-90 pointer-events-auto ${activeKey === 'informasi' ? 'bg-white/5 backdrop-blur-[8px] border border-white/10' : 'hover:bg-white/10'}`}
      >
        <div className="flex items-center gap-3">
          <Icon name="Informasi" />
          <span className="text-[#FFE4C7] text-base">Informasi</span>
        </div>
        <svg className={`w-4 h-4 transform transition-transform ${infoOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" stroke="#FFE4C7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8l4 4 4-4" />
        </svg>
      </button>

      {infoOpen && (
        <div className="pl-6 flex flex-col gap-2 mt-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setActiveKey('announcements'); navigate(toTarget('/announcements')); }}
            className={`flex items-center gap-2 h-10 px-2 rounded relative z-90 pointer-events-auto ${activeKey === 'announcements' ? 'bg-white/5' : 'hover:bg-white/10'}`}
          >
            <Icon name="Pengumuman" />
            <span className="text-[#FFE4C7] text-sm">Pengumuman</span>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setActiveKey('security-tips'); navigate(toTarget('/security-tips')); }}
            className={`flex items-center gap-2 h-10 px-2 rounded relative z-90 pointer-events-auto ${activeKey === 'security-tips' ? 'bg-white/5' : 'hover:bg-white/10'}`}
          >
            <Icon name="Tips Keamanan" />
            <span className="text-[#FFE4C7] text-sm">Tips Keamanan</span>
          </button>
        </div>
      )}
    </aside>
  );
}

// Komponen Layout Utama User
export default function UserLayouts() {
  // State untuk menyimpan data user agar bisa diupdate dan dirender ulang
  const [userData, setUserData] = useState(null);
  
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || ""); // State pencarian

  // Logika Pengambilan Data User (Self-Healing)
  useEffect(() => {
    const loadUser = async () => {
      // 1. Cek LocalStorage dulu (agar cepat)
      const authRaw = localStorage.getItem('authUser');
      if (authRaw) {
        try {
            setUserData(JSON.parse(authRaw));
        } catch(e) {
            console.error("Data auth rusak, mencoba fetch ulang...", e);
        }
      }
      
      // 2. Selalu validasi/update data dari API jika ada token (agar data sync)
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const data = await getMe();
          // Bandingkan dulu agar tidak re-render jika data sama (opsional, tapi bagus)
          if (JSON.stringify(data) !== authRaw) {
              setUserData(data);
              localStorage.setItem('authUser', JSON.stringify(data));
          }
        } catch (err) {
          console.error("Gagal sync profil di layout:", err);
          // Jika token invalid/expired, mungkin perlu logout?
          // Untuk sekarang biarkan dulu agar tidak mengganggu UX
        }
      }
    };
    loadUser();
  }, []);

  // Tentukan Nama & Avatar Tampilan
  const displayName = userData?.nama_lengkap || userData?.username || 'User';
  const avatarSrc = userData?.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=FFE4C7&color=000000&size=64`;

  const location = useLocation();
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    navigate(`/home?search=${encodeURIComponent(val)}`, { replace: true });
  };

  const [active, setActive] = useState('home');
  useEffect(() => {
    const p = location.pathname || '';
    if (p.includes('/register-store')) setActive('store');
    else if (p.includes('/wishlist')) setActive('wishlist');
    else if (p.includes('/announcements')) setActive('announcements');
    else if (p.includes('/security-tips')) setActive('security-tips');
    else if (p.includes('/user/about') || p.includes('/about')) setActive('about');
    else setActive('home');
  }, [location.pathname]);

  const profileRef = useRef(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  
  useEffect(() => {
    function onDocClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);
  
  const handleLogout = () => {
    try { 
        localStorage.removeItem('authUser'); 
        localStorage.removeItem('access_token');
        localStorage.removeItem('isAuthenticated'); 
    } catch {}
    navigate('/login');
  };

  return (
    <div className="min-h-screen min-w-full relative font-inter">
      <img src={bg} alt="background" className="fixed inset-0 w-full h-full object-cover z-0" />

      <header className="fixed top-6 left-6 right-6 z-50 flex items-center">
        <div className="text-[#FFE4C7] text-3xl font-bold font-['Inter']">TUKAR BUKU</div>

        <div className="mx-auto">
          <div className="w-[504px] h-10 relative">
            <div className="absolute inset-0 bg-white/5 rounded-[20px] border border-white/10" />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FFE4C7]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="6" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              value={search}
              onChange={handleSearchChange}
              aria-label="Cari"
              className="absolute left-[44px] top-1/2 -translate-y-1/2 w-[420px] bg-transparent outline-none text-[#FFE4C7] text-xs placeholder:text-[#CDBA9A] px-0"
              placeholder="Cari judul buku atau penulis..."
            />
          </div>
        </div>

        <div ref={profileRef} className="flex items-center gap-3 relative">
          <button
            type="button"
            onClick={() => setProfileOpen(v => !v)}
            className="flex items-center gap-3 px-4 py-2 rounded-[28px] border border-white/20 bg-transparent hover:bg-white/5 outline outline-1 outline-offset-[-2px] outline-white/5"
            aria-expanded={profileOpen}
          >
            <img src={avatarSrc} alt="avatar" className="w-9 h-9 rounded-full border-2 border-[#FFE4C7] object-cover" />
            <span className="text-[#FFE4C7] font-medium">{displayName}</span>
            <svg className={`w-4 h-4 text-[#FFE4C7] transform ${profileOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" stroke="#FFE4C7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8l4 4 4-4" />
            </svg>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 z-60 pointer-events-auto">
              <div className="bg-white/5 rounded-2xl border border-white/10 p-3 space-y-3 mt-2">
                <button
                  onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                  className="w-full py-3 rounded-md text-[#FFE4C7] text-base font-medium hover:bg-white/10 text-left pl-3 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3 text-[#FFE4C7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="8" r="3.2" />
                    <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
                  </svg>
                  <span>Informasi Pribadi</span>
                </button>
                <button
                  onClick={() => { setProfileOpen(false); navigate('/history'); }}
                  className="w-full py-3 rounded-md text-[#FFE4C7] text-base font-medium hover:bg-white/10 text-left pl-3 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3 text-[#FFE4C7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2" />
                    <path d="M21 8v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8" />
                    <path d="M7 12h6M7 16h6" />
                  </svg>
                  <span>Riwayat Pembelian</span>
                </button>
                <button
                  onClick={() => setConfirmLogoutOpen(true)}
                  className="w-full py-3 rounded-md text-[#FFE4C7] text-base font-medium hover:bg-white/10 flex items-center justify-start gap-3 pl-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#FFE4C7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="M16 17l5-5-5-5" />
                    <path d="M21 12H9" />
                  </svg>
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
      
      {profileOpen && (
        <div
          className="fixed inset-0 bg-black/45 backdrop-blur-sm z-40"
          onClick={() => setProfileOpen(false)}
          aria-hidden="true"
        />
      )}

      <UserSidebar activeKey={active} setActiveKey={setActive} />

      <main className="absolute left-[300px] top-28 right-6 bottom-14 overflow-auto">
        <div className="max-w-[1020px] mx-auto py-4">
          <Outlet />
        </div>
      </main>

      <footer className="fixed bottom-4 left-6 right-6 z-50">
        <div className="max-w-[1372px] mx-auto">
          <div className="h-px w-full bg-white/10 mb-3" />
          <div className="flex items-center justify-center gap-2 text-[#FFE4C7] text-sm">
            <div>Copyright ©</div>
            <div>Tukar Buku 2025</div>
          </div>
        </div>
      </footer>

      {/* 🔑 MODAL KONFIRMASI LOGOUT */}
      {confirmLogoutOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setConfirmLogoutOpen(false)} />
          <div className="relative z-[10001] w-96 p-6 bg-[#06070a] border border-white/10 rounded-xl shadow-2xl text-center">
            <h3 className="text-[#FFE4C7] text-lg font-semibold mb-4">Konfirmasi Logout</h3>
            <p className="text-[#CDBA9A] mb-6">Apakah Anda yakin ingin keluar dari akun?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmLogoutOpen(false)}
                className="px-5 py-2 border border-white/20 rounded-lg text-[#FFE4C7] hover:bg-white/10 transition"
              >
                Batal
              </button>
              <button
                onClick={() => { setConfirmLogoutOpen(false); handleLogout(); }}
                className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
              >
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}