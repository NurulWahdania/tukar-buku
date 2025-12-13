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
            
            // Simpan data user umum
            localStorage.setItem('authUser', JSON.stringify(userProfile));
            
            // ===============================================
            // LOGIKA REDIRECT (DIPERBAIKI)
            // ===============================================
            
            const roleName = userProfile.role?.name?.toLowerCase() || '';
            const hasStore = userProfile.store !== null && userProfile.store !== undefined;

            console.log("DEBUG LOGIN -> Role:", roleName, "| Punya Toko:", hasStore);

            if (roleName.includes('admin')) {
                // ADMIN
                // PENTING: Hapus sisa data seller jika ada agar tidak konflik
                localStorage.removeItem('authSeller'); 
                console.log("Redirecting to Admin Dashboard...");
                navigate('/admin', { replace: true });
            } 
            else if (roleName.includes('seller') || hasStore) {
                // SELLER
                // Set authSeller agar router tahu ini seller
                localStorage.setItem('authSeller', JSON.stringify(userProfile));
                console.log("Redirecting to Seller Home...");
                navigate('/seller/home', { replace: true });
            } 
            else {
                // USER BIASA
                // PENTING: Hapus authSeller agar tidak nyasar ke halaman seller!
                localStorage.removeItem('authSeller'); 
                
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
      {/* Background Image: Reverted to full cover */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <img 
            src={bg} 
            alt="background" 
            className="w-full h-full object-cover opacity-80" 
        />
      </div>

      {/* Container: Center on mobile/tablet, Left on laptop/desktop */}
      <div className="w-full h-full relative z-10 flex items-center justify-center lg:justify-start px-4 lg:px-0">
        
        {/* Card: Extra Compact for Laptop + Scale Down */}
        <div className="w-full max-w-[320px] lg:max-w-[340px] xl:max-w-[380px] h-auto mx-auto lg:mx-0 lg:ml-20 xl:ml-32 relative rounded-xl overflow-hidden shadow-2xl transition-all duration-300">
          
          {/* Inner Card */}
          <div className="w-full h-full rounded-xl bg-neutral-900/30 backdrop-blur-[6px] border border-white/10 p-6 lg:p-5 xl:p-8 flex flex-col">
            
            {/* Title */}
            <div className="text-[#FFE4C7] text-2xl lg:text-xl xl:text-3xl font-semibold leading-tight">
              Selamat datang<br/>kembali!
            </div>
            
            {/* Subtitle */}
            <div className="mt-2 lg:mt-2 xl:mt-3 text-[#FFE4C7] text-sm lg:text-xs xl:text-base opacity-90">
              Masuk ke akun anda
            </div>

            <form onSubmit={handleSubmit} className="mt-6 lg:mt-4 xl:mt-6 flex flex-col gap-4 lg:gap-3 xl:gap-4">
              {/* Username Input */}
              <div className="relative">
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => setUsernameFocused(false)}
                  placeholder=" "
                  className="w-full h-10 lg:h-9 xl:h-12 px-4 rounded-[12px] lg:rounded-[12px] bg-white/5 border border-zinc-400 text-[#FFE4C7] text-xs lg:text-[10px] xl:text-sm outline-none focus:border-[#FFE4C7] transition-colors"
                />
                {!username && (
                  <label htmlFor="login-username" className="absolute left-4 top-2.5 lg:top-2.5 xl:top-3.5 pointer-events-none text-zinc-400 text-xs lg:text-[10px] xl:text-sm">
                    Username
                  </label>
                )}
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder=" "
                  className="w-full h-10 lg:h-9 xl:h-12 px-4 rounded-[12px] lg:rounded-[12px] bg-white/5 border border-zinc-400 text-[#FFE4C7] text-xs lg:text-[10px] xl:text-sm outline-none focus:border-[#FFE4C7] transition-colors"
                />
                {!password && (
                  <label htmlFor="login-password" className="absolute left-4 top-2.5 lg:top-2.5 xl:top-3.5 pointer-events-none text-zinc-400 text-xs lg:text-[10px] xl:text-sm">
                    Password
                  </label>
                )}
              </div>

              {/* Forgot Password */}
              <div className="flex items-center justify-between">
                <button type="button" className="text-neutral-400 hover:text-[#FFE4C7] text-[10px] lg:text-[9px] xl:text-xs">Lupa password?</button>
              </div>

              {/* Error Message */}
              {serverError && <div className="p-2 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-[10px] lg:text-[9px] xl:text-xs text-center">{serverError}</div>}
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-10 lg:h-9 xl:h-12 rounded-[12px] lg:rounded-[12px] text-black text-sm lg:text-xs xl:text-base font-medium shadow-[0_4px_4px_rgba(0,0,0,0.15)] transition-all ${isSubmitting ? 'bg-white/30 cursor-not-allowed' : 'bg-[#FFE4C7] hover:bg-[#ffdec0] active:scale-[0.98]'}`}
              >
                {isSubmitting ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-5 lg:mt-3 xl:mt-6 flex items-center justify-center gap-3">
              <div className="w-full h-px bg-neutral-400/50" />
              <div className="text-neutral-400 text-[10px] lg:text-[9px] xl:text-xs whitespace-nowrap">Atau</div>
              <div className="w-full h-px bg-neutral-400/50" />
            </div>

            {/* Register Link */}
            <div className="mt-4 lg:mt-2 xl:mt-5 text-center">
              <span className="text-neutral-400 text-[10px] lg:text-[9px] xl:text-xs">Belum punya akun? </span>
              <Link to="/register" className="text-[#FFE4C7] font-semibold hover:underline text-[10px] lg:text-[9px] xl:text-xs">Daftar Sekarang</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}