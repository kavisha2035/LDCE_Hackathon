import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null); // In-memory ONLY. ZERO localStorage.
  const [loading, setLoading] = useState(true);

  // Silent Refresh via HTTP-Only Cookie (Browser handles Cookie automatically)
  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!res.ok) {
        setAccessToken(null);
        setUser(null);
        return null;
      }

      const data = await res.json();
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch (err) {
      console.error('HTTP-Only Cookie Refresh error:', err);
      setAccessToken(null);
      setUser(null);
      return null;
    }
  }, []);

  // Intercepted Fetch Helper (Handles Auto-Refresh on 401 TOKEN_EXPIRED)
  const authenticatedFetch = useCallback(async (url, options = {}) => {
    const headers = {
      ...(options.headers || {}),
      'Authorization': `Bearer ${accessToken}`
    };

    let response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });

    if (response.status === 401) {
      const errorData = await response.clone().json().catch(() => ({}));
      if (errorData.code === 'TOKEN_EXPIRED' || errorData.message?.includes('expired')) {
        console.log('🔄 Access token expired (15m). Performing silent refresh via HTTP-Only cookie...');
        const newToken = await refreshSession();
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include'
          });
        }
      }
    }

    return response;
  }, [accessToken, refreshSession]);

  // Initial Auth Verification on Page Load (via HTTP-Only Cookie)
  useEffect(() => {
    const initAuth = async () => {
      const token = await refreshSession();
      if (token) {
        try {
          const res = await fetch('/api/me', {
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include'
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          }
        } catch (err) {
          console.error('Initial user fetch error:', err);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    setAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, password, languagePref) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password, languagePref })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    setAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
    } catch (e) {
      console.error('Logout error:', e);
    }
    setAccessToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await authenticatedFetch('/api/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
    const res = await authenticatedFetch('/api/me', {
      method: 'DELETE'
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to delete account');
    }

    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      loading,
      login,
      signup,
      logout,
      updateProfile,
      deleteAccount,
      refreshSession,
      authenticatedFetch,
      isAuthenticated: !!user
    }}>
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
