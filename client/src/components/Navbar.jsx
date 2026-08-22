import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Compass, User as UserIcon, LogOut, Search, MapPin,
  Layers, Calendar, DollarSign, Globe, Shield, Plus,
  Menu, X, Sparkles, ChevronDown, Phone, Instagram, Facebook, Twitter
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
    return `px-4 py-2 uppercase font-extrabold text-xs sm:text-sm tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
      isActive
        ? 'text-[#F5B800] border-b-2 border-[#F5B800]'
        : 'text-[#1E232A] hover:text-[#F5B800]'
    }`;
  };

  const isTripHubActive = ['builder', 'itinerary', 'budget', 'calendar', 'share'].includes(currentTab);

  return (
    <header className="bg-white sticky top-0 z-50 shadow-md w-full">
      
      {/* Top Contact & Announcement Bar */}
      <div className="bg-[#1A1D23] text-white text-xs sm:text-sm py-2.5 px-6 sm:px-12 flex justify-between items-center border-b border-white/10 font-sans">
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-4 text-gray-300">
            <span className="flex items-center gap-1.5 hover:text-[#F5B800] transition cursor-pointer">
              <Instagram className="h-4 w-4" />
            </span>
            <span className="flex items-center gap-1.5 hover:text-[#F5B800] transition cursor-pointer">
              <Facebook className="h-4 w-4" />
            </span>
            <span className="flex items-center gap-1.5 hover:text-[#F5B800] transition cursor-pointer">
              <Twitter className="h-4 w-4" />
            </span>
          </div>
          <span className="flex items-center gap-2 text-white font-semibold">
            <Phone className="h-4 w-4 text-[#F5B800]" />
            1-800-GLOBE-TRIP (456-2387)
          </span>
        </div>

        <div className="flex items-center gap-4 font-bold tracking-wider uppercase">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-[#F5B800] font-extrabold">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="text-white hover:text-[#F5B800] transition flex items-center gap-1.5 cursor-pointer bg-white/10 px-3 py-1 rounded"
              >
                <LogOut className="h-4 w-4" /> SIGN OUT
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="text-[#F5B800] hover:text-white bg-[#F5B800]/10 hover:bg-[#F5B800]/20 px-4 py-1.5 rounded-full transition cursor-pointer font-extrabold text-xs sm:text-sm tracking-widest border border-[#F5B800]/30"
            >
              LOGIN / REGISTER
            </button>
          )}
        </div>
      </div>

      {/* Main Wanderers Brand Header - Full Edge-to-Edge Width */}
      <div className="w-full px-6 sm:px-12 h-24 flex items-center justify-between border-b border-gray-100">
        
        {/* Brand Logo with Yellow Script Accent */}
        <div
          onClick={() => {
            onNavigate('home');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="relative">
            <span className="font-script text-[#F5B800] text-4xl sm:text-5xl block leading-none transform -rotate-6 transition group-hover:rotate-0">
              GlobeTrotter
            </span>
            <span className="font-serif font-black text-2xl sm:text-3xl text-[#1E232A] tracking-wider block uppercase -mt-2">
              ADVENTURES
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => onNavigate('home')}
            className={navItemClass('home')}
          >
            HOME
          </button>

          <button
            onClick={() => onNavigate('my-trips')}
            className={navItemClass('my-trips')}
          >
            MY TRIPS
          </button>

          <button
            onClick={() => onNavigate('cities')}
            className={navItemClass('cities')}
          >
            DESTINATIONS
          </button>

          <button
            onClick={() => onNavigate('activities')}
            className={navItemClass('activities')}
          >
            TOURS & ACTIVITIES
          </button>

          <button
            onClick={() => onNavigate('community')}
            className={navItemClass('community')}
          >
            COMMUNITY
          </button>

          <button
            onClick={() => onNavigate('ai-planner')}
            className={`px-4 py-2 uppercase font-extrabold text-xs sm:text-sm tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'ai-planner'
                ? 'text-[#F5B800] border-b-2 border-[#F5B800]'
                : 'text-[#F5B800] hover:text-white bg-[#1A1D23] px-3 py-1.5 rounded-full shadow'
            }`}
          >
            <Sparkles className="h-4 w-4 text-[#F5B800]" />
            AI PLANNER
          </button>

          {/* Trip Hub Dropdown */}
          <div className="relative">
            <button
              onClick={() => setTripDropdownOpen(!tripDropdownOpen)}
              className={`px-4 py-2 uppercase font-extrabold text-xs sm:text-sm tracking-wider transition cursor-pointer flex items-center gap-1 ${
                isTripHubActive
                  ? 'text-[#F5B800] border-b-2 border-[#F5B800]'
                  : 'text-[#1E232A] hover:text-[#F5B800]'
              }`}
            >
              TRIP HUB
              <ChevronDown className={`h-4 w-4 transition-transform ${tripDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {tripDropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-64 bg-[#1A1D23] text-white border-t-4 border-[#F5B800] shadow-2xl py-3 z-50 font-sans"
                onMouseLeave={() => setTripDropdownOpen(false)}
              >
                <button
                  onClick={() => {
                    onNavigate('my-trips');
                    setTripDropdownOpen(false);
                  }}
                  className="w-full text-left px-5 py-2.5 text-xs sm:text-sm font-semibold hover:bg-white/10 hover:text-[#F5B800] flex items-center gap-2 cursor-pointer border-b border-white/5"
                >
                  <Layers className="h-4 w-4 text-[#F5B800]" />
                  My Trips Wallet
                </button>
                <button
                  onClick={() => {
                    onNavigate('create-trip');
                    setTripDropdownOpen(false);
                  }}
                  className="w-full text-left px-5 py-2.5 text-xs sm:text-sm font-semibold hover:bg-white/10 hover:text-[#F5B800] flex items-center gap-2 cursor-pointer border-b border-white/5"
                >
                  <Plus className="h-4 w-4 text-[#F5B800]" />
                  Plan New Journey
                </button>
                <button
                  onClick={() => {
                    onNavigate('itinerary');
                    setTripDropdownOpen(false);
                  }}
                  className="w-full text-left px-5 py-2.5 text-xs sm:text-sm font-semibold hover:bg-white/10 hover:text-[#F5B800] flex items-center gap-2 cursor-pointer border-b border-white/5"
                >
                  <Globe className="h-4 w-4 text-[#F5B800]" />
                  Interactive Itinerary View
                </button>
                <button
                  onClick={() => {
                    onNavigate('builder');
                    setTripDropdownOpen(false);
                  }}
                  className="w-full text-left px-5 py-2.5 text-xs sm:text-sm font-semibold hover:bg-white/10 hover:text-[#F5B800] flex items-center gap-2 cursor-pointer border-b border-white/5"
                >
                  <Compass className="h-4 w-4 text-[#F5B800]" />
                  Itinerary Builder
                </button>
                <button
                  onClick={() => {
                    onNavigate('budget');
                    setTripDropdownOpen(false);
                  }}
                  className="w-full text-left px-5 py-2.5 text-xs sm:text-sm font-semibold hover:bg-white/10 hover:text-[#F5B800] flex items-center gap-2 cursor-pointer border-b border-white/5"
                >
                  <DollarSign className="h-4 w-4 text-[#F5B800]" />
                  Trip Budget & Ledger
                </button>
                <button
                  onClick={() => {
                    onNavigate('calendar');
                    setTripDropdownOpen(false);
                  }}
                  className="w-full text-left px-5 py-2.5 text-xs sm:text-sm font-semibold hover:bg-white/10 hover:text-[#F5B800] flex items-center gap-2 cursor-pointer border-b border-white/5"
                >
                  <Calendar className="h-4 w-4 text-[#F5B800]" />
                  Timeline & Calendar
                </button>
                <button
                  onClick={() => {
                    onNavigate('share');
                    setTripDropdownOpen(false);
                  }}
                  className="w-full text-left px-5 py-2.5 text-xs sm:text-sm font-semibold hover:bg-white/10 hover:text-[#F5B800] flex items-center gap-2 cursor-pointer border-b border-white/5"
                >
                  <Globe className="h-4 w-4 text-[#F5B800]" />
                  Public Share Pass
                </button>
                <button
                  onClick={() => {
                    onNavigate('community');
                    setTripDropdownOpen(false);
                  }}
                  className="w-full text-left px-5 py-2.5 text-xs sm:text-sm font-semibold hover:bg-white/10 text-[#F5B800] flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-[#F5B800]" />
                  Explorer Community Hub
                </button>
              </div>
            )}
          </div>

          {/* Admin link */}
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`px-4 py-2 font-bold text-xs sm:text-sm tracking-wider transition cursor-pointer flex items-center gap-1 text-red-500 hover:text-red-600 ${
                currentTab === 'admin' ? 'border-b-2 border-red-500' : ''
              }`}
            >
              <Shield className="h-4 w-4" />
              ADMIN
            </button>
          )}
        </nav>

        {/* User Actions & Wanderers Gold CTA */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('create-trip')}
            className="px-6 py-3 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-extrabold text-xs sm:text-sm tracking-widest uppercase transition shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer rounded-full"
          >
            <Plus className="h-4 w-4" />
            PLAN NOW
          </button>

          {isAuthenticated ? (
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#F9F8F6] border border-gray-300 hover:border-[#F5B800] transition cursor-pointer rounded-full"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-7 w-7 rounded-full object-cover border border-[#F5B800]"
                />
              ) : (
                <div className="h-7 w-7 bg-[#F5B800] text-[#1E232A] rounded-full flex items-center justify-center font-bold text-xs">
                  {initialLetter}
                </div>
              )}
              <span className="text-xs sm:text-sm font-bold uppercase hidden xl:inline text-[#1E232A] truncate max-w-[100px]">{user.name}</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="hidden lg:flex p-2.5 text-[#1E232A] hover:text-[#F5B800] transition cursor-pointer"
              title="Account Login"
            >
              <UserIcon className="h-6 w-6" />
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#1E232A] cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="h-7 w-7 text-[#F5B800]" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1A1D23] text-white border-t border-white/10 p-6 space-y-4 font-sans text-sm">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 font-bold uppercase tracking-wider ${
              currentTab === 'home' ? 'text-[#F5B800] bg-white/5' : 'text-white'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => {
              onNavigate('my-trips');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 font-bold uppercase tracking-wider ${
              currentTab === 'my-trips' ? 'text-[#F5B800] bg-white/5' : 'text-white'
            }`}
          >
            My Trips
          </button>

          <button
            onClick={() => {
              onNavigate('cities');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 font-bold uppercase tracking-wider ${
              currentTab === 'cities' ? 'text-[#F5B800] bg-white/5' : 'text-white'
            }`}
          >
            Destinations
          </button>

          <button
            onClick={() => {
              onNavigate('activities');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 font-bold uppercase tracking-wider ${
              currentTab === 'activities' ? 'text-[#F5B800] bg-white/5' : 'text-white'
            }`}
          >
            Tours & Activities
          </button>

          <div className="p-4 bg-white/5 border border-white/10 space-y-3">
            <span className="font-bold text-xs text-[#F5B800] uppercase block tracking-wider">Trip Hub Options:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onNavigate('itinerary');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 bg-white/5 hover:bg-white/10 text-left font-semibold text-white rounded text-xs"
              >
                Itinerary View
              </button>
              <button
                onClick={() => {
                  onNavigate('builder');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 bg-white/5 hover:bg-white/10 text-left font-semibold text-white rounded text-xs"
              >
                Trip Builder
              </button>
              <button
                onClick={() => {
                  onNavigate('budget');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 bg-white/5 hover:bg-white/10 text-left font-semibold text-white rounded text-xs"
              >
                Budget Ledger
              </button>
              <button
                onClick={() => {
                  onNavigate('calendar');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 bg-white/5 hover:bg-white/10 text-left font-semibold text-white rounded text-xs"
              >
                Calendar View
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              onNavigate('create-trip');
              setMobileMenuOpen(false);
            }}
            className="w-full py-3.5 bg-[#F5B800] text-[#1E232A] font-extrabold text-center uppercase tracking-widest text-sm"
          >
            Plan New Journey
          </button>
        </div>
      )}
    </header>
  );
}
