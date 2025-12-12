// src/pages/Admin/SecurityTipsManagement.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function SecurityTipsManagement() {
  // state untuk daftar tips (dapat ditambah/edit/hapus)
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal & form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', body: '' });
  const [editingId, setEditingId] = useState(null);

  // confirm delete modal state
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null); // { id, title }
  const cancelDeleteBtnRef = React.useRef(null);

  // 1. Fetch Data
  const fetchTips = async () => {
    setLoading(true);
    try {
        const res = await fetch('http://localhost:8000/security-tips/');
        if (res.ok) {
            const data = await res.json();
            const mapped = data.map(item => ({
                id: item.id,
                // [UBAH] Mapping dari backend (title, content)
                title: item.title,
                body: item.content
            }));
            setTips(mapped);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      fetchTips();
  }, []);

  // disable body scroll while confirm modal open
  React.useEffect(() => {
    if (confirmDeleteOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [confirmDeleteOpen]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ title: '', body: '' });
    setIsModalOpen(true);
  };
  const openEdit = (t) => {
    setEditingId(t.id);
    setForm({ title: t.title, body: t.body });
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setForm({ title: '', body: '' });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return alert('Judul wajib diisi');
    
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) return alert("Unauthorized");

    try {
        // [UBAH] Payload menggunakan 'title' dan 'content'
        const payload = { title: form.title, content: form.body };

        if (editingId) {
            // UPDATE
            const res = await fetch(`http://localhost:8000/security-tips/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Gagal update");
        } else {
            // CREATE
            const res = await fetch(`http://localhost:8000/security-tips/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Gagal simpan");
        }
        fetchTips();
        closeModal();
    } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan.");
    }
  };

  // request delete -> open confirm modal
  const requestDelete = (t) => {
    setDeleteCandidate({ id: t.id, title: t.title });
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
        const res = await fetch(`http://localhost:8000/security-tips/${deleteCandidate.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setTips(prev => prev.filter(t => t.id !== deleteCandidate.id));
        } else {
            alert("Gagal menghapus.");
        }
    } catch (error) {
        console.error(error);
    }

    setConfirmDeleteOpen(false);
    setDeleteCandidate(null);
  };

  return (
    <div className="w-[1020px] relative mx-auto rounded-[20px] overflow-hidden">
      <div className="absolute inset-0 rounded-xl bg-neutral-300/10 backdrop-blur-lg -z-10" />

      <div className="relative p-6">
        <h2 className="text-[#FFE4C7] text-xl font-semibold mb-4">Tips Keamanan Transaksi</h2>

        <div className="bg-neutral-300/10 rounded-xl outline outline-1 outline-white/0 backdrop-blur-lg overflow-hidden">
          <div className="grid grid-cols-[56px_220px_1fr_200px] items-center gap-4 px-4 py-3 border-b border-zinc-300">
            <div className="text-[#FFE4C7] text-base font-bold">No</div>
            <div className="text-[#FFE4C7] text-base font-bold">Judul</div>
            <div className="text-[#FFE4C7] text-base font-bold">Isi</div>
            <div className="text-[#FFE4C7] text-base font-bold text-right">Aksi</div>
          </div>

          <div className="max-h-[320px] overflow-auto">
            {loading ? (
                <div className="p-4 text-[#FFE4C7] text-center">Memuat data...</div>
            ) : tips.length === 0 ? (
                <div className="p-4 text-[#FFE4C7] text-center opacity-60">Belum ada tips keamanan.</div>
            ) : (
                tips.map((t, idx) => (
                <div key={t.id} className="grid grid-cols-[56px_220px_1fr_200px] items-start gap-4 px-4 py-4 border-b border-zinc-300">
                    <div className="text-[#FFE4C7] text-base font-semibold pt-1">{idx + 1}</div>
                    <div className="text-[#FFE4C7] text-base font-semibold pt-1">{t.title}</div>
                    <div className="text-[#FFE4C7] text-sm leading-relaxed whitespace-pre-line">{t.body}</div>
                    <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        className="h-10 px-4 rounded-[10px] bg-red-600 text-white text-sm font-semibold"
                        onClick={() => requestDelete(t)}
                    >
                        Hapus
                    </button>
                    <button
                        type="button"
                        className="h-10 px-4 rounded-[10px] bg-[#FFE4C7] text-black text-sm font-semibold"
                        onClick={() => openEdit(t)}
                    >
                        Edit
                    </button>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="h-10 px-4 rounded-xl bg-white/5 border border-[#FFE4C7] text-[#FFE4C7]"
            onClick={openAdd}
          >
            Tambah
          </button>
        </div>
      </div>

      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center" role="dialog" aria-modal="true" aria-label={editingId ? 'Edit Tip' : 'Tambah Tip'}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative z-[100000] w-[720px] rounded-xl bg-black/60 backdrop-blur-lg p-6 outline outline-1 outline-offset-[-1px] outline-white/5">
            <h3 className="text-[#FFE4C7] text-lg font-semibold mb-4">{editingId ? 'Edit Tip Keamanan' : 'Tambah Tip Keamanan'}</h3>
            <div className="flex flex-col gap-3">
              <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Judul" className="bg-[#0b0c0f] border border-white/10 rounded h-10 px-3 text-[#FFE4C7]" />
              <textarea value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} placeholder="Isi" rows={6} className="bg-[#0b0c0f] border border-white/10 rounded p-3 text-[#FFE4C7] resize-none" />
              <div className="flex justify-end gap-3">
                <button onClick={closeModal} className="px-4 py-2 bg-white/5 border border-white/10 rounded text-[#FFE4C7]">Batal</button>
                <button onClick={handleSave} className="px-4 py-2 bg-[#FFE4C7] rounded text-black font-semibold">{editingId ? 'Simpan' : 'Tambah'}</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* CONFIRM DELETE MODAL FOR TIPS (portal) */}
      {createPortal(
        confirmDeleteOpen ? (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center" role="presentation">
            <div className="absolute inset-0 bg-black/90" onClick={cancelDelete} aria-hidden="true" />
            <div role="dialog" aria-modal="true" aria-labelledby="confirm-delete-tip" className="relative z-[1000000] w-96 p-6 bg-[#06070a] border border-white/10 rounded-xl shadow-2xl text-center">
              <h3 className="text-[#FFE4C7] text-lg font-semibold mb-4">Yakin ingin menghapus?</h3>
              <p id="confirm-delete-tip" className="text-[#CDBA9A] mb-6">Hapus: <span className="text-white font-semibold">{deleteCandidate?.title}</span></p>
              <div className="flex justify-center gap-4">
                <button ref={cancelDeleteBtnRef} onClick={cancelDelete} className="px-5 py-2 border border-white/20 rounded-lg text-[#FFE4C7] hover:bg-white/10 transition">Batal</button>
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