import React, { useEffect, useState, useRef } from 'react';
import { getMyStore, updateStore } from '../../api/client';

export default function StoreProfile() {
  const [store, setStore] = useState({
    nama_toko: '',
    nama_pemilik_toko: '',
    email: '',
    nomor_hp: '',
    alamat_toko: '',
    store_photo_url: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const data = await getMyStore();
        setStore({
          nama_toko: data.nama_toko || '',
          nama_pemilik_toko: data.nama_pemilik_toko || '',
          email: data.email || '',
          nomor_hp: data.nomor_hp || '',
          alamat_toko: data.alamat_toko || '',
          store_photo_url: data.store_photo_url || ''
        });
      } catch (err) {
        console.error('Gagal ambil data toko:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStore(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setSelectedFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  };

  const handleCancel = () => {
    // reset preview and selected file
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    // reload store data
    setLoading(true);
    getMyStore().then(data => {
      setStore({
        nama_toko: data.nama_toko || '',
        nama_pemilik_toko: data.nama_pemilik_toko || '',
        email: data.email || '',
        nomor_hp: data.nomor_hp || '',
        alamat_toko: data.alamat_toko || '',
        store_photo_url: data.store_photo_url || ''
      });
    }).catch(()=>{}).finally(()=>setLoading(false));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('nama_toko', store.nama_toko);
      formData.append('nama_pemilik_toko', store.nama_pemilik_toko);
      formData.append('email', store.email);
      formData.append('nomor_hp', store.nomor_hp);
      formData.append('alamat_toko', store.alamat_toko);
      if (selectedFile) formData.append('store_photo', selectedFile);

      const updated = await updateStore(formData);

      // update local state & localStorage authSeller
      setStore(prev => ({ ...prev, ...updated }));
      try {
        const raw = JSON.parse(localStorage.getItem('authSeller') || '{}');
        localStorage.setItem('authSeller', JSON.stringify({ ...raw, ...updated }));
      } catch (e) { /* ignore */ }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setSelectedFile(null);
      alert('Informasi toko berhasil disimpan.');
    } catch (err) {
      console.error('Gagal menyimpan informasi toko:', err);
      alert('Gagal menyimpan informasi toko.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="w-[1020px] h-[568px] flex items-center justify-center text-[#FFE4C7]">Memuat informasi toko...</div>;

  return (
    <div className="w-[1020px] h-[568px] relative rounded-xl outline outline-1 outline-offset-[-1px] outline-white/0 backdrop-blur-[10px]">
      <div className="w-[1020px] h-[568px] left-0 top-0 absolute bg-white/5 rounded-[20px]" />
      <div className="left-[20px] top-[16px] absolute text-[#FFE4C7] text-xl font-semibold font-['Inter']">Informasi Toko</div>

      {/* Avatar */}
      <div className="w-28 h-28 left-[450px] top-[56px] absolute bg-stone-300 rounded-full overflow-hidden flex items-center justify-center border-2 border-[#FFE4C7]">
        {previewUrl ? (
          <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
        ) : store.store_photo_url ? (
          <img src={store.store_photo_url} alt="store" className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl font-bold text-gray-600">{store.nama_toko ? store.nama_toko.charAt(0).toUpperCase() : 'T'}</span>
        )}
      </div>

      <input ref={fileInputRef} onChange={handleFileChange} type="file" accept="image/*" className="hidden" />
      <button
        type="button"
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        className="h-8 px-5 py-2 left-[451px] top-[192px] absolute bg-white/5 rounded outline outline-1 outline-offset-[-1px] outline-Color1 inline-flex justify-center items-center gap-2.5 text-[#FFE4C7] text-xs font-medium hover:bg-white/10 transition-colors"
      >
        Upload Photo
      </button>

      {/* Fields */}
      <label className="w-28 left-[20px] top-[252px] absolute text-[#FFE4C7] text-sm font-medium font-['Inter']">Nama Toko</label>
      <input
        name="nama_toko"
        value={store.nama_toko}
        onChange={handleChange}
        className="w-[773.63px] h-10 left-[226.37px] top-[240px] absolute bg-white/5 rounded-lg border border-Color1 px-3 text-[#FFE4C7] focus:outline-none"
      />

      <label className="left-[20px] top-[308px] absolute text-[#FFE4C7] text-sm font-medium font-['Inter']">Nama Pemilik Toko</label>
      <input
        name="nama_pemilik_toko"
        value={store.nama_pemilik_toko}
        onChange={handleChange}
        className="w-[773px] h-10 left-[227px] top-[296px] absolute bg-white/5 rounded-lg border border-Color1 px-3 text-[#FFE4C7] focus:outline-none"
      />

      <label className="left-[20px] top-[364px] absolute text-[#FFE4C7] text-sm font-medium font-['Inter']">Email</label>
      <input
        name="email"
        value={store.email}
        onChange={handleChange}
        className="w-[773px] h-10 left-[227px] top-[352px] absolute bg-white/5 rounded-lg border border-Color1 px-3 text-[#FFE4C7] focus:outline-none"
      />

      <label className="left-[20px] top-[420px] absolute text-[#FFE4C7] text-sm font-medium font-['Inter']">Nomor HP</label>
      <input
        name="nomor_hp"
        value={store.nomor_hp}
        onChange={handleChange}
        className="w-[773px] h-10 left-[227px] top-[408px] absolute bg-white/5 rounded-lg border border-Color1 px-3 text-[#FFE4C7] focus:outline-none"
      />

      <label className="left-[20px] top-[476px] absolute text-[#FFE4C7] text-sm font-medium font-['Inter']">Alamat Toko</label>
      <input
        name="alamat_toko"
        value={store.alamat_toko}
        onChange={handleChange}
        className="w-[773px] h-10 left-[227px] top-[464px] absolute bg-white/5 rounded-lg border border-Color1 px-3 text-[#FFE4C7] focus:outline-none"
      />

      {/* Actions */}
      <button
        type="button"
        onClick={handleCancel}
        className="w-24 h-8 left-[400px] top-[520px] absolute bg-white/5 rounded border border-Color1 text-[#FFE4C7] text-xs font-medium hover:bg-white/10 transition-colors"
      >
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