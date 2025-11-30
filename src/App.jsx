import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// --- LAYOUTS ---
import MainLayouts from './layouts/MainLayouts';      
import UserLayouts from './layouts/UserLayouts';      
import SellerLayouts from './layouts/SellerLayouts';  
import AdminLayouts from './layouts/AdminLayouts';    

// --- COMPONENTS ---
import { ProtectedRoute, SellerRoute, AdminRoute } from './components/ProtectedRoute';

// --- PAGES: AUTH ---
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// --- PAGES: GUEST ---
import GuestCategory from './pages/Guest/Category';
import GuestAbout from './pages/Guest/About';

// --- PAGES: USER (MENGGUNAKAN ALIAS UNTUK MENGHINDARI KONFLIK) ---
import UserHome from './pages/User/Home';
import UserProfile from './pages/User/Profile';
import UserWishlist from './pages/User/Wishlist';
import UserTransactionHistory from './pages/User/TransactionHistory';
import UserAnnouncement from './pages/User/Announcement';
import UserAbout from './pages/User/About';
import UserSecurityTips from './pages/User/SecurityTips';
import RegisterStore from './pages/User/RegisterStore';
import UserStoreProfileView from './pages/User/StoreProfile'; 
// import BookDetail from './pages/User/BookDetail'; // Pastikan file ini sudah dibuat

// --- PAGES: SELLER (CONFIRMED ALIASES) ---
import SellerHome from './pages/Seller/Home';                   // Beranda Seller
import SellerAbout from './pages/Seller/About';                 // About Seller
import SellerAnnouncement from './pages/Seller/Announcement';
import SellerProfile from './pages/Seller/Profile';             // Profile Seller
import SellerReview from './pages/Seller/Review';               // Review Seller
import SellerSecurityTips from './pages/Seller/SecurityTips';
import SellerStoreProducts from './pages/Seller/Store';         // Manajemen Produk Toko
import SellerStoreProfile from './pages/Seller/StoreProfile';   // Profil Toko Seller
import SellerStoreSettings from './pages/Seller/StoreSettings'; // Form Tambah/Edit Buku
import SellerStoreTransactions from './pages/Seller/StoreTransactions'; // Riwayat Transaksi Toko
import SellerTransactionHistory from './pages/Seller/TransactionHistory'; // Riwayat Pembelian Seller
import SellerWishlist from './pages/Seller/Wishlist';           // Wishlist Seller
import UploadReport from './pages/Seller/UploadReport';        // Laporan Unggahan
import AddProduct from './pages/Seller/Products';              // Form Tambah Produk (Products.jsx)

// --- PAGES: ADMIN ---
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import CategoryManagement from './pages/Admin/CategoryManagement';
import ContentVerification from './pages/Admin/ContentVerification';
import ReportListManagement from './pages/Admin/ReportListManagement';
import AnnouncementManagement from './pages/Admin/AnnouncementManagement';
// import StoreVerification from './pages/Admin/StoreVerification';

// --- helper: jika path /home dicek, arahkan seller ke /seller/home ---
function HomeRouteRedirect() {
	// Jika ada data seller di localStorage (di-set saat login seller), redirect ke seller home
	try {
		const raw = localStorage.getItem('authSeller');
		if (raw) {
			return <Navigate to="/seller/home" replace />;
		}
	} catch (e) { /* ignore */ }
	// Default: tampilkan UserHome
	return <UserHome />;
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <AuthProvider>
        <Routes>
          {/* =========================================
              1. PUBLIC ROUTES (Tamu)
             ========================================= */}
          <Route path="/" element={<MainLayouts />}>
            <Route index element={<Navigate to="/category" replace />} />
            <Route path="category" element={<GuestCategory />} />
            <Route path="about" element={<GuestAbout />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/access-denied" element={<div className="text-white text-center mt-20">Akses Ditolak.</div>} />

          {/* =========================================
              2. USER ROUTES (Pembeli Murni)
             ========================================= */}
          <Route element={<ProtectedRoute />}>
            <Route element={<UserLayouts />}>
-              <Route path="/home" element={<UserHome />} />
+              <Route path="/home" element={<HomeRouteRedirect />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/wishlist" element={<UserWishlist />} />
              <Route path="/history" element={<UserTransactionHistory />} />
              <Route path="/announcements" element={<UserAnnouncement />} />
              <Route path="/security-tips" element={<UserSecurityTips />} />
              <Route path="/user/about" element={<UserAbout />} />
              
              <Route path="/register-store" element={<RegisterStore />} />
              <Route path="/store-profile/:id" element={<UserStoreProfileView />} />
            </Route>
        </Route>

          {/* =========================================
              3. SELLER ROUTES (Penjual)
             ========================================= */}
          <Route element={<SellerRoute />}>
            <Route element={<SellerLayouts />}>
              {/* DEFAULT LANDING PAGE: Home Seller */}
              <Route path="/seller" element={<Navigate to="/seller/home" replace />} />
              <Route path="/seller/home" element={<SellerHome />} />
              
              {/* Fitur Seller Spesifik */}
+             <Route path="/seller/store/profile" element={<SellerStoreProfile />} />
              <Route path="/seller/profile" element={<SellerProfile />} />
              <Route path="/seller/about" element={<SellerAbout />} />
              <Route path="/seller/announcements" element={<SellerAnnouncement />} />
              <Route path="/seller/store/reports" element={<UploadReport />} />
              <Route path="/seller/products" element={<AddProduct />} />
              <Route path="/seller/review" element={<SellerReview />} />
              <Route path="/seller/store" element={<SellerStoreProducts />} />
              <Route path="/seller/security-tips" element={<SellerSecurityTips />} />
              <Route path="/seller/transactions" element={<SellerStoreTransactions />} />
              <Route path="/seller/history" element={<SellerTransactionHistory />} />
              <Route path="/seller/wishlist" element={<SellerWishlist />} />
              
              {/* Form Tambah/Edit Buku */}
              <Route path="/seller/store/new" element={<AddProduct />} />
              <Route path="/seller/store/edit/:id" element={<SellerStoreSettings />} />
              
            </Route>
          </Route>

          {/* =========================================
              4. ADMIN ROUTES (Khusus Admin)
             ========================================= */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayouts />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="content" element={<ContentVerification />} />
              <Route path="reports" element={<ReportListManagement />} />
              <Route path="announcements" element={<AnnouncementManagement />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}