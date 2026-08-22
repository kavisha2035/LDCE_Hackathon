import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Compass, User as UserIcon, LogOut, Search, MapPin,
  Layers, Calendar, DollarSign, Globe, Shield, Plus,
  Menu, X, Sparkles, ChevronDown
} from 'lucide-react';

export default function Navbar({ currentTab, onNavigate }) {
  const { user, logout, isAuthenticated } = useAuth();
  const isAdmin = Boolean(isAuthenticated && user?.isAdmin);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tripDropdownOpen, setTripDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    onNavigate('home');
  };

  const initialLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const navItemClass = (tabName) => {
    const isActive = currentTab === tabName;
    return `px-3 py-1.5 border border-[#1F2B2E] uppercase font-bold text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
      isActive
        ? 'bg-[#1F2B2E] text-[#F6F3EC] shadow-[2px_2px_0px_0px_#2C5F7C]'
        : 'bg-white text-[#1F2B2E] hover:bg-[#F6F3EC]'
    }`;
  };

  const isTripHubActive = ['builder', 'itinerary', 'budget', 'calendar', 'share'].includes(currentTab);

  return (
    <header className="bg-white border-b-2 border-[#1F2B2E] sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-4 lg:gap-6">
          <div
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="h-10 w-10 bg-[#1F2B2E] text-[#F6F3EC] flex items-center justify-center font-mono font-extrabold text-xl rounded-sm shadow-[2px_2px_0px_0px_#2C5F7C] group-hover:bg-[#2C5F7C] transition">
              GT
            </div>
            <div>
              <span className="font-extrabold text-2xl font-display tracking-tight text-[#1F2B2E] block leading-none">
                GLOBETROTTER
              </span>
              <span className="text-[10px] font-mono text-[#2C5F7C] uppercase tracking-widest block font-bold">
                ITINERARY-AS-DOCUMENT
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => onNavigate('home')}
              className={navItemClass('home')}
            >
              DASHBOARD
            </button>

            <button
              onClick={() => onNavigate('cities')}
              className={navItemClass('cities')}
            >
              <MapPin className="h-3.5 w-3.5 text-[#2C5F7C]" />
              EXPLORE CITIES
            </button>

            <button
              onClick={() => onNavigate('activities')}
              className={navItemClass('activities')}
            >
              <Search className="h-3.5 w-3.5 text-[#B8823A]" />
              ACTIVITIES
            </button>

            {/* Trip Hub Dropdown / Direct Link */}
            <div className="relative">
              <button
                onClick={() => setTripDropdownOpen(!tripDropdownOpen)}
                className={`px-3 py-1.5 border border-[#1F2B2E] uppercase font-bold text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                  isTripHubActive
                    ? 'bg-[#1F2B2E] text-[#F6F3EC] shadow-[2px_2px_0px_0px_#2C5F7C]'
                    : 'bg-white text-[#1F2B2E] hover:bg-[#F6F3EC]'
                }`}
              >
                <Layers className="h-3.5 w-3.5 text-[#7FA69C]" />
                TRIP HUB
                <ChevronDown className={`h-3 w-3 transition-transform ${tripDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {tripDropdownOpen && (
                <div
                  className="absolute left-0 mt-1 w-52 bg-white border-2 border-[#1F2B2E] shadow-[4px_4px_0px_0px_#1F2B2E] py-1 z-50"
                  onMouseLeave={() => setTripDropdownOpen(false)}
                >
                  <button
                    onClick={() => {
                      onNavigate('itinerary');
                      setTripDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono font-bold text-[#1F2B2E] hover:bg-[#F6F3EC] flex items-center gap-2 border-b border-[#1F2B2E]/10 cursor-pointer"
                  >
                    <Layers className="h-3.5 w-3.5 text-[#2C5F7C]" />
                    Itinerary View
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('builder');
                      setTripDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono font-bold text-[#1F2B2E] hover:bg-[#F6F3EC] flex items-center gap-2 border-b border-[#1F2B2E]/10 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-[#B8823A]" />
                    Itinerary Builder
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('budget');
                      setTripDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono font-bold text-[#1F2B2E] hover:bg-[#F6F3EC] flex items-center gap-2 border-b border-[#1F2B2E]/10 cursor-pointer"
                  >
                    <DollarSign className="h-3.5 w-3.5 text-[#B8823A]" />
                    Budget & Cost Ledger
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('calendar');
                      setTripDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono font-bold text-[#1F2B2E] hover:bg-[#F6F3EC] flex items-center gap-2 border-b border-[#1F2B2E]/10 cursor-pointer"
                  >
                    <Calendar className="h-3.5 w-3.5 text-[#2C5F7C]" />
                    Calendar & Timeline
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('share');
                      setTripDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono font-bold text-[#1F2B2E] hover:bg-[#F6F3EC] flex items-center gap-2 cursor-pointer"
                  >
                    <Globe className="h-3.5 w-3.5 text-[#7FA69C]" />
                    Public Itinerary Pass
                  </button>
                </div>
              )}
            </div>

            {/* Admin link (admin-only) */}
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-1.5 border border-[#1F2B2E] uppercase font-bold text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                  currentTab === 'admin'
                    ? 'bg-[#B84A3E] text-white border-[#B84A3E] shadow-[2px_2px_0px_0px_#1F2B2E]'
                    : 'bg-white text-[#B84A3E] hover:bg-[#F6F3EC]'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                ADMIN
              </button>
            )}
          </nav>
        </div>

        {/* User Actions & CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Plan CTA */}
          <button
            onClick={() => onNavigate('builder')}
            className="hidden sm:flex px-3 py-1.5 bg-[#B8823A] hover:bg-[#1F2B2E] text-white border-2 border-[#1F2B2E] font-mono text-xs font-bold uppercase transition shadow-[2px_2px_0px_0px_#1F2B2E] items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            PLAN TRIP
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('profile')}
                className={`flex items-center gap-2 px-2.5 py-1.5 bg-white border border-[#1F2B2E] font-mono text-xs font-bold transition cursor-pointer ${
                  currentTab === 'profile' ? 'bg-[#1F2B2E] text-[#F6F3EC]' : 'hover:bg-[#F6F3EC] text-[#1F2B2E]'
                }`}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-5 w-5 object-cover border border-[#1F2B2E]"
                  />
                ) : (
                  <div className="h-5 w-5 bg-[#1F2B2E] text-[#F6F3EC] flex items-center justify-center font-mono font-bold text-[10px] border border-[#1F2B2E]">
                    {initialLetter}
                  </div>
                )}
                <span className="uppercase hidden md:inline truncate max-w-[100px]">{user.name}</span>
              </button>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 bg-white border border-[#1F2B2E] text-[#1F2B2E] hover:bg-[#B84A3E] hover:text-white transition cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="px-3 py-1.5 bg-[#2C5F7C] hover:bg-[#1F2B2E] text-[#F6F3EC] border border-[#1F2B2E] font-mono text-xs font-bold uppercase transition shadow-[2px_2px_0px_0px_#1F2B2E] flex items-center gap-1.5 cursor-pointer"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>SIGN IN</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 bg-white border border-[#1F2B2E] text-[#1F2B2E] cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t-2 border-[#1F2B2E] p-4 space-y-2 font-mono text-xs shadow-lg">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 border border-[#1F2B2E] font-bold uppercase ${
              currentTab === 'home' ? 'bg-[#1F2B2E] text-white' : 'bg-white text-[#1F2B2E]'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => {
              onNavigate('cities');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 border border-[#1F2B2E] font-bold uppercase flex items-center gap-2 ${
              currentTab === 'cities' ? 'bg-[#1F2B2E] text-white' : 'bg-white text-[#1F2B2E]'
            }`}
          >
            <MapPin className="h-4 w-4 text-[#2C5F7C]" />
            Explore Cities
          </button>

          <button
            onClick={() => {
              onNavigate('activities');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 border border-[#1F2B2E] font-bold uppercase flex items-center gap-2 ${
              currentTab === 'activities' ? 'bg-[#1F2B2E] text-white' : 'bg-white text-[#1F2B2E]'
            }`}
          >
            <Search className="h-4 w-4 text-[#B8823A]" />
            Activities Catalog
          </button>

          <div className="p-2 bg-[#F6F3EC] border border-[#1F2B2E] space-y-1">
            <span className="font-bold text-[10px] text-[#2C5F7C] uppercase block">Trip Workspace:</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  onNavigate('itinerary');
                  setMobileMenuOpen(false);
                }}
                className="px-2 py-1 bg-white border border-[#1F2B2E] text-left font-bold text-[11px]"
              >
                Itinerary View
              </button>
              <button
                onClick={() => {
                  onNavigate('builder');
                  setMobileMenuOpen(false);
                }}
                className="px-2 py-1 bg-white border border-[#1F2B2E] text-left font-bold text-[11px]"
              >
                Trip Builder
              </button>
              <button
                onClick={() => {
                  onNavigate('budget');
                  setMobileMenuOpen(false);
                }}
                className="px-2 py-1 bg-white border border-[#1F2B2E] text-left font-bold text-[11px]"
              >
                Budget Ledger
              </button>
              <button
                onClick={() => {
                  onNavigate('calendar');
                  setMobileMenuOpen(false);
                }}
                className="px-2 py-1 bg-white border border-[#1F2B2E] text-left font-bold text-[11px]"
              >
                Calendar View
              </button>
            </div>
            <button
              onClick={() => {
                onNavigate('share');
                setMobileMenuOpen(false);
              }}
              className="w-full px-2 py-1 bg-[#7FA69C] text-white border border-[#1F2B2E] text-center font-bold text-[11px]"
            >
              Public Share Pass
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 border border-[#B84A3E] font-bold uppercase flex items-center gap-2 ${
                currentTab === 'admin' ? 'bg-[#B84A3E] text-white' : 'bg-white text-[#B84A3E]'
              }`}
            >
              <Shield className="h-4 w-4" />
              Admin Dashboard
            </button>
          )}
        </div>
      )}
    </header>
  );
}
