import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  async function login(email, password) {
    const res = await api.post('/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }

  async function register(data) {
    const res = await api.post('/register', data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }

  async function logout() {
    try {
      await api.post('/logout');
    } catch (e) {
      // abaikan, tetap hapus sesi lokal
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  // Dipakai halaman Edit Profil supaya data user (nama/email/no_hp) di seluruh app
  // langsung ikut update begitu berhasil disimpan ke backend, tanpa perlu login ulang.
  function updateUser(dataBaru) {
    const gabungan = { ...user, ...dataBaru };
    localStorage.setItem('user', JSON.stringify(gabungan));
    setUser(gabungan);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
