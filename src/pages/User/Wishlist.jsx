// src/pages/User/Wishlist.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getMyWishlist, removeFromWishlist } from '../../api/client';

// BookCard: fleksibel
function BookCard({ title, author, price, condition, imageUrl, isWish, onLove }) {
  return (
    <div className="w-60 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.25)] outline outline-1 outline-offset-[-1px] outline-white overflow-hidden bg-transparent flex flex-col">
      <img 
        className="w-60 h-60 object-cover" 
        src={imageUrl || "https://placehold.co/240x240?text=No+Image"} 
        alt={title} 
        onError={(e) => { e.target.src = "https://placehold.co/240x240?text=Error"; }}
      />
      <div className="px-4 py-3 bg-white/5 backdrop-blur-[10px] flex-1 flex flex-col">
        <div className="text-[#FFE4C7] text-sm font-semibold truncate" title={title}>{title}</div>
        <div className="text-[#FFE4C7] text-xs mb-2 truncate">{author}</div>

        <div className="h-px bg-stone-300 my-2" />

        <div className="flex items-center gap-3 mt-auto">
          <div className="flex flex-col">
            <div className="text-[#FFE4C7] text-[10px]">Harga</div>
            <div className="text-[#FFE4C7] text-xs font-bold">{price}</div>
          </div>

          <div className="flex flex-col">
            <div className="text-[#FFE4C7] text-[10px]">Kondisi</div>
            <div className="text-[#FFE4C7] text-xs">{condition}</div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onLove && onLove();
                }} 
                className={`w-8 h-8 flex items-center justify-center rounded ${isWish ? 'bg-[#FFE4C7]' : 'bg-transparent border border-[#FFE4C7]'}`}
            >
              {isWish ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="black" stroke="#FFE4C7" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 4 8.5 4C10.5 4 12 6 12 6C12 6 13.5 4 15.5 4C17.5 4 20 5.5 20 8.5C20 13.5 12 21 12 21Z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFE4C7" strokeWidth="1.6" className="w-4 h-4">
                  <path d="M12 21s-7-4.9-9-8.2C1.4 9.9 4.1 6 7.5 6c1.7 0 3 1 4.5 2.8C13.5 7 14.8 6 16.5 6 19.9 6 22.6 9.9 21 12.8 19 16.1 12 21 12 21z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wishlist page: render dynamic grid sesuai daftar buku
export default function Wishlist() {
  const [booksState, setBooksState] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Wishlist from Backend
  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const data = await getMyWishlist();
        if (Array.isArray(data)) {
            // Map backend data to UI format
            const mapped = data.map(item => {
                const b = item.book;
                return {
                    id: b.id,
                    wishlistId: item.id, // ID item wishlist untuk penghapusan
                    title: b.title,
                    author: b.author,
                    price: b.is_barter ? "Barter" : (typeof b.price === 'number' ? `Rp ${b.price.toLocaleString()}` : b.price),
                    condition: b.condition,
                    imageUrl: b.image_url,
                    description: b.description,
                    store: b.store,
                    is_barter: b.is_barter
                };
            });
            setBooksState(mapped);
        }
      } catch (error) {
        console.error("Gagal memuat wishlist:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  // Remove from wishlist (Backend)
  const removeFromList = async (book) => {
    if (!book || !book.wishlistId) return;
    
    if(!window.confirm(`Hapus "${book.title}" dari wishlist?`)) return;

    try {
        await removeFromWishlist(book.wishlistId);
        
        // Update UI
        setBooksState(prev => prev.filter(b => b.wishlistId !== book.wishlistId));
        
        if (selectedBook && selectedBook.wishlistId === book.wishlistId) {
            setSelectedBook(null);
        }
    } catch (error) {
        console.error("Gagal menghapus wishlist:", error);
        alert("Gagal menghapus dari wishlist.");
    }
  };

  return (
    <div className="w-[1020px] min-h-[600px] relative rounded-xl outline outline-1 outline-offset-[-1px] outline-white/0 backdrop-blur-[10px]">
      <div className="w-full h-full absolute bg-white/5 rounded-[20px] -z-10" />
      
      <div className="p-6">
        <h2 className="text-[#FFE4C7] text-xl font-semibold font-['Inter'] mb-6">Wishlist Saya</h2>

        {loading ? (
          <div className="text-[#FFE4C7] text-center mt-10">Memuat wishlist...</div>
        ) : booksState.length === 0 ? (
          <div className="text-[#FFE4C7] text-center mt-10 opacity-60">Wishlist Anda kosong.</div>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {booksState.map(book => (
              <div key={book.wishlistId} className="z-10 cursor-pointer transition-transform hover:scale-105" onClick={() => setSelectedBook(book)}>
                <BookCard 
                    {...book} 
                    isWish={true} 
                    onLove={() => removeFromList(book)} 
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {typeof document !== 'undefined' && selectedBook && createPortal(
        <BookDetailModal 
            book={selectedBook} 
            onClose={() => setSelectedBook(null)} 
            onRemove={() => removeFromList(selectedBook)}
        />,
        document.body
      )}
    </div>
  );
}

// Local modal component
function BookDetailModal({ book, onClose, onRemove }) {
  if (!book) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[10px]" onClick={onClose} />
      <div className="w-[980px] max-w-[95%] h-[700px] relative rounded-xl bg-[#18181b] border border-white/10 overflow-hidden flex shadow-2xl z-[10000]">
        
        {/* Gambar */}
        <img 
            className="w-[460px] h-[660px] left-[20px] top-[20px] absolute rounded-2xl object-cover" 
            src={book.imageUrl || "https://placehold.co/460x660?text=No+Image"} 
            alt={book.title} 
        />
        
        {/* Detail */}
        <div className="w-[440px] left-[520px] top-[60px] absolute flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <img className="w-10 h-10 rounded-full bg-white/10" src={book.store?.store_photo_url || "https://placehold.co/40x40?text=S"} alt="store" />
            <div className="text-[#FFE4C7] text-xl font-semibold">{book.store?.nama_toko || "Toko"}</div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="text-[#FFE4C7] text-3xl font-semibold leading-tight">{book.title}</div>
            <div className="text-[#FFE4C7] text-lg opacity-80">{book.author}</div>
          </div>
          
          <div className="text-[#FFE4C7] text-sm leading-relaxed h-40 overflow-y-auto pr-2">
            {book.description || "Tidak ada deskripsi."}
          </div>
          
          <div className="h-px w-full bg-stone-500 my-2" />
          
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-8">
              <div>
                <div className="text-[#FFE4C7] text-sm opacity-70">{book.is_barter ? 'Tipe' : 'Harga'}</div>
                <div className="text-[#FFE4C7] text-2xl font-semibold">{book.price}</div>
              </div>
              <div>
                <div className="text-[#FFE4C7] text-sm opacity-70">Kondisi</div>
                <div className="text-[#FFE4C7] text-2xl font-semibold">{book.condition}</div>
              </div>
            </div>
            
            <div className="flex gap-3 items-center">
              {/* Wishlist Button (Active) -> Click to Remove */}
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove && onRemove(); }} 
                className="w-10 h-10 flex items-center justify-center rounded bg-[#FFE4C7] border border-[#FFE4C7] hover:bg-[#ffcca0] transition"
                title="Hapus dari Wishlist"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="black" stroke="black" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 4 8.5 4C10.5 4 12 6 12 6C12 6 13.5 4 15.5 4C17.5 4 20 5.5 20 8.5C20 13.5 12 21 12 21Z"/></svg>
              </button>
              
              {/* Beli Button (Placeholder) */}
              <button className="h-10 px-6 bg-[#FFE4C7] rounded flex items-center gap-2 hover:bg-[#ffcca0] transition">
                <span className="text-black text-base font-semibold">Lihat di Home</span>
              </button>
            </div>
          </div>
        </div>
        <button className="absolute right-5 top-5 text-[#FFE4C7] text-4xl hover:text-white transition" onClick={onClose}>×</button>
      </div>
    </div>
  );
}