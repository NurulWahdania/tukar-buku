import React from 'react';
import { useNavigate } from 'react-router-dom';

// [FIX] Import ini menyebabkan error jika file belum ada secara fisik di folder tersebut.
// Silakan UNCOMMENT (hapus //) baris import di bawah ini SETELAH file 'bg-404.png' diletakkan di 'src/assets/images/'
// import bgImage from '../../assets/images/bg-404.png'; 

// Fallback sementara agar aplikasi bisa jalan tanpa error
const bgImage = null; 

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#1E1E1E] relative overflow-hidden">
      
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        {bgImage && (
          <img 
            src={bgImage} 
            alt="Background 404" 
            className="w-full h-full object-cover opacity-50"
          />
        )}
        {/* Gradient Overlay: Gelap di bawah dan atas agar teks kontras */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1E1E1E]/80 via-[#1E1E1E]/40 to-[#1E1E1E]" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 text-center px-6 max-w-3xl mt-[-50px]">
        <h1 className="text-[120px] md:text-[160px] font-bold text-[#FFE4C7] leading-none opacity-90 drop-shadow-2xl select-none">
          404
        </h1>
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-neutral-300 mb-10 text-lg md:text-xl drop-shadow-md max-w-xl mx-auto">
          Maaf, halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau tidak pernah ada.
        </p>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-xl border-2 border-[#FFE4C7] text-[#FFE4C7] hover:bg-[#FFE4C7]/10 transition-all font-semibold backdrop-blur-sm"
          >
            Kembali
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 rounded-xl bg-[#FFE4C7] text-black hover:bg-[#e6cdb0] transition-all font-semibold shadow-lg shadow-[#FFE4C7]/20"
          >
            Ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}
