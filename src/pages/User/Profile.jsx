import React, { useEffect, useState, useRef } from 'react';
// Pastikan baris import ini ada di paling atas
import { getMe, updateProfile } from '../../api/client'; 

export default function Profile() {
  // State untuk menampung data user
  const [user, setUser] = useState({
    nama_lengkap: '',
    username: '',
    email: '',
    nomor_hp: '',
    jurusan: '',
    profile_photo_url: ''
  });
  
  // State untuk upload foto
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef(null);

  // 1. AMBIL DATA SAAT HALAMAN DIBUKA
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMe();
        setUser({
          nama_lengkap: data.nama_lengkap || '',
          username: data.username || '',
          email: data.email || '',
          nomor_hp: data.nomor_hp || '',
          jurusan: data.jurusan || '',
          profile_photo_url: data.profile_photo_url || ''
        });
      } catch (error) {
        console.error("Gagal ambil data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 2. HANDLE PERUBAHAN INPUT
  const handleChange = (e) => {
    const keyMap = {
      'nama': 'nama_lengkap',
      'hp': 'nomor_hp'
    };
    const stateKey = keyMap[e.target.name] || e.target.name;
    setUser(prev => ({ ...prev, [stateKey]: e.target.value }));
  };

  // 3. HANDLE PILIH FILE FOTO
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 4. HANDLE TOMBOL SIMPAN
  const handleSave = async () => {
    setSaving(true);
    try {
      // Gunakan FormData untuk support upload file + data teks
      const formData = new FormData();
      formData.append('nama_lengkap', user.nama_lengkap);
      formData.append('email', user.email);
      formData.append('nomor_hp', user.nomor_hp);
      formData.append('jurusan', user.jurusan);
      
      if (selectedFile) {
        formData.append('profile_photo', selectedFile); 
      }

      // Kirim data ke backend
      const updatedData = await updateProfile(formData);

      // Update state lokal & localStorage
      setUser(prev => ({ ...prev, ...updatedData }));
      
      const currentAuth = JSON.parse(localStorage.getItem('authUser') || '{}');
      localStorage.setItem('authUser', JSON.stringify({ ...currentAuth, ...updatedData }));

      alert("Profil berhasil diperbarui!");
      
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setSelectedFile(null);
      
      window.location.reload(); 
    } catch (error) {
      console.error("Gagal update:", error);
      alert("Gagal menyimpan perubahan. Cek koneksi atau data Anda.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="w-[1020px] h-[568px] flex justify-center items-center text-[#FFE4C7]">Memuat...</div>;
  }

  return (
    <div className="w-[1020px] h-[568px] relative rounded-xl outline outline-1 outline-offset-[-1px] outline-white/0 backdrop-blur-[10px]">
      <div className="w-[1020px] h-[568px] left-0 top-0 absolute bg-white/5 rounded-[20px]" />
      <div className="left-[20px] top-[16px] absolute text-[#FFE4C7] text-xl font-semibold font-['Inter']">Informasi Pribadi</div>
      
      {/* Foto Profil */}
      <div className="w-28 h-28 left-[450px] top-[56px] absolute bg-stone-300 rounded-full overflow-hidden flex items-center justify-center border-2 border-[#FFE4C7]">
         {previewUrl ? (
           <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
         ) : user.profile_photo_url ? (
           <img src={user.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
         ) : (
           <span className="text-4xl font-bold text-gray-600">
             {user.nama_lengkap ? user.nama_lengkap.charAt(0).toUpperCase() : 'U'}
           </span>
         )}
      </div>

      {/* Input File Tersembunyi */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />

      <button 
        type="button" 
        onClick={() => fileInputRef.current.click()}
        className="h-8 px-5 py-2 left-[451px] top-[192px] absolute bg-white/5 rounded outline outline-1 outline-offset-[-1px] outline-[#FFE4C7] inline-flex justify-center items-center gap-2.5 text-[#FFE4C7] text-xs font-medium hover:bg-white/10 transition-colors"
      >
        Upload Photo
      </button>

      {/* Input Fields */}
      <label htmlFor="nama" className="w-28 left-[20px] top-[252px] absolute text-[#FFE4C7] text-sm font-medium font-['Inter']">Nama Lengkap</label>
      <input 
        id="nama" name="nama" type="text" 
        value={user.nama_lengkap} onChange={handleChange}
        className="w-[773.63px] h-10 left-[226.37px] top-[240px] absolute bg-white/5 rounded-lg border border-[#FFE4C7] px-3 text-[#FFE4C7] focus:outline-none focus:border-[#ffdec0]"
      />

      <label htmlFor="username" className="left-[20px] top-[308px] absolute text-[#FFE4C7] text-sm font-medium font-['Inter']">Username</label>
      <input 
        id="username" name="username" type="text" 
        value={user.username} readOnly 
        className="w-[773px] h-10 left-[227px] top-[296px] absolute bg-white/5 rounded-lg border border-[#FFE4C7] px-3 text-[#FFE4C7] opacity-70 cursor-not-allowed"
      />

      <label htmlFor="email" className="left-[20px] top-[364px] absolute text-[#FFE4C7] text-sm font-medium font-['Inter']">Email</label>
      <input 
        id="email" name="email" type="email" 
        value={user.email} onChange={handleChange}
        className="w-[773px] h-10 left-[227px] top-[352px] absolute bg-white/5 rounded-lg border border-[#FFE4C7] px-3 text-[#FFE4C7] focus:outline-none focus:border-[#ffdec0]"
      />

      <label htmlFor="hp" className="left-[20px] top-[420px] absolute text-[#FFE4C7] text-sm font-medium font-['Inter']">Nomor HP</label>
      <input 
        id="hp" name="hp" type="text" 
        value={user.nomor_hp} onChange={handleChange}
        className="w-[773px] h-10 left-[227px] top-[408px] absolute bg-white/5 rounded-lg border border-[#FFE4C7] px-3 text-[#FFE4C7] focus:outline-none focus:border-[#ffdec0]"
      />

      <label htmlFor="jurusan" className="left-[20px] top-[476px] absolute text-[#FFE4C7] text-sm font-medium font-['Inter']">Jurusan</label>
      <input 
        id="jurusan" name="jurusan" type="text" 
        value={user.jurusan} onChange={handleChange}
        className="w-[773px] h-10 left-[227px] top-[464px] absolute bg-white/5 rounded-lg border border-[#FFE4C7] px-3 text-[#FFE4C7] focus:outline-none focus:border-[#ffdec0]"
      />

      {/* Tombol Aksi */}
      <button type="button" onClick={() => window.location.reload()} className="w-24 h-8 left-[400px] top-[520px] absolute bg-white/5 rounded border border-[#FFE4C7] text-[#FFE4C7] text-xs font-medium hover:bg-white/10 transition-colors">
        Batal
      </button>
      
      <button 
        type="button" 
        onClick={handleSave}
        disabled={saving}
        className="w-24 h-8 left-[520px] top-[520px] absolute bg-[#FFE4C7] rounded text-black text-xs font-medium hover:bg-[#ffdec0] disabled:opacity-70 transition-colors"
      >
        {saving ? 'Menyimpan...' : 'Simpan'}
      </button>
    </div>
  );
}