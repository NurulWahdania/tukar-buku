import React, { useState, useEffect, useRef } from 'react'; // <-- added useRef
import { Link, useNavigate } from 'react-router-dom';
import { getMyStore, getBooks, deleteBook } from '../../api/client';
import { createPortal } from 'react-dom';

// --- Komponen Kartu Buku Khusus Seller ---
// Bedanya: Ada Badge Status & Tombol Edit/Hapus (plus menu 3-dot)
function SellerBookCard({ book, onDeleteRequest, onEdit }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const onDocPointer = (e) => {
      if (!menuOpen) return;
      const tgt = e.target;
      // jika klik di luar tombol atau menu => tutup
      if (
        (menuRef.current && menuRef.current.contains(tgt)) ||
        (btnRef.current && btnRef.current.contains(tgt))
      ) {
        return;
      }
      setMenuOpen(false);
    };
    const onDocKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };

    document.addEventListener('pointerdown', onDocPointer);
    document.addEventListener('keydown', onDocKey);
    return () => {
      document.removeEventListener('pointerdown', onDocPointer);
      document.removeEventListener('keydown', onDocKey);
    };
  }, [menuOpen]);

  const openMenu = (e) => {
    e.stopPropagation();
    const btn = btnRef.current;
    if (!btn) {
      setMenuOpen(v => !v);
      return;
    }
    const rect = btn.getBoundingClientRect();
    const menuWidth = 180;
    let left = rect.right - menuWidth;
    if (left < 8) left = rect.left;
    const top = rect.bottom + 8;
    setMenuPos({ top, left });
    setMenuOpen(true);
  };

  const closeMenu = () => setMenuOpen(false);
  const activateEdit = (ev) => { ev.stopPropagation(); closeMenu(); if (typeof onEdit === 'function') onEdit(book); else navigate(`/seller/store/edit/${book.id}`); };
  const activateDelete = (ev) => { ev.stopPropagation(); closeMenu(); if (typeof onDeleteRequest === 'function') onDeleteRequest(book); };

  // menu rendered via portal untuk menghindari masalah z-index/overflow
  const menuNode = menuOpen && typeof document !== 'undefined' ? createPortal(
    <div ref={menuRef} style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, zIndex: 200000 }} className="pointer-events-auto">
      <div className="px-4 py-2 bg-black/80 rounded-lg shadow-lg border border-white/10 inline-flex items-start gap-2">
        <div className="w-24 h-14 bg-black/20 rounded-2xl flex items-center justify-center p-2">
          <div className="w-0.5 h-4 bg-white" />
        </div>
        <div className="px-2 py-1 inline-flex flex-col">
          <button onClick={activateEdit} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 text-[#FFE4C7] text-left">
            <svg className="w-4 h-4 text-[#FFE4C7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
            <span className="text-sm font-medium">Edit</span>
          </button>
          <div className="h-1" />
          <button onClick={activateDelete} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 text-red-400 text-left">
            <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
            <span className="text-sm font-medium">Hapus</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="w-60 rounded-xl outline outline-1 outline-white bg-white/5 backdrop-blur-[10px] overflow-hidden flex flex-col relative z-20 pointer-events-auto">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={openMenu}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMenu(e); } }}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center z-60 hover:bg-white/5 pointer-events-auto"
        title="Menu"
      >
        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="6" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="18" r="1.5" />
        </svg>
      </button>

      {/* Badge Status Verifikasi */}
      <div className={`absolute top-2 left-2 px-2 py-1 text-[10px] font-bold rounded uppercase z-10 shadow-md ${
          book.status_verifikasi === 'approved' ? 'bg-green-500 text-white' :
          book.status_verifikasi === 'rejected' ? 'bg-red-500 text-white' :
          'bg-yellow-500 text-black'
      }`}>
          {book.status_verifikasi || 'Pending'}
      </div>

      {/* Gambar */}
      <img 
        className="w-60 h-60 object-cover" 
        src={book.image_url || "https://placehold.co/240x240?text=No+Image"} 
        alt={book.title} 
        onError={(e) => { e.target.src = "https://placehold.co/240x240?text=Error"; }}
      />
      
      <div className="flex flex-col gap-2 px-4 py-3 flex-1">
        {/* Info Utama */}
        <div>
          <div className="text-[#FFE4C7] text-sm font-semibold truncate" title={book.title}>{book.title}</div>
          <div className="text-[#FFE4C7] text-xs truncate">{book.author}</div>
        </div>
        
        <div className="h-0.5 w-full bg-stone-300 my-2" />
        
        {/* Harga & Kondisi */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[#FFE4C7] text-[10px]">{book.is_barter ? 'Tipe' : 'Harga'}</div>
            <div className="text-[#FFE4C7] text-xs font-bold">{book.is_barter ? 'Barter' : (book.price ? `Rp ${book.price.toLocaleString()}` : 0)}</div>
          </div>
          <div className="text-right">
            <div className="text-[#FFE4C7] text-[10px]">Kondisi</div>
            <div className="text-[#FFE4C7] text-xs">{book.condition}</div>
          </div>
        </div>

        {/* Tombol Aksi (Edit & Hapus) */}
        <div className="mt-3 flex gap-2">
          <button onClick={() => { if (typeof onEdit === 'function') onEdit(book); else navigate(`/seller/store/edit/${book.id}`); }} className="flex-1 py-1.5 rounded bg-white/10 border border-white/20 text-[#FFE4C7] text-xs font-medium hover:bg-white/20">Edit</button>
          <button onClick={() => { if (typeof onDeleteRequest === 'function') onDeleteRequest(book); }} className="flex-1 py-1.5 rounded bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-medium hover:bg-red-500/30">Hapus</button>
        </div>
      </div>

      {menuNode}
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
  const [modalTitle, setModalTitle] = useState(''); 
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '', author: '', condition: '', price: '', is_barter: false, category: '', description: '', image_url: ''
  });
  
  // State Konfirmasi
  const [deleteCandidate, setDeleteCandidate] = useState(null); 
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false); // <-- New state for save confirmation

  // 1. Ambil Data Toko & Buku Saya
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // A. Ambil Profil Toko
        const storeData = await getMyStore();
        setStore(storeData);

        // B. Ambil Semua Buku -> Filter milik toko ini
        const allBooks = await getBooks();
        const filtered = allBooks.filter(b => b.store_id === storeData.id);
        setMyBooks(filtered);

      } catch (err) {
        console.error("Gagal memuat dashboard:", err);
        // Jika belum punya toko (404), lempar ke halaman daftar toko
        if (err.response && (err.response.status === 404 || err.response.status === 403)) {
            navigate('/register-store');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // 2. Perform delete (no prompt here; prompt is handled by modal)
  const handleDelete = async (bookId) => {
    try {
        await deleteBook(bookId);
        setMyBooks(prev => prev.filter(b => b.id !== bookId));
    } catch (err) {
        alert("Gagal menghapus buku.");
    }
  };
  
  // request to delete -> open confirmation modal
  const requestDelete = (book) => {
    setDeleteCandidate({ id: book.id, title: book.title });
    setConfirmDeleteOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    await handleDelete(deleteCandidate.id);
    setConfirmDeleteOpen(false);
    setDeleteCandidate(null);
  };
  
  const cancelDelete = () => {
    setConfirmDeleteOpen(false);
    setDeleteCandidate(null);
  };

  // buka modal edit dengan data book
  const openEditModal = (book) => {
    setEditingId(book.id);
    setEditForm({
      title: book.title || '',
      author: book.author || '',
      condition: book.condition || '',
      price: book.price || '',
      is_barter: Boolean(book.is_barter),
      category: book.category || '',
      description: book.description || '',
      image_url: book.image_url || ''
    });
    setModalTitle('Edit Detail Buku'); 
    setEditModalOpen(true);
  };
  
  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingId(null);
    setModalTitle('');
    setConfirmSaveOpen(false); // Reset confirm state
  };
  
  const handleEditChange = (key, value) => setEditForm(f => ({ ...f, [key]: value }));
  
  // Trigger konfirmasi simpan
  const handleSaveClick = () => {
    setConfirmSaveOpen(true);
  };

  // Eksekusi simpan setelah konfirmasi
  const handleConfirmSave = async () => {
    // jika punya API: await updateBook(editingId, editForm)
    // Simulasi update lokal
    setMyBooks(prev => prev.map(b => b.id === editingId ? { ...b, ...editForm } : b));
    
    setConfirmSaveOpen(false);
    closeEditModal();
    // optional: toast/success
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-[#FFE4C7]">Memuat Toko...</div>;

  return (
    <div className="w-[1020px] min-h-[800px] relative">
      
      {/* Header Toko (klik untuk buka profil toko) */}
      <Link
        to="/seller/store/profile"
        aria-label="Buka profil toko"
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
          <div className="text-[#FFE4C7] text-xl font-semibold font-['Inter']">Toko ({myBooks.length})</div>
          <div className="flex items-center gap-3">
            <Link
              to="/seller/store/reports"
              className="h-8 px-3 bg-white/5 rounded border border-Color1 text-Color1 text-sm font-semibold hover:bg-white/10 transition flex items-center justify-center cursor-pointer"
            >
              Laporan Unggahan
            </Link>
            <button
              type="button"
              aria-label="Tambah Produk"
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
              <div className="w-full max-w-[980px] h-60 flex flex-col items-center justify-center rounded-xl bg-white/5 border border-white/10 text-center text-white/60 p-6">
                <div className="text-[#FFE4C7] text-lg font-semibold mb-2">Etalase Toko Kosong</div>
                <div className="mb-4">Belum ada buku di etalase. Tambahkan produk pertama Anda untuk mulai berjualan.</div>
                
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-x-5 gap-y-6 pointer-events-auto z-10">
              {myBooks.map(book => (
                <div key={book.id} className="pointer-events-auto z-20">
                  <SellerBookCard book={book} onDeleteRequest={requestDelete} onEdit={openEditModal} />
                </div>
              ))}
            </div>
          )}
        </div>
       </div>

      {/* EDIT MODAL (Improved UI) */}
      {editModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[120000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeEditModal} />
          
          <div className="relative z-10 w-full max-w-4xl bg-[#18181b] border border-[#FFE4C7]/20 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
               <h3 className="text-xl font-bold text-[#FFE4C7]">{modalTitle || 'Edit Detail Buku'}</h3>
               <button onClick={closeEditModal} className="text-white/50 hover:text-white transition-colors">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto grid grid-cols-2 gap-8">
               {/* Left Column */}
               <div className="space-y-5">
                  <div>
                    <label className="block text-[#FFE4C7] text-xs font-medium mb-2">Judul Buku</label>
                    <input 
                      value={editForm.title} 
                      onChange={e=>handleEditChange('title', e.target.value)} 
                      className="w-full bg-white/5 rounded-lg border border-[#FFE4C7]/30 px-4 py-2.5 text-[#FFE4C7] outline-none focus:border-[#FFE4C7] transition-colors" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[#FFE4C7] text-xs font-medium mb-2">Pengarang</label>
                    <input 
                      value={editForm.author} 
                      onChange={e=>handleEditChange('author', e.target.value)} 
                      className="w-full bg-white/5 rounded-lg border border-[#FFE4C7]/30 px-4 py-2.5 text-[#FFE4C7] outline-none focus:border-[#FFE4C7] transition-colors" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#FFE4C7] text-xs font-medium mb-2">Kondisi</label>
                      <input 
                        value={editForm.condition} 
                        onChange={e=>handleEditChange('condition', e.target.value)} 
                        className="w-full bg-white/5 rounded-lg border border-[#FFE4C7]/30 px-4 py-2.5 text-[#FFE4C7] outline-none focus:border-[#FFE4C7] transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-[#FFE4C7] text-xs font-medium mb-2">Harga</label>
                      <input 
                        value={editForm.price} 
                        onChange={e=>handleEditChange('price', e.target.value)} 
                        className="w-full bg-white/5 rounded-lg border border-[#FFE4C7]/30 px-4 py-2.5 text-[#FFE4C7] outline-none focus:border-[#FFE4C7] transition-colors" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#FFE4C7] text-xs font-medium mb-2">Kategori</label>
                    <input 
                      value={editForm.category} 
                      onChange={e=>handleEditChange('category', e.target.value)} 
                      className="w-full bg-white/5 rounded-lg border border-[#FFE4C7]/30 px-4 py-2.5 text-[#FFE4C7] outline-none focus:border-[#FFE4C7] transition-colors" 
                    />
                  </div>
               </div>

               {/* Right Column */}
               <div className="space-y-5 flex flex-col">
                  <div>
                    <label className="block text-[#FFE4C7] text-xs font-medium mb-2">Foto Buku</label>
                    <div className="w-full h-48 bg-neutral-900/50 rounded-lg border border-[#FFE4C7]/30 overflow-hidden relative group">
                      {editForm.image_url ? (
                        <img className="w-full h-full object-cover" src={editForm.image_url} alt="preview" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-white/30 text-sm">Tidak ada gambar</div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Ganti Foto (Coming Soon)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <label className="block text-[#FFE4C7] text-xs font-medium mb-2">Deskripsi</label>
                    <textarea 
                      value={editForm.description} 
                      onChange={e=>handleEditChange('description', e.target.value)} 
                      className="w-full flex-1 bg-white/5 rounded-lg border border-[#FFE4C7]/30 px-4 py-3 text-[#FFE4C7] outline-none focus:border-[#FFE4C7] transition-colors resize-none" 
                    />
                  </div>
               </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
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
        </div>,
        document.body
      )}

      {/* CONFIRM SAVE MODAL */}
      {confirmSaveOpen && (
        <div className="fixed inset-0 z-[130000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setConfirmSaveOpen(false)} />
          <div className="relative z-[130001] w-full max-w-sm p-6 bg-[#18181b] border border-[#FFE4C7]/30 rounded-2xl shadow-2xl text-center transform scale-100 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-[#FFE4C7]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#FFE4C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-[#FFE4C7] text-xl font-bold mb-2">Simpan Perubahan?</h3>
            <p className="text-white/60 mb-6 text-sm">Pastikan data yang Anda masukkan sudah benar sebelum menyimpan.</p>
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
        <div className="fixed inset-0 z-[110000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={cancelDelete} />
          <div className="relative z-[110001] w-96 p-6 bg-[#06070a] border border-white/10 rounded-xl shadow-2xl text-center">
            <h3 className="text-[#FFE4C7] text-lg font-semibold mb-4">Yakin ingin menghapus?</h3>
            <p className="text-[#CDBA9A] mb-6">Hapus buku: <span className="text-white font-semibold">{deleteCandidate?.title}</span></p>
            <div className="flex justify-center gap-4">
              <button onClick={cancelDelete} className="px-5 py-2 border border-white/20 rounded-lg text-[#FFE4C7] hover:bg-white/10 transition">Batal</button>
              <button onClick={confirmDelete} className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}