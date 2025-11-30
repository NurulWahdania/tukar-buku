import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

// Helper: Ambil data user dari LocalStorage
function getStoredAuth() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Helper: Cek Token
function hasToken() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('access_token');
}

// --- LOGIKA PENGECEKAN ROLE (DIPERBAIKI) ---
const checkRole = (user, targetRole) => {
  if (!user) return false;

  const target = targetRole.toLowerCase();

  // 1. JALUR KHUSUS SELLER:
  // Jika target adalah 'seller' DAN user punya data 'store', IZINKAN!
  // (Ini mengatasi masalah role masih 'User' tapi sudah punya toko)
  if (target === 'seller' && user.store) {
    return true; 
  }

  // 2. Cek berdasarkan Role ID (Paling Akurat)
  // 1 = Admin, 2 = Seller, 3 = User
  if (target === 'admin' && user.role_id === 1) return true;
  if (target === 'seller' && user.role_id === 2) return true;

  // 3. Cek berdasarkan Nama Role (String atau Object)
  let roleName = '';
  if (user.role) {
    if (typeof user.role === 'string') {
      roleName = user.role.toLowerCase();
    } else if (typeof user.role === 'object' && user.role.name) {
      roleName = user.role.name.toLowerCase();
    }
  }

  // Admin boleh akses halaman Seller juga
  if (target === 'seller' && roleName === 'admin') return true;

  return roleName === target;
};

// --- KOMPONEN ROUTE ---

// 1. ProtectedRoute: Hanya butuh Login
export function ProtectedRoute() {
  const location = useLocation();
  
  if (!hasToken()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

// 2. SellerRoute: Butuh Login + (Role Seller ATAU Punya Toko)
export function SellerRoute() {
  const location = useLocation();
  const user = getStoredAuth();
  const token = hasToken();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Cek apakah User adalah Seller (atau Admin)
  const isSeller = checkRole(user, 'seller');

  // DEBUG LOG: Lihat ini di Console browser jika masih gagal
  console.log("[SellerRoute] User:", user?.username, "| Punya Toko:", !!user?.store, "| Is Allowed:", isSeller);

  return isSeller ? <Outlet /> : <Navigate to="/access-denied" replace />;
}

// 3. AdminRoute: Butuh Login + Role Admin
export function AdminRoute() {
  const location = useLocation();
  const user = getStoredAuth();
  const token = hasToken();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin = checkRole(user, 'admin');

  return isAdmin ? <Outlet /> : <Navigate to="/access-denied" replace />;
}

export default ProtectedRoute;