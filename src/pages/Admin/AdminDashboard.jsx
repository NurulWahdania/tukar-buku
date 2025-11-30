// src/pages/Admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import AdminLayouts from '../../layouts/AdminLayouts'; // wrap ke layout
// import { getDashboardStats } from '../../api/client'; // Removed to use direct fetch

export default function AdminDashboard() {
  // State untuk menyimpan data statistik
  const [stats, setStats] = useState({
    users_today: 0,
    users_growth: 0, // Tambahan untuk persentase
    total_users: 0,
    total_growth: 0, // Tambahan untuk persentase
    reports_today: 0,
    reports_growth: 0 // Tambahan untuk persentase
  });

  // Fetch data saat komponen dimuat
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (!token) return;

        // Panggil endpoint baru di backend
        const response = await fetch('http://localhost:8000/reports/dashboard-stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            setStats({
                users_today: data.users_today || 0, 
                users_growth: data.users_growth || 0,
                total_users: data.total_users || 0,
                total_growth: data.total_growth || 0,
                reports_today: data.reports_today || 0,
                reports_growth: data.reports_growth || 0
            });
        } else {
            console.error("Gagal mengambil data statistik dashboard");
        }
      } catch (error) {
        console.error("Gagal memuat statistik:", error);
      }
    };
    fetchStats();
  }, []);

  // Helper untuk format persentase (misal: 5 jadi "+5%", -5 jadi "-5%")
  const formatGrowth = (val) => {
    const num = Number(val);
    if (isNaN(num)) return "0%";
    return num > 0 ? `+${num}%` : `${num}%`;
  };

  const Cards = (
    <>
      {/* Kartu 1 */}
      <div className="w-80 h-48 p-4 left-[300px] top-[98px] absolute bg-neutral-300/10 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/0 backdrop-blur-lg inline-flex flex-col justify-between items-start z-30">
        <div className="w-72 inline-flex justify-start items-start gap-5">
          <div className="w-52 inline-flex flex-col justify-start items-start gap-4">
            <div className="self-stretch justify-start text-[#FFE4C7] text-base font-bold font-['Inter']">Jumlah Pengguna Hari Ini</div>
            <div className="self-stretch justify-start text-white text-3xl font-bold font-['Inter']">{stats.users_today}</div>
          </div>
          <div className="w-16 h-16 flex items-center justify-center">
            {/* Calendar icon */}
            <svg className="w-10 h-10 text-[#FFE4C7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
        </div>
        <div className="justify-start">
            <span className="text-[#FFE4C7] text-base font-bold font-['Inter']">{formatGrowth(stats.users_growth)} </span>
            <span className="text-[#FFE4C7] text-base font-normal font-['Inter']">Sejak kemarin</span>
        </div>
      </div>

      {/* Kartu 2 */}
      <div className="w-80 h-48 p-4 left-[645px] top-[98px] absolute bg-neutral-300/10 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/0 backdrop-blur-lg inline-flex flex-col justify-between items-start z-30">
        <div className="w-72 inline-flex justify-start items-start gap-5">
          <div className="w-52 inline-flex flex-col justify-start items-start gap-4">
            <div className="self-stretch justify-start text-[#FFE4C7] text-base font-bold font-['Inter']">Total Pengguna</div>
            <div className="self-stretch justify-start text-white text-3xl font-bold font-['Inter']">{stats.total_users}</div>
          </div>
          <div className="w-16 h-16 flex items-center justify-center">
            {/* Users icon */}
            <svg className="w-10 h-10 text-[#FFE4C7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M7 21v-2a4 4 0 0 1 3-3.87" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>
        <div className="justify-start">
            <span className="text-[#FFE4C7] text-base font-bold font-['Inter']">{formatGrowth(stats.total_growth)} </span>
            <span className="text-[#FFE4C7] text-base font-normal font-['Inter']">Sejak kemarin</span>
        </div>
      </div>

      {/* Kartu 3 */}
      <div className="w-80 h-48 p-4 left-[990px] top-[98px] absolute bg-neutral-300/10 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/0 backdrop-blur-lg inline-flex flex-col justify-between items-start z-30">
        <div className="w-72 inline-flex justify-start items-start gap-5">
          <div className="w-52 inline-flex flex-col justify-start items-start gap-4">
            <div className="self-stretch justify-start text-[#FFE4C7] text-base font-bold font-['Inter']">Jumlah Laporan Hari Ini</div>
            <div className="self-stretch justify-start text-white text-3xl font-bold font-['Inter']">{stats.reports_today}</div>
          </div>
          <div className="w-16 h-16 flex items-center justify-center">
            {/* Alert / report icon */}
            <svg className="w-10 h-10 text-[#FFE4C7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <circle cx="12" cy="16" r="1" />
            </svg>
          </div>
        </div>
        <div className="justify-start">
            <span className="text-[#FFE4C7] text-base font-bold font-['Inter']">{formatGrowth(stats.reports_growth)} </span>
            <span className="text-[#FFE4C7] text-base font-normal font-['Inter']">Sejak kemarin</span>
        </div>
      </div>
    </>
  );

  return <AdminLayouts>{Cards}</AdminLayouts>;
}