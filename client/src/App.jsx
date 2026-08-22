import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs text-[#1F2B2E]">
        LOADING PASSENGER MANIFEST...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function MainApp() {
  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#1F2B2E] flex flex-col font-body selection:bg-[#2C5F7C] selection:text-[#F6F3EC]">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="border-t-2 border-[#1F2B2E] bg-white py-4 text-center font-mono text-xs text-[#1F2B2E]">
        GLOBETROTTER &bull; INKED MAP DESIGN SYSTEM &bull; NEON POSTGRESQL &bull; REACT ROUTER
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </BrowserRouter>
  );
}
