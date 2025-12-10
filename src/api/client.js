import axios from 'axios';

// URL Backend
export const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor untuk menyisipkan token otomatis
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- API FUNCTIONS ---

export const ping = async () => {
  return await api.get('/');
};

// --- AUTH ---
export const registerUser = async (payload) => {
  const res = await api.post('/register', payload);
  return res.data;
};

export const loginUser = async (payload) => {
  const params = new URLSearchParams();
  params.append('username', payload.username);
  params.append('password', payload.password);
  
  const res = await api.post('/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return res.data; 
};

export const getMe = async () => {
  const res = await api.get('/users/me');
  return res.data;
};

export const updateProfile = async (payload) => {
  const isFormData = payload instanceof FormData;
  const res = await api.put('/users/me', payload, {
    headers: isFormData ? { 'Content-Type': undefined } : {}
  });
  return res.data;
};

// --- STORE & BOOKS ---
export const getBooks = async (params = {}) => {
  const res = await api.get('/books/', { params: params }); 
  return res.data;
};

export const getBookById = async (id) => {
  const res = await api.get(`/books/${id}`);
  return res.data;
};

export const uploadBook = async (payload) => {
  const res = await api.post('/books/', payload, {
    headers: { 'Content-Type': undefined } 
  });
  return res.data;
};

export const createStore = async (payload) => {
  const isFormData = payload instanceof FormData;
  const res = await api.post('/stores/', payload, {
    headers: isFormData ? { 'Content-Type': undefined } : {}
  });
  return res.data;
}

export const getMyStore = async () => {
  const res = await api.get('/stores/my-store');
  return res.data;
};

export const updateStore = async (payload) => {
  const res = await api.put('/stores/my-store', payload);
  return res.data;
};

export const updateBook = async (id, payload) => {
  const res = await api.put(`/books/${id}`, payload, {
    headers: { 'Content-Type': undefined }
  });
  return res.data;
};

export const deleteBook = async (id) => {
  await api.delete(`/books/${id}`);
};

// --- FUNGSI SELLER (MY LISTINGS) ---
export const getMyListings = async () => {
  const res = await api.get('/books/my-listings'); 
  return res.data;
};


// --- FEATURES (GUEST/USER) ---
export const getAnnouncements = async () => {
  const res = await api.get('/announcements/');
  return res.data;
};

export const getSecurityTips = async () => {
  const res = await api.get('/security-tips/');
  return res.data;
};

export const getAboutContent = async () => {
  const res = await api.get('/about/');
  return res.data;
};

export const getCategories = async () => {
  const res = await api.get('/categories/');
  return res.data;
};

export const getMyWishlist = async () => {
  const res = await api.get('/wishlist/my-wishlist');
  return res.data;
};

export const addToWishlist = async (payload) => {
  const res = await api.post('/wishlist/', payload);
  return res.data;
};

export const removeFromWishlist = async (id) => {
  const res = await api.delete(`/wishlist/${id}`);
  return res.data;
};

export const getMyHistory = async () => {
  const res = await api.get('/transactions/my-history');
  return res.data;
};

// --- FUNGSI TRANSAKSI SELLER ---
export const getMyStoreSales = async () => {
  const res = await api.get('/transactions/my-store-sales');
  return res.data;
};

// --- FUNGSI REVIEW (USER) ---
export const createReview = async (payload) => {
  const res = await api.post('/reviews/', payload);
  return res.data;
};

export const getReviewsForBook = async (book_id) => {
  const res = await api.get(`/reviews/book/${book_id}`);
  return res.data;
};


// --- ADMIN ---
export const getDashboardStats = async () => {
  const res = await api.get('/stats/');
  return res.data;
};

export const getAllUsers = async () => {
  const res = await api.get('/users/');
  return res.data;
};

// TAMBAHAN: Hapus User
export const deleteUser = async (id) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};

// TAMBAHAN: Manajemen Kategori (Admin)
export const createCategory = async (payload) => {
  const res = await api.post('/categories/', payload);
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await api.delete(`/categories/${id}`);
  return res.data;
};

// FUNGSI ADMIN BARU (DIPERBAIKI UNTUK MENGIRIM PARAMETER)
export const getPendingBooks = async (skip = 0, limit = 100) => {
  const res = await api.get('/books/pending', {
    params: {
      skip: skip,
      limit: limit
    }
  }); 
  return res.data;
};

export const moderateBook = async (payload) => {
  // Hapus trailing slash agar sesuai dengan endpoint backend
  const res = await api.post('/moderations', payload);
  return res.data;
};

// --- FUNGSI CRUD KONTEN (ADMIN) ---

// ABOUT
export const createAboutContent = (payload) => api.post('/about/', payload);
export const updateAboutContent = (id, payload) => api.put(`/about/${id}`, payload);
export const deleteAboutContent = (id) => api.delete(`/about/${id}`);

// ANNOUNCEMENTS
export const createAnnouncement = (payload) => api.post('/announcements/', payload);
export const updateAnnouncement = (id, payload) => api.put(`/announcements/${id}`, payload);
export const deleteAnnouncement = (id) => api.delete(`/announcements/${id}`);

// REPORTS (ADMIN & USER)
export const getReports = async () => {
  const res = await api.get('/reports/');
  return res.data;
};

export const createReport = async (payload) => {
  const res = await api.post('/reports/', payload);
  return res.data;
};

export const deleteReport = async (id) => {
  const res = await api.delete(`/reports/${id}`);
  return res.data;
};

// TAMBAHAN: Kirim Peringatan ke User
export const warnUser = async (payload) => {
  const res = await api.post('/reports/warn', payload);
  return res.data;
};

// SECURITY TIPS
export const createSecurityTip = (payload) => api.post('/security-tips/', payload);
export const updateSecurityTip = (id, payload) => api.put(`/security-tips/${id}`, payload);
export const deleteSecurityTip = (id) => api.delete(`/security-tips/${id}`);


export default api;