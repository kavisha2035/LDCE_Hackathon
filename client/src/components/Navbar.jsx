import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, User as UserIcon, LogOut, Search } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initialLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="bg-white border-b-2 border-[#1F2B2E] sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 bg-[#1F2B2E] text-[#F6F3EC] flex items-center justify-center font-mono font-extrabold text-xl rounded-sm shadow-[2px_2px_0px_0px_#2C5F7C] group-hover:bg-[#2C5F7C] transition">
              GT
            </div>
            <div>
              <span className="font-extrabold text-2xl font-display tracking-tight text-[#1F2B2E] block leading-none">
                GLOBETROTTER
              </span>
              <span className="text-[10px] font-mono text-[#2C5F7C] uppercase tracking-widest block">
                ITINERARY-AS-DOCUMENT
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 font-mono text-xs">
            <Link
              to="/"
              className={`px-3 py-1.5 border border-[#1F2B2E] uppercase font-bold transition ${
                location.pathname === '/' ? 'bg-[#1F2B2E] text-[#F6F3EC]' : 'bg-white text-[#1F2B2E] hover:bg-[#F6F3EC]'
              }`}
            >
              DASHBOARD
            </Link>

            <Link
              to="/activities"
              className={`px-3 py-1.5 border border-[#1F2B2E] uppercase font-bold transition flex items-center gap-1.5 ${
                location.pathname === '/activities' ? 'bg-[#1F2B2E] text-[#F6F3EC]' : 'bg-white text-[#1F2B2E] hover:bg-[#F6F3EC]'
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              ACTIVITIES (SCR 8)
            </Link>

            {isAuthenticated && (
              <Link
                to="/profile"
                className={`px-3 py-1.5 border border-[#1F2B2E] uppercase font-bold transition ${
                  location.pathname === '/profile' ? 'bg-[#1F2B2E] text-[#F6F3EC]' : 'bg-white text-[#1F2B2E] hover:bg-[#F6F3EC]'
                }`}
              >
                PROFILE (SCR 12)
              </Link>
            )}
          </nav>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1 bg-white border border-[#1F2B2E] font-mono text-xs font-bold hover:bg-[#F6F3EC] transition"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-6 w-6 object-cover border border-[#1F2B2E]"
                  />
                ) : (
                  <div className="h-6 w-6 bg-[#1F2B2E] text-[#F6F3EC] flex items-center justify-center font-mono font-bold text-xs border border-[#1F2B2E]">
                    {initialLetter}
                  </div>
                )}
                <span className="text-[#1F2B2E] uppercase hidden sm:inline">{user.name}</span>
              </Link>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 bg-white border border-[#1F2B2E] text-[#1F2B2E] hover:bg-[#B84A3E] hover:text-white transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-[#2C5F7C] hover:bg-[#1F2B2E] text-[#F6F3EC] border border-[#1F2B2E] font-mono text-xs font-bold uppercase transition shadow-[2px_2px_0px_0px_#1F2B2E] flex items-center gap-2"
            >
              <UserIcon className="h-4 w-4" />
              SIGN IN / REGISTER
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
