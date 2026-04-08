import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => sessionStorage.getItem('token'));
  const [loading, setLoading] = useState(() => {
    const hasToken = Boolean(sessionStorage.getItem('token'));
    const hasUser = Boolean(sessionStorage.getItem('user'));
    return hasToken && !hasUser;
  });

  useEffect(() => {
    if (token && !user) {
      setLoading(true);
      api.get('/auth/me')
        .then(res => {
          setUser(res.data.user);
          sessionStorage.setItem('user', JSON.stringify(res.data.user));
        })
        .catch(err => {
          if (err.response?.status === 401) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, user]);

  const login = (tokenVal, userData) => {
    sessionStorage.setItem('token', tokenVal);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenVal);
    setUser(userData);
    setLoading(false);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
