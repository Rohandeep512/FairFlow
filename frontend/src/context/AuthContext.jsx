import { createContext, useState, useEffect } from 'react';
import api from '../utils/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Prevents premature kicks to login

  useEffect(() => {
    const hydrateAuth = async () => {
      // For Admin Auth Context, we ONLY look at admin_ keys
      const token = localStorage.getItem('admin_token');
      const role = localStorage.getItem('admin_role');
      const name = localStorage.getItem('admin_name');

      if (!token || role !== 'admin') {
        setLoading(false);
        return;
      }

      // Optimistic hydration — show UI immediately
      setUser({ token, role, name });

      // Verify token is still valid against the server
      try {
        const res = await api.get('/auth/me');
        // Token is valid — update name in case it changed server-side
        const freshName = res.data.name || name;
        // Update name if changed
        if (freshName !== name) {
          localStorage.setItem('admin_name', freshName);
        }
        setUser({ token, role, name: freshName });
      } catch (err) {
        // If token is invalid, clear storage
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_role');
        localStorage.removeItem('admin_name');
        setUser(null);
      }

      setLoading(false);
    };

    hydrateAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_role');
    localStorage.removeItem('admin_name');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};