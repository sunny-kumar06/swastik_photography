import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('swastik_admin_token');
      const savedUser = localStorage.getItem('swastik_admin_user');

      if (token && savedUser) {
        try {
          setAdmin(JSON.parse(savedUser));
          const res = await authApi.getMe();
          if (res.data && res.data.data) {
            setAdmin(res.data.data);
            localStorage.setItem('swastik_admin_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.error('[Auth Check Failed]:', err.message);
          localStorage.removeItem('swastik_admin_token');
          localStorage.removeItem('swastik_admin_user');
          setAdmin(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data && res.data.success) {
      const userData = res.data.data;
      localStorage.setItem('swastik_admin_token', userData.token);
      localStorage.setItem('swastik_admin_user', JSON.stringify(userData));
      setAdmin(userData);
      return { success: true };
    }
    return { success: false, message: res.data?.message || 'Login failed' };
  };

  const logout = () => {
    localStorage.removeItem('swastik_admin_token');
    localStorage.removeItem('swastik_admin_user');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
