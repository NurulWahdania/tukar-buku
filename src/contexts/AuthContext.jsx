// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, getMe } from '../api/client';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Hapus useNavigate di sini jika AuthProvider membungkus BrowserRouter di main.jsx
  // Tapi untuk amannya kita kelola state saja di sini.

  // Cek apakah user sudah login saat website direfresh
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Validasi token dengan mengambil data user terbaru
          const userData = await getMe();
          setUser(userData);
        } catch (error) {
          console.error("Token expired or invalid", error);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      // 1. Panggil API Login
      const data = await loginUser({ username, password });
      
      // 2. Simpan Token
      localStorage.setItem('access_token', data.access_token);
      
      // 3. Ambil data profil user (untuk tahu role-nya)
      const userData = await getMe();
      setUser(userData);
      
      return { success: true, role: userData.role.name };
    } catch (error) {
      console.error("Login failed", error);
      return { success: false, message: error.response?.data?.detail || "Login gagal" };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    window.location.href = '/login'; // Redirect paksa ke login
  };

  const value = { user, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);