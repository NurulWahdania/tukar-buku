// src/pages/Admin/ContentVerification.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // Import useSearchParams
import { getPendingBooks, moderateBook } from '../../api/client'; // Import fungsi API

export default function ContentVerification() {
  const [rows, setRows] = useState([]); // Daftar buku pending
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  // --- STATE MODAL ---
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null, // 'APPROVED' | 'REJECTED'
    bookId: null,
    bookTitle: ''
  });
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // 1. Fetch Data PENDING saat komponen dimuat
  const fetchPendingBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingBooks(); // GET /books/pending (Hanya Admin yang bisa akses)
      setRows(data);
    } catch (err) {
      // Menampilkan pesan error jika user bukan Admin atau gagal koneksi
      setError("Gagal memuat buku pending. Pastikan Anda login sebagai Admin.");
      console.error("Gagal fetch buku pending:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBooks();
  }, []);
  
  // 2. Fungsi Membuka Modal
  const openModal = (book, type) => {
    setModalConfig({
      isOpen: true,
      type,
      bookId: book.id,
      bookTitle: book.title
    });
    setRejectReason(''); // Reset alasan
  };

  // 3. Fungsi Menutup Modal
  const closeModal = () => {
    if (processing) return; // Cegah tutup saat loading
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // 4. Handler Konfirmasi Aksi
  const handleConfirm = async () => {
    const { type, bookId } = modalConfig;
    let note = "Disetujui."; // Default note untuk APPROVED
    
    if (type === 'REJECTED') {
        if (!rejectReason || rejectReason.trim() === '') {
            alert("Alasan penolakan wajib diisi.");
            return;
        }
        note = rejectReason;
    }

    setProcessing(true);
    try {
        await moderateBook({
            book_id: bookId,
            aksi: type, // "APPROVED" atau "REJECTED"
            catatan_admin: note
        });
        
        // alert(`Buku berhasil di ${type === 'APPROVED' ? 'setujui' : 'tolak'}!`);
        fetchPendingBooks(); // Muat ulang daftar setelah aksi berhasil
        closeModal();
        
    } catch (err) {
        alert(`Gagal memproses: ` + (err.response?.data?.detail || "Error koneksi."));
        console.error(err);
    } finally {
        setProcessing(false);
    }
  };

  // Filter rows based on search query
  const filteredRows = rows.filter(book => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (book.title || '').toLowerCase().includes(q) || 
           (book.store?.nama_toko || '').toLowerCase().includes(q);
  });

  if (loading) return <div className="p-6 text-[#FFE4C7] text-center">Memuat data verifikasi...</div>;
  if (error) return <div className="p-6 text-red-500 text-center">{error}</div>;

  return (
    <div className="w-[1020px] relative mx-auto rounded-[20px] overflow-hidden">
      {/* glass panel */}
      <div className="absolute inset-0 bg-neutral-300/10 rounded-xl border border-white/0 backdrop-blur-lg" />
      <div className="relative p-6 z-10">
        <h2 className="text-Color1 text-xl font-semibold font-['Inter'] mb-4">Validasi Postingan ({filteredRows.length} Pending)</h2>

        <div className="bg-neutral-300/10 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/0 backdrop-blur-lg overflow-hidden">
          {/* table header */}
          <div className="grid grid-cols-[48px_1fr_1fr_220px_220px] items-center gap-4 px-4 py-3 border-b border-zinc-300">
            <div className="text-Color1 text-base font-bold">No</div>
            <div className="text-Color1 text-base font-bold">Penjual (Store)</div>
            <div className="text-Color1 text-base font-bold">Buku</div>
            <div className="text-Color1 text-base font-bold">Jenis Transaksi</div>
            <div className="text-Color1 text-base font-bold">Aksi</div>
          </div>

          {/* table rows */}
          <div className="max-h-[520px] overflow-auto">
            {filteredRows.map((book, index) => (
              <div key={book.id} className="grid grid-cols-[48px_1fr_1fr_220px_220px] items-center gap-4 px-4 py-3 border-b border-zinc-300">
                <div className="text-Color1 text-base font-semibold">{index + 1}</div>
                
                {/* Kolom Nama Penjual/Store */}
                <div className="text-Color1 text-base font-semibold">{book.store?.nama_toko || "Toko Tidak Ditemukan"}</div>
                
                {/* Kolom Buku */}
                <div className="text-Color1 text-base font-semibold">{book.title}</div>
                
                {/* Kolom Jenis Transaksi */}
                <div className="text-Color1 text-base font-semibold">{book.is_barter ? 'Barter' : 'Jual'}</div>

                <div className="flex items-center gap-3 justify-end">
                  {/* Tombol Tolak */}
                  <button
                    type="button"
                    onClick={() => openModal(book, 'REJECTED')}
                    className="h-10 px-4 rounded-[10px] bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                  >
                    Tolak
                  </button>
                  
                  {/* Tombol Konfirmasi */}
                  <button
                    type="button"
                    onClick={() => openModal(book, 'APPROVED')}
                    className="h-10 px-4 rounded-[10px] bg-white/90 text-black text-sm font-semibold border border-white/40 hover:bg-white transition-colors"
                  >
                    Konfirmasi
                  </button>
                </div>
              </div>
            ))}
            
            {filteredRows.length === 0 && (
                 <div className="text-Color1 text-center py-6 opacity-80">
                    {searchQuery ? "Tidak ada postingan yang cocok dengan pencarian." : "Tidak ada postingan yang menunggu verifikasi."}
                 </div>
            )}
            
          </div>
        </div>
      </div>

      {/* --- MODAL KUSTOM --- */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
            
            {/* Modal Content */}
            <div className="relative bg-[#18181b] border border-[#FFE4C7]/20 rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all scale-100">
                <h3 className="text-xl font-bold text-[#FFE4C7] mb-2">
                    {modalConfig.type === 'APPROVED' ? 'Konfirmasi Persetujuan' : 'Tolak Postingan'}
                </h3>
                
                <p className="text-white/70 mb-6 text-sm leading-relaxed">
                    {modalConfig.type === 'APPROVED' 
                        ? <span>Apakah Anda yakin ingin menyetujui buku <span className="text-white font-semibold">"{modalConfig.bookTitle}"</span> untuk ditampilkan ke publik?</span>
                        : <span>Masukkan alasan penolakan untuk buku <span className="text-white font-semibold">"{modalConfig.bookTitle}"</span>. Penjual akan menerima notifikasi ini.</span>
                    }
                </p>

                {modalConfig.type === 'REJECTED' && (
                    <div className="mb-6">
                        <label className="block text-[#FFE4C7] text-xs font-medium mb-2">Alasan Penolakan</label>
                        <textarea 
                            className="w-full bg-white/5 border border-[#FFE4C7]/30 rounded-lg p-3 text-[#FFE4C7] text-sm focus:outline-none focus:border-[#FFE4C7] focus:ring-1 focus:ring-[#FFE4C7] transition-all resize-none placeholder-white/20"
                            rows="3"
                            placeholder="Contoh: Foto buram, deskripsi mengandung unsur SARA, dll..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            autoFocus
                        />
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={closeModal}
                        disabled={processing}
                        className="px-4 py-2 rounded-lg text-[#FFE4C7] text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={processing}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                            modalConfig.type === 'APPROVED' 
                                ? 'bg-[#FFE4C7] text-black hover:bg-[#ffdec0] shadow-[#FFE4C7]/10' 
                                : 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/20'
                        }`}
                    >
                        {processing ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Memproses...
                            </>
                        ) : (
                            modalConfig.type === 'APPROVED' ? 'Setujui' : 'Tolak Postingan'
                        )}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}