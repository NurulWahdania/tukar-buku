import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { getBooks } from '../../api/client'; // Pastikan path import benar

// --- KOMPONEN KARTU BUKU (GUEST) ---
function BookCard({ title, author, price, condition, imageUrl, isSold, isBarter, onAction }) {
  const displayPrice = isBarter 
    ? "Barter" 
    : (typeof price === 'number' ? `Rp ${price.toLocaleString()}` : price);

  return (
    <div className="w-60 rounded-xl outline outline-1 outline-white bg-white/5 backdrop-blur-[10px] overflow-hidden flex flex-col group relative cursor-pointer hover:bg-white/10 transition-all">
      
      {/* Gambar Buku */}
      <div className="w-full h-60 relative overflow-hidden bg-zinc-800">
        <img 
            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
            src={imageUrl || "https://placehold.co/240x240?text=No+Image"} 
            alt={title} 
            onError={(e) => { e.target.src = "https://placehold.co/240x240?text=Error"; }}
        />
      </div>
      
      <div className="flex flex-col gap-2 px-4 py-3 bg-white/5 h-full border-t border-white/5">
        {/* Header */}
        <div>
          <div className="text-[#FFE4C7] text-sm font-semibold font-['Inter'] truncate" title={title}>{title}</div>
          <div className="text-[#FFE4C7] text-xs font-normal font-['Inter'] truncate opacity-80">{author}</div>
        </div>
        
        <div className="h-px w-full bg-white/10 my-1" />
        
        {/* Info */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[#FFE4C7]/60 text-[10px] font-normal font-['Inter']">{isBarter ? 'Tipe' : 'Harga'}</div>
            <div className="text-[#FFE4C7] text-xs font-bold font-['Inter']">{displayPrice}</div>
          </div>
          <div className="text-right">
            <div className="text-[#FFE4C7]/60 text-[10px] font-normal font-['Inter']">Kondisi</div>
            <div className="text-[#FFE4C7] text-xs font-normal font-['Inter']">{condition || "-"}</div>
          </div>
        </div>
        
        {/* Tombol Aksi (Redirect to Login) */}
        <div className="flex items-center justify-end gap-2 mt-2">
            {isSold ? (
                 <>
                    {/* Tombol Ulasan (Guest -> Login) */}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onAction(); }}
                        className="h-8 px-3 flex items-center gap-2 justify-center rounded bg-transparent border border-[#FFE4C7] hover:bg-white/10 transition-colors group/btn"
                        title="Login untuk melihat ulasan"
                    >
                        <span className="text-[#FFE4C7] text-[10px] font-medium">Ulasan</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FFE4C7" className="w-3.5 h-3.5 group-hover/btn:fill-[#FFE4C7]/20">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                    </button>
                    <div className="h-8 px-3 bg-white/5 border border-white/20 rounded flex items-center justify-center cursor-default">
                        <span className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">Sold</span>
                    </div>
                 </>
            ) : (
                <>
                    {/* Wishlist (Guest -> Login) */}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onAction(); }}
                        className="w-8 h-8 flex items-center justify-center rounded bg-transparent border border-[#FFE4C7] hover:bg-white/5 transition-all"
                        title="Login untuk wishlist"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#FFE4C7" strokeWidth="1.5"><path d="M12 21s-7-4.9-9-8.2C1.4 9.9 4.1 6 7.5 6c1.7 0 3 1 4.5 2.8C13.5 7 14.8 6 16.5 6 19.9 6 22.6 9.9 21 12.8 19 16.1 12 21 12 21z"/></svg>
                    </button>
                    
                    {/* Hubungi (Guest -> Login) */}
                    <div className="w-8 h-8 flex items-center justify-center rounded bg-[#FFE4C7] border border-[#FFE4C7] cursor-pointer hover:bg-[#ffdec0]" onClick={(e) => { e.stopPropagation(); onAction(); }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 32 32" className="w-5 h-5">
                            <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.697 4.624 2.02 6.573L4 29l7.573-2.02A12.94 12.94 0 0016 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-2.162 0-4.267-.634-6.07-1.834l-.433-.273-4.498 1.2 1.2-4.498-.273-.433A10.96 10.96 0 016 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.297-7.425c-.297-.149-1.757-.867-2.029-.967-.273-.099-.472-.148-.67.15-.198.297-.767.967-.94 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.477-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.457.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.67-1.615-.917-2.211-.242-.582-.487-.502-.67-.511l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.214 3.075.149.198 2.095 3.2 5.076 4.363.71.278 1.265.443 1.701.565.714.227 1.365.195 1.88.119.574-.084 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
}

// --- KOMPONEN MODAL DETAIL BUKU (GUEST) ---
function BookDetailModal({ book, onClose }) {
  const navigate = useNavigate();
  if (!book) return null;
  const displayPrice = book.is_barter ? "Barter" : (typeof book.price === 'number' ? `Rp ${book.price.toLocaleString()}` : book.price);

  const redirectToLogin = () => {
      onClose(); // Tutup modal
      navigate('/login'); // Arahkan ke login
  };

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-[1000px] max-w-full h-[650px] bg-[#18181b] border border-white/10 rounded-2xl flex overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        
        {/* Kiri: Gambar Besar */}
        <div className="w-[45%] h-full bg-black flex items-center justify-center p-6 relative">
             <img className="w-full h-full object-contain rounded-lg" src={book.image_url || "https://placehold.co/500x700"} alt={book.title} />
        </div>

        {/* Kanan: Detail Info */}
        <div className="w-[55%] h-full p-8 flex flex-col overflow-y-auto">
          
          {/* Header Toko (Guest -> Login jika diklik) */}
          <div 
             onClick={redirectToLogin}
             className="flex items-center gap-4 cursor-pointer group mb-6 p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors border border-white/5 hover:border-white/20"
             title="Login untuk lihat profil toko"
          >
            <img className="w-12 h-12 rounded-full border border-white/10 object-cover" src={book.store?.store_photo_url || "https://placehold.co/60"} alt="store" />
            <div>
                <div className="text-[#FFE4C7] text-lg font-bold group-hover:underline decoration-[#FFE4C7]">{book.store?.nama_toko || "Nama Toko"}</div>
                <div className="text-zinc-400 text-xs group-hover:text-white transition-colors">Penjual Terpercaya</div>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-[#FFE4C7] text-4xl font-bold leading-tight mb-2">{book.title}</h1>
            <p className="text-zinc-400 text-lg font-medium">{book.author}</p>
          </div>

          <div className="flex-1 mb-6 pr-2 overflow-y-auto text-zinc-300 text-sm leading-relaxed whitespace-pre-line border-l-2 border-white/10 pl-4">
            {book.description || "Tidak ada deskripsi."}
          </div>

          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="flex justify-between items-end mb-6">
               <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mb-1">{book.is_barter ? 'Tipe Transaksi' : 'Harga Buku'}</p>
                  <p className="text-[#FFE4C7] text-3xl font-bold">{displayPrice}</p>
               </div>
               <div className="text-right">
                  <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mb-1">Kondisi</p>
                  <span className="px-3 py-1 bg-white/10 rounded text-[#FFE4C7] text-sm font-medium border border-white/10">{book.condition}</span>
               </div>
            </div>

            <div className="flex items-center gap-3">
               {/* Tombol Lapor (Guest -> Login) */}
               <button onClick={redirectToLogin} className="w-12 h-12 flex items-center justify-center rounded-xl border border-zinc-600 text-zinc-400 hover:border-red-500 hover:text-red-500 transition-colors" title="Login untuk melapor">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               </button>

               {!book.is_sold ? (
                 <>
                   {/* Wishlist (Guest -> Login) */}
                   <button onClick={redirectToLogin} className="w-12 h-12 flex items-center justify-center rounded-xl border border-zinc-600 text-zinc-400 hover:border-[#FFE4C7] hover:text-[#FFE4C7] transition-all">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                   </button>
                   {/* Hubungi (Guest -> Login) */}
                   <button onClick={redirectToLogin} className="flex-1 h-12 bg-[#FFE4C7] hover:bg-[#ffdec0] text-black text-lg font-bold rounded-xl shadow-lg shadow-[#FFE4C7]/20 transition-all flex items-center justify-center gap-2">
                      <span>Login untuk Membeli</span>
                   </button>
                 </>
               ) : (
                 <>
                   {/* Lihat Ulasan (Guest -> Login) */}
                   <button onClick={redirectToLogin} className="flex-1 h-12 border border-[#FFE4C7] text-[#FFE4C7] hover:bg-[#FFE4C7]/10 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      Login untuk Lihat Ulasan
                   </button>
                   <div className="px-6 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-500 font-bold cursor-not-allowed">
                      TERJUAL
                   </div>
                 </>
               )}
            </div>
          </div>
        </div>

        <button className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors" onClick={onClose}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>, document.body
  ) : null;
}

// --- KOMPONEN UTAMA (CATEGORY GUEST) ---
export default function Category() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const categories = ['Semua', 'Humaniora', 'Saintek', 'Fiksi', 'Barter', 'Jual'];
  
  // Ambil search params (opsional jika guest bisa search)
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Panggil API getBooks yang sama dengan User
        const data = await getBooks();
        setBooks(Array.isArray(data) ? data : []); 
      } catch (error) {
        console.error("Gagal mengambil buku:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter Buku
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

  // Handler Umum: Redirect ke Login
  const handleAuthRedirect = () => {
      navigate('/login');
  };

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
        <div className="absolute left-[20px] top-[16px] text-[#FFE4C7] text-xl font-semibold font-['Inter'] z-10">
          {selectedCategory}
        </div>

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
                <div key={book.id} onClick={() => setSelectedBook(book)}>
                  <BookCard 
                    title={book.title}
                    author={book.author}
                    price={book.price}
                    condition={book.condition}
                    imageUrl={book.image_url}
                    isBarter={book.is_barter}
                    isSold={book.is_sold}
                    onAction={handleAuthRedirect} // Semua aksi -> Login
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
      />
    </div>
  );
}