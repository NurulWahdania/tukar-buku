// src/pages/Seller/TransactionHistory.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

export default function TransactionHistory() {
  const navigate = useNavigate();
  
  // review modal state
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedReviewBook, setSelectedReviewBook] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [existingReviewId, setExistingReviewId] = useState(null);
  
  // Success modal state
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // report modal state
  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    sellerId: null, 
    sellerName: '',
    bookTitle: '',
    description: '',
  });

  const [transactions, setTransactions] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Transactions & Reviews from Backend
  useEffect(() => {
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('access_token');
            if (!token) {
                setLoading(false);
                return;
            }

            // --- PERBAIKAN DI SINI ---
            // Ganti 'my-store-sales' menjadi 'my-history'
            // Karena ini adalah halaman Riwayat PEMBELIAN (Seller beli barang orang lain)
            const txRes = await fetch('http://localhost:8000/transactions/my-history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Fetch My Reviews (Review yang SAYA buat untuk orang lain)
            const reviewRes = await fetch('http://localhost:8000/reviews/my-reviews', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (txRes.ok) {
                const data = await txRes.json();
                const mappedData = data.map(tx => ({
                    id: tx.id,
                    title: tx.book?.title || 'Unknown Book',
                    author: tx.book?.author || 'Unknown Author',
                    price: tx.book?.is_barter ? 'Barter' : `Rp${(tx.total_price || tx.book?.price || 0).toLocaleString()}`,
                    date: new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                    status: tx.status, 
                    imageUrl: tx.book?.image_url || 'https://placehold.co/80x80',
                    bookId: tx.book?.id,
                    // Info Penjual (Toko orang lain)
                    sellerId: tx.book?.store?.owner_id,
                    sellerName: tx.book?.store?.nama_toko || 'Penjual'
                }));
                setTransactions(mappedData);
            }

            if (reviewRes.ok) {
                const reviews = await reviewRes.json();
                setMyReviews(reviews);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [navigate, successModalOpen]);

  // --- REPORT LOGIC ---
  const openReport = (tx) => {
    setReportForm({ 
        sellerId: tx.sellerId,
        sellerName: tx.sellerName, 
        bookTitle: tx.title, 
        description: '' 
    });
    setReportOpen(true);
  };
  const closeReport = () => setReportOpen(false);
  
  const submitReport = async () => {
    if (!reportForm.description) {
        alert("Mohon isi deskripsi laporan.");
        return;
    }
    if (!reportForm.sellerId) {
        alert("Data penjual tidak valid.");
        return;
    }

    try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        const response = await fetch('http://localhost:8000/reports/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                terlapor_id: reportForm.sellerId,
                deskripsi: `[Laporan Transaksi: ${reportForm.bookTitle}] ${reportForm.description}`
            })
        });

        if (response.ok) {
            alert("Laporan berhasil dikirim.");
            setReportOpen(false);
        } else {
            const err = await response.json();
            alert(`Gagal melapor: ${err.detail || 'Error'}`);
        }
    } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan koneksi.");
    }
  };

  // --- REVIEW LOGIC ---
  const openReview = (tx, existingReview = null) => {
    setSelectedReviewBook(tx);
    if (existingReview) {
        setRating(existingReview.rating);
        setReviewText(existingReview.comment || '');
        setExistingReviewId(existingReview.id);
    } else {
        setRating(0);
        setReviewText('');
        setExistingReviewId(null);
    }
    setReviewOpen(true);
  };
  const closeReview = () => { setReviewOpen(false); setSelectedReviewBook(null); };
  
  const submitReview = async () => {
    if (rating === 0) {
        alert("Mohon berikan rating bintang.");
        return;
    }
    
    try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        let url = 'http://localhost:8000/reviews/';
        let method = 'POST';

        if (existingReviewId) {
            url = `http://localhost:8000/reviews/${existingReviewId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                book_id: selectedReviewBook.bookId,
                rating: rating,
                comment: reviewText
            })
        });

        if (response.ok) {
            setReviewOpen(false);
            setSelectedReviewBook(null);
            setSuccessModalOpen(true);
        } else {
            const err = await response.json();
            alert(`Gagal mengirim ulasan: ${err.detail || 'Error'}`);
        }
    } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan koneksi.");
    }
  };

  // Hapus dari tampilan riwayat (Lokal saja atau perlu API delete transaction?)
  // Biasanya riwayat transaksi tidak dihapus dari DB, hanya disembunyikan.
  const removeTransaction = (id) => {
    if(window.confirm("Hapus riwayat ini dari tampilan?")) {
        setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  useEffect(() => {
    const locked = reviewOpen || reportOpen || successModalOpen;
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [reviewOpen, reportOpen, successModalOpen]);

  if (loading) return <div className="p-6 text-[#FFE4C7] text-center">Memuat riwayat pembelian...</div>;

  return (
    <div className="w-[1020px] relative rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-white/5 rounded-[20px] border border-white/10 backdrop-blur-[10px]" />
      <div className="relative z-10 p-6">
        <h2 className="text-[#FFE4C7] text-xl font-semibold mb-4">Riwayat Pembelian</h2>

        <div className="space-y-3">
          {transactions.length === 0 && (
            <div className="text-[#CDBA9A] text-center py-10 opacity-70">Belum ada riwayat pembelian.</div>
          )}

          {transactions.map(tx => {
            const myReview = myReviews.find(r => r.book_id === tx.bookId);

            return (
                <div key={tx.id} className="bg-white/5 rounded-lg p-4 flex items-center gap-4 hover:bg-white/10 transition-colors">
                <img src={tx.imageUrl} alt={tx.title} className="w-20 h-20 object-cover rounded bg-zinc-800" />
                <div className="flex-1">
                    <div className="text-[#FFE4C7] text-base font-semibold">{tx.title}</div>
                    <div className="text-[#FFE4C7] text-sm">{tx.author}</div>
                    <div className="text-[#CDBA9A] text-xs mt-1">Tanggal: {tx.date}</div>
                    <div className="text-[#CDBA9A] text-xs mt-1">Penjual: {tx.sellerName}</div>
                </div>

                <div className="w-36 text-right">
                    <div className="text-[#FFE4C7] font-semibold">{tx.price}</div>
                    <div className={`text-xs uppercase font-bold mt-1 ${tx.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {tx.status}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {myReview ? (
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex text-yellow-400 text-sm">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i}>{i < myReview.rating ? '★' : '☆'}</span>
                                ))}
                            </div>
                            <button
                                onClick={() => openReview(tx, myReview)}
                                className="text-xs text-[#FFE4C7] underline hover:text-white"
                            >
                                Edit Rating
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => openReview(tx)}
                            className="h-10 px-3 rounded bg-white/5 border border-white/20 text-[#FFE4C7] hover:bg-white/10 transition"
                        >
                            Rating
                        </button>
                    )}

                    <button
                    onClick={() => openReport(tx)}
                    className="h-10 px-3 rounded border border-red-500/50 text-red-300 hover:bg-red-500/10 transition"
                    >
                    Laporkan
                    </button>

                    <button
                    onClick={() => removeTransaction(tx.id)}
                    className="h-10 px-3 rounded bg-[#FFE4C7] text-black font-medium hover:bg-[#ffdec0] transition"
                    >
                    Hapus
                    </button>
                </div>
                </div>
            );
          })}
        </div>
      </div>

      {/* Review Modal */}
      {typeof document !== 'undefined' && reviewOpen && selectedReviewBook && createPortal(
        <div className="fixed inset-0 z-[20000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 z-0" onClick={closeReview} />
          <div className="relative z-10 w-[600px] max-w-[95%] bg-[#18181b] border border-white/20 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-[#FFE4C7] text-lg font-semibold mb-3">
                {existingReviewId ? 'Edit Ulasan' : 'Berikan Ulasan'}
            </h3>
            <div className="flex gap-4 mb-4">
              <div className="w-20 h-20 shrink-0">
                <img src={selectedReviewBook.imageUrl} alt="cover" className="w-full h-full object-cover rounded bg-zinc-800" />
              </div>
              <div className="flex-1">
                <div className="text-[#FFE4C7] font-semibold">{selectedReviewBook.title}</div>
                <div className="text-[#CDBA9A] text-sm">{selectedReviewBook.sellerName}</div>
              </div>
            </div>

            <div className="mb-4">
                <label className="text-[#FFE4C7] text-sm mb-2 block">Rating</label>
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setRating(s)} className="p-1 transition-transform hover:scale-110">
                      {s <= rating ? (
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#FFE4C7" xmlns="http://www.w3.org/2000/svg"><path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.167L12 18.896 4.664 23.164l1.402-8.167L.132 9.21l8.2-1.192z"/></svg>
                      ) : (
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#FFE4C7" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg"><path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.167L12 18.896 4.664 23.164l1.402-8.167L.132 9.21l8.2-1.192z"/></svg>
                      )}
                    </button>
                  ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="text-[#FFE4C7] text-sm mb-2 block">Komentar</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full h-24 bg-white/5 border border-white/10 p-3 rounded-lg text-[#FFE4C7] placeholder:text-zinc-500 focus:outline-none focus:border-[#FFE4C7] resize-none"
                  placeholder="Ceritakan pengalaman Anda..."
                />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={closeReview} className="px-4 py-2 border border-white/20 rounded-lg text-[#FFE4C7] hover:bg-white/5 transition">Batal</button>
              <button onClick={submitReview} className="px-6 py-2 rounded-lg bg-[#FFE4C7] text-black font-bold hover:bg-[#ffdec0] transition">
                {existingReviewId ? 'Simpan Perubahan' : 'Kirim Ulasan'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Success Modal */}
      {typeof document !== 'undefined' && successModalOpen && createPortal(
        <div className="fixed inset-0 z-[20001] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80 z-0" onClick={() => setSuccessModalOpen(false)} />
            <div className="relative z-10 w-[400px] bg-[#18181b] border border-green-500/30 rounded-2xl p-8 shadow-2xl text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-green-500 text-xl font-bold mb-2">Berhasil!</h3>
                <p className="text-gray-400 mb-6">Ulasan Anda telah berhasil disimpan.</p>
                <button 
                    onClick={() => setSuccessModalOpen(false)} 
                    className="w-full py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors"
                >
                    Tutup
                </button>
            </div>
        </div>,
        document.body
      )}

      {/* Report Modal */}
      {typeof document !== 'undefined' && reportOpen && createPortal(
        <div className="fixed inset-0 z-[20000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 z-0" onClick={closeReport} />
          <div className="relative z-10 w-[600px] max-w-[95%] bg-[#18181b] border border-white/20 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-[#FFE4C7] text-lg font-semibold mb-4">Laporkan Masalah</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="text-xs text-gray-500 block mb-1">Penjual</label>
                      <div className="text-[#FFE4C7] text-sm font-medium bg-white/5 px-3 py-2 rounded border border-white/10">{reportForm.sellerName}</div>
                  </div>
                  <div>
                      <label className="text-xs text-gray-500 block mb-1">Buku</label>
                      <div className="text-[#FFE4C7] text-sm font-medium bg-white/5 px-3 py-2 rounded border border-white/10 truncate">{reportForm.bookTitle}</div>
                  </div>
              </div>
              
              <div>
                  <label className="text-xs text-[#FFE4C7] block mb-2">Deskripsi Masalah</label>
                  <textarea
                    placeholder="Jelaskan masalah yang Anda alami secara detail..."
                    value={reportForm.description}
                    onChange={(e) => setReportForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[#FFE4C7] placeholder:text-zinc-600 focus:outline-none focus:border-[#FFE4C7] resize-none"
                  />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeReport} className="px-4 py-2 border border-white/20 rounded-lg text-[#FFE4C7] hover:bg-white/5 transition">Batal</button>
              <button onClick={submitReport} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium">Laporkan</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}