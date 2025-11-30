import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// Sesuaikan impor API Anda. Asumsi fungsi-fungsi ini mendukung pengiriman FormData.
import { uploadBook, getCategories, getBooks, updateBook, getBookById } from '../../api/client'; 

export default function StoreSettings() {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const isEditMode = !!id;
    
    // Ref untuk mengakses input file secara tersembunyi
    const fileInputRef = useRef(null);

    // 1. State Form
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        condition: 'Baru', 
        price: '',
        is_barter: false,
        category_id: '',
        description: '',
    });
    
    // State khusus untuk file gambar dan preview-nya
    const [imageFile, setImageFile] = useState(null); // Menampung objek File yang akan diupload
    const [imagePreview, setImagePreview] = useState(''); // Menampung URL lokal (blob:) atau URL lama (dari backend)

    // State pendukung
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pageLoading, setPageLoading] = useState(true);

    // 2. Ambil Data Kategori & Data Buku (Jika mode Edit)
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Ambil Kategori
                const catData = await getCategories();
                setCategories(catData);
                
                // Jika mode edit, ambil data buku
                if (isEditMode) {
                    // Gunakan getBookById agar lebih efisien daripada getBooks().find()
                    // Jika getBookById belum ada, gunakan logika lama
                    let bookToEdit = null;
                    try {
                        bookToEdit = await getBookById(id);
                    } catch (e) {
                        // Fallback jika getBookById gagal/tidak ada
                        const allBooks = await getBooks();
                        bookToEdit = allBooks.find(b => b.id === parseInt(id));
                    }

                    if (bookToEdit) {
                        setFormData({
                            title: bookToEdit.title,
                            author: bookToEdit.author || '',
                            condition: bookToEdit.condition || 'Baru',
                            price: bookToEdit.price || '',
                            is_barter: bookToEdit.is_barter || false,
                            description: bookToEdit.description || '',
                            category_id: bookToEdit.categories?.[0]?.id?.toString() || '' 
                        });
                        // Set imagePreview dengan URL yang sudah ada dari backend
                        setImagePreview(bookToEdit.image_url || ''); 
                    } else {
                        setError("Buku tidak ditemukan untuk diedit.");
                    }
                }
            } catch (err) {
                console.error("Gagal fetch data:", err);
                setError("Gagal memuat data awal atau kategori.");
            } finally {
                setPageLoading(false);
            }
        };

        fetchData();
        
        // Cleanup untuk Object URL (penting untuk manajemen memori)
        return () => {
            if (imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [isEditMode, id]);


    // Handle Perubahan Input Teks/Select
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };
    
    // Handle File Change: Menyimpan file dan membuat URL preview lokal
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Revoke URL lama jika ada dan itu adalah blob URL
            if (imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
            // Set state untuk file dan preview baru
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    // Trigger input file tersembunyi
    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    // Handle Toggle Jual/Barter
    const setTransactionType = (isBarter) => {
        setFormData(prev => ({ 
            ...prev, 
            is_barter: isBarter,
            // Jika barter aktif, harga diatur ke 0. Jika tidak, pakai harga sebelumnya.
            price: isBarter ? 0 : prev.price 
        }));
    };

    // 3. Handle Submit (Menggunakan FormData untuk kirim file)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        // Validasi Dasar
        if (!formData.title || !formData.category_id) {
            setError("Judul dan Kategori wajib diisi.");
            setLoading(false);
            return;
        }
        
        // Validasi Foto Buku wajib diisi untuk unggahan baru
        if (!isEditMode && !imageFile) {
            setError("Foto Buku wajib diunggah.");
            setLoading(false);
            return;
        }
        
        // Gunakan FormData untuk mengirim data form dan file gambar
        const payload = new FormData();
        payload.append('title', formData.title);
        payload.append('author', formData.author);
        payload.append('condition', formData.condition);
        
        // Harga dan Barter
        const priceValue = formData.is_barter ? 0 : (formData.price === '' ? null : parseFloat(formData.price));
        if (priceValue !== null) {
             payload.append('price', priceValue);
        }
        payload.append('is_barter', formData.is_barter);
        
        payload.append('description', formData.description);
        // Kirim category_ids sebagai stringified array (tergantung kebutuhan API Anda)
        payload.append('category_ids', JSON.stringify([parseInt(formData.category_id)])); 

        // Lampirkan file gambar jika ada yang baru
        if (imageFile) {
            payload.append('image_file', imageFile); // Gunakan key yang diharapkan backend Anda, contoh: 'image_file'
        } else if (isEditMode && imagePreview && !imagePreview.startsWith('blob:')) {
             // Jika mode edit dan tidak ada file baru, kirim URL lama agar backend tahu
             payload.append('existing_image_url', imagePreview); 
        }
        
        try {
            if (isEditMode) {
                // Asumsi updateBook/uploadBook menangani FormData
                await updateBook(id, payload); 
                alert("Buku berhasil diperbarui!");
            } else {
                await uploadBook(payload); 
                alert("Buku berhasil diunggah! Menunggu verifikasi admin.");
            }

            navigate('/seller/store'); 

        } catch (err) {
            console.error(err);
            // PERBAIKAN: Handle format error dari FastAPI (Array of objects) agar tidak crash di React
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                // Jika error berupa array validasi (misal: [{loc:.., msg:..}])
                const msg = detail.map(e => `${e.loc[1]}: ${e.msg}`).join(', ');
                setError(msg);
            } else if (typeof detail === 'string') {
                setError(detail);
            } else {
                setError("Gagal memproses buku. Cek koneksi atau data input.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) return <div className="p-6 text-[#FFE4C7]">Memuat...</div>;
    if (error && !isEditMode) return <div className="p-6 text-red-400">{error}</div>;


    return (
        <form onSubmit={handleSubmit} className="w-[1020px] relative rounded-xl outline outline-1 outline-offset-[-1px] outline-white/0 backdrop-blur-[10px] p-6 min-h-[600px]">
            <div className="w-full h-full left-0 top-0 absolute bg-white/5 rounded-[20px] -z-10" />
            <div className="left-[20px] top-[16px] absolute justify-start text-[#FFE4C7] text-xl font-semibold font-['Inter']">
                {isEditMode ? 'Edit Detail Buku' : 'Unggah Detail Buku'}
            </div>
            
            {error && <div className="mt-12 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">Error: {error}</div>}

            <div className="grid grid-cols-2 gap-x-10 mt-12">
                
                {/* Kolom Kiri: Input Fields */}
                <div className="space-y-6">
                    
                    {/* Judul Buku */}
                    <div>
                        <label className="justify-start text-[#FFE4C7] text-xs font-medium font-['Inter']" htmlFor="title">Judul Buku *</label>
                        <input id="title" type="text" value={formData.title} onChange={handleChange} required className="w-full h-10 mt-2 bg-white/5 rounded-lg border border-[#FFE4C7] px-3 text-[#FFE4C7] focus:outline-none" />
                    </div>
                    
                    {/* Pengarang */}
                    <div>
                        <label className="justify-start text-[#FFE4C7] text-xs font-medium font-['Inter']" htmlFor="author">Pengarang</label>
                        <input id="author" type="text" value={formData.author} onChange={handleChange} className="w-full h-10 mt-2 bg-white/5 rounded-lg border border-[#FFE4C7] px-3 text-[#FFE4C7] focus:outline-none" />
                    </div>

                    {/* Kondisi Buku */}
                    <div>
                        <label className="justify-start text-[#FFE4C7] text-xs font-medium font-['Inter']" htmlFor="condition">Kondisi Buku</label>
                        <select id="condition" value={formData.condition} onChange={handleChange} className="w-full h-10 mt-2 bg-white/5 rounded-lg border border-[#FFE4C7] px-3 text-[#FFE4C7] focus:outline-none">
                            <option value="Baru" className="bg-neutral-800">Baru</option>
                            <option value="Bekas (Baik)" className="bg-neutral-800">Bekas (Baik)</option>
                            <option value="Bekas (Cukup)" className="bg-neutral-800">Bekas (Cukup)</option>
                        </select>
                    </div>
                    
                    {/* Harga dan Jual/Barter */}
                    <div className="flex flex-col">
                        <label className="justify-start text-[#FFE4C7] text-xs font-medium font-['Inter']">Harga (Rp) / Opsi Transaksi</label>
                        <div className="flex items-end gap-4">
                            <div className="flex-1">
                                <input 
                                    id="price" 
                                    type="number" 
                                    value={formData.price} 
                                    onChange={handleChange} 
                                    disabled={formData.is_barter}
                                    className={`w-full h-10 mt-2 px-3 bg-white/5 rounded-lg border border-[#FFE4C7] text-[#FFE4C7] focus:outline-none ${formData.is_barter ? 'opacity-50 cursor-not-allowed' : ''}`} 
                                    placeholder="0"
                                />
                            </div>
                            
                            {/* Opsi Jual/Barter */}
                            <div className="mb-0 flex gap-2">
                                <button type="button" onClick={() => setTransactionType(false)} className={`h-8 px-3 rounded-lg text-xs font-medium transition-all ${!formData.is_barter ? 'bg-[#FFE4C7] text-black font-semibold' : 'bg-white/5 text-[#FFE4C7]'}`}>
                                    Jual
                                </button>
                                <button type="button" onClick={() => setTransactionType(true)} className={`h-8 px-3 rounded-lg text-xs font-medium transition-all ${formData.is_barter ? 'bg-[#FFE4C7] text-black font-semibold' : 'bg-white/5 text-[#FFE4C7]'}`}>
                                    Barter
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Kategori */}
                    <div>
                        <label className="justify-start text-[#FFE4C7] text-xs font-medium font-['Inter']" htmlFor="category_id">Kategori *</label>
                        <select id="category_id" value={formData.category_id} onChange={handleChange} required className="w-full h-10 mt-2 bg-white/5 rounded-lg border border-[#FFE4C7] px-3 text-[#FFE4C7] focus:outline-none">
                            <option value="" className="bg-neutral-800">Pilih Kategori</option>
                            {/* Mapping data kategori dari API */}
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id} className="bg-neutral-800">{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Deskripsi */}
                    <div>
                        <label className="justify-start text-[#FFE4C7] text-xs font-medium font-['Inter']" htmlFor="description">Deskripsi</label>
                        <textarea id="description" value={formData.description} onChange={handleChange} rows="3" className="w-full mt-2 p-3 bg-white/5 rounded-lg border border-[#FFE4C7] text-[#FFE4C7] focus:outline-none resize-none" />
                    </div>
                </div>
                
                {/* Kolom Kanan: Foto Buku (Area Upload + Preview) */}
                <div className='flex flex-col'>
                    <label className="justify-start text-[#FFE4C7] text-xs font-medium font-['Inter']">Foto Buku</label>
                    
                    {/* Input File Tersembunyi */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        accept="image/*" 
                        className='hidden' 
                    />
                    
                    {/* Area Preview/Upload (diklik akan memicu input file) */}
                    <div 
                        onClick={triggerFileInput} 
                        className="w-full h-[320px] bg-neutral-300/5 rounded-lg border border-[#FFE4C7] flex justify-center items-center overflow-hidden relative mt-2 cursor-pointer hover:bg-white/10 transition-colors"
                    >
                        {/* Tampilkan gambar dari URL lokal (jika baru) atau URL lama (jika edit) */}
                        {imagePreview ? (
                            <img 
                                src={imagePreview} 
                                alt="Preview Foto Buku" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            // Placeholder saat belum ada gambar
                            <div className="flex flex-col items-center text-white/40 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                </svg>
                                <span>Klik untuk Unggah Foto</span>
                            </div>
                        )}
                    </div>
                    
                </div>
            </div>
            
            {/* Tombol Aksi Form */}
            <div className="flex justify-center mt-8 gap-4">
                <button 
                    type="button" 
                    onClick={() => navigate('/seller/store')} 
                    className="w-24 h-8 bg-white/5 rounded border border-[#FFE4C7] text-[#FFE4C7] text-xs font-medium hover:bg-white/10"
                >
                    Batal
                </button>
                <button 
                    type="submit" 
                    disabled={loading} 
                    className={`w-24 h-8 bg-[#FFE4C7] rounded text-black text-xs font-medium hover:bg-[#ffdec0] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Memproses...' : (isEditMode ? 'Simpan' : 'Upload')}
                </button>
            </div>
        </form>
    );
}