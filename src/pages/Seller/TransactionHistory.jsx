// src/pages/Seller/TransactionHistory.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

export default function TransactionHistory() {
  const navigate = useNavigate();

  // review modal state (Seller biasanya tidak mereview pembeli di sistem ini, tapi jika fitur ada, biarkan)
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedReviewBook, setSelectedReviewBook] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  // report modal state
  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    buyerId: null,
    buyerName: '',
    bookTitle: '',
    description: '',
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Store Sales History from Backend
  useEffect(() => {
    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('access_token');
            if (!token) {
                setLoading(false);
                return;
            }

            // Endpoint khusus untuk melihat penjualan toko
            const response = await fetch('http://localhost:8000/transactions/my-store-sales', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                // Mapping data backend ke format UI
                const mappedData = data.map(tx => ({
                    id: tx.id,
                    title: tx.book?.title || 'Unknown Book',
                    author: tx.book?.author || 'Unknown Author',
                    price: tx.book?.is_barter ? 'Barter' : `Rp${(tx.total_price || tx.book?.price || 0).toLocaleString()}`,
                    date: new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                    status: tx.status, 
                    imageUrl: tx.book?.image_url || 'https://placehold.co/80x80',
                    bookId: tx.book?.id,
                    // Info pembeli (jika backend mengirim user, tapi endpoint saat ini mungkin perlu join user)
                    // Untuk sementara kita pakai placeholder atau update backend jika perlu info pembeli detail
                    buyerId: tx.user_id, 
                    buyerName: `Pembeli #${tx.user_id}` 
                }));
                setTransactions(mappedData);
            } else {
                console.error("Gagal mengambil riwayat penjualan");
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchHistory();
  }, [navigate]);

  const openReport = (tx) => {
    setReportForm({ 
        buyerId: tx.buyerId,
        buyerName: tx.buyerName, 
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
    
    try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        const response = await fetch('http://localhost:8000/reports/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                terlapor_id: reportForm.buyerId, // Melaporkan pembeli
                deskripsi: `[Laporan Penjualan: ${reportForm.bookTitle}] ${reportForm.description}`
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

  const openReview = (tx) => {
    // Fitur review balik ke pembeli belum diimplementasi di backend
    alert("Fitur ulasan untuk pembeli belum tersedia.");
  };
  
  const closeReview = () => { setReviewOpen(false); setSelectedReviewBook(null); };
  const submitReview = () => {
    // Placeholder
    setReviewOpen(false);
  };

  const removeTransaction = (id) => {
    if(window.confirm("Hapus riwayat ini dari tampilan?")) {
        setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  // disable page scroll when any modal is open
  useEffect(() => {
    const locked = reviewOpen || reportOpen;
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [reviewOpen, reportOpen]);

  if (loading) return <div className="p-6 text-[#FFE4C7]">Memuat riwayat penjualan...</div>;

  return (
    <div className="w-[1020px] relative rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-white/5 rounded-[20px] border border-white/10 backdrop-blur-[10px]" />
      <div className="relative z-10 p-6">
        <h2 className="text-[#FFE4C7] text-xl font-semibold mb-4">Riwayat Penjualan</h2>

        <div className="space-y-3">
          {transactions.length === 0 && (
            <div className="text-[#CDBA9A]">Belum ada riwayat penjualan.</div>
          )}

          {transactions.map(tx => (
            <div key={tx.id} className="bg-white/5 rounded-lg p-4 flex items-center gap-4">
              <img src={tx.imageUrl} alt={tx.title} className="w-20 h-20 object-cover rounded" />
              <div className="flex-1">
                <div className="text-[#FFE4C7] text-base font-semibold">{tx.title}</div>
                <div className="text-[#FFE4C7] text-sm">{tx.author}</div>
                <div className="text-[#CDBA9A] text-xs mt-1">Tanggal: {tx.date}</div>
              </div>

              <div className="w-36 text-right">
                <div className="text-[#FFE4C7] font-semibold">{tx.price}</div>
                <div className="text-[#CDBA9A] text-xs uppercase">{tx.status}</div>
              </div>

              <div className="flex items-center gap-2">
                {/* Tombol Rating dinonaktifkan untuk seller sementara waktu */}
                {/* 
                <button
                  onClick={() => openReview(tx)}
                  className="h-10 px-3 rounded bg-white/5 text-[#FFE4C7] hover:bg-white/10"
                >
                  Rating
                </button> 
                */}

                <button
                  onClick={() => openReport(tx)}
                  className="h-10 px-3 rounded border border-[#FFE4C7] text-[#FFE4C7] hover:bg-white/10"
                >
                  Laporkan
                </button>

                <button
                  onClick={() => removeTransaction(tx.id)}
                  className="h-10 px-3 rounded bg-[#FFE4C7] text-black"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Modal */}
      {typeof document !== 'undefined' && reportOpen && createPortal(
        <div className="fixed inset-0 z-[20000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 z-0" onClick={closeReport} />
          <div className="relative z-10 w-[760px] max-w-[95%] bg-[#06070a]/95 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-[#FFE4C7] text-lg font-semibold mb-3">Form Lapor Pembeli</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#CDBA9A]">Pembeli</label>
                  <input
                    type="text"
                    value={reportForm.buyerName}
                    readOnly
                    className="w-full h-12 bg-[#0f1720] border border-white/10 rounded px-3 text-[#FFE4C7] opacity-70 cursor-not-allowed"
                  />
              </div>
              <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#CDBA9A]">Buku</label>
                  <input
                    type="text"
                    value={reportForm.bookTitle}
                    readOnly
                    className="w-full h-12 bg-[#0f1720] border border-white/10 rounded px-3 text-[#FFE4C7] opacity-70 cursor-not-allowed"
                  />
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-xs text-[#CDBA9A]">Deskripsi Masalah</label>
                  <textarea
                    placeholder="Jelaskan masalah dengan pembeli ini..."
                    value={reportForm.description}
                    onChange={(e) => setReportForm(f => ({ ...f, description: e.target.value }))
                    }
                    className="w-full h-32 bg-[#0f1720] border border-white/10 rounded px-3 py-2 text-[#FFE4C7] placeholder:text-[#CDBA9A] resize-none"
                  />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={closeReport} className="px-4 py-2 border border-white/10 rounded text-[#FFE4C7]">Batal</button>
              <button onClick={submitReport} className="px-4 py-2 rounded bg-[#FFE4C7] text-black">Laporkan</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}