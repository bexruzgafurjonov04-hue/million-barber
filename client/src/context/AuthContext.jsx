import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('million_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('million_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const savedToken = localStorage.getItem('million_token');
      if (!savedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('million_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        localStorage.removeItem('million_token');
        localStorage.removeItem('million_user');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;

    localStorage.setItem('million_token', receivedToken);
    localStorage.setItem('million_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);

    return receivedUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('million_token');
    localStorage.removeItem('million_user');
    setUser(null);
    setToken(null);
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    // Update local user forcePasswordChange flag if successful
    if (user) {
      const updatedUser = { ...user, forcePasswordChange: false };
      setUser(updatedUser);
      localStorage.setItem('million_user', JSON.stringify(updatedUser));
    }
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isBarber: user?.role === 'BARBER',
        isLoading,
        login,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
