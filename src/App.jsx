// src/App.jsx
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

// --- PAGES: USER ---
import UserHome from './pages/User/Home';
import UserProfile from './pages/User/Profile';
import UserWishlist from './pages/User/Wishlist';
import UserTransactionHistory from './pages/User/TransactionHistory';
import UserAnnouncement from './pages/User/Announcement';
import UserAbout from './pages/User/About';
import UserSecurityTips from './pages/User/SecurityTips';
import RegisterStore from './pages/User/RegisterStore';
import UserStoreProfileView from './pages/User/StoreProfile'; 

// --- PAGES: SELLER ---
import SellerHome from './pages/Seller/Home';                   
import SellerAbout from './pages/Seller/About';                 
import SellerAnnouncement from './pages/Seller/Announcement';
import SellerProfile from './pages/Seller/Profile';             
import SellerReview from './pages/Seller/Review';               
import SellerSecurityTips from './pages/Seller/SecurityTips';
import SellerStoreProducts from './pages/Seller/Store';         
import SellerStoreProfile from './pages/Seller/StoreProfile';   
import SellerStoreSettings from './pages/Seller/StoreSettings'; 
import SellerStoreTransactions from './pages/Seller/StoreTransactions'; 
import SellerTransactionHistory from './pages/Seller/TransactionHistory'; 
import SellerWishlist from './pages/Seller/Wishlist';           
import UploadReport from './pages/Seller/UploadReport';        
import AddProduct from './pages/Seller/Products';              

// --- PAGES: ADMIN ---
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import CategoryManagement from './pages/Admin/CategoryManagement';
import ContentVerification from './pages/Admin/ContentVerification';
import ReportListManagement from './pages/Admin/ReportListManagement';
import AnnouncementManagement from './pages/Admin/AnnouncementManagement';
import SecurityTipsManagement from './pages/Admin/SecurityTipsManagement';
import AboutManagement from './pages/Admin/AboutManagement';

// --- PAGES: UTIL ---
import NotFound from './pages/Util/NotFound';

// --- Helper: Redirect Home ---
// Jika Seller login dan mengakses /home, lempar ke /seller/home
function HomeRouteRedirect() {
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
    // Future flags ditambahkan untuk menghilangkan warning React Router v7
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
          
          {/* Halaman Akses Ditolak */}
          <Route path="/access-denied" element={<NotFound />} />

          {/* =========================================
              2. USER ROUTES (Pembeli)
             ========================================= */}
          <Route element={<ProtectedRoute />}>
            <Route element={<UserLayouts />}>
              <Route path="/home" element={<HomeRouteRedirect />} />
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
              <Route path="/seller" element={<Navigate to="/seller/home" replace />} />
              <Route path="/seller/home" element={<SellerHome />} />
              
              {/* Fitur Seller */}
              <Route path="/seller/store/profile" element={<SellerStoreProfile />} />
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
              4. ADMIN ROUTES (Admin)
             ========================================= */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayouts />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="content" element={<ContentVerification />} />
              <Route path="reports" element={<ReportListManagement />} />
              <Route path="announcements" element={<AnnouncementManagement />} />
              <Route path="about" element={<AboutManagement />} />
              <Route path="security-tips" element={<SecurityTipsManagement />} />
            </Route>
          </Route>

          {/* Fallback 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}