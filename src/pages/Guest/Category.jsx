// src/pages/Guest/Category.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Ini adalah komponen untuk satu kartu buku
function BookCard({ title, author, price, condition, imageUrl, isSold, isBarter }) {
  return (
    <div className="w-60 rounded-xl outline outline-1 outline-white bg-white/5 backdrop-blur-[10px] overflow-hidden flex flex-col">
      <img className="w-60 h-60 object-cover" src={imageUrl} alt={title} />
      <div className="flex flex-col gap-2 px-4 py-3">
        <div>
          <div className="text-[#FFE4C7] text-sm font-semibold font-['Inter']">{title}</div>
          <div className="text-[#FFE4C7] text-xs font-normal font-['Inter']">{author}</div>
        </div>
        <div className="h-0.5 w-full bg-stone-300 my-2" />
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[#FFE4C7] text-[10px] font-normal font-['Inter']">{isBarter ? '' : 'Harga'}</div>
            <div className="text-[#FFE4C7] text-xs font-normal font-['Inter']">{isBarter ? 'Barter' : price}</div>
          </div>
          <div>
            <div className="text-[#FFE4C7] text-[10px] font-normal font-['Inter']">Kondisi</div>
            <div className="text-[#FFE4C7] text-xs font-normal font-['Inter']">{condition}</div>
          </div>
          
          
          {/* Icon Hati dan WA */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Heart Icon */}
            <div className="w-8 h-8 flex items-center justify-center rounded bg-transparent border border-[#FFE4C7]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#FFE4C7" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 4 8.5 4C10.5 4 12 6 12 6C12 6 13.5 4 15.5 4C17.5 4 20 5.5 20 8.5C20 13.5 12 21 12 21Z"/>
              </svg>
            </div>
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

function BookDetailModal({ book, onClose }) {
  const navigate = useNavigate();
  if (!book) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop Blur */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[10px]" onClick={onClose}></div>
      {/* Card Detail */}
      <div className="w-[980px] h-[700px] relative rounded-xl outline outline-1 outline-white/0 backdrop-blur-[10px] overflow-hidden bg-black/50 flex">
        <img className="w-[460px] h-[660px] left-[20px] top-[20px] absolute rounded-2xl object-cover" src={book.imageUrl} alt={book.title} />
        <div className="w-96 left-[520px] top-[60px] absolute flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <img className="w-10 h-10 rounded-full" src="https://placehold.co/40x40" alt="profile" />
            <div className="text-[#FFE4C7] text-xl font-semibold font-['Inter']">Collective</div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-[#FFE4C7] text-xl font-semibold font-['Inter']">{book.title}</div>
            <div className="text-[#FFE4C7] text-base font-normal font-['Inter']">{book.author}</div>
          </div>
          <div className="text-[#FFE4C7] text-xs font-normal font-['Inter']">
            {/* Dummy text, replace with book.description if available */}
            quis Morbi lacus, vehicula, vehicula, vitae ex luctus odio felis, ex nisi Nunc quam hendrerit sapien lobortis, Nunc odio gravida sodales. amet, consectetur eget lacus facilisis gravida In cursus placerat enim. volutpat viverra maximus Sed <br/><br/>
            sit Vestibulum consectetur turpis sit elit Praesent urna Nam odio elit. sapien Nullam nisi faucibus efficitur. gravida Morbi non, In in viverra quis ipsum urna. sapien ultrices Nullam nulla, Nunc ullamcorper Quisque viverra leo. Nunc eget <br/><br/>
            Vestibulum quis varius dui. hendrerit vitae vitae dui. porta ultrices fringilla diam consectetur quis lorem. facilisis urna Morbi ullamcorper elit. Ut ex ex ultrices vitae id Sed dignissim, Nam eget fringilla Nam maximus lorem. non non, <br/><br/>
            ex at, at, id In vel gravida tempor nec Nullam Ut efficitur. malesuada consectetur vitae ipsum varius tincidunt tincidunt Nam scelerisque vitae dignissim, non ipsum malesuada nibh scelerisque sollicitudin. vehicula, tincidunt venenatis eu <br/><br/>
            nec nec Morbi Lorem turpis Praesent lobortis, sollicitudin. faucibus eget odio tempor dui nisl. Nullam ipsum ex non eget vehicula, felis, Nam Nullam est. eu nisl. varius tincidunt risus lacus facilisis urna ex. diam Cras tincidunt Nunc ex
          </div>
          <div className="h-0.5 w-full bg-stone-300 my-2" />
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-6">
              <div>
                <div className="text-[#FFE4C7] text-sm font-normal font-['Inter']">Harga</div>
                <div className="text-[#FFE4C7] text-xl font-normal font-['Inter']">{book.price}</div>
              </div>
              <div>
                <div className="text-[#FFE4C7] text-sm font-normal font-['Inter']">Kondisi</div>
                <div className="text-[#FFE4C7] text-xl font-normal font-['Inter']">{book.condition}</div>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              {/* button report */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); navigate('/login'); }}
                className="w-8 h-8 flex items-center justify-center rounded bg-transparent border border-[#FFE4C7]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#FFE4C7" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M12 2L2 22h20L12 2z" />
                  <circle cx="12" cy="16" r="1.5" fill="#FFE4C7" />
                  <path d="M12 10v3" stroke="#FFE4C7" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {/* button wishlist (guest -> redirect to login) */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); navigate('/login'); }}
                className="w-8 h-8 flex items-center justify-center rounded bg-transparent border border-[#FFE4C7]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#FFE4C7" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 4 8.5 4C10.5 4 12 6 12 6C12 6 13.5 4 15.5 4C17.5 4 20 5.5 20 8.5C20 13.5 12 21 12 21Z"/>
                </svg>
              </button>

              {/* button wa / beli (guest -> redirect to login) */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); navigate('/login'); }}
                className="w-20 h-8 px-3 py-1.5 bg-[#FFE4C7] rounded flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 32 32" fill="black">
                  <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.697 4.624 2.02 6.573L4 29l7.573-2.02A12.94 12.94 0 0016 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-2.162 0-4.267-.634-6.07-1.834l-.433-.273-4.498 1.2 1.2-4.498-.273-.433A10.96 10.96 0 016 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.297-7.425c-.297-.149-1.757-.867-2.029-.967-.273-.099-.472-.148-.67.15-.198.297-.767.967-.94 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.477-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.457.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.67-1.615-.917-2.211-.242-.582-.487-.502-.67-.511l-.571-.011c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.214 3.075.149.198 2.099 3.205 5.088 4.367.712.274 1.267.438 1.701.561.715.228 1.366.196 1.88.119.574-.085 1.757-.719 2.006-1.413.248-.694.248-1.288.174-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
                <span className="text-black text-base font-semibold font-['Inter']">Beli</span>
              </button>
            </div>
          </div>
        </div>
        <button className="absolute right-5 top-5 text-[#FFE4C7] text-2xl" onClick={onClose}>×</button>
      </div>
    </div>
  );
}

// Komponen Utama Halaman Kategori
export default function Category() {
  const [selectedBook, setSelectedBook] = useState(null);
  // kategori untuk filter (sama seperti Home.jsx)
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const categories = ['Semua', 'Humaniora', 'Saintek', 'Fiksi', 'Barter', 'Jual'];

  // Data dummy untuk buku-buku
  const books = [
    { id: 1, title: 'The Psychology of Money', author: 'Morgan Housel', price: 'Rp200,000', condition: 'Baru', category: 'Humaniora', imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71g2ednj0JL.jpg', isSold: false, isBarter: false },
    { id: 2, title: 'How Innovation Works', author: 'Matt Ridley', price: 'Barter', condition: 'Baru', category: 'Barter', imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81pQwUuQJzL.jpg', isSold: false, isBarter: true },
    { id: 3, title: 'Company of One', author: 'Paul Jarvis', price: 'Rp199,000', condition: 'Baru', category: 'Humaniora', imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81bPKTgQy-L.jpg', isSold: false, isBarter: false },
    { id: 4, title: 'Sapiens', author: 'Yuval Noah Harari', price: 'Rp400,000', condition: 'Baru', category: 'Fiksi', imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/713jIoMO3UL.jpg', isSold: false, isBarter: false },
    { id: 5, title: 'Zero to One', author: 'Peter Thiel', price: 'Rp200,000', condition: 'Baru', category: 'Humaniora', imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71m-MxdJ2WL.jpg', isSold: true, isBarter: false },
    { id: 6, title: 'Filosofi Teras', author: 'Henry Manampiring', price: 'Rp100,000', condition: 'Baru', category: 'Humaniora', imageUrl: 'https://cdn.gramedia.com/uploads/items/9786024813137_Filosofi_Teras.jpg', isSold: false, isBarter: false },
    { id: 7, title: 'The Winner Effect', author: 'Ian Robertson', price: 'Rp300,000', condition: 'Baru', category: 'Saintek', imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81vpsIs58WL.jpg', isSold: false, isBarter: false },
    { id: 8, title: 'The Art of Laziness', author: 'Library Mindset', price: 'Rp200,000', condition: 'Baru', category: 'Fiksi', imageUrl: 'https://cdn.gramedia.com/uploads/items/9786020632060.jpg', isSold: false, isBarter: false },
  ];

  return (
    <div className="w-[1020px] min-h-[828px] relative">
      {/* Filter Kategori (pixel-positioned pills sesuai desain) */}
      <div className="absolute left-0 top-0 z-10">
        <div className="w-[608px] h-8 flex items-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`h-8 px-3 rounded-xl inline-flex items-center justify-center ${selectedCategory === cat ? 'bg-[#FFE4C7] text-black' : 'bg-white/5 text-[#FFE4C7] outline outline-1 outline-offset-[-1px] outline-white backdrop-blur-[10px]'}`}
            >
              <div className="text-base font-normal font-['Inter']">{cat}</div>
            </button>
          ))}
        </div>
      </div>
      {/* Container Buku */}
      <div className="absolute left-0 top-[48px] w-full min-h-[780px] rounded-[20px] outline outline-1 outline-white overflow-hidden">
        <div className="w-full h-full bg-white/5 border border-white backdrop-blur-[10px] absolute inset-0 pointer-events-none" />
        <div className="absolute left-[20px] top-[16px] text-[#FFE4C7] text-xl font-semibold font-['Inter'] z-10">{selectedCategory}</div>
        <div className="pt-[56px] px-5 pb-5 relative z-10">
          <div className="grid grid-cols-4 gap-x-5 gap-y-6">
            { (selectedCategory === 'Semua' ? books : books.filter(b => b.category === selectedCategory)).map((book) => (
              <div key={book.id} onClick={() => setSelectedBook(book)} className="cursor-pointer">
                <BookCard {...book} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Modal Detail Buku */}
      <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
    </div>
  );
}