// src/pages/Seller/StoreTransactions.jsx
import React, { useState, useEffect } from 'react';
import { getMyStoreSales } from '../../api/client'; // Import API

export default function StoreTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Data Transaksi Penjualan
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await getMyStoreSales();
        // Pastikan data berupa array
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Gagal mengambil transaksi:", err);
        setError("Gagal memuat riwayat transaksi.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="w-[1020px] h-[553px] relative rounded-xl outline outline-1 outline-offset-[-1px] outline-white/0 backdrop-blur-[10px] overflow-hidden">
      <div className="w-[1020px] h-[553px] left-0 top-0 absolute bg-white/5 rounded-[20px]" />
      <div className="left-[20px] top-[16px] absolute justify-start text-Color1 text-xl font-semibold font-['Inter']">Transaksi Toko</div>

      {/* Container List Transaksi (Scrollable) */}
      <div className="w-[980px] left-[20px] top-[57px] bottom-[20px] absolute rounded-xl outline outline-1 outline-offset-[-1px] outline-white/0 backdrop-blur-[10px] flex flex-col justify-start items-start overflow-hidden overflow-y-auto">
        
        {/* Loading State */}
        {loading && (
            <div className="w-full h-full flex items-center justify-center text-Color1">Memuat data transaksi...</div>
        )}

        {/* Error State */}
        {error && (
            <div className="w-full h-full flex items-center justify-center text-red-400">{error}</div>
        )}

        {/* Empty State */}
        {!loading && !error && transactions.length === 0 && (
            <div className="w-full h-full flex items-center justify-center text-Color1 opacity-60">Belum ada transaksi penjualan.</div>
        )}

        {/* List Data */}
        {!loading && !error && transactions.map((trx) => (
            <div key={trx.id} className="self-stretch h-24 relative border-b border-zinc-300 shrink-0 hover:bg-white/5 transition-colors">
              {/* Gambar Produk */}
              <img 
                className="w-16 h-16 left-[12px] top-[12px] absolute object-cover rounded" 
                src={trx.book?.image_url || "https://placehold.co/64x64?text=No+Img"} 
                alt="product" 
              />
              
              {/* Judul Buku */}
              <div className="left-[96px] top-[12px] absolute justify-start text-Color1 text-base font-semibold font-['Inter'] truncate w-[400px]">
                {trx.book?.title || "Judul Tidak Tersedia"}
              </div>
              
              {/* Penulis */}
              <div className="left-[96px] top-[36px] absolute justify-start text-Color1 text-sm font-normal font-['Inter']">
                {trx.book?.author || "Penulis Tidak Diketahui"}
              </div>
              
              {/* Status */}
              <div className="left-[540px] top-[18px] absolute justify-start text-Color1 text-base font-semibold font-['Inter']">
                Status: <span className="text-[#FFE4C7]">{trx.status || 'Proses'}</span>
              </div>
              
              {/* Tombol Aksi */}
              <div className="left-[720px] top-[12px] absolute inline-flex gap-3">
                <button className="w-24 h-10 px-3 py-2 bg-white/5 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-Color1 text-Color1 hover:bg-white/10 transition-colors text-sm font-medium">
                    Detail
                </button>
                <button className="w-24 h-10 px-3 py-2 bg-Color1 rounded-[10px] text-black hover:bg-[#ffdec0] transition-colors text-sm font-medium">
                    Update
                </button>
              </div>
            </div>
        ))}
        
      </div>
    </div>
  );
}