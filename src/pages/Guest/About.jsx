// src/pages/Guest/About.jsx
import React, { useState, useEffect } from 'react';

export default function About() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/about/')
      .then(res => res.json())
      .then(data => setContents(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
      return <div className="text-[#FFE4C7] text-center p-10">Memuat informasi...</div>;
  }

  if (contents.length === 0) {
      return <div className="text-[#FFE4C7] text-center p-10 opacity-60">Belum ada informasi.</div>;
  }

  return (
    <div className="max-w-[1020px] mx-auto space-y-6">
      {contents.map((item) => (
        <section key={item.id} className="bg-white/5 border border-white/10 rounded-[20px] backdrop-blur-[10px] p-6">
            {/* [UBAH] Menggunakan title & content */}
            <h2 className="text-[#FFE4C7] text-xl font-semibold mb-2 w-full">{item.title}</h2>
            <div className="text-[#FFE4C7] text-base leading-relaxed w-full whitespace-normal break-words whitespace-pre-line">
            {item.content}
            </div>
        </section>
      ))}
    </div>
  );
}