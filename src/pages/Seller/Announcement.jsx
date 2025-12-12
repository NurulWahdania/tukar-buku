// src/pages/User/Announcement.jsx
import React, { useState, useEffect } from 'react';

export default function Announcement() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/announcements/')
      .then(res => res.json())
      .then(data => setAnnouncements(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[#FFE4C7] text-center p-6">Memuat pengumuman...</div>;

  return (
    <div className="w-[1020px] relative">
      <div className="bg-white/5 rounded-[20px] border border-white backdrop-blur-[10px] p-6">
        <div className="text-[#FFE4C7] text-xl font-semibold mb-3">Pengumuman</div>
        <div className="space-y-6 text-[#FFE4C7] text-base font-medium">
          {announcements.length === 0 ? (
              <p className="opacity-60">Tidak ada pengumuman terbaru.</p>
          ) : (
              announcements.map((item) => (
                  <div key={item.id} className="border-b border-white/10 pb-4 last:border-0">
                      {/* [UBAH] Menggunakan title & content */}
                      <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                      <p className="break-words whitespace-pre-line opacity-90">{item.content}</p>
                  </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}