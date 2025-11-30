import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom'; // Import createPortal untuk modal

export default function AddProduct() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [condition, setCondition] = useState('');
  const [price, setPrice] = useState('');
  const [isBarter, setIsBarter] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const fileRef = useRef(null);

  // State untuk data dari backend
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(false);

  // State Modals
  const [confirmUploadOpen, setConfirmUploadOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // 1. Fetch Kategori dari Backend saat komponen dimuat
  useEffect(() => {
    fetch('http://localhost:8000/categories/')
      .then(res => res.json())
      .then(data => setCategoriesList(data))
      .catch(err => console.error("Gagal memuat kategori:", err));
  }, []);

  const resetForm = () => {
    setTitle(''); setAuthor(''); setCondition(''); setPrice(''); setIsBarter(false);
    setCategory(''); setDescription(''); setImageSrc(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return setImageSrc(null);
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(f);
  };

  // Handler saat tombol submit ditekan (Hanya buka modal konfirmasi)
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validasi input wajib
    if (!title || !condition || !category) {
        alert("Mohon lengkapi Judul, Kondisi, dan Kategori.");
        return;
    }

    // Buka modal konfirmasi
    setConfirmUploadOpen(true);
  };

  // Handler eksekusi upload ke backend
  const handleConfirmUpload = async () => {
    setLoading(true);

    try {
        // Ambil token dari localStorage
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (!token) {
            alert("Sesi habis. Silakan login kembali.");
            navigate('/login');
            return;
        }

        // Gunakan FormData untuk upload file
        const formData = new FormData();
        formData.append('title', title);
        formData.append('author', author);
        formData.append('condition', condition);
        formData.append('is_barter', isBarter);
        
        if (!isBarter && price) {
            formData.append('price', price);
        }

        formData.append('description', description);
        // Backend mengharapkan list ID kategori dalam format JSON string, contoh: "[1]"
        formData.append('category_ids', JSON.stringify([parseInt(category)]));

        // Append file gambar jika ada
        if (fileRef.current && fileRef.current.files[0]) {
            formData.append('image_file', fileRef.current.files[0]);
        }

        // Kirim ke Backend
        const response = await fetch('http://localhost:8000/books/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) {
                alert("Sesi kadaluarsa. Silakan login ulang.");
                navigate('/login');
                return;
            }
            throw new Error(errorData.detail || 'Gagal mengupload buku');
        }

        // Sukses: Tutup modal konfirmasi, Buka modal sukses, Reset form
        setConfirmUploadOpen(false);
        setSuccessModalOpen(true);
        resetForm();

    } catch (error) {
        console.error(error);
        alert(`Gagal: ${error.message}`);
        setConfirmUploadOpen(false);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-[1020px] relative">
      <div className="bg-white/5 rounded-[20px] border border-white/10 backdrop-blur-[10px] p-6">
        <h2 className="text-[#FFE4C7] text-xl font-semibold mb-4">Unggah Detail Buku</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          {/* LEFT: inputs */}
          <div className="space-y-4">
            <div>
              <label className="text-[#FFE4C7] text-xs font-medium">Judul Buku</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="mt-2 w-full bg-white/5 rounded-lg border border-[#FFE4C7] px-3 py-2 text-[#FFE4C7] outline-none" placeholder="Masukkan judul buku" required />
            </div>

            <div>
              <label className="text-[#FFE4C7] text-xs font-medium">Pengarang</label>
              <input value={author} onChange={e => setAuthor(e.target.value)} className="mt-2 w-full bg-white/5 rounded-lg border border-[#FFE4C7] px-3 py-2 text-[#FFE4C7] outline-none" placeholder="Nama pengarang" />
            </div>

            <div>
              <label className="text-[#FFE4C7] text-xs font-medium">Kondisi Buku</label>
              <select value={condition} onChange={e => setCondition(e.target.value)} className="mt-2 w-full bg-white/5 rounded-lg border border-[#FFE4C7] px-3 py-2 text-[#FFE4C7] outline-none" required>
                  <option value="">Pilih Kondisi</option>
                  <option value="Baru">Baru</option>
                  <option value="Bekas - Seperti Baru">Bekas - Seperti Baru</option>
                  <option value="Bekas - Baik">Bekas - Baik</option>
                  <option value="Bekas - Cukup">Bekas - Cukup</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-[#FFE4C7] text-xs font-medium">Harga</label>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  disabled={isBarter}
                  placeholder={isBarter ? 'Barter' : 'Rp'}
                  className={`mt-2 w-full rounded-lg px-3 py-2 outline-none transition-colors ${
                    isBarter
                      ? 'bg-white/3 border border-white/10 text-white/60 cursor-not-allowed'
                      : 'bg-white/5 border border-[#FFE4C7] text-[#FFE4C7] focus:border-[#FFE4C7]'
                  }`}
                />
              </div>
              <div className="w-40">
                <label className="text-[#FFE4C7] text-xs font-medium">Tipe</label>
                <div
                  role="radiogroup"
                  aria-label="Tipe transaksi"
                  className="mt-2 inline-flex rounded-full bg-transparent p-1 gap-1"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={!isBarter}
                    onClick={() => setIsBarter(false)}
                    className={`px-3 py-1.5 text-xs rounded-full font-medium transition ${
                      !isBarter
                        ? 'bg-[#FFE4C7] text-black shadow-sm'
                        : 'bg-transparent border border-white/20 text-[#FFE4C7]'
                    }`}
                  >
                    Jual
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isBarter}
                    onClick={() => { setIsBarter(true); setPrice(''); }}
                    className={`px-3 py-1.5 text-xs rounded-full font-medium transition ${
                      isBarter
                        ? 'bg-[#FFE4C7] text-black shadow-sm'
                        : 'bg-transparent border border-white/20 text-[#FFE4C7]'
                    }`}
                  >
                    Barter
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[#FFE4C7] text-xs font-medium">Kategori</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="mt-2 w-full bg-white/5 rounded-lg border border-[#FFE4C7] px-3 py-2 text-[#FFE4C7] outline-none" required>
                <option value="">Pilih kategori</option>
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[#FFE4C7] text-xs font-medium">Deskripsi</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-2 w-full bg-white/5 rounded-lg border border-[#FFE4C7] px-3 py-2 text-[#FFE4C7] outline-none" placeholder="Deskripsi singkat buku..." />
            </div>
          </div>

          {/* RIGHT: image box */}
          <div className="flex flex-col items-stretch">
            <label className="text-[#FFE4C7] text-xs font-medium mb-2">Foto Buku</label>
            <div
              onClick={() => fileRef.current && fileRef.current.click()}
              className="w-full h-80 bg-neutral-300/5 rounded-lg border border-[#FFE4C7] flex items-center justify-center cursor-pointer relative overflow-hidden"
            >
              {imageSrc ? (
                <img src={imageSrc} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-[#FFE4C7]/60 text-sm text-center px-4">
                  Klik untuk memilih gambar buku<br/>(JPG, PNG)
                </div>
              )}
            </div>

            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

            <div className="mt-4 flex gap-3 justify-end">
              <button type="button" onClick={resetForm} disabled={loading} className="h-10 px-4 bg-white/5 rounded border border-[#FFE4C7] text-[#FFE4C7] text-sm font-medium hover:bg-white/10 disabled:opacity-50">Batal</button>
              <button type="submit" disabled={loading} className="h-10 px-6 bg-[#FFE4C7] rounded text-black font-semibold hover:brightness-95 disabled:opacity-50">
                {loading ? 'Mengunggah...' : 'Upload'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* --- MODAL KONFIRMASI UPLOAD --- */}
      {confirmUploadOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[130000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setConfirmUploadOpen(false)} />
          <div className="relative z-[130001] w-full max-w-sm p-6 bg-[#18181b] border border-[#FFE4C7]/30 rounded-2xl shadow-2xl text-center transform scale-100 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-[#FFE4C7]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#FFE4C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </div>
            <h3 className="text-[#FFE4C7] text-xl font-bold mb-2">Konfirmasi Upload</h3>
            <p className="text-white/60 mb-6 text-sm">Apakah Anda yakin ingin mengunggah buku ini? Data akan diverifikasi oleh Admin sebelum ditampilkan.</p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setConfirmUploadOpen(false)} 
                className="flex-1 px-4 py-2.5 border border-white/20 rounded-lg text-[#FFE4C7] hover:bg-white/5 transition font-medium text-sm"
              >
                Periksa Lagi
              </button>
              <button 
                onClick={handleConfirmUpload} 
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#FFE4C7] text-black font-bold hover:bg-[#ffdec0] transition text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                    <>
                        <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Proses...
                    </>
                ) : 'Ya, Upload'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- MODAL SUKSES --- */}
      {successModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[130000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative z-[130001] w-full max-w-sm p-6 bg-[#18181b] border border-green-500/30 rounded-2xl shadow-2xl text-center transform scale-100 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-green-400 text-xl font-bold mb-2">Berhasil Diunggah!</h3>
            <p className="text-white/60 mb-6 text-sm">Produk Anda telah berhasil dikirim dan sedang menunggu persetujuan Admin.</p>
            <button 
              onClick={() => setSuccessModalOpen(false)} 
              className="w-full px-4 py-2.5 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition text-sm"
            >
              Mengerti
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}