// src/pages/Seller/Store.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyStore, getBooks, deleteBook, updateBook } from '../../api/client';
import { createPortal } from 'react-dom';

// --- Komponen Kartu Buku Khusus Seller ---
function SellerBookCard({ book, onEdit, onToggleSold }) {
  const displayPrice = book.is_barter 
    ? "Barter" 
    : (typeof book.price === 'number' ? `Rp ${book.price.toLocaleString()}` : book.price);

  return (
    <div 
      onClick={() => onEdit(book)} 
      className="w-60 h-[380px] rounded-xl outline outline-1 outline-white bg-white/5 backdrop-blur-[10px] overflow-hidden flex flex-col relative z-20 pointer-events-auto cursor-pointer group hover:bg-white/10 transition-all"
    >
      {/* Badge Status Verifikasi */}
      <div className={`absolute top-2 left-2 px-2 py-1 text-[10px] font-bold rounded uppercase z-10 shadow-md ${
          (book.status_verifikasi || '').toLowerCase() === 'approved' ? 'bg-green-500 text-white' :
          (book.status_verifikasi || '').toLowerCase() === 'rejected' ? 'bg-red-500 text-white' :
          'bg-yellow-500 text-black'
      }`}>
          {book.status_verifikasi || 'Pending'}
      </div>

      {/* Gambar */}
      <div className="w-full h-60 relative overflow-hidden">
        <img 
            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
            src={book.image_url || "https://placehold.co/240x240?text=No+Image"} 
            alt={book.title} 
            onError={(e) => { e.target.src = "https://placehold.co/240x240?text=Error"; }}
        />
      </div>
      
      <div className="flex flex-col gap-2 px-4 py-3 flex-1">
        <div>
          <div className="text-[#FFE4C7] text-sm font-semibold truncate" title={book.title}>{book.title}</div>
          <div className="text-[#FFE4C7] text-xs truncate">{book.author}</div>
        </div>
        
        <div className="h-px w-full bg-white/20 my-1" />
        
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[#FFE4C7]/60 text-[10px]">{book.is_barter ? 'Tipe' : 'Harga'}</div>
            <div className="text-[#FFE4C7] text-xs font-bold">{displayPrice}</div>
          </div>
          <div className="text-right">
            <div className="text-[#FFE4C7]/60 text-[10px]">Kondisi</div>
            <div className="text-[#FFE4C7] text-xs">{book.condition}</div>
          </div>
        </div>

        {/* Tombol Status Terjual */}
        <div className="mt-auto">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleSold(book);
                }}
                className={`w-full py-1.5 rounded text-xs font-semibold transition-colors z-20 relative ${
                    book.is_sold 
                    ? 'bg-white/10 text-white hover:bg-white/20' 
                    : 'bg-[#FFE4C7] text-black hover:bg-[#ffdec0]'
                }`}
            >
                {book.is_sold ? 'Tandai Tersedia' : 'Tandai Terjual'}
            </button>
        </div>
      </div>
    </div>
  );
}

// --- Komponen Utama Dashboard Seller ---
export default function Store() {
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Modal Edit
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Ref untuk input file
  const fileInputRef = useRef(null);

  const [editForm, setEditForm] = useState({
    title: '', author: '', condition: '', price: '', is_barter: false, description: '', 
    image_url: '', // URL gambar lama (dari server)
    image_file: null, // File gambar baru (dari upload)
    preview_url: null // URL preview gambar baru
  });
  
  // State Konfirmasi
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  // 1. Ambil Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const storeData = await getMyStore();
      setStore(storeData);

      const allBooks = await getBooks();
      const filtered = allBooks.filter(b => b.store_id === storeData.id);
      setMyBooks(filtered);

    } catch (err) {
      console.error("Gagal memuat dashboard:", err);
      if (err.response && (err.response.status === 404 || err.response.status === 403)) {
          navigate('/register-store');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  // 2. Logic Toggle Status Terjual
  const handleToggleSold = async (book) => {
    const newStatus = !book.is_sold;
    try {
        const formData = new FormData();
        formData.append('is_sold', newStatus); 
        await updateBook(book.id, formData);
        setMyBooks(prev => prev.map(b => b.id === book.id ? { ...b, is_sold: newStatus } : b));
    } catch (error) {
        console.error("Gagal update status:", error);
        alert("Gagal mengubah status buku.");
    }
  };

  // 3. Logic Edit & Modal
  const openEditModal = (book) => {
    setEditingId(book.id);
    setEditForm({
      title: book.title || '',
      author: book.author || '',
      condition: book.condition || '',
      price: book.price || '',
      is_barter: Boolean(book.is_barter),
      description: book.description || '',
      image_url: book.image_url || '',
      image_file: null,
      preview_url: null
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingId(null);
    setConfirmSaveOpen(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEditChange = (key, value) => setEditForm(f => ({ ...f, [key]: value }));

  // --- HANDLER UPLOAD GAMBAR ---
  const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setEditForm(prev => ({
              ...prev,
              image_file: file,
              preview_url: URL.createObjectURL(file)
          }));
      }
  };

  const handleSaveClick = () => setConfirmSaveOpen(true);

  const handleConfirmSave = async () => {
    if(!editingId) return;
    try {
        const formData = new FormData();
        formData.append('title', editForm.title);
        formData.append('author', editForm.author);
        formData.append('condition', editForm.condition);
        
        if(editForm.is_barter) {
            formData.append('price', 0);
            formData.append('is_barter', true);
        } else {
            formData.append('price', editForm.price);
            formData.append('is_barter', false);
        }
        
        formData.append('description', editForm.description);

        // Jika ada file gambar baru, kirimkan
        if (editForm.image_file) {
            formData.append('image_file', editForm.image_file);
        }

        await updateBook(editingId, formData);
        
        alert("Perubahan disimpan!");
        closeEditModal();
        fetchData(); 

    } catch (error) {
        console.error(error);
        alert("Gagal menyimpan perubahan.");
    }
  };

  const handleDeleteClick = () => {
      setDeleteId(editingId);
      setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
      if(!deleteId) return;
      try {
          await deleteBook(deleteId);
          setMyBooks(prev => prev.filter(b => b.id !== deleteId));
          setConfirmDeleteOpen(false);
          closeEditModal();
      } catch (error) {
          alert("Gagal menghapus buku.");
      }
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-[#FFE4C7]">Memuat Toko...</div>;

  return (
    <div className="w-[1020px] min-h-[800px] relative">
      
      {/* Header Toko */}
      <Link
        to="/seller/store/profile"
        className="w-full p-6 bg-white/5 rounded-[20px] border border-white/10 backdrop-blur-[10px] flex items-center justify-between mb-6 cursor-pointer hover:bg-white/10 transition-colors"
      >
         <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-700 overflow-hidden border-2 border-[#FFE4C7]">
                {store?.store_photo_url ? (
                    <img src={store.store_photo_url} alt="Logo" className="w-full h-full object-cover"/>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[#FFE4C7]">
                        {store?.nama_toko?.charAt(0)}
                    </div>
                )}
            </div>
            <div>
                <h1 className="text-2xl font-bold text-[#FFE4C7]">{store?.nama_toko}</h1>
                <p className="text-white/60 text-sm">Pemilik: {store?.nama_pemilik_toko}</p>
            </div>
         </div>
      </Link>

      {/* Container Grid Buku */}
      <div className="w-full min-h-[600px] rounded-[20px] outline outline-1 outline-white overflow-hidden relative">
        <div className="absolute inset-0 bg-white/5 border border-white backdrop-blur-[10px] pointer-events-none z-0" />
        
        <div className="absolute left-[20px] right-6 top-[12px] z-30 flex items-center justify-between">
          <div className="text-[#FFE4C7] text-xl font-semibold font-['Inter']">Etalase Toko ({myBooks.length})</div>
          <div className="flex items-center gap-3">
            <Link
              to="/seller/store/reports"
              className="h-8 px-3 bg-white/5 rounded border border-Color1 text-Color1 text-sm font-semibold hover:bg-white/10 transition flex items-center justify-center cursor-pointer"
            >
              Laporan Unggahan
            </Link>
            <button
              type="button"
              onClick={() => navigate('/seller/products')}
              className="h-8 px-4 bg-[#FFE4C7] hover:bg-[#ffdaae] text-black font-semibold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              + Tambah Produk
            </button>
          </div>
        </div>

        <div className="pt-[60px] px-5 pb-5 relative z-10">
          {myBooks.length === 0 ? (
            <div className="w-full flex items-center justify-center">
              <div className="text-center text-white/60 py-20">
                <div className="text-[#FFE4C7] text-lg font-semibold mb-2">Etalase Toko Kosong</div>
                <div className="mb-4">Belum ada buku di etalase. Tambahkan produk pertama Anda untuk mulai berjualan.</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-x-5 gap-y-6 pointer-events-auto z-10">
              {myBooks.map(book => (
                <SellerBookCard 
                    key={book.id} 
                    book={book} 
                    onEdit={openEditModal} 
                    onToggleSold={handleToggleSold} 
                />
              ))}
            </div>
          )}
        </div>
       </div>

      {/* --- MODAL EDIT BUKU (POPUP) --- */}
      {editModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[120000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeEditModal} />
          
          <div className="relative z-10 w-full max-w-4xl bg-[#18181b] border border-[#FFE4C7]/20 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
               <h3 className="text-xl font-bold text-[#FFE4C7]">Edit Detail Buku</h3>
               <button onClick={closeEditModal} className="text-white/50 hover:text-white transition-colors text-2xl">×</button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto grid grid-cols-2 gap-8">
               {/* Left Column */}
               <div className="space-y-5">
                  <div>
                    <label className="block text-[#FFE4C7] text-xs font-medium mb-2">Judul Buku</label>
                    <input value={editForm.title} onChange={e=>handleEditChange('title', e.target.value)} className="w-full bg-white/5 rounded-lg border border-[#FFE4C7]/30 px-4 py-2.5 text-[#FFE4C7] outline-none" />
                  </div>
                  
                  <div>
                    <label className="block text-[#FFE4C7] text-xs font-medium mb-2">Pengarang</label>
                    <input value={editForm.author} onChange={e=>handleEditChange('author', e.target.value)} className="w-full bg-white/5 rounded-lg border border-[#FFE4C7]/30 px-4 py-2.5 text-[#FFE4C7] outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#FFE4C7] text-xs font-medium mb-2">Kondisi</label>
                      <select value={editForm.condition} onChange={e=>handleEditChange('condition', e.target.value)} className="w-full bg-white/5 rounded-lg border border-[#FFE4C7]/30 px-3 py-2.5 text-[#FFE4C7] outline-none bg-[#18181b]">
                         <option value="Baru">Baru</option>
                         <option value="Bekas - Seperti Baru">Bekas - Seperti Baru</option>
                         <option value="Bekas - Baik">Bekas - Baik</option>
                         <option value="Bekas - Cukup">Bekas - Cukup</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#FFE4C7] text-xs font-medium mb-2">Harga</label>
                      <input 
                         type="number" 
                         value={editForm.price} 
                         disabled={editForm.is_barter}
                         onChange={e=>handleEditChange('price', e.target.value)} 
                         className={`w-full bg-white/5 rounded-lg border border-[#FFE4C7]/30 px-4 py-2.5 text-[#FFE4C7] outline-none ${editForm.is_barter ? 'opacity-50 cursor-not-allowed' : ''}`} 
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2">
                     <label className="text-[#FFE4C7] text-sm">Mode Transaksi:</label>
                     <button type="button" onClick={()=>handleEditChange('is_barter', false)} className={`px-3 py-1 rounded text-xs ${!editForm.is_barter ? 'bg-[#FFE4C7] text-black' : 'bg-white/10 text-white'}`}>Jual</button>
                     <button type="button" onClick={()=>handleEditChange('is_barter', true)} className={`px-3 py-1 rounded text-xs ${editForm.is_barter ? 'bg-[#FFE4C7] text-black' : 'bg-white/10 text-white'}`}>Barter</button>
                  </div>
               </div>

               {/* Right Column */}
               <div className="space-y-5 flex flex-col">
                  <div>
                    <label className="block text-[#FFE4C7] text-xs font-medium mb-2">Foto Buku</label>
                    
                    {/* Area Klik untuk Upload */}
                    <div 
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        className="w-full h-48 bg-neutral-900/50 rounded-lg border border-[#FFE4C7]/30 border-dashed hover:border-[#FFE4C7] overflow-hidden flex items-center justify-center cursor-pointer group transition-colors"
                    >
                      {/* Tampilkan Preview (Gambar Baru atau Gambar Lama) */}
                      {editForm.preview_url ? (
                         <img className="w-full h-full object-cover" src={editForm.preview_url} alt="preview" />
                      ) : editForm.image_url ? (
                         <img className="w-full h-full object-cover" src={editForm.image_url} alt="current" />
                      ) : (
                         <div className="flex flex-col items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white/30 group-hover:text-[#FFE4C7]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="text-white/30 text-xs group-hover:text-[#FFE4C7]">Klik untuk ganti foto</span>
                         </div>
                      )}
                    </div>
                    {/* Input File Tersembunyi */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        accept="image/*" 
                        className="hidden" 
                    />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <label className="block text-[#FFE4C7] text-xs font-medium mb-2">Deskripsi</label>
                    <textarea 
                      value={editForm.description} 
                      onChange={e=>handleEditChange('description', e.target.value)} 
                      className="w-full flex-1 bg-white/5 rounded-lg border border-[#FFE4C7]/30 px-4 py-3 text-[#FFE4C7] outline-none resize-none" 
                    />
                  </div>
               </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10 flex justify-between items-center bg-white/5">
               {/* Tombol Hapus */}
               <button 
                 onClick={handleDeleteClick}
                 className="px-4 py-2 rounded-lg bg-red-600/10 border border-red-600/50 text-red-500 hover:bg-red-600 hover:text-white transition-colors font-medium text-sm"
               >
                 Hapus Buku Ini
               </button>

               <div className="flex gap-3">
                    <button 
                        onClick={closeEditModal} 
                        className="px-6 py-2.5 rounded-lg border border-white/20 text-[#FFE4C7] hover:bg-white/5 transition-colors font-medium text-sm"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleSaveClick} 
                        className="px-6 py-2.5 rounded-lg bg-[#FFE4C7] text-black hover:bg-[#ffdec0] transition-colors font-bold text-sm shadow-lg shadow-[#FFE4C7]/10"
                    >
                        Simpan Perubahan
                    </button>
               </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* CONFIRM SAVE MODAL */}
      {confirmSaveOpen && (
        <div className="fixed inset-0 z-[130000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setConfirmSaveOpen(false)} />
          <div className="relative z-[130001] w-full max-w-sm p-6 bg-[#18181b] border border-[#FFE4C7]/30 rounded-2xl shadow-2xl text-center">
            <h3 className="text-[#FFE4C7] text-xl font-bold mb-2">Simpan Perubahan?</h3>
            <p className="text-white/60 mb-6 text-sm">Pastikan data yang Anda masukkan sudah benar.</p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setConfirmSaveOpen(false)} 
                className="flex-1 px-4 py-2.5 border border-white/20 rounded-lg text-[#FFE4C7] hover:bg-white/5 transition font-medium text-sm"
              >
                Periksa Lagi
              </button>
              <button 
                onClick={handleConfirmSave} 
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#FFE4C7] text-black font-bold hover:bg-[#ffdec0] transition text-sm"
              >
                Ya, Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-[130000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setConfirmDeleteOpen(false)} />
          <div className="relative z-[130001] w-96 p-6 bg-[#06070a] border border-white/10 rounded-xl shadow-2xl text-center">
            <h3 className="text-[#FFE4C7] text-lg font-semibold mb-4">Hapus Buku?</h3>
            <p className="text-[#CDBA9A] mb-6">Tindakan ini tidak dapat dibatalkan. Buku akan hilang dari toko Anda.</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setConfirmDeleteOpen(false)} className="px-5 py-2 border border-white/20 rounded-lg text-[#FFE4C7] hover:bg-white/10 transition">Batal</button>
              <button onClick={confirmDelete} className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}