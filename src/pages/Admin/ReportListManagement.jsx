// src/pages/Admin/ReportListManagement.jsx
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getReports, deleteReport, deleteUser, warnUser } from '../../api/client';

export default function ReportListManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null); // { id, label }
  const cancelBtnRef = useRef(null);

  // State untuk Modal Profil
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // State untuk Modal Peringatan
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningTarget, setWarningTarget] = useState(null); // { id, name }
  const [warningMessage, setWarningMessage] = useState("");

  // State untuk Modal Blokir
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockTarget, setBlockTarget] = useState(null); // { id, name }

  // State untuk Modal Sukses (Baru)
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // disable body scroll while modal open
  useEffect(() => {
    if (confirmDeleteOpen || profileModalOpen || warningModalOpen || blockModalOpen || successModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [confirmDeleteOpen, profileModalOpen, warningModalOpen, blockModalOpen, successModalOpen]);

  // Helper Modal Sukses
  const showSuccessModal = (msg) => {
      setSuccessMessage(msg);
      setSuccessModalOpen(true);
  };
  const closeSuccessModal = () => {
      setSuccessModalOpen(false);
      setSuccessMessage("");
  };

  // Fetch Data Laporan
  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getReports();
      setRows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal memuat laporan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // request delete -> open confirm modal
  const requestDeleteReport = (id) => {
    setDeleteCandidate({ id, label: 'laporan' });
    setConfirmDeleteOpen(true);
  };
  
  const cancelDelete = () => {
    setConfirmDeleteOpen(false);
    setDeleteCandidate(null);
  };
  
  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteReport(deleteCandidate.id);
      setRows(prev => prev.filter(r => r.id !== deleteCandidate.id));
      setConfirmDeleteOpen(false);
      setDeleteCandidate(null);
      showSuccessModal("Laporan berhasil dihapus."); // Tampilkan modal sukses
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus laporan.");
      setConfirmDeleteOpen(false);
      setDeleteCandidate(null);
    }
  };

  // Handler Blokir Akun (Membuka Modal)
  const handleBlockUser = (userId, username) => {
    if (!userId) return;
    setBlockTarget({ id: userId, name: username || "User" });
    setBlockModalOpen(true);
  };

  // Handler Submit Blokir
  const submitBlockUser = async () => {
    if (!blockTarget) return;
    try {
        await deleteUser(blockTarget.id); 
        setBlockModalOpen(false);
        setBlockTarget(null);
        showSuccessModal(`Akun ${blockTarget.name} berhasil diblokir.`); // Tampilkan modal sukses
        fetchReports(); // Refresh data
    } catch (error) {
        console.error("Gagal memblokir akun:", error);
        alert("Gagal memblokir akun.");
    }
  };

  const closeBlockModal = () => {
      setBlockModalOpen(false);
      setBlockTarget(null);
  };

  // Handler Peringatan (Membuka Modal)
  const handleWarnUser = (userId, username) => {
    if (!userId) {
        alert("User tidak ditemukan (mungkin sudah dihapus).");
        return;
    }
    setWarningTarget({ id: userId, name: username || "User" });
    setWarningMessage("Kami menerima laporan terkait aktivitas akun Anda. Harap patuhi aturan komunitas.");
    setWarningModalOpen(true);
  };

  // Handler Submit Peringatan
  const submitWarning = async () => {
    if (!warningTarget) return;
    
    try {
        await warnUser({ user_id: warningTarget.id, message: warningMessage });
        setWarningModalOpen(false);
        setWarningTarget(null);
        showSuccessModal(`Peringatan berhasil dikirim ke ${warningTarget.name}.`); // Tampilkan modal sukses
    } catch (error) {
        console.error("Gagal mengirim peringatan:", error);
        alert("Gagal mengirim peringatan.");
    }
  };

  const closeWarningModal = () => {
      setWarningModalOpen(false);
      setWarningTarget(null);
  };

  // Handler Lihat Profil
  const handleViewProfile = (user) => {
    if (!user) return;
    setSelectedProfile(user);
    setProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setProfileModalOpen(false);
    setSelectedProfile(null);
  };

  return (
    <div className="w-[1020px] relative mx-auto">
      {/* glass panel background */}
      <div className="absolute inset-0 rounded-xl bg-neutral-300/10 backdrop-blur-lg -z-10" />

      <div className="relative rounded-[20px] overflow-hidden">
        <div className="bg-transparent p-6">
          <h2 className="text-[#FFE4C7] text-xl font-semibold mb-4">Riwayat Laporan</h2>

          <div className="bg-neutral-300/10 rounded-xl outline outline-1 outline-white/0 backdrop-blur-lg overflow-hidden">
            {/* table header */}
            <div className="grid grid-cols-[56px_200px_200px_1fr_340px] items-center gap-4 px-4 py-3 border-b border-zinc-300">
              <div className="text-[#FFE4C7] text-base font-bold">No</div>
              <div className="text-[#FFE4C7] text-base font-bold">Terlapor</div>
              <div className="text-[#FFE4C7] text-base font-bold">Pelapor</div>
              <div className="text-[#FFE4C7] text-base font-bold">Deskripsi</div>
              <div className="text-[#FFE4C7] text-base font-bold text-right">Aksi</div>
            </div>

            {/* table body (scrollable) */}
            <div className="max-h-[520px] overflow-auto">
              {loading ? (
                <div className="p-6 text-center text-[#FFE4C7]">Memuat data laporan...</div>
              ) : rows.length === 0 ? (
                <div className="p-6 text-center text-[#FFE4C7] opacity-60">Tidak ada laporan masuk.</div>
              ) : (
                rows.map((r, index) => (
                  <div key={r.id} className="grid grid-cols-[56px_200px_200px_1fr_340px] items-center gap-4 px-4 py-3 border-b border-zinc-300 hover:bg-white/5 transition-colors">
                    <div className="text-[#FFE4C7] text-base font-semibold">{index + 1}</div>
                    
                    {/* Terlapor */}
                    <div 
                        className="text-[#FFE4C7] text-base font-semibold truncate cursor-pointer hover:text-white hover:underline" 
                        title="Klik untuk lihat profil"
                        onClick={() => handleViewProfile(r.terlapor)}
                    >
                        {r.terlapor?.username || "Unknown"}
                    </div>
                    
                    {/* Pelapor */}
                    <div 
                        className="text-[#FFE4C7] text-base font-semibold truncate cursor-pointer hover:text-white hover:underline" 
                        title="Klik untuk lihat profil"
                        onClick={() => handleViewProfile(r.pelapor)}
                    >
                        {r.pelapor?.username || "Anonim"}
                    </div>
                    
                    {/* Deskripsi */}
                    <div className="text-[#FFE4C7] text-base font-semibold truncate" title={r.deskripsi}>
                        {r.deskripsi || "-"}
                    </div>

                    {/* Aksi */}
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => requestDeleteReport(r.id)}
                        className="h-9 px-3 rounded-[8px] bg-white/10 border border-white/20 text-white text-xs font-semibold hover:bg-white/20"
                      >
                        Hapus Laporan
                      </button>

                      <button
                        type="button"
                        onClick={() => handleWarnUser(r.terlapor?.id, r.terlapor?.username)}
                        className="h-9 px-3 rounded-[8px] bg-amber-500/80 text-black text-xs font-semibold hover:bg-amber-500"
                      >
                        Peringatan
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBlockUser(r.terlapor?.id, r.terlapor?.username)}
                        className="h-9 px-3 rounded-[8px] bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                      >
                        Blok Akun
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM DELETE MODAL FOR REPORT (portal) */}
      {createPortal(
        confirmDeleteOpen ? (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center" role="presentation">
            <div className="absolute inset-0 bg-black/90" onClick={cancelDelete} aria-hidden="true" />
            <div role="dialog" aria-modal="true" aria-labelledby="confirm-delete-report" className="relative z-[1000000] w-96 p-6 bg-[#06070a] border border-white/10 rounded-xl shadow-2xl text-center">
              <h3 className="text-[#FFE4C7] text-lg font-semibold mb-4">Yakin ingin menghapus?</h3>
              <p id="confirm-delete-report" className="text-[#CDBA9A] mb-6">Hapus laporan ini dari daftar.</p>
              <div className="flex justify-center gap-4">
                <button ref={cancelBtnRef} onClick={cancelDelete} className="px-5 py-2 border border-white/20 rounded-lg text-[#FFE4C7] hover:bg-white/10 transition">Batal</button>
                <button onClick={confirmDelete} className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition">Hapus</button>
              </div>
            </div>
          </div>
        ) : null,
        document.body
      )}

      {/* PROFILE MODAL (portal) */}
      {createPortal(
        profileModalOpen && selectedProfile ? (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center" role="presentation">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeProfileModal} aria-hidden="true" />
            <div className="relative z-[1000000] w-[400px] bg-[#18181b] border border-[#FFE4C7]/20 rounded-2xl p-6 shadow-2xl transform transition-all scale-100">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-[#FFE4C7]">Profil Pengguna</h3>
                    <button onClick={closeProfileModal} className="text-white/50 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-zinc-700 overflow-hidden border-2 border-[#FFE4C7] mb-4">
                        {selectedProfile.profile_photo_url ? (
                            <img src={selectedProfile.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#FFE4C7]">
                                {selectedProfile.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <h4 className="text-lg font-semibold text-white">{selectedProfile.nama_lengkap || selectedProfile.username}</h4>
                    <span className="text-sm text-[#FFE4C7]/70">@{selectedProfile.username}</span>
                </div>

                <div className="space-y-4">
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                        <label className="text-xs text-[#FFE4C7]/60 block mb-1">Email</label>
                        <div className="text-white text-sm">{selectedProfile.email}</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                        <label className="text-xs text-[#FFE4C7]/60 block mb-1">Nomor HP</label>
                        <div className="text-white text-sm">{selectedProfile.nomor_hp || "-"}</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                        <label className="text-xs text-[#FFE4C7]/60 block mb-1">Jurusan</label>
                        <div className="text-white text-sm">{selectedProfile.jurusan || "-"}</div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={closeProfileModal}
                        className="px-4 py-2 rounded-lg bg-[#FFE4C7] text-black font-bold hover:bg-[#ffdec0] transition text-sm"
                    >
                        Tutup
                    </button>
                </div>
            </div>
          </div>
        ) : null,
        document.body
      )}

      {/* WARNING MODAL (portal) */}
      {createPortal(
        warningModalOpen && warningTarget ? (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center" role="presentation">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeWarningModal} aria-hidden="true" />
            <div className="relative z-[1000000] w-[500px] bg-[#18181b] border border-[#FFE4C7]/20 rounded-2xl p-6 shadow-2xl transform transition-all scale-100">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-[#FFE4C7]">Kirim Peringatan</h3>
                    <button onClick={closeWarningModal} className="text-white/50 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <p className="text-white/70 mb-4 text-sm">
                    Kirim pesan peringatan kepada <span className="font-semibold text-white">{warningTarget.name}</span>.
                </p>

                <div className="mb-6">
                    <label className="block text-[#FFE4C7] text-xs font-medium mb-2">Pesan Peringatan</label>
                    <textarea 
                        className="w-full bg-white/5 border border-[#FFE4C7]/30 rounded-lg p-3 text-[#FFE4C7] text-sm focus:outline-none focus:border-[#FFE4C7] focus:ring-1 focus:ring-[#FFE4C7] transition-all resize-none placeholder-white/20"
                        rows="4"
                        value={warningMessage}
                        onChange={(e) => setWarningMessage(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={closeWarningModal}
                        className="px-4 py-2 rounded-lg border border-white/20 text-[#FFE4C7] hover:bg-white/5 transition text-sm font-medium"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={submitWarning}
                        className="px-4 py-2 rounded-lg bg-amber-500 text-black font-bold hover:bg-amber-400 transition text-sm shadow-lg shadow-amber-500/20"
                    >
                        Kirim Peringatan
                    </button>
                </div>
            </div>
          </div>
        ) : null,
        document.body
      )}

      {/* BLOCK MODAL (portal) */}
      {createPortal(
        blockModalOpen && blockTarget ? (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center" role="presentation">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeBlockModal} aria-hidden="true" />
            <div className="relative z-[1000000] w-[400px] bg-[#18181b] border border-red-600/30 rounded-2xl p-6 shadow-2xl transform transition-all scale-100 text-center">
                <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                
                <h3 className="text-xl font-bold text-red-500 mb-2">Blokir Akun?</h3>
                
                <p className="text-white/70 mb-6 text-sm leading-relaxed">
                    Apakah Anda yakin ingin memblokir akun <span className="font-semibold text-white">{blockTarget.name}</span>? 
                    <br/><span className="text-red-400/80 text-xs">Tindakan ini akan menghapus akses pengguna secara permanen.</span>
                </p>

                <div className="flex justify-center gap-3">
                    <button 
                        onClick={closeBlockModal}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-[#FFE4C7] hover:bg-white/5 transition text-sm font-medium"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={submitBlockUser}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition text-sm shadow-lg shadow-red-600/20"
                    >
                        Ya, Blokir
                    </button>
                </div>
            </div>
          </div>
        ) : null,
        document.body
      )}

      {/* SUCCESS MODAL (portal) */}
      {createPortal(
        successModalOpen ? (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center" role="presentation">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeSuccessModal} aria-hidden="true" />
            <div className="relative z-[1000000] w-[400px] bg-[#18181b] border border-green-500/30 rounded-2xl p-6 shadow-2xl transform transition-all scale-100 text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                
                <h3 className="text-xl font-bold text-green-500 mb-2">Berhasil</h3>
                
                <p className="text-white/70 mb-6 text-sm leading-relaxed">
                    {successMessage}
                </p>

                <div className="flex justify-center">
                    <button 
                        onClick={closeSuccessModal}
                        className="w-full px-4 py-2.5 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition text-sm shadow-lg shadow-green-600/20"
                    >
                        Tutup
                    </button>
                </div>
            </div>
          </div>
        ) : null,
        document.body
      )}
    </div>
  );
}