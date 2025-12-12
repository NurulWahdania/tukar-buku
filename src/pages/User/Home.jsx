import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getBooks, getMyWishlist, addToWishlist, removeFromWishlist, createReport, getReviewsForBook } from '../../api/client'; 

// --- Komponen Modal Lihat Ulasan (User View - Read Only) ---
function ReviewsModal({ book, onClose }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (book) fetchReviews();
    }, [book]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await getReviewsForBook(book.id);
            setReviews(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Gagal ambil ulasan:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="fixed inset-0 z-[130000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative z-[130001] w-[800px] max-w-full bg-[#18181b] border border-[#FFE4C7]/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="text-xl font-bold text-[#FFE4C7]">Ulasan - {book.title}</h3>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors text-2xl">×</button>
                </div>

                {/* Content */}
                <div className="overflow-auto flex-1 p-6">
                    <div className="w-full bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-[200px_80px_1fr_120px] gap-4 p-4 border-b border-white/10 text-[#FFE4C7] font-semibold text-sm">
                            <div>Nama</div>
                            <div>Rate</div>
                            <div>Review</div>
                            <div className="text-right">Tanggal</div>
                        </div>

                        {/* Table Body */}
                        {loading ? (
                            <div className="p-8 text-center text-[#CDBA9A]">Memuat ulasan...</div>
                        ) : reviews.length === 0 ? (
                            <div className="p-8 text-center text-[#CDBA9A] opacity-60">Belum ada ulasan untuk buku ini.</div>
                        ) : (
                            reviews.map((review) => (
                                <div key={review.id} className="grid grid-cols-[200px_80px_1fr_120px] gap-4 p-4 border-b border-white/5 items-center hover:bg-white/5 transition-colors">
                                    {/* Kolom Nama */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-zinc-600 overflow-hidden shrink-0 border border-white/10">
                                            <img 
                                                src={review.user?.profile_photo_url || `https://ui-avatars.com/api/?name=${review.user?.username}`} 
                                                alt="avatar" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-[#FFE4C7] text-sm font-semibold truncate">{review.user?.username || 'User'}</span>
                                            <span className="text-[#CDBA9A] text-[10px] truncate">Pembeli</span>
                                        </div>
                                    </div>

                                    {/* Kolom Rate */}
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4 text-[#FFE4C7] fill-current" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.167L12 18.896 4.664 23.164l1.402-8.167L.132 9.21l8.2-1.192z"/></svg>
                                        <span className="text-[#FFE4C7] text-sm font-bold">{review.rating}</span>
                                    </div>

                                    {/* Kolom Review */}
                                    <div className="text-[#FFE4C7] text-sm leading-relaxed text-justify pr-2">
                                        {review.comment || "-"}
                                    </div>

                                    {/* Kolom Tanggal */}
                                    <div className="text-right text-[#FFE4C7] text-xs opacity-80">
                                        {formatDate(review.created_at)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Komponen Kartu Buku ---
function BookCard({ title, author, price, condition, imageUrl, isSold, isBarter, isWish, onLove, onViewReviews }) {
  const displayPrice = isBarter 
    ? "Barter" 
    : (typeof price === 'number' ? `Rp ${price.toLocaleString()}` : price);

  return (
    <div className="w-60 rounded-xl outline outline-1 outline-white bg-white/5 backdrop-blur-[10px] overflow-hidden flex flex-col group relative">
      
      {/* Gambar Buku */}
      <div className="w-full h-60 relative overflow-hidden">
        {/* Gambar NORMAL (Tidak Grayscale, Tidak Overlay Text) */}
        <img 
            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
            src={imageUrl || "https://placehold.co/240x240?text=No+Image"} 
            alt={title} 
            onError={(e) => { e.target.src = "https://placehold.co/240x240?text=Error"; }}
        />
      </div>
      
      <div className="flex flex-col gap-2 px-4 py-3 bg-white/5 h-full">
        {/* Header */}
        <div>
          <div className="text-[#FFE4C7] text-sm font-semibold font-['Inter'] truncate" title={title}>{title}</div>
          <div className="text-[#FFE4C7] text-xs font-normal font-['Inter'] truncate">{author}</div>
        </div>
        
        <div className="h-0.5 w-full bg-stone-300 my-2" />
        
        {/* Info */}
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[#FFE4C7] text-[10px] font-normal font-['Inter']">{isBarter ? 'Tipe' : 'Harga'}</div>
            <div className="text-[#FFE4C7] text-xs font-normal font-['Inter'] font-bold">{displayPrice}</div>
          </div>
          <div>
            <div className="text-[#FFE4C7] text-[10px] font-normal font-['Inter']">Kondisi</div>
            <div className="text-[#FFE4C7] text-xs font-normal font-['Inter']">{condition || "-"}</div>
          </div>
          
          {/* Tombol Aksi */}
          <div className="flex items-center gap-2 ml-auto">
            {isSold ? (
                // --- JIKA TERJUAL: TOMBOL LIHAT ULASAN ---
                <>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewReviews && onViewReviews();
                        }}
                        className="h-8 px-3 flex items-center gap-2 justify-center rounded bg-transparent border border-[#FFE4C7] hover:bg-white/10 transition-colors group/btn"
                        title="Lihat Ulasan Pembeli"
                    >
                        <span className="text-[#FFE4C7] text-[10px] font-medium">Ulasan</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FFE4C7" className="w-4 h-4 group-hover/btn:fill-[#FFE4C7]/20">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                    </button>
                </>
            ) : (
                // --- JIKA TERSEDIA: WISHLIST & HUBUNGI ---
                <>
                    {/* Wishlist */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onLove && onLove();
                        }}
                        className={`w-8 h-8 flex items-center justify-center rounded ${isWish ? 'bg-[#FFE4C7]' : 'bg-transparent border border-[#FFE4C7]'}`}
                    >
                        {isWish ? (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-7-4.9-9-8.2C1.4 9.9 4.1 6 7.5 6c1.7 0 3 1 4.5 2.8C13.5 7 14.8 6 16.5 6 19.9 6 22.6 9.9 21 12.8 19 16.1 12 21 12 21z"/></svg>
                        ) : (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#FFE4C7" strokeWidth="2" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-7-4.9-9-8.2C1.4 9.9 4.1 6 7.5 6c1.7 0 3 1 4.5 2.8C13.5 7 14.8 6 16.5 6 19.9 6 22.6 9.9 21 12.8 19 16.1 12 21 12 21z"/></svg>
                        )}
                    </button>
                    
                    {/* WhatsApp */}
                    <div className="w-8 h-8 flex items-center justify-center rounded bg-[#FFE4C7] border border-[#FFE4C7]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 32 32" className="w-5 h-5">
                            <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.697 4.624 2.02 6.573L4 29l7.573-2.02A12.94 12.94 0 0016 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-2.162 0-4.267-.634-6.07-1.834l-.433-.273-4.498 1.2 1.2-4.498-.273-.433A10.96 10.96 0 016 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.297-7.425c-.297-.149-1.757-.867-2.029-.967-.273-.099-.472-.148-.67.15-.198.297-.767.967-.94 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.477-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.457.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.67-1.615-.917-2.211-.242-.582-.487-.502-.67-.511l-.571-.011c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.214 3.075.149.198 2.099 3.205 5.088 4.367.712.274 1.267.438 1.701.561.715.228 1.366.196 1.88.119.574-.085 1.757-.719 2.006-1.413.248-.694.248-1.288.174-1.413-.074-.124-.272-.198-.57-.347z"/>
                        </svg>
                    </div>
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Komponen Modal Detail Buku ---
function BookDetailModal({ book, onClose, isWish, onToggle, onViewReviews }) {
  const navigate = useNavigate(); // Hook untuk navigasi
  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ seller: '', book: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmBuyOpen, setConfirmBuyOpen] = useState(false);
  const [buying, setBuying] = useState(false);
  const [hasTransacted, setHasTransacted] = useState(false);
  const [transactionAlertOpen, setTransactionAlertOpen] = useState(false);
  const [ownStoreAlertOpen, setOwnStoreAlertOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

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

  useEffect(() => {
    if (book) {
      setReportForm(f => ({ ...f, book: book.title || '', seller: book.store?.nama_toko || 'Penjual' }));
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
        } catch (error) { console.error("Gagal cek riwayat:", error); }
      };
      checkTransaction();
    }
  }, [book]);

  const handleOpenReport = (e) => {
    e.stopPropagation();
    if (!hasTransacted) { setTransactionAlertOpen(true); return; }
    setReportOpen(true);
  };

  const closeReport = () => setReportOpen(false);
  
  const submitReport = async () => {
    if (!reportForm.description.trim()) { alert("Mohon isi deskripsi."); return; }
    setSubmitting(true);
    try {
        const ownerId = book.store?.owner_id;
        if (!ownerId) { alert("Data penjual tidak valid."); setSubmitting(false); return; }
        await createReport({ terlapor_id: parseInt(ownerId), deskripsi: reportForm.description });
        alert('Laporan berhasil dikirim.');
        setReportOpen(false);
        setReportForm(prev => ({ ...prev, description: '' }));
    } catch (error) {
        alert("Gagal mengirim laporan.");
    } finally { setSubmitting(false); }
  };

  const handleBuy = async () => {
    if (!book) return;
    if (currentUser && book.store?.owner_id === currentUser.id) {
        setOwnStoreAlertOpen(true);
        setConfirmBuyOpen(false);
        return;
    }
    const newWindow = window.open('', '_blank');
    if (!newWindow) { alert("Izinkan pop-up untuk WhatsApp."); return; }
    newWindow.document.write("Memproses transaksi...");

    setBuying(true);
    try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (!token) { newWindow.close(); alert("Silakan login."); setBuying(false); return; }

        const response = await fetch('http://localhost:8000/transactions/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ book_id: book.id, total_price: book.price || 0 })
        });

        if (!response.ok) throw new Error("Gagal transaksi");

        const phoneNumber = book.store?.hp_toko;
        if (phoneNumber) {
            let formatted = phoneNumber.replace(/\D/g, '');
            if (formatted.startsWith('0')) formatted = '62' + formatted.substring(1);
            const msg = encodeURIComponent(`Halo, saya tertarik dengan buku "${book.title}".`);
            newWindow.location.href = `https://wa.me/${formatted}?text=${msg}`;
        } else {
            newWindow.close();
            alert("Nomor WA tidak tersedia.");
        }
        setConfirmBuyOpen(false); onClose(); window.location.reload(); 
    } catch (error) {
        newWindow.close(); alert(error.message);
    } finally { setBuying(false); }
  };

  const handleStoreClick = () => {
    if (book?.store?.id) {
        onClose(); 
        navigate(`/store-profile/${book.store.id}`); // Navigasi ke profil toko
    }
  };

  if (!book) return null;
  const displayPrice = book.is_barter ? "Barter" : (typeof book.price === 'number' ? `Rp ${book.price.toLocaleString()}` : book.price);

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[10px]" onClick={onClose}></div>
      <div className="w-[980px] h-[700px] relative rounded-xl outline outline-1 outline-white/0 backdrop-blur-[10px] overflow-hidden bg-black/80 flex shadow-2xl">
        <div className="w-[460px] h-[660px] left-[20px] top-[20px] absolute rounded-2xl overflow-hidden">
             {/* Gambar Modal Tetap Berwarna */}
             <img className="w-full h-full object-cover" src={book.image_url || "https://placehold.co/460x660"} alt={book.title} />
        </div>
        <div className="w-[440px] left-[520px] top-[60px] absolute flex flex-col gap-5">
          
          {/* Info Penjual (Bisa Diklik) */}
          <div 
            onClick={handleStoreClick}
            className="flex items-center gap-3 cursor-pointer group p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
            title="Lihat Profil Toko"
          >
            <img className="w-10 h-10 rounded-full bg-white/10 border border-transparent group-hover:border-[#FFE4C7]" src={book.store?.store_photo_url || "https://placehold.co/40"} alt="store" />
            <div>
                <div className="text-[#FFE4C7] text-xl font-semibold group-hover:underline">
                {book.store?.nama_toko || "Store"}
                </div>
                <div className="text-[#CDBA9A] text-xs">Klik untuk kunjungi toko</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-[#FFE4C7] text-3xl font-semibold leading-tight">{book.title}</div>
            <div className="text-[#FFE4C7] text-lg opacity-80">{book.author}</div>
          </div>
          <div className="text-[#FFE4C7] text-sm leading-relaxed h-40 overflow-y-auto pr-2">{book.description || "No desc."}</div>
          <div className="h-px w-full bg-stone-500 my-2" />
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-8">
              <div><div className="text-[#FFE4C7] text-sm opacity-70">Harga</div><div className="text-[#FFE4C7] text-2xl font-semibold">{displayPrice}</div></div>
              <div><div className="text-[#FFE4C7] text-sm opacity-70">Kondisi</div><div className="text-[#FFE4C7] text-2xl font-semibold">{book.condition || "-"}</div></div>
            </div>
            
            <div className="flex gap-3 items-center">
              <button onClick={handleOpenReport} className="w-10 h-10 flex items-center justify-center rounded border border-[#FFE4C7] hover:bg-white/10" title="Lapor">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#FFE4C7" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 2L2 22h20L12 2z" /><circle cx="12" cy="16" r="1.5" fill="#FFE4C7" /><path d="M12 10v3" strokeLinecap="round" /></svg>
              </button>

              {!book.is_sold ? (
                <>
                  <button onClick={(e) => { e.stopPropagation(); onToggle && onToggle(); }} className={`w-10 h-10 flex items-center justify-center rounded border border-[#FFE4C7] ${isWish ? 'bg-[#FFE4C7]' : 'hover:bg-white/10'}`}>
                    {isWish ? <svg className="w-5 h-5" fill="black" viewBox="0 0 24 24"><path d="M12 21s-7-4.9-9-8.2C1.4 9.9 4.1 6 7.5 6c1.7 0 3 1 4.5 2.8C13.5 7 14.8 6 16.5 6 19.9 6 22.6 9.9 21 12.8 19 16.1 12 21 12 21z"/></svg> : <svg className="w-5 h-5" fill="none" stroke="#FFE4C7" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21s-7-4.9-9-8.2C1.4 9.9 4.1 6 7.5 6c1.7 0 3 1 4.5 2.8C13.5 7 14.8 6 16.5 6 19.9 6 22.6 9.9 21 12.8 19 16.1 12 21 12 21z"/></svg>}
                  </button>
                  <button onClick={() => setConfirmBuyOpen(true)} className="h-10 px-6 bg-[#FFE4C7] rounded flex items-center gap-2 hover:bg-[#ffcca0] text-black font-semibold">Hubungi</button>
                </>
              ) : (
                 <>
                    <button
                        onClick={(e) => { e.stopPropagation(); onViewReviews && onViewReviews(); }}
                        className="w-10 h-10 flex items-center justify-center rounded border border-[#FFE4C7] hover:bg-white/10"
                        title="Lihat Ulasan"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FFE4C7" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                    </button>
                    <div className="h-10 px-6 bg-[#333] border border-[#555] rounded flex items-center justify-center cursor-default">
                        <span className="text-[#888] text-base font-semibold">Terjual</span>
                    </div>
                 </>
              )}
            </div>
          </div>
        </div>
        <button className="absolute right-5 top-5 text-[#FFE4C7] text-4xl hover:text-white" onClick={onClose}>×</button>
      </div>

      {/* Modal Lainnya (Sama) */}
      {reportOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={closeReport} />
          <div className="relative z-10 w-[500px] bg-[#06070a] border border-white/20 rounded-2xl p-6">
            <h3 className="text-[#FFE4C7] text-lg font-bold mb-4">Lapor</h3>
            <textarea value={reportForm.description} onChange={e=>setReportForm(f=>({...f,description:e.target.value}))} className="w-full h-32 bg-white/5 border border-white/10 rounded px-3 py-2 text-[#FFE4C7] outline-none" placeholder="Deskripsi..." />
            <div className="mt-4 flex justify-end gap-3"><button onClick={closeReport} className="px-4 py-2 text-[#FFE4C7]">Batal</button><button onClick={submitReport} className="px-4 py-2 bg-red-600 text-white rounded">Kirim</button></div>
          </div>
        </div>
      )}

      {transactionAlertOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80" onClick={()=>setTransactionAlertOpen(false)} />
            <div className="relative z-10 w-[400px] bg-[#06070a] border border-white/20 rounded-2xl p-8 text-center">
                <h3 className="text-[#FFE4C7] text-xl font-bold mb-2">Belum Ada Transaksi</h3>
                <p className="text-gray-400 mb-4">Anda harus bertransaksi dulu untuk melapor.</p>
                <button onClick={()=>setTransactionAlertOpen(false)} className="px-6 py-2 bg-[#FFE4C7] text-black rounded">Oke</button>
            </div>
        </div>
      )}

      {ownStoreAlertOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80" onClick={() => setOwnStoreAlertOpen(false)} />
            <div className="relative z-10 w-[400px] bg-[#06070a] border border-white/20 rounded-2xl p-8 text-center">
                <h3 className="text-[#FFE4C7] text-xl font-bold mb-2">Toko Anda Sendiri</h3>
                <p className="text-gray-400 mb-4">Tidak bisa transaksi buku sendiri.</p>
                <button onClick={() => setOwnStoreAlertOpen(false)} className="px-6 py-2 bg-[#FFE4C7] text-black rounded">Oke</button>
            </div>
        </div>
      )}

      {confirmBuyOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80" onClick={()=>setConfirmBuyOpen(false)} />
            <div className="relative z-10 w-[400px] bg-[#06070a] border border-white/20 rounded-2xl p-6 text-center">
                <h3 className="text-[#FFE4C7] text-lg font-bold mb-4">Konfirmasi</h3>
                <p className="text-gray-400 mb-6">Hubungi penjual via WhatsApp?</p>
                <div className="flex justify-center gap-3">
                    <button onClick={()=>setConfirmBuyOpen(false)} className="px-4 py-2 border border-white/20 rounded text-[#FFE4C7]">Batal</button>
                    <button onClick={handleBuy} className="px-4 py-2 bg-[#FFE4C7] text-black rounded">Ya</button>
                </div>
            </div>
        </div>
      )}
    </div>, document.body
  ) : null;
}

// --- Komponen Utama Halaman Home ---
export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [wishlistMap, setWishlistMap] = useState({}); 
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const categories = ['Semua', 'Humaniora', 'Saintek', 'Fiksi', 'Barter', 'Jual'];
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  // State Modal Ulasan
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [reviewBook, setReviewBook] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getBooks();
        setBooks(Array.isArray(data) ? data : []); 
      } catch (error) { console.error("Gagal ambil buku:", error); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await getMyWishlist();
        if (Array.isArray(data)) {
            const map = {};
            data.forEach(item => {
                if (item.book_id) map[item.book_id] = item.id;
                else if (item.book?.id) map[item.book.id] = item.id;
            });
            setWishlistMap(map);
        }
      } catch (error) { console.error("Gagal ambil wishlist:", error); }
    };
    fetchWishlist();
  }, []);

  const toggleWishlist = async (book) => {
    if (!book) return;
    const bookId = book.id;
    const wishlistId = wishlistMap[bookId];
    try {
        if (wishlistId) {
            await removeFromWishlist(wishlistId);
            setWishlistMap(prev => { const next = { ...prev }; delete next[bookId]; return next; });
        } else {
            const res = await addToWishlist({ book_id: bookId });
            if (res && res.id) setWishlistMap(prev => ({ ...prev, [bookId]: res.id }));
        }
    } catch (error) { alert("Login untuk akses wishlist."); }
  };

  const handleViewReviews = (book) => {
      setReviewBook(book);
      setReviewsModalOpen(true);
  };

  const filteredBooks = books.filter(book => {
    let categoryMatch = true;
    if (selectedCategory !== 'Semua') {
        if (selectedCategory === 'Barter') categoryMatch = book.is_barter === true;
        else if (selectedCategory === 'Jual') categoryMatch = book.is_barter === false;
        else if (Array.isArray(book.categories)) categoryMatch = book.categories.some(cat => cat.name === selectedCategory);
        else if (book.category) categoryMatch = book.category.name === selectedCategory;
        else categoryMatch = false;
    }
    let searchMatch = true;
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        searchMatch = (book.title || '').toLowerCase().includes(q) || (book.author || '').toLowerCase().includes(q);
    }
    return categoryMatch && searchMatch;
  });

  return (
    <div className="w-[1020px] min-h-[828px] relative">
      <div className="absolute left-0 top-0 z-10">
        <div className="w-[608px] h-8 flex items-center gap-3">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`h-8 px-3 rounded-xl transition-all ${selectedCategory === cat ? 'bg-[#FFE4C7] text-black font-medium' : 'bg-white/5 text-[#FFE4C7] outline outline-1 outline-white hover:bg-white/10'}`}>
              <div className="text-sm">{cat}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="absolute left-0 top-[48px] w-full min-h-[780px] rounded-[20px] outline outline-1 outline-white overflow-hidden">
        <div className="w-full h-full bg-white/5 border border-white backdrop-blur-[10px] absolute inset-0 pointer-events-none" />
        <div className="absolute left-[20px] top-[16px] text-[#FFE4C7] text-xl font-semibold z-10">{selectedCategory}</div>

        <div className="pt-[56px] px-5 pb-5 relative z-10">
          {loading ? <div className="flex items-center justify-center h-60 text-[#FFE4C7]">Memuat buku...</div> 
          : filteredBooks.length === 0 ? <div className="flex items-center justify-center h-60 text-[#FFE4C7] opacity-60">Tidak ada buku.</div> 
          : (
            <div className="grid grid-cols-4 gap-x-5 gap-y-6">
              {filteredBooks.map((book) => (
                <div key={book.id} className="cursor-pointer transition-transform hover:scale-105" onClick={() => setSelectedBook(book)}>
                  <BookCard 
                    title={book.title} author={book.author} price={book.price} condition={book.condition} imageUrl={book.image_url}
                    isBarter={book.is_barter} isSold={book.is_sold} isWish={!!wishlistMap[book.id]}
                    onLove={() => toggleWishlist(book)}
                    onViewReviews={() => handleViewReviews(book)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BookDetailModal 
        book={selectedBook} 
        onClose={() => setSelectedBook(null)} 
        isWish={selectedBook ? !!wishlistMap[selectedBook.id] : false} 
        onToggle={() => toggleWishlist(selectedBook)}
        onViewReviews={() => {
            const b = selectedBook;
            setSelectedBook(null);
            handleViewReviews(b);
        }}
      />
      
      {reviewsModalOpen && reviewBook && createPortal(
          <ReviewsModal book={reviewBook} onClose={() => { setReviewsModalOpen(false); setReviewBook(null); }} />,
          document.body
      )}
    </div>
  );
}