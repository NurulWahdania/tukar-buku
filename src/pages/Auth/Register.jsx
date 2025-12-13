import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bg from '../../assets/latar.png';
import { registerUser, ping, BASE } from '../../api/client';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // focus states
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  // server & submit state
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // validation errors
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    username: '',
    password: ''
  });
  
  // success modal state
  const [showSuccess, setShowSuccess] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const [serverAvailable, setServerAvailable] = useState(null); 
  const [serverInfo, setServerInfo] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await ping();
        if (cancelled) return;
        setServerAvailable(true);
        setServerInfo(`OK ${res.status} ${res.statusText} (${BASE})`);
      } catch (err) {
        if (cancelled) return;
        setServerAvailable(false);
        const msg = err?.response ? `${err.response.status} ${err.response.statusText}` : err.message;
        setServerInfo(`Not reachable: ${msg} (${BASE})`);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // --- VALIDASI FRONTEND ---
    const nextErrors = { name: '', email: '', username: '', password: '' };
    let hasError = false;
    
    if (!name.trim()) { nextErrors.name = 'Nama lengkap wajib diisi'; hasError = true; }
    if (!email.trim()) { nextErrors.email = 'Email wajib diisi'; hasError = true; }
    if (!username.trim()) { nextErrors.username = 'Username wajib diisi'; hasError = true; }
    if (!password.trim()) {
      nextErrors.password = 'Password wajib diisi';
      hasError = true;
    } else if (password.length < 8) {
      nextErrors.password = 'Password minimal 8 karakter';
      hasError = true;
    }
    setErrors(nextErrors);
    if (hasError) return;

    // --- CEK KONEKSI SERVER ---
    if (serverAvailable === false) {
      setServerError(`Tidak dapat menghubungi backend. Periksa VITE_API_BASE_URL (${BASE})...`);
      return;
    }

    setServerError('');
    setIsSubmitting(true);

    try {
      // --- PERBAIKAN DI SINI ---
      // Mengirim 'name' input sebagai 'nama_lengkap' ke backend
      const payload = { 
        nama_lengkap: name, 
        email, 
        username, 
        password, 
        role_id: 3 
      };
      
      if (import.meta.env.VITE_DEBUG === 'true') console.log('[REGISTER] sending', payload);
      
      const data = await registerUser(payload);
      
      // Simpan auth user sementara (opsional, karena login nanti akan overwrite)
      if (data.user) localStorage.setItem('authUser', JSON.stringify(data.user));
      
      // Tampilkan Sukses
      setShowSuccess(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setShowSuccess(false);
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error('[REGISTER] err', err);
      const resp = err?.response;
      
      if (!resp) {
        setServerError(`Network error: tidak ada response dari backend.`);
      } else if (resp.status === 422 && Array.isArray(resp.data?.detail)) {
        // Handling error validasi dari FastAPI
        const serverFieldErrors = { name: '', email: '', username: '', password: '' };
        resp.data.detail.forEach(item => {
          const loc = item.loc || [];
          const field = loc.length > 1 ? loc[loc.length - 1] : null;
          // Map 'nama_lengkap' error back to 'name' field if necessary
          const fieldKey = field === 'nama_lengkap' ? 'name' : field;
          
          if (fieldKey && serverFieldErrors.hasOwnProperty(fieldKey)) {
             serverFieldErrors[fieldKey] = item.msg;
          } else {
             setServerError(prev => prev ? prev + ' | ' + item.msg : item.msg);
          }
        });
        setErrors(prev => ({ ...prev, ...serverFieldErrors }));
      } else {
        const backendMsg = resp.data?.detail || resp.data?.message || JSON.stringify(resp.data) || err.message;
        setServerError(`Gagal Daftar: ${backendMsg}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // cleanup timer
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div className="w-screen h-screen relative bg-black overflow-hidden font-inter">
      <div className="fixed top-2 right-2 z-50 text-sm text-neutral-300 bg-black/50 px-3 py-1 rounded">
        Backend: {serverAvailable === null ? 'checking...' : serverAvailable ? <span className="text-emerald-400">reachable</span> : <span className="text-red-400">unreachable</span>}
      </div>
      
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
        
        {/* Card: Compact Responsive Dimensions */}
        <div className="w-full max-w-[340px] lg:max-w-[360px] xl:max-w-[420px] h-auto mx-auto lg:mx-0 lg:ml-20 xl:ml-32 relative rounded-xl overflow-hidden shadow-2xl transition-all duration-300">
          
          <div className="w-full h-full rounded-xl bg-neutral-900/30 backdrop-blur-lg border border-white/5 p-6 lg:p-5 xl:p-8 flex flex-col">
            <div className="text-[#FFE4C7] text-2xl lg:text-xl xl:text-3xl font-semibold">Selamat Datang!</div>
            <div className="mt-2 lg:mt-2 xl:mt-4 text-[#FFE4C7] text-sm lg:text-xs xl:text-base opacity-90">Buat akun anda</div>

            <form onSubmit={handleSubmit} className="mt-6 lg:mt-4 xl:mt-6 flex flex-col gap-4 lg:gap-3 xl:gap-4">
              {/* Nama lengkap */}
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  placeholder=" "
                  className="w-full h-10 lg:h-9 xl:h-12 px-4 rounded-[12px] bg-white/5 border border-zinc-400 text-[#FFE4C7] text-xs lg:text-[10px] xl:text-sm outline-none focus:border-[#FFE4C7] transition-colors"
                />
                {!name && !nameFocused && (
                  <label className="absolute left-4 top-2.5 lg:top-2.5 xl:top-3.5 pointer-events-none text-zinc-400 text-xs lg:text-[10px] xl:text-sm">Nama lengkap</label>
                )}
                {errors.name && <div className="mt-1 text-red-400 text-[10px] lg:text-[9px] xl:text-xs">{errors.name}</div>}
              </div>

              {/* Email */}
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder=" "
                  className="w-full h-10 lg:h-9 xl:h-12 px-4 rounded-[12px] bg-white/5 border border-zinc-400 text-[#FFE4C7] text-xs lg:text-[10px] xl:text-sm outline-none focus:border-[#FFE4C7] transition-colors"
                />
                {!email && !emailFocused && (
                  <label className="absolute left-4 top-2.5 lg:top-2.5 xl:top-3.5 pointer-events-none text-zinc-400 text-xs lg:text-[10px] xl:text-sm">Email</label>
                )}
                {errors.email && <div className="mt-1 text-red-400 text-[10px] lg:text-[9px] xl:text-xs">{errors.email}</div>}
              </div>

              {/* Username */}
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => setUsernameFocused(false)}
                  placeholder=" "
                  className="w-full h-10 lg:h-9 xl:h-12 px-4 rounded-[12px] bg-white/5 border border-zinc-400 text-[#FFE4C7] text-xs lg:text-[10px] xl:text-sm outline-none focus:border-[#FFE4C7] transition-colors"
                />
                {!username && !usernameFocused && (
                  <label className="absolute left-4 top-2.5 lg:top-2.5 xl:top-3.5 pointer-events-none text-zinc-400 text-xs lg:text-[10px] xl:text-sm">Username</label>
                )}
                {errors.username && <div className="mt-1 text-red-400 text-[10px] lg:text-[9px] xl:text-xs">{errors.username}</div>}
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder=" "
                  minLength={8}
                  className="w-full h-10 lg:h-9 xl:h-12 px-4 rounded-[12px] bg-white/5 border border-zinc-400 text-[#FFE4C7] text-xs lg:text-[10px] xl:text-sm outline-none focus:border-[#FFE4C7] transition-colors"
                />
                {!password && !passwordFocused && (
                  <label className="absolute left-4 top-2.5 lg:top-2.5 xl:top-3.5 pointer-events-none text-zinc-400 text-xs lg:text-[10px] xl:text-sm">Password</label>
                )}
                {errors.password && <div className="mt-1 text-red-400 text-[10px] lg:text-[9px] xl:text-xs">{errors.password}</div>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-10 lg:h-9 xl:h-12 rounded-[12px] text-black text-sm lg:text-xs xl:text-base font-medium shadow-[0_4px_4px_rgba(0,0,0,0.15)] transition-all ${isSubmitting ? 'bg-white/30 cursor-not-allowed' : 'bg-[#FFE4C7] hover:bg-[#ffdec0] active:scale-[0.98]'}`}
              >
                {isSubmitting ? 'Memproses...' : 'Daftar'}
              </button>
              {serverError && <div className="mt-1 text-red-400 text-[10px] lg:text-[9px] xl:text-xs break-words text-center">{serverError}</div>}
            </form>

            <div className="mt-5 lg:mt-3 xl:mt-6 flex items-center justify-center gap-3">
              <div className="w-full h-px bg-neutral-400/50" />
              <div className="text-neutral-400 text-[10px] lg:text-[9px] xl:text-xs whitespace-nowrap">Atau</div>
              <div className="w-full h-px bg-neutral-400/50" />
            </div>

            <div className="mt-4 lg:mt-2 xl:mt-5 text-center">
              <span className="text-neutral-400 text-[10px] lg:text-[9px] xl:text-xs">Sudah punya akun? </span>
              <Link to="/login" className="text-[#FFE4C7] font-semibold hover:underline text-[10px] lg:text-[9px] xl:text-xs">Masuk</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Success modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 w-80 p-6 rounded-xl bg-black/60 border border-white/10 shadow-lg flex flex-col items-center gap-3 text-center text-[#FFE4C7]">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-emerald-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <div className="text-lg font-semibold">Registrasi berhasil</div>
            <div className="text-sm text-neutral-300">Silakan login untuk melanjutkan</div>
          </div>
        </div>
      )}
    </div>
  );
}