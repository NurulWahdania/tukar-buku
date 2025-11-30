// src/pages/Seller/Rewiev.jsx
import React, { useState, useEffect } from 'react';
import { getMyListings, getReviewsForBook } from '../../api/client';

export default function Rewiev() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllStoreReviews = async () => {
      setLoading(true);
      try {
        // 1. Ambil semua buku milik seller
        const myBooks = await getMyListings();
        
        // 2. Ambil review untuk setiap buku secara paralel
        const reviewsPromises = myBooks.map(async (book) => {
            try {
                const bookReviews = await getReviewsForBook(book.id);
                // Pastikan return array dan tambahkan info buku ke dalam object review
                return Array.isArray(bookReviews) ? bookReviews.map(r => ({
                    ...r,
                    book_title: book.title,
                    book_image: book.image_url
                })) : [];
            } catch (e) {
                console.error(`Gagal ambil review untuk buku ${book.id}`, e);
                return [];
            }
        });
        
        // 3. Tunggu semua request selesai dan gabungkan array
        const results = await Promise.all(reviewsPromises);
        const flatReviews = results.flat();
        
        // Opsional: Urutkan berdasarkan ID atau Tanggal (jika ada field created_at)
        // flatReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setReviews(flatReviews);

      } catch (err) {
        console.error("Gagal memuat ulasan toko:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStoreReviews();
  }, []);

  // Helper untuk format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="w-[1020px] h-96 relative rounded-xl outline outline-1 outline-offset-[-1px] outline-white/0 backdrop-blur-[10px] overflow-hidden">
      <div className="w-[1020px] h-96 left-0 top-0 absolute bg-white/5 rounded-[20px]" />
      <div className="left-[20px] top-[16px] absolute justify-start text-Color1 text-xl font-semibold font-['Inter']">Ulasan Toko</div>
      
      <div className="w-[980px] left-[20px] top-[56px] bottom-[20px] absolute rounded-xl outline outline-1 outline-offset-[-1px] outline-white/0 backdrop-blur-[10px] flex flex-col justify-start items-start overflow-hidden overflow-y-auto">
        
        {/* Header Tabel */}
        <div className="self-stretch h-12 relative border-b border-zinc-300 shrink-0 bg-white/5">
          <div className="left-[210px] top-[15.50px] absolute justify-start text-Color1 text-base font-bold font-['Inter']">Rate</div>
          <div className="left-[20px] top-[15.50px] absolute justify-start text-Color1 text-base font-bold font-['Inter']">Nama / Buku</div>
          <div className="left-[314px] top-[15.50px] absolute justify-start text-Color1 text-base font-bold font-['Inter']">Review</div>
          <div className="left-[724px] top-[15.50px] absolute justify-start text-Color1 text-base font-bold font-['Inter']">Tanggal</div>
          <div className="left-[868px] top-[15.50px] absolute justify-start text-Color1 text-base font-bold font-['Inter']">Aksi</div>
        </div>
        
        {/* Loading State */}
        {loading && (
            <div className="w-full py-10 flex justify-center text-Color1">Memuat ulasan...</div>
        )}

        {/* Empty State */}
        {!loading && reviews.length === 0 && (
            <div className="w-full py-10 flex justify-center text-Color1 opacity-60">Belum ada ulasan untuk produk Anda.</div>
        )}

        {/* List Ulasan */}
        {!loading && reviews.map((review, index) => (
            <div key={review.id || index} className="self-stretch h-24 relative border-b border-zinc-300 shrink-0 hover:bg-white/5 transition-colors">
              
              {/* Avatar User */}
              <div className="w-14 h-14 left-[12px] top-[10px] absolute bg-zinc-300 rounded-full overflow-hidden">
                 <img 
                    src={review.user?.profile_photo_url || `https://ui-avatars.com/api/?name=${review.user?.username || 'User'}`} 
                    alt="avatar" 
                    className="w-full h-full object-cover"
                 />
              </div>

              {/* Nama User & Judul Buku */}
              <div className="left-[84px] top-[19px] absolute flex flex-col justify-start w-[120px]">
                <span className="text-Color1 text-sm font-semibold font-['Inter'] truncate" title={review.user?.username}>
                    {review.user?.username || 'Anonim'}
                </span>
                <span className="text-Color1/70 text-xs font-normal font-['Inter'] truncate" title={review.book_title}>
                    {review.book_title || 'Produk'}
                </span>
              </div>

              {/* Rating (Bintang & Angka) */}
              <div className="left-[210px] top-[24px] absolute flex items-center gap-1">
                <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.167L12 18.896 4.664 23.164l1.402-8.167L.132 9.21l8.2-1.192z"/>
                </svg>
                <span className="text-Color1 text-base font-semibold font-['Inter']">{review.rating || 0}</span>
              </div>

              {/* Isi Review */}
              <div className="left-[314px] top-[20px] absolute w-[380px] h-[56px] overflow-hidden">
                <p className="text-Color1 text-sm font-normal font-['Inter'] line-clamp-3">
                    {review.comment || "Tidak ada komentar."}
                </p>
              </div>

              {/* Tanggal */}
              <div className="left-[724px] top-[30px] absolute justify-start text-Color1 text-sm font-semibold font-['Inter']">
                {formatDate(review.created_at)}
              </div>

              {/* Tombol Aksi */}
              <div className="left-[868px] top-[20px] absolute">
                <button className="w-24 h-10 bg-white/5 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-zinc-500 text-Color1 text-sm font-semibold hover:bg-red-500/20 hover:outline-red-500 hover:text-red-200 transition-all">
                    Lapor
                </button>
              </div>
            </div>
        ))}
        
      </div>
    </div>
  );
}