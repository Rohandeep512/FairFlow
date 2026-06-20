import { createContext, useState, useEffect } from 'react';
import api from '../utils/api.js';
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Prevents premature kicks to login
  useEffect(() => {
    const hydrateAuth = async () => {
      const token = localStorage.getItem('admin_token');
      const role = localStorage.getItem('admin_role');
      const name = localStorage.getItem('admin_name');
      if (!token || role !== 'admin') {
        setLoading(false);
        return;
      }
      setUser({ token, role, name });
      try {
        const res = await api.get('/auth/me');
        const freshName = res.data.name || name;
        if (freshName !== name) {
          localStorage.setItem('admin_name', freshName);
        }
        setUser({ token, role, name: freshName });
      } catch (err) {
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