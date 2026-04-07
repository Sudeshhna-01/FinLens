import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5001/api';

/** Map axios errors to a user-visible string */
function getAuthErrorMessage(error, fallback) {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  const errs = error.response?.data?.errors;
  if (Array.isArray(errs) && errs.length > 0) {
    return errs.map((e) => e.msg || `${e.path || e.param}: invalid`).join(' ');
  }
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return `Cannot reach the server. Start the API (port 5001) and set REACT_APP_API_URL if needed. Current: ${API_URL}`;
  }
  if (!error.response) {
    return `No response from server. Check that the backend is running at ${API_URL.replace(/\/api$/, '')}`;
  }
  return fallback;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const { user, token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error, 'Login failed')
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password
      });

      const { user, token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error, 'Registration failed')
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
