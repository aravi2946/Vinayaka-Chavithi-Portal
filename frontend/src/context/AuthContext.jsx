import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const base = API_URL.replace('/api', '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const isVideoUrl = (url) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|mkv|avi|3gp)$/i.test(url.split('?')[0]);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    festivalName: 'Vinayaka Chavithi Celebration',
    committeeName: 'Festival Committee',
    festivalYear: 2026,
    festivalDates: 'September 14 - September 19, 2026',
    logoUrl: '',
    ganeshaImageUrl: '',
    contactInfo: '',
    publicCollectionVisibility: true,
    registrationSettings: true,
    announcementSettings: true,
    paymentNumber: '9948050484',
    accountName: 'UPPUTURI VENKATA GANESH',
  });
  const [toasts, setToasts] = useState([]);

  // Load user from localStorage on boot
  useEffect(() => {
    const storedUser = localStorage.getItem('committee_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('committee_user');
      }
    }
    fetchSettings();
    setLoading(false);
  }, []);

  // Fetch settings from API
  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  // Login handler
  const login = async (username, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data);
      localStorage.setItem('committee_user', JSON.stringify(data));
      triggerToast('Logged in successfully!', 'success');
      return data;
    } catch (error) {
      triggerToast(error.message, 'danger');
      throw error;
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    localStorage.removeItem('committee_user');
    triggerToast('Logged out successfully', 'info');
  };

  // Global toast notification system
  const triggerToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const hasPermission = (allowedRoles) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        settings,
        toasts,
        login,
        logout,
        fetchSettings,
        triggerToast,
        hasPermission,
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
