// src/pages/User/StoreProfile.jsx 
import React from 'react';

// (Komponen BookCard bisa dipindah ke src/components/)
function BookCard({ title, author, price, condition, imageUrl }) {
  // ... (Salin kode BookCard dari User/Home.jsx) ...
   return (
    <div className="w-60 h-96 rounded-xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] outline outline-1 outline-offset-[-1px] outline-white overflow-hidden">
      {/* ... isi BookCard ... */}
    </div>
  );
}

export default function StoreProfile() {
  return (
    <>
      {/* Konten 1: Kartu Profil Toko */}
      {/* Ganti top-[98px] jadi relative mb-5 */}
      <div className="w-[1020px] h-28 p-5 relative bg-white/5 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-white backdrop-blur-[10px] inline-flex justify-between items-center mb-5">
        <img className="w-20 h-20 rounded-full" src="https://placehold.co/80x80" alt="store avatar" />
        <div className="w-64 justify-start text-Color1 text-2xl font-semibold font-['Inter']">Collective</div>
        <div className="w-64 opacity-80 justify-start text-Color1 text-base font-semibold font-['Inter']">Rohsilia Gratia Simak</div>
        <div className="px-3 flex justify-start items-center gap-3">
          <div className="justify-start text-Color1 text-xl font-semibold font-['Inter']">4.0</div>
          <div className="w-6 h-6 bg-Color1" />
          <div className="w-7 h-0 origin-top-left rotate-90 outline outline-1 outline-offset-[-0.50px] outline-Color1"></div>
          <div className="justify-start text-Color1 text-xl font-semibold font-['Inter']">Produk : 4</div>
        </div>
      </div>

      {/* Konten 2: Grid Produk */}
      {/* Ganti left-[238px] top-[238px] jadi relative */}
      <div className="w-[1020px] h-96 relative rounded-[20px] outline outline-1 outline-offset-[-1px] outline-white overflow-hidden">
        <div className="w-[1020px] h-96 left-0 top-0 absolute bg-white/5 border border-white backdrop-blur-[10px]" />
        <div className="left-[20px] top-[16px] absolute justify-start text-Color1 text-xl font-semibold font-['Inter']">Semua Produk</div>
        
        {/* Grid Buku */}
        <div className="relative grid grid-cols-4 gap-x-5 gap-y-6 p-5 top-[56px] w-full">
          <BookCard title="The Psychology of Money" author="Morgan Housel" price="Rp200,000" condition="Baru" imageUrl="https://placehold.co/233x240" />
          <BookCard title="How Innovation Works" author="Matt Ridley" price="Rp200,000" condition="Baru" imageUrl="https://placehold.co/233x240" />
          <BookCard title="Company of One" author="Paul Jarvis" price="Rp200,000" condition="Baru" imageUrl="https://placehold.co/233x240" />
          <BookCard title="Sapiens" author="Yuval Noah Harari" price="Rp200,000" condition="Baru" imageUrl="https://placehold.co/233x240" />
        </div>
      </div>
    </>
  );
}