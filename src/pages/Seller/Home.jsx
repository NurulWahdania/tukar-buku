import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom'; // Import useSearchParams
import { getBooks, getMyWishlist, addToWishlist, removeFromWishlist, createReport } from '../../api/client'; 

// --- Komponen Kartu Buku ---
function BookCard({ title, author, price, condition, imageUrl, isSold, isBarter, isWish, onLove }) {
  // Format harga jika berupa angka
  const displayPrice = isBarter 
    ? "Barter" 
    : (typeof price === 'number' ? `Rp ${price.toLocaleString()}` : price);

  return (
    <div className="w-60 rounded-xl outline outline-1 outline-white bg-white/5 backdrop-blur-[10px] overflow-hidden flex flex-col">
      {/* Gambar Buku */}
      <img 
        className="w-60 h-60 object-cover" 
        src={imageUrl || "https://placehold.co/240x240?text=No+Image"} 
        alt={title} 
        onError={(e) => { e.target.src = "https://placehold.co/240x240?text=Error"; }}
      />
      
      <div className="flex flex-col gap-2 px-4 py-3">
        {/* Header: Judul & Penulis */}
        <div>
          <div className="text-[#FFE4C7] text-sm font-semibold font-['Inter'] truncate" title={title}>{title}</div>
          <div className="text-[#FFE4C7] text-xs font-normal font-['Inter'] truncate">{author}</div>
        </div>
        
        <div className="h-0.5 w-full bg-stone-300 my-2" />
        
        {/* Info Harga & Kondisi */}
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[#FFE4C7] text-[10px] font-normal font-['Inter']">{isBarter ? 'Tipe' : 'Harga'}</div>
            <div className="text-[#FFE4C7] text-xs font-normal font-['Inter'] font-bold">{displayPrice}</div>
          </div>
          <div>
            <div className="text-[#FFE4C7] text-[10px] font-normal font-['Inter']">Kondisi</div>
            <div className="text-[#FFE4C7] text-xs font-normal font-['Inter']">{condition || "-"}</div>
          </div>
          
          {/* Tombol Aksi (Wishlist & WA) */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Mencegah klik kartu
                onLove && onLove();
              }}
              className={`w-8 h-8 flex items-center justify-center rounded ${isWish ? 'bg-[#FFE4C7]' : 'bg-transparent border border-[#FFE4C7]'}`}
              aria-label="wishlist"
            >
              {isWish ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-7-4.9-9-8.2C1.4 9.9 4.1 6 7.5 6c1.7 0 3 1 4.5 2.8C13.5 7 14.8 6 16.5 6 19.9 6 22.6 9.9 21 12.8 19 16.1 12 21 12 21z"/></svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#FFE4C7" strokeWidth="2" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-7-4.9-9-8.2C1.4 9.9 4.1 6 7.5 6c1.7 0 3 1 4.5 2.8C13.5 7 14.8 6 16.5 6 19.9 6 22.6 9.9 21 12.8 19 16.1 12 21 12 21z"/></svg>
              )}
            </button>
            
            {/* WhatsApp Icon */}
            <div className="w-8 h-8 flex items-center justify-center rounded bg-[#FFE4C7] border border-[#FFE4C7]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 32 32" className="w-5 h-5">
                <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.697 4.624 2.02 6.573L4 29l7.573-2.02A12.94 12.94 0 0016 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-2.162 0-4.267-.634-6.07-1.834l-.433-.273-4.498 1.2 1.2-4.498-.273-.433A10.96 10.96 0 016 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.297-7.425c-.297-.149-1.757-.867-2.029-.967-.273-.099-.472-.148-.67.15-.198.297-.767.967-.94 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.477-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.457.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.67-1.615-.917-2.211-.242-.582-.487-.502-.67-.511l-.571-.011c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.214 3.075.149.198 2.099 3.205 5.088 4.367.712.274 1.267.438 1.701.561.715.228 1.366.196 1.88.119.574-.085 1.757-.719 2.006-1.413.248-.694.248-1.288.174-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Komponen Modal Detail Buku ---
function BookDetailModal({ book, onClose, isWish, onToggle }) {
  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ seller: '', book: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  // State untuk konfirmasi beli/hubungi
  const [confirmBuyOpen, setConfirmBuyOpen] = useState(false);
  const [buying, setBuying] = useState(false);
  
  // State untuk validasi
  const [hasTransacted, setHasTransacted] = useState(false);
  const [transactionAlertOpen, setTransactionAlertOpen] = useState(false);
  
  // State untuk alert toko sendiri
  const [ownStoreAlertOpen, setOwnStoreAlertOpen] = useState(false);
  
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch Current User (untuk cek kepemilikan buku)
  useEffect(() => {
    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('access_token');
            if (!token) return;
            const res = await fetch('http://localhost:8000/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCurrentUser(data);
            }
        } catch (e) { console.error(e); }
    };
    fetchUser();
  }, []);

  // Update form saat buku berubah & Cek Transaksi
  useEffect(() => {
    if (book) {
      setReportForm(f => ({ ...f, book: book.title || '', seller: book.store?.nama_toko || 'Penjual' }));
      
      // Cek apakah user pernah transaksi buku ini
      const checkTransaction = async () => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('access_token');
            if (!token) return;

            const response = await fetch('http://localhost:8000/transactions/my-history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const transactions = await response.json();
                const found = transactions.some(tx => tx.book_id === book.id);
                setHasTransacted(found);
            }
        } catch (error) {
            console.error("Gagal cek riwayat transaksi:", error);
        }
      };
      
      checkTransaction();
    }
  }, [book]);

  const handleOpenReport = (e) => {
    e.stopPropagation();
    if (!hasTransacted) {
        setTransactionAlertOpen(true);
        return;
    }
    setReportOpen(true);
  };

  const closeReport = () => setReportOpen(false);
  
  const submitReport = async () => {
    if (!reportForm.description.trim()) {
        alert("Mohon isi deskripsi masalah.");
        return;
    }
    if (!book?.id) {
        alert("Data buku tidak valid.");
        return;
    }

    setSubmitting(true);
    try {
        const ownerId = book.store?.owner_id;
        if (!ownerId) {
            alert("Data penjual tidak valid, tidak dapat melaporkan.");
            setSubmitting(false);
            return;
        }

        const payload = {
            terlapor_id: parseInt(ownerId), 
            deskripsi: reportForm.description
        };

        await createReport(payload);
        alert('Laporan berhasil dikirim. Terima kasih atas masukan Anda.');
        setReportOpen(false);
        setReportForm(prev => ({ ...prev, description: '' }));
    } catch (error) {
        console.error("Gagal mengirim laporan:", error);
        const msg = error.response?.data?.detail 
            ? (Array.isArray(error.response.data.detail) 
                ? error.response.data.detail.map(e => e.msg).join(', ') 
                : error.response.data.detail)
            : "Gagal mengirim laporan. Silakan coba lagi.";
        alert(msg);
    } finally {
        setSubmitting(false);
    }
  };

  // --- HANDLER TRANSAKSI & WHATSAPP ---
  const handleBuy = async () => {
    if (!book) return;
    
    // CEK KEPEMILIKAN: Seller tidak boleh beli buku sendiri
    if (currentUser && book.store?.owner_id === currentUser.id) {
        setOwnStoreAlertOpen(true);
        setConfirmBuyOpen(false);
        return;
    }

    // Buka tab baru segera untuk menghindari popup blocker
    const newWindow = window.open('', '_blank');
    if (!newWindow) {
        alert("Pop-up diblokir. Izinkan pop-up untuk membuka WhatsApp.");
        return;
    }
    newWindow.document.write("Memproses transaksi... Mohon tunggu.");

    setBuying(true);
    try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (!token) {
            newWindow.close();
            alert("Silakan login terlebih dahulu.");
            setBuying(false);
            return;
        }

        // 1. Buat Transaksi di Backend
        const response = await fetch('http://localhost:8000/transactions/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                book_id: book.id,
                total_price: book.price || 0
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Gagal membuat transaksi");
        }

        // 2. Arahkan ke WhatsApp
        const phoneNumber = book.store?.hp_toko;
        if (phoneNumber) {
            let formattedPhone = phoneNumber.replace(/\D/g, '');
            if (formattedPhone.startsWith('0')) {
                formattedPhone = '62' + formattedPhone.substring(1);
            }
            
            const message = encodeURIComponent(
                `Halo, saya tertarik dengan buku "${book.title}" yang Anda jual di TukarBuku.`
            );
            
            const waUrl = `https://wa.me/${formattedPhone}?text=${message}`;
            newWindow.location.href = waUrl;
        } else {
            newWindow.close();
            alert("Nomor WhatsApp penjual tidak tersedia, tetapi transaksi telah dicatat.");
        }

        // 3. Tutup Modal & Refresh
        setConfirmBuyOpen(false);
        onClose(); 
        window.location.reload(); 

    } catch (error) {
        console.error("Gagal memproses transaksi:", error);
        newWindow.close();
        alert(error.message);
    } finally {
        setBuying(false);
    }
  };

  if (!book) return null;

  const displayPrice = book.is_barter 
    ? "Barter" 
    : (typeof book.price === 'number' ? `Rp ${book.price.toLocaleString()}` : book.price);

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[10px]" onClick={onClose}></div>
      <div className="w-[980px] h-[700px] relative rounded-xl outline outline-1 outline-white/0 backdrop-blur-[10px] overflow-hidden bg-black/80 flex shadow-2xl">
        
        {/* Gambar Besar */}
        <img 
          className="w-[460px] h-[660px] left-[20px] top-[20px] absolute rounded-2xl object-cover" 
          src={book.image_url || "https://placehold.co/460x660?text=No+Image"} 
          alt={book.title} 
        />
        
        {/* Detail Buku */}
        <div className="w-[440px] left-[520px] top-[60px] absolute flex flex-col gap-5">
          {/* Info Penjual */}
          <div className="flex items-center gap-3">
            <img className="w-10 h-10 rounded-full bg-white/10" src={book.store?.store_photo_url || "https://placehold.co/40x40?text=S"} alt="store" />
            <div className="text-[#FFE4C7] text-xl font-semibold font-['Inter']">
              {book.store?.nama_toko || "Collective"}
            </div>
          </div>

          {/* Judul & Penulis */}
          <div className="flex flex-col gap-2">
            <div className="text-[#FFE4C7] text-3xl font-semibold font-['Inter'] leading-tight">{book.title}</div>
            <div className="text-[#FFE4C7] text-lg font-normal font-['Inter'] opacity-80">{book.author}</div>
          </div>

          {/* Deskripsi */}
          <div className="text-[#FFE4C7] text-sm font-normal font-['Inter'] leading-relaxed h-40 overflow-y-auto pr-2">
            {book.description || "Tidak ada deskripsi untuk buku ini."}
          </div>

          <div className="h-px w-full bg-stone-500 my-2" />

          {/* Harga & Kondisi */}
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-8">
              <div>
                <div className="text-[#FFE4C7] text-sm font-normal font-['Inter'] opacity-70">{book.is_barter ? 'Tipe' : 'Harga'}</div>
                <div className="text-[#FFE4C7] text-2xl font-semibold font-['Inter']">{displayPrice}</div>
              </div>
              <div>
                <div className="text-[#FFE4C7] text-sm font-normal font-['Inter'] opacity-70">Kondisi</div>
                <div className="text-[#FFE4C7] text-2xl font-semibold font-['Inter']">{book.condition || "-"}</div>
              </div>
            </div>
            
            {/* Tombol Aksi Modal */}
            <div className="flex gap-3 items-center">
              {/* Report */}
              <button 
                type="button" 
                onClick={handleOpenReport} 
                className="w-10 h-10 flex items-center justify-center rounded bg-transparent border border-[#FFE4C7] hover:bg-white/10 transition"
                title="Laporkan Masalah"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#FFE4C7" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M12 2L2 22h20L12 2z" />
                  <circle cx="12" cy="16" r="1.5" fill="#FFE4C7" />
                  <path d="M12 10v3" stroke="#FFE4C7" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {/* Wishlist */}
              <button 
                onClick={(e) => { e.stopPropagation(); onToggle && onToggle(); }} 
                className={`w-10 h-10 flex items-center justify-center rounded border border-[#FFE4C7] transition ${isWish ? 'bg-[#FFE4C7]' : 'bg-transparent hover:bg-white/10'}`}
              >
                {isWish ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="black" stroke="black" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 4 8.5 4C10.5 4 12 6 12 6C12 6 13.5 4 15.5 4C17.5 4 20 5.5 20 8.5C20 13.5 12 21 12 21Z"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#FFE4C7" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 4 8.5 4C10.5 4 12 6 12 6C12 6 13.5 4 15.5 4C17.5 4 20 5.5 20 8.5C20 13.5 12 21 12 21Z"/></svg>
                )}
              </button>

              {/* Beli / Chat */}
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setConfirmBuyOpen(true);
                }}
                className="h-10 px-6 bg-[#FFE4C7] rounded flex items-center gap-2 hover:bg-[#ffcca0] transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 32 32" fill="black">
                  <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.697 4.624 2.02 6.573L4 29l7.573-2.02A12.94 12.94 0 0016 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-2.162 0-4.267-.634-6.07-1.834l-.433-.273-4.498 1.2 1.2-4.498-.273-.433A10.96 10.96 0 016 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.297-7.425c-.297-.149-1.757-.867-2.029-.967-.273-.099-.472-.148-.67.15-.198.297-.767.967-.94 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.477-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.457.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.67-1.615-.917-2.211-.242-.582-.487-.502-.67-.511l-.571-.011c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.214 3.075.149.198 2.099 3.205 5.088 4.367.712.274 1.267.438 1.701.561.715.228 1.366.196 1.88.119.574-.085 1.757-.719 2.006-1.413.248-.694.248-1.288.174-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
                <span className="text-black text-base font-semibold font-['Inter']">Hubungi</span>
              </button>
            </div>
          </div>
        </div>
        <button className="absolute right-5 top-5 text-[#FFE4C7] text-4xl hover:text-white transition" onClick={onClose}>×</button>
      </div>

      {/* Report Modal (Nested Portal) */}
      {typeof document !== 'undefined' && reportOpen && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 z-0" onClick={closeReport} />
          <div className="relative z-10 w-[500px] max-w-[95%] bg-[#06070a] border border-white/20 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-[#FFE4C7] text-lg font-semibold mb-4">Laporkan Masalah</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-400">Terlapor</label>
                <input type="text" readOnly value={reportForm.seller} className="w-full h-10 bg-white/5 border border-white/10 rounded px-3 text-gray-400" />
              </div>
              <div>
                <label className="text-xs text-gray-400">Buku</label>
                <input type="text" readOnly value={reportForm.book} className="w-full h-10 bg-white/5 border border-white/10 rounded px-3 text-gray-400" />
              </div>
              <div>
                <label className="text-xs text-[#FFE4C7]">Deskripsi Masalah</label>
                <textarea 
                  placeholder="Jelaskan alasan pelaporan..." 
                  value={reportForm.description} 
                  onChange={(e)=>setReportForm(f=>({...f,description:e.target.value}))} 
                  className="w-full h-32 bg-white/5 border border-white/10 rounded px-3 py-2 text-[#FFE4C7] focus:outline-none focus:border-[#FFE4C7] resize-none" 
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeReport} disabled={submitting} className="px-4 py-2 border border-white/20 rounded text-[#FFE4C7] hover:bg-white/5 disabled:opacity-50">Batal</button>
              <button onClick={submitReport} disabled={submitting} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-medium disabled:opacity-50">
                {submitting ? 'Mengirim...' : 'Kirim Laporan'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Transaction Alert Modal (New) */}
      {transactionAlertOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80 z-0" onClick={() => setTransactionAlertOpen(false)} />
            <div className="relative z-10 w-[400px] bg-[#06070a] border border-white/20 rounded-2xl p-8 shadow-2xl text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                </div>
                <h3 className="text-[#FFE4C7] text-xl font-bold mb-2">Akses Ditolak</h3>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    Anda hanya dapat melaporkan buku ini jika Anda pernah melakukan transaksi pembelian atau barter untuk buku ini.
                </p>
                <button 
                    onClick={() => setTransactionAlertOpen(false)} 
                    className="w-full py-2.5 rounded-xl bg-[#FFE4C7] text-black font-bold hover:bg-[#ffcca0] transition-colors"
                >
                    Mengerti
                </button>
            </div>
        </div>
      )}

      {/* Own Store Alert Modal (New) */}
      {ownStoreAlertOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80 z-0" onClick={() => setOwnStoreAlertOpen(false)} />
            <div className="relative z-10 w-[400px] bg-[#06070a] border border-white/20 rounded-2xl p-8 shadow-2xl text-center">
                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h3 className="text-[#FFE4C7] text-xl font-bold mb-2">Toko Anda Sendiri</h3>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    Anda tidak dapat melakukan transaksi pembelian atau barter pada buku yang Anda jual sendiri.
                </p>
                <button 
                    onClick={() => setOwnStoreAlertOpen(false)} 
                    className="w-full py-2.5 rounded-xl bg-[#FFE4C7] text-black font-bold hover:bg-[#ffcca0] transition-colors"
                >
                    Mengerti
                </button>
            </div>
        </div>
      )}

      {/* Confirm Buy Modal */}
      {confirmBuyOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80 z-0" onClick={() => setConfirmBuyOpen(false)} />
            <div className="relative z-10 w-[400px] bg-[#06070a] border border-white/20 rounded-2xl p-6 shadow-2xl text-center">
                <h3 className="text-[#FFE4C7] text-lg font-semibold mb-4">Konfirmasi Transaksi</h3>
                <p className="text-gray-400 mb-6">
                    Apakah Anda yakin ingin menghubungi penjual? <br/>
                    Buku akan ditandai sebagai terjual dan masuk ke riwayat transaksi Anda.
                </p>
                <div className="flex justify-center gap-4">
                    <button 
                        onClick={() => setConfirmBuyOpen(false)} 
                        disabled={buying}
                        className="px-4 py-2 border border-white/20 rounded text-[#FFE4C7] hover:bg-white/5 disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleBuy} 
                        disabled={buying}
                        className="px-4 py-2 rounded bg-[#FFE4C7] text-black font-bold hover:bg-[#ffcca0] disabled:opacity-50"
                    >
                        {buying ? 'Memproses...' : 'Ya, Hubungi'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>,
    document.body
  ) : null;
}

// --- Komponen Utama Halaman Home ---
export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  
  // State untuk mapping book_id -> wishlist_id
  const [wishlistMap, setWishlistMap] = useState({}); 
  
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const categories = ['Semua', 'Humaniora', 'Saintek', 'Fiksi', 'Barter', 'Jual'];

  // Ambil search params
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  // 1. Ambil Data Buku dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getBooks();
        // Pastikan data adalah array
        setBooks(Array.isArray(data) ? data : []); 
      } catch (error) {
        console.error("Gagal mengambil buku:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Ambil Data Wishlist dari API
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await getMyWishlist();
        if (Array.isArray(data)) {
            const map = {};
            data.forEach(item => {
                // item.book_id adalah ID buku, item.id adalah ID wishlist
                if (item.book_id) map[item.book_id] = item.id;
                else if (item.book?.id) map[item.book.id] = item.id;
            });
            setWishlistMap(map);
        }
      } catch (error) {
        console.error("Gagal mengambil wishlist:", error);
      }
    };
    fetchWishlist();
  }, []);

  // 3. Fungsi Toggle Wishlist (API)
  const toggleWishlist = async (book) => {
    if (!book) return;
    const bookId = book.id;
    const wishlistId = wishlistMap[bookId];

    try {
        if (wishlistId) {
            // Hapus dari wishlist
            await removeFromWishlist(wishlistId);
            setWishlistMap(prev => {
                const next = { ...prev };
                delete next[bookId];
                return next;
            });
        } else {
            // Tambah ke wishlist
            const res = await addToWishlist({ book_id: bookId });
            if (res && res.id) {
                setWishlistMap(prev => ({ ...prev, [bookId]: res.id }));
            }
        }
    } catch (error) {
        console.error("Gagal update wishlist:", error);
        alert("Gagal mengubah wishlist. Pastikan Anda login.");
    }
  };

  // 4. Logika Filter Kategori & Search
  const filteredBooks = books.filter(book => {
    // Filter Kategori
    let categoryMatch = true;
    if (selectedCategory !== 'Semua') {
        if (selectedCategory === 'Barter') categoryMatch = book.is_barter === true;
        else if (selectedCategory === 'Jual') categoryMatch = book.is_barter === false;
        else if (Array.isArray(book.categories)) {
            categoryMatch = book.categories.some(cat => cat.name === selectedCategory);
        } else if (book.category) {
            categoryMatch = book.category.name === selectedCategory;
        } else {
            categoryMatch = false;
        }
    }

    // Filter Search
    let searchMatch = true;
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        searchMatch = (book.title || '').toLowerCase().includes(q) || 
                      (book.author || '').toLowerCase().includes(q);
    }

    return categoryMatch && searchMatch;
  });

  return (
    <div className="w-[1020px] min-h-[828px] relative">
      {/* Filter Kategori */}
      <div className="absolute left-0 top-0 z-10">
        <div className="w-[608px] h-8 flex items-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`h-8 px-3 rounded-xl inline-flex items-center justify-center transition-all ${
                selectedCategory === cat 
                  ? 'bg-[#FFE4C7] text-black font-medium' 
                  : 'bg-white/5 text-[#FFE4C7] outline outline-1 outline-offset-[-1px] outline-white backdrop-blur-[10px] hover:bg-white/10'
              }`}
            >
              <div className="text-sm font-['Inter']">{cat}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Container Buku */}
      <div className="absolute left-0 top-[48px] w-full min-h-[780px] rounded-[20px] outline outline-1 outline-white overflow-hidden">
        <div className="w-full h-full bg-white/5 border border-white backdrop-blur-[10px] absolute inset-0 pointer-events-none" />
        
        {/* Judul Kategori Aktif */}
        <div className="absolute left-[20px] top-[16px] text-[#FFE4C7] text-xl font-semibold font-['Inter'] z-10">
          {selectedCategory}
        </div>

        {/* Grid Buku */}
        <div className="pt-[56px] px-5 pb-5 relative z-10">
          {loading ? (
            <div className="flex items-center justify-center h-60 text-[#FFE4C7]">Memuat buku...</div>
          ) : filteredBooks.length === 0 ? (
            <div className="flex items-center justify-center h-60 text-[#FFE4C7] opacity-60">
              Tidak ada buku di kategori ini.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-x-5 gap-y-6">
              {filteredBooks.map((book) => (
                <div key={book.id} className="cursor-pointer transition-transform hover:scale-105" onClick={() => setSelectedBook(book)}>
                  <BookCard 
                    title={book.title}
                    author={book.author}
                    price={book.price}
                    condition={book.condition}
                    imageUrl={book.image_url}
                    isBarter={book.is_barter}
                    isSold={book.is_sold}
                    isWish={!!wishlistMap[book.id]}
                    onLove={() => toggleWishlist(book)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail Buku */}
      <BookDetailModal 
        book={selectedBook} 
        onClose={() => setSelectedBook(null)} 
        isWish={selectedBook ? !!wishlistMap[selectedBook.id] : false}
        onToggle={() => toggleWishlist(selectedBook)}
      />
    </div>
  );
}