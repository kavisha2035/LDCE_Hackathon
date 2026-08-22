import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const getInitialToken = () => {
    const t = localStorage.getItem('gt_token');
    if (!t || t === 'undefined' || t === 'null') {
      localStorage.removeItem('gt_token');
      return null;
    }
    return t;
  };

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getInitialToken);
  const [loading, setLoading] = useState(true);

  // Verify and fetch user profile on load if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (token && token !== 'undefined' && token !== 'null') {
        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            // Token invalid or expired
            logout();
          }
        } catch (err) {
          console.error('Auth verification failed:', err);
        }
      } else {
        logout();
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    const authToken = data.token || data.accessToken;
    if (authToken) {
      localStorage.setItem('gt_token', authToken);
      setToken(authToken);
    }
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, password, languagePref, avatar) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, languagePref, avatar })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    const authToken = data.token || data.accessToken;
    if (authToken) {
      localStorage.setItem('gt_token', authToken);
      setToken(authToken);
    }
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('gt_token');
    setToken(null);
    setUser(null);
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  };

  const updateProfile = async (profileData) => {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    setUser(data.user);
    return data;
  };

  const deleteAccount = async () => {
    const res = await fetch('/api/auth/account', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to delete account');
    }

    logout();
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        deleteAccount,
        isAuthenticated: !!user
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
