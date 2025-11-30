import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import bg from '../assets/latar.png';
import { useAuth } from '../contexts/AuthContext'; 

// Import komponen Admin Management (Direferensikan dalam logic rendering)
import ContentVerification from '../pages/Admin/ContentVerification'; 
import ReportListManagement from '../pages/Admin/ReportListManagement'; 
import CategoryManagement from '../pages/Admin/CategoryManagement'; 
import UserManagement from '../pages/Admin/UserManagement'; 
import AnnouncementManagement from '../pages/Admin/AnnouncementManagement'; 
import AboutManagement from '../pages/Admin/AboutManagement'; 
import SecurityTipsManagement from '../pages/Admin/SecurityTipsManagement'; 


// --- AdminSidebar Component (TETAP SAMA) ---
function AdminSidebar({ activeKey, setActiveKey }) {
  const navigate = useNavigate();
  const [infoOpen, setInfoOpen] = useState(false);

  const items = [
    { key: 'dashboard', label: 'Dashboard', path: '/admin' },
    { key: 'content', label: 'Moderasi Konten', path: '/admin/content' },
    { key: 'categories', label: 'Manajemen Kategori', path: '/admin/categories' },
    { key: 'users', label: 'Pengguna', path: '/admin/users' },
    { key: 'reports', label: 'Laporan Penipuan', path: '/admin/reports' },
  ];

  const IconFor = ({ name }) => {
    const stroke = '#FFE4C7';
    switch (name) {
      case 'Dashboard':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="8" height="8" rx="1" />
            <rect x="13" y="3" width="8" height="8" rx="1" />
            <rect x="3" y="13" width="8" height="8" rx="1" />
            <rect x="13" y="13" width="8" height="8" rx="1" />
          </svg>
        );
      case 'Moderasi Konten':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M7 9h10M7 13h6" />
          </svg>
        );
      case 'Manajemen Kategori':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16" />
            <path d="M4 12h10" />
            <path d="M4 18h7" />
          </svg>
        );
      case 'Pengguna':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-3-3.87" />
            <path d="M4 21v-2a4 4 0 013-3.87" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      case 'Laporan Penipuan':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
        );
      default:
        return <span className="w-4 h-4 bg-[#FFE4C7] rounded-sm" />;
    }
  };

  return (
    <aside role="menu" aria-label="Sidebar" className="fixed left-8 top-28 w-60 h-[calc(100vh-220px)] flex flex-col gap-3 z-[1100] pointer-events-auto">
      {items.map(it => {
        const isActive = activeKey === it.key;
        return (
          <button
            key={it.key}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveKey(it.key);
              navigate(it.path);
            }}
            role="menuitem"
            aria-pressed={isActive}
            className={`w-full h-12 px-4 rounded-xl flex items-center gap-3 transition-colors text-Color1 relative z-[1100] pointer-events-auto ${isActive ? 'bg-white/5 outline outline-1 outline-offset-[-1px] outline-white/0' : 'hover:bg-white/10'}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex-none"><IconFor name={it.label} /></div>
              <div className="text-[#FFE4C7] text-base">{it.label}</div>
            </div>
          </button>
        );
      })}

      {/* Pusat Informasi (parent) */}
      <div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setInfoOpen(v => !v); setActiveKey('informasi'); }}
          role="menuitem"
          aria-expanded={infoOpen}
          className={`w-full flex items-center justify-between h-12 px-4 rounded-xl transition-colors relative z-[1100] pointer-events-auto ${infoOpen ? 'bg-white/5 outline outline-1 outline-offset-[-1px] outline-white/0' : 'hover:bg-white/10'}`}
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#FFE4C7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11v2a2 2 0 002 2h3l7 4V5L8 9H5a2 2 0 0 0-2 2z" />
            </svg>
            <div className="text-[#FFE4C7] text-base">Pusat Informasi</div>
          </div>
          <svg className={`w-4 h-4 transform transition-transform ${infoOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" stroke="#FFE4C7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8l4 4 4-4" />
          </svg>
        </button>

        {infoOpen && (
          <div className="pl-6 flex flex-col gap-2 mt-1">
            <button onClick={(e) => { e.stopPropagation(); setActiveKey('announcements'); navigate('/admin/announcements'); }} role="menuitem" className="flex items-center gap-2 h-10 px-2 rounded hover:bg-white/10 text-[#FFE4C7] text-sm relative z-[1100] pointer-events-auto">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#FFE4C7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0v4a6 6 0 0 0 5 5.91V20a1 1 0 0 0 2 0v-2.09A6 6 0 0 0 18 12V8z"/></svg>
              Pengumuman
            </button>

            {/* NEW: Tentang button inside Pusat Informasi dropdown */}
            <button onClick={(e) => { e.stopPropagation(); setActiveKey('about'); navigate('/admin/about'); }} role="menuitem" className="flex items-center gap-2 h-10 px-2 rounded hover:bg-white/10 text-[#FFE4C7] text-sm relative z-[1100] pointer-events-auto">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#FFE4C7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
              Tentang
            </button>

            <button onClick={(e) => { e.stopPropagation(); setActiveKey('security-tips'); navigate('/admin/security-tips'); }} role="menuitem" className="flex items-center gap-2 h-10 px-2 rounded hover:bg-white/10 text-[#FFE4C7] text-sm relative z-[1100] pointer-events-auto">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#FFE4C7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l7 4v5c0 5-3.58 9.74-7 11"/></svg>
              Tips Keamanan
            </button>
          </div>
        )}
        
      </div>
    </aside>
  );
}

// --- KOMPONEN UTAMA ADMIN LAYOUT ---
export default function AdminLayouts({ children }) {
    const { user, logout } = useAuth(); 
    const location = useLocation();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || "");

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        // Update URL search param on current page immediately
        navigate(`${location.pathname}?search=${encodeURIComponent(val)}`, { replace: true });
    };

    const [profileOpen, setProfileOpen] = useState(false);
    const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
    const profileRef = useRef(null);

    const displayName = user?.nama_lengkap || user?.username || 'Admin';
    const avatarSrc = user?.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'Admin')}&background=FFE4C7&color=000000&size=64`;
    
    const initialKey = location.pathname === '/admin' || location.pathname.startsWith('/admin') ? (
        location.pathname.includes('/admin/content') || location.pathname.includes('/admin/moderasi') || location.pathname.includes('/admin/validasi') ? 'content' :
        location.pathname.includes('/admin/categories') ? 'categories' :
        location.pathname.includes('/admin/users') ? 'users' :
        location.pathname.includes('/admin/reports') ? 'reports' :
        location.pathname.includes('/admin/announcements') ? 'announcements' :
        location.pathname.includes('/admin/about') ? 'about' :
        location.pathname.includes('/admin/security-tips') ? 'security-tips' : 'dashboard'
    ) : 'dashboard';
    const [activeKey, setActiveKey] = useState(initialKey);
    const [selectedPage, setSelectedPage] = useState(null);

    useEffect(() => {
        const p = location.pathname || '';
        if (p.includes('/admin/content') || p.includes('/admin/moderasi') || p.includes('/admin/validasi')) setActiveKey('content');
        else if (p.includes('/admin/categories')) setActiveKey('categories');
        else if (p.includes('/admin/users')) setActiveKey('users');
        else if (p.includes('/admin/reports')) setActiveKey('reports');
        else if (p.includes('/admin/announcements')) setActiveKey('announcements');
        else if (p.includes('/admin/security-tips')) setActiveKey('security-tips');
        else if (p.includes('/admin/about')) setActiveKey('about');
        else if (p === '/admin' || p.startsWith('/admin')) setActiveKey('dashboard');
        else setActiveKey('dashboard');
        
        if (p.includes('/admin')) setSelectedPage(null);
    }, [location.pathname]);
    
    // ❌ Menghapus Logic onDocClick yang bermasalah (Sesuai Solusi)
    // Sekarang hanya mengandalkan Backdrop untuk menutup dropdown

    return (
        <div className="fixed inset-0 z-[999] overflow-hidden">
            <img src={bg} alt="background" className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none" />

            {/* NAVBAR - Perbaikan z-index dari z-80 ke z-[1200] agar bisa diklik */}
            <header className="fixed top-6 left-6 right-6 z-[1200] flex items-center">
                <div className="text-[#FFE4C7] text-3xl font-bold">TUKAR BUKU</div>
                
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

                {/* USER PILL BARU (dengan Dropdown Logout) */}
                <div ref={profileRef} className="flex items-center gap-3 relative z-[1200]"> 
                    <button
                        type="button"
                        onClick={(e) => { 
                             e.stopPropagation(); 
                             setProfileOpen(v => !v); 
                         }}
                        className="flex items-center gap-3 px-4 py-2 rounded-3xl border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 shadow-sm transition-all"
                        aria-expanded={profileOpen}
                    >
                        {/* Avatar */}
                        <img src={avatarSrc} alt="avatar" className="w-8 h-8 rounded-full border border-white/10 object-cover" />
                        {/* Nama */}
                        <span className="text-[#FFE4C7] font-medium truncate max-w-28">{displayName}</span>
                        {/* Icon Panah */}
                        <svg className={`w-4 h-4 text-[#FFE4C7] transform transition-transform ${profileOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" stroke="#FFE4C7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 8l4 4 4-4" />
                        </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {profileOpen && (
                        <div className="absolute right-0 top-full mt-2 w-60 z-[1201] pointer-events-auto"> 
                            <div className="bg-white/5 rounded-xl border border-white/10 p-2 space-y-1">
                                
                                {/* Tombol Logout */}
                                <button
                                    onClick={() => { setProfileOpen(false); setConfirmLogoutOpen(true); }}
                                    className="w-full h-12 px-3 rounded-lg flex items-center justify-start gap-3 text-[#FFE4C7] text-base font-medium hover:bg-white/10"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
                                    <span>Log Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Backdrop untuk Dropdown (z-index 1199, transparan)
            {profileOpen && (
                <div 
                    className="fixed inset-0 z-[1199] bg-transparent"
                    onClick={() => setProfileOpen(false)} 
                    aria-hidden="true" 
                />
            )} */}
            
            {/* Sidebar (TETAP SAMA) */}
            <AdminSidebar activeKey={activeKey} setActiveKey={(k) => {
                setActiveKey(k);
                if (k === 'content') setSelectedPage('content');
                else if (k === 'categories') setSelectedPage('categories');
                else if (k === 'users') setSelectedPage('users');
                else if (k === 'reports') setSelectedPage('reports');
                else if (k === 'announcements') setSelectedPage('announcements');
                else if (k === 'about') setSelectedPage('about');
                else if (k === 'security-tips') setSelectedPage('security-tips');
                else if (k === 'reports') setSelectedPage('reports');
                else setSelectedPage(null);
            }} />
 
            {/* Main Content Area (TETAP SAMA) */}
            <main className="pt-28 pb-24 pl-[300px] pr-8 relative z-30">
                <div className="max-w-[1020px] mx-auto">
                    <div className="h-[calc(100vh-220px)] overflow-hidden">
                        {(selectedPage === 'announcements' || activeKey === 'announcements' || location.pathname.includes('/admin/announcements')) ? (
                            <AnnouncementManagement />
                        ) : (selectedPage === 'about' || activeKey === 'about' || location.pathname.includes('/admin/about')) ? (
                            <AboutManagement />
                        ) : (selectedPage === 'security-tips' || activeKey === 'security-tips' || location.pathname.includes('/admin/security-tips')) ? (
                            <SecurityTipsManagement />
                        ) : (selectedPage === 'reports' || activeKey === 'reports' || location.pathname.includes('/admin/reports')) ? (
                            <ReportListManagement />
                        ) : (selectedPage === 'categories' || activeKey === 'categories' || location.pathname.includes('/admin/categories')) ? (
                            <CategoryManagement />
                        ) : (selectedPage === 'users' || activeKey === 'users' || location.pathname.includes('/admin/users')) ? (
                            <UserManagement />
                        ) : (selectedPage === 'content' || activeKey === 'content' || location.pathname.includes('/admin/content')) ? (
                            <ContentVerification />
                        ) : (
                            (children ?? <Outlet />)
                        )}
                    </div>
                </div>
            </main>

            {/* Footer (TETAP SAMA) */}
            <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-60">
                <div className="flex items-center gap-2 text-[#FFE4C7] text-sm">
                    <div>Copyright ©</div>
                    <div>Tukar Buku 2025</div>
                </div>
            </footer>
            
            {/* 🔑 MODAL KONFIRMASI LOGOUT (BARU) */}
            {confirmLogoutOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setConfirmLogoutOpen(false)} />
                    <div className="relative z-[10001] w-96 p-6 bg-[#06070a] border border-white/10 rounded-xl shadow-2xl text-center">
                        <h3 className="text-[#FFE4C7] text-lg font-semibold mb-4">Konfirmasi Logout</h3>
                        <p className="text-[#CDBA9A] mb-6">Apakah Anda yakin ingin keluar dari Akun Admin?</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setConfirmLogoutOpen(false)}
                                className="px-5 py-2 border border-white/20 rounded-lg text-[#FFE4C7] hover:bg-white/10 transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={logout} // Panggil fungsi logout dari AuthContext
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