// src/pages/Admin/AboutManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function AboutManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal & form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', body: '' });
  const [editingId, setEditingId] = useState(null);

  // confirm delete modal state
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null); // { id, title }
  const cancelBtnRef = useRef(null);

  // 1. Fetch Data from Backend
  const fetchContent = async () => {
    setLoading(true);
    try {
        const res = await fetch('http://localhost:8000/about/');
        if (res.ok) {
            const data = await res.json();
            // Map backend fields (judul, isi) to frontend (title, body)
            const mapped = data.map(item => ({
                id: item.id,
                title: item.judul,
                body: item.isi
            }));
            setItems(mapped);
        }
    } catch (err) {
        console.error("Failed to fetch about content", err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
    
    function onKey(e) {
      if (e.key === 'Escape') setIsModalOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // disable body scroll while confirm modal open
  useEffect(() => {
    if (confirmDeleteOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [confirmDeleteOpen]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setForm({ title: '', body: '' });
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!form.title.trim()) return alert('Judul wajib diisi');
    
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) return alert("Unauthorized");

    try {
        if (editingId) {
            // UPDATE
            const res = await fetch(`http://localhost:8000/about/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ judul: form.title, isi: form.body })
            });
            if (!res.ok) throw new Error("Gagal update");
        } else {
            // CREATE
            const res = await fetch(`http://localhost:8000/about/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ judul: form.title, isi: form.body })
            });
            if (!res.ok) throw new Error("Gagal simpan");
        }
        fetchContent(); // Refresh list
        closeModal();
    } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan saat menyimpan data.");
    }
  };

  // request delete -> open confirm modal
  const requestDelete = (it) => {
    setDeleteCandidate({ id: it.id, title: it.title });
    setConfirmDeleteOpen(true);
  };

  const cancelDelete = () => {
    setConfirmDeleteOpen(false);
    setDeleteCandidate(null);
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    try {
        const res = await fetch(`http://localhost:8000/about/${deleteCandidate.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setItems(prev => prev.filter(it => it.id !== deleteCandidate.id));
        } else {
            alert("Gagal menghapus data.");
        }
    } catch (error) {
        console.error(error);
    }
    
    if (editingId === deleteCandidate.id) closeModal();
    setConfirmDeleteOpen(false);
    setDeleteCandidate(null);
  };

  const openEdit = (it) => {
    setEditingId(it.id);
    setForm({ title: it.title, body: it.body });
    setIsModalOpen(true);
  };

  return (
    <div className="w-[1020px] relative mx-auto rounded-[20px] overflow-hidden">
      {/* glass background */}
      <div className="absolute inset-0 rounded-xl bg-neutral-300/10 backdrop-blur-lg -z-10" />

      <div className="relative p-6">
        <h2 className="text-[#FFE4C7] text-xl font-semibold mb-4">List Tentang</h2>

        <div className="bg-neutral-300/10 rounded-xl outline outline-1 outline-white/0 backdrop-blur-lg overflow-hidden">
          {/* table header */}
          <div className="grid grid-cols-[64px_220px_1fr_240px] items-center gap-4 px-4 py-3 border-b border-zinc-300">
            <div className="text-[#FFE4C7] text-base font-bold">No</div>
            <div className="text-[#FFE4C7] text-base font-bold">Judul</div>
            <div className="text-[#FFE4C7] text-base font-bold">Isi</div>
            <div className="text-[#FFE4C7] text-base font-bold text-right">Aksi</div>
          </div>

          {/* table body (scrollable) */}
          <div className="max-h-[320px] overflow-auto">
            {loading ? (
                <div className="p-4 text-[#FFE4C7] text-center">Memuat data...</div>
            ) : items.length === 0 ? (
                <div className="p-4 text-[#FFE4C7] text-center opacity-60">Belum ada konten.</div>
            ) : (
                items.map((it, idx) => (
                <div key={it.id} className="grid grid-cols-[64px_220px_1fr_240px] items-start gap-4 px-4 py-4 border-b border-zinc-300">
                    <div className="text-[#FFE4C7] text-base font-semibold pt-1">{idx + 1}</div>
                    <div className="text-[#FFE4C7] text-base font-semibold pt-1">{it.title}</div>
                    <div className="text-[#FFE4C7] text-sm leading-relaxed whitespace-pre-line">{it.body}</div>
                    <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        className="h-10 px-4 rounded-[10px] bg-red-600 text-white text-sm font-semibold"
                        onClick={() => requestDelete(it)}
                    >
                        Hapus
                    </button>
                    <button
                        type="button"
                        className="h-10 px-4 rounded-[10px] bg-[#FFE4C7] text-black text-sm font-semibold"
                        onClick={() => openEdit(it)}
                    >
                        Edit
                    </button>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>

        {/* tambah tombol di kanan bawah panel */}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="h-10 px-4 rounded-xl bg-white/5 border border-[#FFE4C7] text-[#FFE4C7]"
            onClick={openModal}
          >
            Tambah Tentang
          </button>
        </div>
      </div>

      {/* MODAL: Form Tambah Tentang (render via portal supaya selalu paling depan) */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center" role="dialog" aria-modal="true" aria-label={editingId ? 'Edit Tentang' : 'Form Tambah Tentang'}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative z-[100000] w-[1020px] h-96 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/0 bg-black/60 backdrop-blur-lg p-6">
            <div className="absolute inset-0 rounded-xl border border-white/0 backdrop-blur-lg" />
            <div className="absolute left-[20px] top-[16px] text-[#FFE4C7] text-xl font-semibold font-['Inter']">{editingId ? 'Edit Tentang' : 'Form Tambah Tentang'}</div>

            <label className="absolute left-[20px] top-[56px] text-[#FFE4C7] text-xs font-medium font-['Inter']">Judul</label>
            <input
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              className="absolute w-[474px] h-10 left-[20px] top-[75px] bg-white/5 rounded-lg border border-[#FFE4C7] px-3 text-[#FFE4C7] outline-none"
            />

            <label className="absolute left-[526px] top-[56px] text-[#FFE4C7] text-xs font-medium font-['Inter']">Isi</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))}
              className="absolute w-[474px] h-60 left-[526px] top-[75px] bg-white/5 rounded-lg border border-[#FFE4C7] px-3 py-2 text-[#FFE4C7] outline-none resize-none"
            />

            <button
              onClick={closeModal}
              className="absolute w-24 h-8 left-[390px] top-[331px] bg-white/5 rounded border border-[#FFE4C7] text-[#FFE4C7] text-xs font-medium"
            >
              Batal
            </button>
            <button
              onClick={handleAdd}
              className="absolute w-24 h-8 left-[510px] top-[331px] bg-[#FFE4C7] rounded text-black text-xs font-medium"
            >
              {editingId ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* CONFIRM DELETE MODAL FOR ABOUT (portal) */}
      {createPortal(
        confirmDeleteOpen ? (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center" role="presentation">
            <div className="absolute inset-0 bg-black/90" onClick={cancelDelete} aria-hidden="true" />
            <div role="dialog" aria-modal="true" aria-labelledby="confirm-delete-about" className="relative z-[1000000] w-96 p-6 bg-[#06070a] border border-white/10 rounded-xl shadow-2xl text-center">
              <h3 className="text-[#FFE4C7] text-lg font-semibold mb-4">Yakin ingin menghapus?</h3>
              <p id="confirm-delete-about" className="text-[#CDBA9A] mb-6">Hapus item: <span className="text-white font-semibold">{deleteCandidate?.title}</span></p>
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