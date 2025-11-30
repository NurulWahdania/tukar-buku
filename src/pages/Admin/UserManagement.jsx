// src/pages/Admin/UserManagement.jsx
import React, { useEffect, useState } from 'react';
import { useRef } from 'react';
import { getAllUsers, deleteUser } from '../../api/client';
import { createPortal } from 'react-dom';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null); // { id, username }
  const cancelBtnRef = useRef(null);

  // Disable body scroll when modal is open, restore on close
  useEffect(() => {
    if (confirmDeleteOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [confirmDeleteOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal memuat user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // buka modal konfirmasi hapus
  const requestDelete = (user) => {
    setDeleteCandidate({ id: user.id, username: user.username });
    setConfirmDeleteOpen(true);
  };

  const cancelDelete = () => {
    setConfirmDeleteOpen(false);
    setDeleteCandidate(null);
  };

  // fokus tombol Batal ketika modal muncul supaya modal terlihat dan aksesibel
  useEffect(() => {
    if (confirmDeleteOpen && cancelBtnRef.current) {
      // beri delay micro agar element benar-benar mounted
      setTimeout(() => cancelBtnRef.current?.focus(), 0);
    }
  }, [confirmDeleteOpen]);

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteUser(deleteCandidate.id);
      setUsers(prev => prev.filter(u => u.id !== deleteCandidate.id));
      setConfirmDeleteOpen(false);
      setDeleteCandidate(null);
    } catch (error) {
      console.error("Gagal menghapus user:", error);
      alert("Gagal menghapus user.");
    }
  };

  return (
    <div className="w-[1020px] mx-auto">
      <h2 className="text-[#FFE4C7] text-xl font-semibold mb-4">Manajemen Pengguna</h2>
      
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="grid grid-cols-[50px_1fr_1fr_1fr_100px] gap-4 p-4 border-b border-white/10 bg-white/5 font-bold text-[#FFE4C7]">
          <div>ID</div>
          <div>Username</div>
          <div>Email</div>
          <div>Role</div>
          <div>Aksi</div>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-[#FFE4C7]">Memuat data...</div>
          ) : users.map((user) => (
            <div key={user.id} className="grid grid-cols-[50px_1fr_1fr_1fr_100px] gap-4 p-4 border-b border-white/5 items-center hover:bg-white/5 transition-colors text-[#FFE4C7]">
              <div>{user.id}</div>
              <div className="flex items-center gap-3">
                <img src={user.profile_photo_url || `https://ui-avatars.com/api/?name=${user.username}`} className="w-8 h-8 rounded-full object-cover" alt="" />
                {user.username}
              </div>
              <div className="truncate">{user.email}</div>
              <div>
                <span className={`px-2 py-1 rounded text-xs ${user.role?.name === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                  {user.role?.name || 'User'}
                </span>
              </div>
              <div>
                {user.role?.name !== 'admin' && (
                  <button 
                    onClick={() => requestDelete(user)}
                    className="h-10 px-3 py-2 bg-red-600 rounded-[10px] text-white font-semibold"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CONFIRM DELETE MODAL (render via portal agar selalu di atas layout) */}
      {createPortal(
        confirmDeleteOpen ? (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center pointer-events-auto" role="presentation">
            <div
              className="absolute inset-0 bg-black/90 pointer-events-auto"
              onClick={cancelDelete}
              aria-hidden="true"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-modal-title"
              className="relative z-[1000000] w-96 p-6 bg-[#06070a] border border-white/10 rounded-xl shadow-2xl text-center pointer-events-auto"
            >
              <h3 className="text-[#FFE4C7] text-lg font-semibold mb-4">Yakin ingin menghapus?</h3>
              <p id="delete-modal-title" className="text-[#CDBA9A] mb-6">Hapus: <span className="text-white font-semibold">{deleteCandidate?.username}</span></p>
              <div className="flex justify-center gap-4">
                <button ref={cancelBtnRef} onClick={cancelDelete} className="px-5 py-2 border border-white/20 rounded-lg text-[#FFE4C7] hover:bg-white/10 transition">Batal</button>
                <button onClick={confirmDelete} className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition">Hapus</button>
              </div>
            </div>
          </div>
        ) : null,
        document.body
      )}
    </div>
  );
}