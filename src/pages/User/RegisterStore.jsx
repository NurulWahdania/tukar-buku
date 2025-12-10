// src/pages/User/RegisterStore.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { createStore, getMyStore, getMe } from '../../api/client';

export default function RegisterStore() {
  const navigate = useNavigate();

  // 1. State Form
  const [formData, setFormData] = useState({
    nama_toko: '',
    nama_pemilik_toko: '',
    email_toko: '',
    hp_toko: '',
    alamat_toko: '',
  });

  // State untuk gambar
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // State untuk Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 2. Logika Inisialisasi
  useEffect(() => {
    const initPage = async () => {
      try {
        const store = await getMyStore();
        if (store) {
          navigate('/seller/store');
          return;
        }
      } catch (e) {
        try {
          const userData = await getMe();
          setFormData(prev => ({
            ...prev,
            nama_pemilik_toko: userData.nama_lengkap || '',
            email_toko: userData.email || '',
            hp_toko: userData.nomor_hp || ''
          }));
        } catch (userErr) {
          console.error("Gagal auto-fill data user", userErr);
        }
      }
    };
    initPage();
  }, [navigate]);

  // 3. Handle Input Teks
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 4. Handle Input Gambar
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 5. Handle Tombol Submit (Memicu Modal Konfirmasi)
  const handleRegisterClick = (e) => {
    e.preventDefault();
    if (!formData.nama_toko) {
      alert("Nama Toko wajib diisi");
      return;
    }
    setShowConfirmModal(true);
  };

  // 6. Eksekusi Register Setelah Konfirmasi
  const confirmRegister = async () => {
    setShowConfirmModal(false);
    setLoading(true);

    try {
      // Gunakan FormData agar bisa kirim file
      const payload = new FormData();
      payload.append('nama_toko', formData.nama_toko);
      payload.append('nama_pemilik_toko', formData.nama_pemilik_toko);
      payload.append('email_toko', formData.email_toko);
      payload.append('hp_toko', formData.hp_toko);
      payload.append('alamat_toko', formData.alamat_toko);
      
      if (imageFile) {
        payload.append('store_photo', imageFile);
      }

      await createStore(payload);

      // Refresh auth user di localStorage agar role terupdate jadi Seller
      const updatedUser = await getMe();
      localStorage.setItem('authUser', JSON.stringify(updatedUser));

      // Tampilkan modal sukses
      setShowSuccessModal(true);

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || "Gagal mendaftar toko.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessOk = () => {
    setShowSuccessModal(false);
    navigate('/seller/store');
  };

  return (
    <div className="w-[1020px] relative">
      <div className="w-full h-[568px] left-0 top-0 absolute bg-white/5 rounded-xl border border-white/10 backdrop-blur-[10px]" />

      <div className="relative z-10 p-6 h-[568px]">
        <div className="absolute left-[20px] top-[16px] text-[#FFE4C7] text-xl font-semibold font-['Inter']">
          Daftarkan Toko
        </div>

        {/* Avatar + Upload */}
        <div className="flex flex-col items-center justify-start mt-6">
          <div className="w-28 h-28 bg-stone-300 rounded-full flex items-center justify-center overflow-hidden border-2 border-[#FFE4C7]">
             {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
             ) : (
                <span className="text-4xl font-bold text-gray-600">
                  {formData.nama_toko ? formData.nama_toko.charAt(0).toUpperCase() : 'T'}
                </span>
             )}
          </div>
          
          <label className="mt-4 inline-flex items-center px-4 py-2 bg-white/5 rounded outline outline-1 outline-offset-[-1px] outline-white cursor-pointer hover:bg-white/10 transition">
            <input 
                type="file" 
                className="hidden" 
                onChange={handleImageChange} 
                accept="image/*" 
            /> 
            <span className="text-[#FFE4C7] text-xs font-medium font-['Inter']">Upload Photo</span>
          </label>
        </div>

        <form className="mt-6" onSubmit={handleRegisterClick}>
          <div className="grid grid-cols-[200px_1fr] gap-x-6 gap-y-4 items-center">
            
            <label htmlFor="namaToko" className="text-[#FFE4C7] text-sm font-medium font-['Inter']">Nama Toko</label>
            <input 
              id="namaToko" name="nama_toko" value={formData.nama_toko} onChange={handleChange} required
              type="text" 
              className="w-full h-10 bg-white/5 rounded-lg border border-white/10 px-3 text-[#FFE4C7] outline-none focus:border-[#FFE4C7]" 
            />

            <label htmlFor="namaPemilik" className="text-[#FFE4C7] text-sm font-medium font-['Inter']">Nama Pemilik Toko</label>
            <input 
              id="namaPemilik" name="nama_pemilik_toko" value={formData.nama_pemilik_toko} onChange={handleChange}
              type="text" 
              className="w-full h-10 bg-white/5 rounded-lg border border-white/10 px-3 text-[#FFE4C7] outline-none focus:border-[#FFE4C7]" 
            />

            <label htmlFor="emailToko" className="text-[#FFE4C7] text-sm font-medium font-['Inter']">Email</label>
            <input 
              id="emailToko" name="email_toko" value={formData.email_toko} onChange={handleChange}
              type="email" 
              className="w-full h-10 bg-white/5 rounded-lg border border-white/10 px-3 text-[#FFE4C7] outline-none focus:border-[#FFE4C7]" 
            />

            <label htmlFor="hpToko" className="text-[#FFE4C7] text-sm font-medium font-['Inter']">Nomor HP</label>
            <input 
              id="hpToko" name="hp_toko" value={formData.hp_toko} onChange={handleChange}
              type="text" 
              className="w-full h-10 bg-white/5 rounded-lg border border-white/10 px-3 text-[#FFE4C7] outline-none focus:border-[#FFE4C7]" 
            />

            <label htmlFor="alamatToko" className="text-[#FFE4C7] text-sm font-medium font-['Inter']">Alamat Toko</label>
            <input 
              id="alamatToko" name="alamat_toko" value={formData.alamat_toko} onChange={handleChange}
              type="text" 
              className="w-full h-10 bg-white/5 rounded-lg border border-white/10 px-3 text-[#FFE4C7] outline-none focus:border-[#FFE4C7]" 
            />
          </div>

          <div className="flex justify-center mt-6">
            <button 
              type="submit" disabled={loading}
              className={`h-8 px-5 py-2 bg-[#FFE4C7] rounded text-black text-xs font-medium font-['Inter'] transition hover:bg-[#ffdaae] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Memproses...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>

      {/* MODAL KONFIRMASI */}
      {showConfirmModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1E1E1E] border border-[#FFE4C7]/30 p-6 rounded-xl shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-[#FFE4C7] mb-4">Konfirmasi Pendaftaran</h3>
            <p className="text-neutral-300 mb-6">Apakah Anda yakin ingin mendaftarkan toko dengan data ini?</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg border border-[#FFE4C7] text-[#FFE4C7] hover:bg-[#FFE4C7]/10 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={confirmRegister}
                className="px-4 py-2 rounded-lg bg-[#FFE4C7] text-black font-semibold hover:bg-[#e6cdb0] transition-colors"
              >
                Ya, Daftar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL SUKSES */}
      {showSuccessModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1E1E1E] border border-[#FFE4C7]/30 p-6 rounded-xl shadow-2xl max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#FFE4C7] mb-2">Berhasil!</h3>
            <p className="text-neutral-300 mb-6">Toko Anda berhasil didaftarkan.</p>
            <button 
              onClick={handleSuccessOk}
              className="w-full py-2 rounded-lg bg-[#FFE4C7] text-black font-semibold hover:bg-[#e6cdb0] transition-colors"
            >
              OK
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}