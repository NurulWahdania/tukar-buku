import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UploadReport() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch data dari backend saat komponen dimuat
  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (!token) {
            // Jika tidak ada token, arahkan ke login (opsional)
            navigate('/login');
            return;
        }

        const response = await fetch('http://localhost:8000/books/my-listings', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            setReports(data);
        } else {
            console.error("Failed to fetch listings");
            if (response.status === 401) {
                navigate('/login');
            }
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, [navigate]);

  const formatPrice = (v) => (v ? `Rp${v.toLocaleString()}` : '-');
  
  const formatDate = (dateString) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const StatusBadge = ({ status }) => {
    const normalizedStatus = status ? status.toLowerCase() : '';
    
    if (normalizedStatus === 'approved') {
      return <span className="px-3 py-1 rounded-md bg-Color1 text-black text-sm font-semibold">Diterima</span>;
    }
    if (normalizedStatus === 'pending') {
      return <span className="px-3 py-1 rounded-md bg-white/5 border border-Color1 text-Color1 text-sm font-semibold">Pending</span>;
    }
    // Rejected
    return <span className="px-3 py-1 rounded-md bg-red-600 text-white text-sm font-semibold">Ditolak</span>;
  };

  if (loading) return <div className="p-6 text-[#FFE4C7]">Memuat laporan...</div>;

  return (
    <div className="w-[1020px] relative">
      <div className="bg-white/5 rounded-[20px] border border-white/10 backdrop-blur-[10px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-Color1 text-xl font-semibold">Laporan Unggahan</h2>
          <div className="text-Color1 text-sm">Total: <span className="font-bold">{reports.length}</span></div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] table-auto text-Color1">
            <thead>
              <tr className="text-left text-sm font-semibold border-b border-zinc-300">
                <th className="py-3 px-4 w-12">No</th>
                <th className="py-3 px-4 w-40">Tanggal</th>
                <th className="py-3 px-4">Judul Buku</th>
                <th className="py-3 px-4 w-48">Author</th>
                <th className="py-3 px-4 w-28">Transaksi</th>
                <th className="py-3 px-4 w-32">Harga</th>
                <th className="py-3 px-4 w-36">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {reports.map((r, idx) => (
                <tr key={r.id} className="align-middle">
                  <td className="py-4 px-4 text-sm">{idx + 1}</td>
                  <td className="py-4 px-4 text-sm">{formatDate(r.created_at)}</td>
                  <td className="py-4 px-4 text-sm font-semibold">{r.title}</td>
                  <td className="py-4 px-4 text-sm">{r.author || '-'}</td>
                  <td className="py-4 px-4 text-sm">{r.is_barter ? 'Barter' : 'Jual'}</td>
                  <td className="py-4 px-4 text-sm">{r.is_barter ? '-' : formatPrice(r.price)}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <StatusBadge status={r.status_verifikasi} />
                    </div>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                  <tr>
                      <td colSpan="7" className="py-8 text-center text-white/50">Belum ada riwayat unggahan.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-Color1/60 text-sm">
          {/* Footer kecil — sesuai mock */}
          <div>Jika Anda ingin meninjau laporan lebih lanjut, buka detail unggahan pada setiap item.</div>
        </div>
      </div>
    </div>
  );
}