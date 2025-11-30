import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import bg from '../../assets/latar.png';
import { loginUser, getMe } from '../../api/client';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // State UI
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!username?.trim()) { setServerError('Username wajib diisi'); return; }
    if (!password?.trim()) { setServerError('Password wajib diisi'); return; }

    setIsSubmitting(true);

    try {
      // 1. Lakukan Login
      const payload = { username: username.trim(), password };
      console.log("Login payload:", payload);
      
      const loginData = await loginUser(payload);
      const token = loginData.access_token || loginData.token;

      if (token) {
        // 2. Simpan Token
        localStorage.setItem('access_token', token);
        localStorage.setItem('isAuthenticated', 'true');

        try {
            // 3. Ambil Profil User Terbaru
            const userProfile = await getMe();
            
            // Simpan data user agar bisa dipakai di Layouts (Navbar dll)
            localStorage.setItem('authUser', JSON.stringify(userProfile));
            
            // ===============================================
            // LOGIKA REDIRECT (PENGATUR LALU LINTAS) - DIPERBAIKI
            // ===============================================
            
            // Ambil nama role (lowercase agar aman)
            const roleName = userProfile.role?.name?.toLowerCase() || '';
            
            // Cek apakah user punya data toko (objek store tidak null)
            const hasStore = userProfile.store !== null && userProfile.store !== undefined;

            console.log("DEBUG LOGIN -> Role:", roleName, "| Punya Toko:", hasStore);

            if (roleName.includes('admin')) {
                // 1. JIKA ADMIN
                console.log("Redirecting to Admin Dashboard...");
                navigate('/admin', { replace: true });
            } 
            else if (roleName.includes('seller') || hasStore) {
                // 2. JIKA SELLER (ATAU USER BIASA TAPI PUNYA TOKO)
                // Simpan profil sebagai authSeller agar SellerLayouts dapat membaca,
                // lalu arahkan ke home seller.
                try { localStorage.setItem('authSeller', JSON.stringify(userProfile)); } catch (e) { /* ignore */ }
                console.log("Redirecting to Seller Home...");
                navigate('/seller/home', { replace: true });
            } 
            else {
                // 3. JIKA USER BIASA (PEMBELI MURNI)
                console.log("Redirecting to User Home...");
                navigate('/home', { replace: true });
            }
            // ===============================================

        } catch (profileError) {
            console.error("Gagal ambil profil:", profileError);
            setServerError("Login berhasil, tapi gagal memuat data profil.");
        }

      } else {
        setServerError("Token tidak ditemukan dari server.");
      }

    } catch (err) {
      console.error("Login Error:", err);
      const resp = err?.response;
      if (!resp) {
        setServerError(`Gagal terhubung ke server.`);
      } else if (resp.status === 401) {
        setServerError('Username atau password salah');
      } else {
        setServerError(resp?.data?.detail || 'Login gagal');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen relative bg-black overflow-hidden font-inter">
      <img src={bg} alt="background" className="absolute inset-0 w-full h-full object-cover z-0" />

      <div className="w-full h-full relative z-10 flex items-center justify-start">
        <div className="ml-36 mt-5 w-[464px] h-[689px] relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 rounded-xl bg-neutral-900/30 backdrop-blur-[6px] border border-white/10 p-8 flex flex-col">
            <div className="text-[#FFE4C7] text-4xl font-semibold leading-tight">Selamat datang<br/>kembali!</div>
            <div className="mt-6 text-[#FFE4C7] text-2xl">Masuk ke akun anda</div>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
              <div className="relative">
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => setUsernameFocused(false)}
                  placeholder=" "
                  className="w-full h-16 px-6 rounded-[20px] bg-white/5 border border-zinc-400 text-[#FFE4C7] outline-none focus:border-[#FFE4C7] transition-colors"
                />
                {/* label hanya muncul jika field kosong; hilang langsung saat mulai mengetik */}
                {!username && (
                  <label htmlFor="login-username" className="absolute left-6 top-5 pointer-events-none text-zinc-400 text-base">
                    Username
                  </label>
                )}
              </div>

              <div className="relative">
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder=" "
                  className="w-full h-16 px-6 rounded-[20px] bg-white/5 border border-zinc-400 text-[#FFE4C7] outline-none focus:border-[#FFE4C7] transition-colors"
                />
                {/* label hanya muncul jika field kosong; hilang langsung saat mulai mengetik */}
                {!password && (
                  <label htmlFor="login-password" className="absolute left-6 top-5 pointer-events-none text-zinc-400 text-base">
                    Password
                  </label>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button type="button" className="text-neutral-400 hover:text-[#FFE4C7] text-sm">Lupa password?</button>
              </div>

              {serverError && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm text-center">{serverError}</div>}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-16 rounded-[20px] text-black text-xl font-medium shadow-[0_4px_4px_rgba(0,0,0,0.15)] transition-all ${isSubmitting ? 'bg-white/30 cursor-not-allowed' : 'bg-[#FFE4C7] hover:bg-[#ffdec0] active:scale-[0.98]'}`}
              >
                {isSubmitting ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-6">
              <div className="w-44 h-px bg-neutral-400" />
              <div className="text-neutral-400">Atau</div>
              <div className="w-44 h-px bg-neutral-400" />
            </div>

            <div className="mt-auto text-center">
              <span className="text-neutral-400">Belum punya akun? </span>
              <Link to="/register" className="text-[#FFE4C7] font-semibold hover:underline">Daftar Sekarang</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}