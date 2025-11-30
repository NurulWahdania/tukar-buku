// src/pages/User/RegisterStore.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStore, getMyStore, getMe } from '../../api/client';

export default function RegisterStore() {
  const navigate = useNavigate();

  // 1. State Form
  const [formData, setFormData] = useState({
    nama_toko: '',
    nama_pemilik_toko: '', // Akan diisi otomatis
    email_toko: '',        // Akan diisi otomatis
    hp_toko: '',           // Akan diisi otomatis
    alamat_toko: '',
    store_photo_url: '' 
  });

  const [loading, setLoading] = useState(false);

  // 2. Logika Inisialisasi (Cek Toko & Ambil Data User)
  useEffect(() => {
    const initPage = async () => {
      try {
        // A. Cek apakah sudah punya toko?
        const store = await getMyStore();
        if (store) {
          navigate('/seller/store');
          return;
        }
      } catch (e) {
        // B. Jika belum punya toko (Error 404), ambil data diri user untuk Auto-Fill
        try {
          const userData = await getMe();
          setFormData(prev => ({
            ...prev,
            nama_pemilik_toko: userData.nama_lengkap || '',
            email_toko: userData.email || '',
            hp_toko: userData.nomor_hp || ''
          }));
        } catch (userErr) {
          console.error("Gagal mengambil data user untuk auto-fill", userErr);
        }
      }
    };
    
    initPage();
  }, [navigate]);

  // 3. Handle Perubahan Input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 4. Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.nama_toko) {
        alert("Nama Toko wajib diisi");
        setLoading(false);
        return;
      }

      await createStore(formData);

      // Refresh data user di localStorage agar role berubah jadi Seller
      const updatedUser = await getMe();
      localStorage.setItem('authUser', JSON.stringify(updatedUser));

      alert("Toko berhasil didaftarkan!");
      navigate('/seller/store');

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || "Gagal mendaftar toko.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[1020px] relative">
      {/* Card background (glass) */}
      <div className="w-full h-[568px] left-0 top-0 absolute bg-white/5 rounded-xl border border-white/10 backdrop-blur-[10px]" />

      {/* Content inside card */}
      <div className="relative z-10 p-6 h-[568px]">
        {/* Title */}
        <div className="absolute left-[20px] top-[16px] text-[#FFE4C7] text-xl font-semibold font-['Inter']">
          Daftarkan Toko
        </div>

        {/* Avatar + Upload */}
        <div className="flex flex-col items-center justify-start mt-6">
          <div className="w-28 h-28 bg-stone-300 rounded-full flex items-center justify-center overflow-hidden">
             <span className="text-4xl font-bold text-gray-600">
               {formData.nama_toko ? formData.nama_toko.charAt(0).toUpperCase() : ''}
             </span>
          </div>
          <label className="mt-4 inline-flex items-center px-4 py-2 bg-white/5 rounded outline outline-1 outline-offset-[-1px] outline-white cursor-pointer hover:bg-white/10 transition">
            <input type="file" className="hidden" disabled /> 
            <span className="text-[#FFE4C7] text-xs font-medium font-['Inter']">Upload Photo</span>
          </label>
        </div>

        {/* Form fields */}
        <form className="mt-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-[200px_1fr] gap-x-6 gap-y-4 items-center">
            
            <label htmlFor="namaToko" className="text-[#FFE4C7] text-sm font-medium font-['Inter']">Nama Toko</label>
            <input 
              id="namaToko" 
              name="nama_toko" 
              value={formData.nama_toko}
              onChange={handleChange}
              type="text" 
              className="w-full h-10 bg-white/5 rounded-lg border border-white/10 px-3 text-[#FFE4C7] placeholder:text-zinc-400 outline-none focus:border-[#FFE4C7]" 
              required
            />

            <label htmlFor="namaPemilik" className="text-[#FFE4C7] text-sm font-medium font-['Inter']">Nama Pemilik Toko</label>
            <input 
              id="namaPemilik" 
              name="nama_pemilik_toko"
              value={formData.nama_pemilik_toko}
              onChange={handleChange}
              type="text" 
              className="w-full h-10 bg-white/5 rounded-lg border border-white/10 px-3 text-[#FFE4C7] placeholder:text-zinc-400 outline-none focus:border-[#FFE4C7]" 
            />

            <label htmlFor="emailToko" className="text-[#FFE4C7] text-sm font-medium font-['Inter']">Email</label>
            <input 
              id="emailToko" 
              name="email_toko"
              value={formData.email_toko}
              onChange={handleChange}
              type="email" 
              className="w-full h-10 bg-white/5 rounded-lg border border-white/10 px-3 text-[#FFE4C7] placeholder:text-zinc-400 outline-none focus:border-[#FFE4C7]" 
            />

            <label htmlFor="hpToko" className="text-[#FFE4C7] text-sm font-medium font-['Inter']">Nomor HP</label>
            <input 
              id="hpToko" 
              name="hp_toko"
              value={formData.hp_toko}
              onChange={handleChange}
              type="text" 
              className="w-full h-10 bg-white/5 rounded-lg border border-white/10 px-3 text-[#FFE4C7] placeholder:text-zinc-400 outline-none focus:border-[#FFE4C7]" 
            />

            <label htmlFor="alamatToko" className="text-[#FFE4C7] text-sm font-medium font-['Inter']">Alamat Toko</label>
            <input 
              id="alamatToko" 
              name="alamat_toko"
              value={formData.alamat_toko}
              onChange={handleChange}
              type="text" 
              className="w-full h-10 bg-white/5 rounded-lg border border-white/10 px-3 text-[#FFE4C7] placeholder:text-zinc-400 outline-none focus:border-[#FFE4C7]" 
            />
          </div>

          {/* Submit button centered */}
          <div className="flex justify-center mt-6">
            <button 
              type="submit" 
              disabled={loading}
              className={`h-8 px-5 py-2 bg-[#FFE4C7] rounded text-black text-xs font-medium font-['Inter'] transition hover:bg-[#ffdaae] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Memproses...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}