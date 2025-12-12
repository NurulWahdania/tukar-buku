// src/pages/User/SecurityTips.jsx
import React, { useState, useEffect } from 'react';

export default function SecurityTips() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/security-tips/')
      .then(res => res.json())
      .then(data => setTips(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[#FFE4C7] text-center p-6">Memuat tips keamanan...</div>;

  return (
    <div className="w-[1020px] relative">
      <div className="bg-white/5 rounded-[20px] border border-white backdrop-blur-[10px] p-6">
        <div className="text-[#FFE4C7] text-xl font-semibold mb-4">Tips Keamanan Transaksi</div>
        <div className="space-y-4 text-[#FFE4C7] text-base font-medium">
          {tips.length === 0 ? (
              <p className="opacity-60">Belum ada tips keamanan.</p>
          ) : (
              tips.map((item, index) => (
                <div key={item.id}>
                    {/* [UBAH] Menggunakan title & content */}
                    <div className="font-semibold">{index + 1}. {item.title}</div>
                    <p className="mt-2 break-words whitespace-pre-line opacity-90">{item.content}</p>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}