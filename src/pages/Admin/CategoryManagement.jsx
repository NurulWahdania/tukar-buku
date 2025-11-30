// src/pages/Admin/CategoryManagement.jsx
import React, { useEffect, useState, useRef } from 'react';
import { getCategories, createCategory, deleteCategory } from '../../api/client';
import { createPortal } from 'react-dom';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // modal & edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalValue, setModalValue] = useState('');
  // new: confirm delete modal state
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null); // { id, name }
  const cancelDeleteBtnRef = useRef(null);

  // disable body scroll while confirm modal open
  useEffect(() => {
    if (confirmDeleteOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [confirmDeleteOpen]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal memuat kategori:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (name) => {
    if (!name?.trim()) return;
    try {
      await createCategory({ name });
      setModalValue('');
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      alert("Gagal menambah kategori.");
    }
  };

  // request delete -> open confirm modal
  const requestDelete = (cat) => {
    setDeleteCandidate({ id: cat.id, name: cat.name });
    setConfirmDeleteOpen(true);
  };

  const cancelDelete = () => {
    setConfirmDeleteOpen(false);
    setDeleteCandidate(null);
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteCategory(deleteCandidate.id);
      setCategories(prev => prev.filter(c => c.id !== deleteCandidate.id));
      setConfirmDeleteOpen(false);
      setDeleteCandidate(null);
    } catch (error) {
      console.error("Gagal menghapus kategori:", error);
      alert("Gagal menghapus kategori. Mungkin sedang digunakan oleh buku.");
      setConfirmDeleteOpen(false);
      setDeleteCandidate(null);
    }
  };

  const openAddModal = () => { setEditingId(null); setModalValue(''); setIsModalOpen(true); };
  const openEditModal = (cat) => { setEditingId(cat.id); setModalValue(cat.name); setIsModalOpen(true); };
  const handleSave = async () => {
    if (!modalValue.trim()) return alert('Nama kategori wajib diisi');
    if (editingId) {
      // no update API available -> update locally for UI; you can add an API call if exists
      setCategories(prev => prev.map(c => c.id === editingId ? { ...c, name: modalValue.trim() } : c));
      setIsModalOpen(false);
      setEditingId(null);
      setModalValue('');
    } else {
      await handleAdd(modalValue.trim());
    }
  };

  return (
    <div className="w-[1020px] h-80 relative rounded-[20px] overflow-hidden mx-auto">
      <div className="absolute inset-0 bg-neutral-300/10 rounded-xl border border-white/0 backdrop-blur-lg" />
      <div className="absolute left-[20px] top-[16px] text-[#FFE4C7] text-xl font-semibold font-['Inter']">List Kategori</div>

      <div className="absolute left-[20px] top-[57px] w-[980px] bg-neutral-300/10 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/0 backdrop-blur-lg overflow-hidden">
        {/* header */}
        <div className="relative h-12 border-b border-zinc-300">
          <div className="absolute left-4 top-3 text-[#FFE4C7] text-base font-bold">No</div>
          <div className="absolute left-[64px] top-3 text-[#FFE4C7] text-base font-bold">Kategori</div>
          <div className="absolute right-6 top-3 text-[#FFE4C7] text-base font-bold">Aksi</div>
        </div>

        <div className="max-h-[200px] overflow-auto">
          {loading ? (
            <div className="p-4 text-[#FFE4C7]">Memuat...</div>
          ) : categories.length === 0 ? (
            <div className="p-4 text-[#FFE4C7]">Belum ada kategori.</div>
          ) : (
            categories.map((cat, idx) => (
              <div key={cat.id} className="relative h-12 border-b border-zinc-300">
                <div className="absolute left-4 top-3 text-[#FFE4C7] text-base font-semibold">{idx + 1}</div>
                <div className="absolute left-[66px] top-3 text-[#FFE4C7] text-base font-semibold">{cat.name}</div>

                <div className="absolute right-36 top-2">
                  <button
                    onClick={() => requestDelete(cat)}
                    className="h-8 px-3 rounded-[10px] bg-red-600 text-white font-semibold"
                  >
                    Hapus
                  </button>
                </div>

                <div className="absolute right-6 top-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="h-8 px-3 rounded-[10px] bg-[#FFE4C7] text-black font-semibold"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="absolute right-[20px] bottom-[16px]">
        <button onClick={openAddModal} className="h-10 px-3 py-2 bg-white/5 rounded-xl outline outline-1 outline-offset-[-1px] outline-[#FFE4C7] text-[#FFE4C7]">
          Tambah Kategori
        </button>
      </div>

      {/* modal via portal */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center" role="dialog" aria-modal="true" aria-label={editingId ? 'Edit Kategori' : 'Tambah Kategori'}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-[100000] w-[600px] rounded-xl bg-black/60 backdrop-blur-lg p-6 outline outline-1 outline-offset-[-1px] outline-white/5">
            <h3 className="text-[#FFE4C7] text-lg font-semibold mb-4">{editingId ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
            <div className="flex gap-3">
              <input
                value={modalValue}
                onChange={(e) => setModalValue(e.target.value)}
                placeholder="Nama Kategori"
                className="flex-1 bg-[#0b0c0f] border border-white/10 rounded h-10 px-3 text-[#FFE4C7] focus:outline-none"
              />
              <div className="flex items-center gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white/5 border border-white/10 rounded text-[#FFE4C7]">Batal</button>
                <button onClick={handleSave} className="px-4 py-2 bg-[#FFE4C7] rounded text-black font-semibold">{editingId ? 'Simpan' : 'Tambah'}</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* CONFIRM DELETE MODAL (portal) */}
      {createPortal(
        confirmDeleteOpen ? (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center" role="presentation">
            <div className="absolute inset-0 bg-black/90" onClick={cancelDelete} aria-hidden="true" />
            <div role="dialog" aria-modal="true" aria-labelledby="confirm-delete-title" className="relative z-[1000000] w-96 p-6 bg-[#06070a] border border-white/10 rounded-xl shadow-2xl text-center">
              <h3 id="confirm-delete-title" className="text-[#FFE4C7] text-lg font-semibold mb-4">Yakin ingin menghapus?</h3>
              <p className="text-[#CDBA9A] mb-6">Hapus kategori: <span className="text-white font-semibold">{deleteCandidate?.name}</span></p>
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