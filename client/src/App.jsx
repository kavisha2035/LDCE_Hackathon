import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CreateTripPage from './pages/CreateTripPage';
import MyTripsPage from './pages/MyTripsPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import ActivitySearchPage from './pages/ActivitySearchPage';
import CitySearch from './components/city-search/CitySearch';
import ItineraryBuilder from './components/itinerary-builder/ItineraryBuilder';
import ItineraryView from './components/itinerary-view/ItineraryView';
import TripBudgetPage from './pages/TripBudgetPage';
import TripCalendarPage from './pages/TripCalendarPage';
import PublicItineraryPage from './pages/PublicItineraryPage';
import AdminPage from './pages/AdminPage';
import {
  Compass, ArrowLeft, Layers, Calendar, DollarSign,
  Globe, Search, MapPin, Shield, User, Sparkles, Plus
} from 'lucide-react';

const PROTECTED_TABS = ['create-trip', 'my-trips', 'builder', 'profile', 'admin'];

const VALID_TABS = [
  'home', 'create-trip', 'my-trips', 'cities', 'activities',
  'builder', 'itinerary', 'budget', 'calendar', 'share',
  'admin', 'profile', 'auth', 'reset'
];

const parseLocation = (loc = window.location) => {
  const path = loc.pathname.replace(/^\/+|\/+$/g, '');
  const searchParams = new URLSearchParams(loc.search);
  const params = {};
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }

  // Check reset token in query
  if (params.reset_token) {
    return { tab: 'reset', params, resetToken: params.reset_token };
  }

  if (!path || path === '' || path === 'home') {
    return { tab: 'home', params };
  }

  if (path.startsWith('share/')) {
    const slug = path.split('/')[1];
    return { tab: 'share', params: { ...params, slug } };
  }

  if (VALID_TABS.includes(path)) {
    return { tab: path, params };
  }

  return { tab: 'home', params };
};

const buildUrl = (tab, params = {}) => {
  let path = tab === 'home' ? '/' : `/${tab}`;
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
};

function MainApp() {
  const { user, isAuthenticated, loading } = useAuth();
  const isAdmin = Boolean(isAuthenticated && user?.isAdmin);

  const initialLoc = parseLocation();
  const [activeTab, setActiveTab] = useState(initialLoc.tab);
  const [navParams, setNavParams] = useState(initialLoc.params);
  const [resetToken, setResetToken] = useState(initialLoc.resetToken || null);

  // Authentication redirection memory: track previous page and intended target
  const [previousPage, setPreviousPage] = useState({ tab: 'home', params: {} });
  const [redirectTarget, setRedirectTarget] = useState(null);
  const [authReason, setAuthReason] = useState('');
  const [authMode, setAuthMode] = useState('signup'); // 'signup', 'login'

  // Initialize and synchronize with browser history (popstate / back / forward)
  useEffect(() => {
    const handlePopState = () => {
      const { tab, params, resetToken: token } = parseLocation();
      setActiveTab(tab);
      setNavParams(params);
      if (token) setResetToken(token);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Detect reset_token query param from password reset email link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset_token');
    if (token) {
      setResetToken(token);
      setActiveTab('reset');
      // Clean URL without reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Defensive guard: redirect authenticated user away from auth/reset pages, and guard admin routes
  useEffect(() => {
    if (loading) return;

    if (isAuthenticated && (activeTab === 'auth' || activeTab === 'reset')) {
      navigate('home');
      return;
    }

    if (activeTab === 'admin' && !isAdmin) {
      if (!isAuthenticated) {
        setAuthMode('login');
        setAuthReason('Administrative credentials required to access the admin portal.');
        navigate('auth');
      } else {
        navigate('home');
      }
    }
  }, [activeTab, isAdmin, isAuthenticated, loading]);

  const navigate = (tab, params = {}) => {
    // If already authenticated and trying to access auth/reset page, redirect to home
    if (!loading && isAuthenticated && (tab === 'auth' || tab === 'reset')) {
      const url = buildUrl('home');
      if (window.location.pathname + window.location.search !== url) {
        window.history.pushState({ tab: 'home', params: {} }, '', url);
      }
      setActiveTab('home');
      setNavParams({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 1. If unauthenticated user tries to access a protected page, remember the target and redirect to signup
    if (!loading && PROTECTED_TABS.includes(tab) && !isAuthenticated) {
      setRedirectTarget({ tab, params });
      setAuthMode('signup');
      setAuthReason(
        tab === 'create-trip' ? 'Please sign in or create an account to plan and save custom travel routes.' :
        tab === 'my-trips' ? 'Please sign in or create an account to view and manage your travel itineraries.' :
        tab === 'builder' ? 'Please sign in or create an account to build and modify itinerary stops.' :
        tab === 'profile' ? 'Please sign in or create an account to access your passenger passport profile.' :
        tab === 'admin' ? 'Administrative credentials required to access the admin portal.' :
        'Please sign in or register to access this section.'
      );
      const url = buildUrl('auth');
      if (window.location.pathname + window.location.search !== url) {
        window.history.pushState({ tab: 'auth', params: {} }, '', url);
      }
      setActiveTab('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!loading && tab === 'admin' && !isAdmin) {
      if (!isAuthenticated) {
        setRedirectTarget({ tab: 'admin', params });
        setAuthMode('login');
        setAuthReason('Administrative credentials required to access the admin portal.');
        const url = buildUrl('auth');
        if (window.location.pathname + window.location.search !== url) {
          window.history.pushState({ tab: 'auth', params: {} }, '', url);
        }
        setActiveTab('auth');
      } else {
        const url = buildUrl('home');
        if (window.location.pathname + window.location.search !== url) {
          window.history.pushState({ tab: 'home', params: {} }, '', url);
        }
        setActiveTab('home');
      }
      setNavParams({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. If navigating directly to auth (e.g. clicking "SIGN IN" in navbar), remember the current page
    if (tab === 'auth') {
      if (!redirectTarget && activeTab !== 'auth' && activeTab !== 'reset') {
        setRedirectTarget({ tab: activeTab, params: navParams });
      }
      setAuthMode('login');
      const url = buildUrl('auth');
      if (window.location.pathname + window.location.search !== url) {
        window.history.pushState({ tab: 'auth', params: {} }, '', url);
      }
      setActiveTab('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 3. Normal navigation: update previous page history and push browser URL
    if (activeTab !== 'auth' && activeTab !== 'reset') {
      setPreviousPage({ tab: activeTab, params: navParams });
    }

    const url = buildUrl(tab, params);
    if (window.location.pathname + window.location.search !== url) {
      window.history.pushState({ tab, params }, '', url);
    }

    setActiveTab(tab);
    setNavParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Called after successful login or signup
  const handleAuthSuccess = () => {
    // Determine destination: intended target -> previous page -> default 'home' (never stay on auth)
    const target = (redirectTarget && redirectTarget.tab !== 'auth' && redirectTarget.tab !== 'reset')
      ? redirectTarget
      : (previousPage.tab && previousPage.tab !== 'auth' && previousPage.tab !== 'reset' ? previousPage : { tab: 'home', params: {} });
    
    // Clear auth memory
    setRedirectTarget(null);
    setAuthReason('');
    setAuthMode('login');
    
    // Redirect to destination (or default to home)
    navigate(target.tab || 'home', target.params || {});
  };

  // Subpage title helper
  const getSubpageInfo = () => {
    switch (activeTab) {
      case 'create-trip':
        return { title: 'PLAN A NEW JOURNEY', screen: 'CREATE ROUTE', icon: Plus, color: 'text-[#2C5F7C]' };
      case 'my-trips':
        return { title: 'MY ROUTE SHEETS & WALLET', screen: 'TICKET WALLET', icon: Layers, color: 'text-[#2C5F7C]' };
      case 'cities':
        return { title: 'CITY DISCOVERY & SEARCH', screen: 'DESTINATIONS', icon: MapPin, color: 'text-[#2C5F7C]' };
      case 'activities':
        return { title: 'ACTIVITY & EXPERIENCE CATALOG', screen: 'EXPERIENCES', icon: Search, color: 'text-[#B8823A]' };
      case 'builder':
        return { title: 'ITINERARY BUILDER & ROUTE DRAFT', screen: 'WORKSPACE', icon: Layers, color: 'text-[#2C5F7C]' };
      case 'itinerary':
        return { title: 'ITINERARY DOCUMENT VIEW', screen: 'READING VIEW', icon: Layers, color: 'text-[#1F2B2E]' };
      case 'budget':
        return { title: 'TRIP BUDGET & COST LEDGER', screen: 'FINANCIAL LEDGER', icon: DollarSign, color: 'text-[#B8823A]' };
      case 'calendar':
        return { title: 'TRIP CALENDAR & TIMELINE', screen: 'SCHEDULE TIMELINE', icon: Calendar, color: 'text-[#2C5F7C]' };
      case 'share':
        return { title: 'PUBLIC SHAREABLE ITINERARY PASS', screen: 'PUBLIC PASS', icon: Globe, color: 'text-[#7FA69C]' };
      case 'admin':
        return { title: 'SYSTEM & ANALYTICS DASHBOARD', screen: 'ADMIN PORTAL', icon: Shield, color: 'text-[#B84A3E]' };
      case 'profile':
        return { title: 'PASSENGER PASSPORT & SETTINGS', screen: 'USER PROFILE', icon: User, color: 'text-[#1F2B2E]' };
      case 'auth':
        return { title: 'PASSENGER CHECK-IN & REGISTRATION', screen: 'AUTHENTICATION', icon: User, color: 'text-[#2C5F7C]' };
      case 'reset':
        return { title: 'PASSWORD RESET RECOVERY', screen: 'AUTH RECOVERY', icon: User, color: 'text-[#B8823A]' };
      default:
        return null;
    }
  };

  const subpageInfo = getSubpageInfo();

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#1F2B2E] flex flex-col font-body selection:bg-[#2C5F7C] selection:text-[#F6F3EC]">
      
      {/* Top Navbar */}
      <Navbar currentTab={activeTab} onNavigate={navigate} />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab !== 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          </div>
        )}
        
        {/* Breadcrumb / Subpage Header if not on Home */}
        {activeTab !== 'home' && (
          <div className="w-full px-6 sm:px-12 pt-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-200 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('home')}
                  className="px-4 py-2 bg-gray-100 hover:bg-[#1E232A] hover:text-white border border-gray-300 text-[#1E232A] font-sans text-xs font-extrabold uppercase transition flex items-center gap-2 cursor-pointer rounded-full shadow-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  DASHBOARD
                </button>

                {subpageInfo && (
                  <div>
                    <div className="font-sans text-[10px] uppercase font-bold text-[#F5B800] leading-none">
                      {subpageInfo.screen}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-[#1E232A] leading-tight flex items-center gap-2">
                      <subpageInfo.icon className={`h-5 w-5 ${subpageInfo.color}`} />
                      {subpageInfo.title}
                    </h2>
                  </div>
                )}
              </div>

              {/* Quick Trip Workspace Switchers for Itinerary / Builder / Budget / Calendar / Share */}
              {['builder', 'itinerary', 'budget', 'calendar', 'share', 'my-trips', 'create-trip'].includes(activeTab) && (
                <div className="flex flex-wrap items-center gap-1.5 font-sans text-xs">
                  <button
                    onClick={() => navigate('my-trips')}
                    className={`px-3 py-1.5 rounded-full font-extrabold uppercase transition cursor-pointer ${
                      activeTab === 'my-trips' ? 'bg-[#1E232A] text-[#F5B800]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    My Trips
                  </button>
                  <button
                    onClick={() => navigate('create-trip')}
                    className={`px-3 py-1.5 rounded-full font-extrabold uppercase transition cursor-pointer ${
                      activeTab === 'create-trip' ? 'bg-[#1E232A] text-[#F5B800]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    + New
                  </button>
                  <button
                    onClick={() => navigate('itinerary')}
                    className={`px-3 py-1.5 rounded-full font-extrabold uppercase transition cursor-pointer ${
                      activeTab === 'itinerary' ? 'bg-[#1E232A] text-[#F5B800]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate('builder')}
                    className={`px-3 py-1.5 rounded-full font-extrabold uppercase transition cursor-pointer ${
                      activeTab === 'builder' ? 'bg-[#1E232A] text-[#F5B800]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Builder
                  </button>
                  <button
                    onClick={() => navigate('budget')}
                    className={`px-3 py-1.5 rounded-full font-extrabold uppercase transition cursor-pointer ${
                      activeTab === 'budget' ? 'bg-[#1E232A] text-[#F5B800]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Budget
                  </button>
                  <button
                    onClick={() => navigate('calendar')}
                    className={`px-3 py-1.5 rounded-full font-extrabold uppercase transition cursor-pointer ${
                      activeTab === 'calendar' ? 'bg-[#1E232A] text-[#F5B800]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Calendar
                  </button>
                  <button
                    onClick={() => navigate('share')}
                    className={`px-3 py-1.5 rounded-full font-extrabold uppercase transition cursor-pointer ${
                      activeTab === 'share' ? 'bg-[#F5B800] text-[#1E232A]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Share
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Switching with Auth Guards */}
        {activeTab === 'home' && (
          <HomePage
            onNavigate={navigate}
            onSelectCity={(cityName) => navigate('cities', { search: cityName })}
            onSelectActivity={(actName) => navigate('activities', { search: actName })}
          />
        )}

        {activeTab === 'create-trip' && (
          isAuthenticated ? (
            <CreateTripPage
              onNavigate={navigate}
              onTripCreated={(newTrip) => navigate('builder', { tripId: newTrip.id })}
            />
          ) : (
            <AuthPage
              mode="signup"
              reason="Please sign in or create an account to plan and save your custom travel routes."
              onSuccess={() => navigate('create-trip')}
            />
          )
        )}

        {activeTab === 'my-trips' && (
          isAuthenticated ? (
            <MyTripsPage onNavigate={navigate} />
          ) : (
            <AuthPage
              mode="signup"
              reason="Please sign in or create an account to view and manage your travel itineraries."
              onSuccess={() => navigate('my-trips')}
            />
          )
        )}

        {activeTab === 'cities' && (
          <div className="w-full px-6 sm:px-12">
            <CitySearch
              initialSearch={navParams.search || ''}
              onAddToTrip={(city) => {
                navigate('builder', { cityId: city.id });
              }}
            />
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="w-full px-6 sm:px-12">
            <ActivitySearchPage
              initialCityName={navParams.city}
              initialSearch={navParams.search || ''}
              navTripId={navParams.tripId}
              onNavigate={navigate}
              onBack={() => navigate('home')}
            />
          </div>
        )}

        {activeTab === 'builder' && (
          isAuthenticated ? (
            <div className="w-full px-6 sm:px-12">
              <ItineraryBuilder tripId={navParams.tripId} onNavigate={navigate} />
            </div>
          ) : (
            <AuthPage
              mode="signup"
              reason="Please sign in or create an account to build and modify itinerary stops."
              onSuccess={() => navigate('builder', navParams)}
            />
          )
        )}

        {activeTab === 'itinerary' && (
          <div className="w-full px-6 sm:px-12">
            <ItineraryView tripId={navParams.tripId} onNavigate={navigate} />
          </div>
        )}

        {activeTab === 'budget' && (
          <TripBudgetPage
            tripId={navParams.tripId || null}
            onNavigate={navigate}
            onBack={() => navigate('home')}
            onNavigateToCalendar={() => navigate('calendar')}
          />
        )}

        {activeTab === 'calendar' && (
          <TripCalendarPage
            tripId={navParams.tripId || null}
            onNavigate={navigate}
            onBack={() => navigate('home')}
            onNavigateToBudget={() => navigate('budget')}
            onNavigateToActivities={() => navigate('activities')}
          />
        )}

        {activeTab === 'share' && (
          <PublicItineraryPage
            shareSlug={navParams.slug || 'europe-grand-2026-x8f1'}
            onBack={() => navigate('home')}
            onNavigateToAuth={() => {
              setRedirectTarget({ tab: 'share', params: navParams });
              setAuthMode('signup');
              setAuthReason('Please sign in or create an account to clone trips into your wallet.');
              setActiveTab('auth');
            }}
          />
        )}

        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminPage />
          ) : (
            <AuthPage
              mode="login"
              reason="Administrative credentials required to access the admin portal."
              onSuccess={() => navigate('admin')}
            />
          )
        )}

        {activeTab === 'profile' && (
          isAuthenticated ? (
            <ProfilePage />
          ) : (
            <AuthPage
              mode="signup"
              reason="Please sign in or create an account to view and update your passenger profile."
              onSuccess={() => navigate('profile')}
            />
          )
        )}

        {activeTab === 'auth' && (
          isAuthenticated ? (
            <HomePage
              onNavigate={navigate}
              onSelectCity={(cityName) => navigate('cities', { search: cityName })}
              onSelectActivity={(actName) => navigate('activities', { search: actName })}
            />
          ) : (
            <AuthPage
              mode={authMode}
              reason={authReason}
              onSuccess={handleAuthSuccess}
            />
          )
        )}

        {activeTab === 'reset' && resetToken && (
          <AuthPage
            mode="reset"
            resetToken={resetToken}
            onSuccess={() => {
              setResetToken(null);
              setAuthMode('login');
              setActiveTab('auth');
            }}
          />
        )}

      </main>

      {/* Footer Inked Seal */}
      <footer className="border-t border-gray-200 bg-[#1A1D23] text-white py-8 mt-12">
        <div className="w-full px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs">
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 bg-[#F5B800] text-[#1E232A] rounded-full flex items-center justify-center font-extrabold text-xs">GT</span>
            <span className="font-serif text-base font-bold text-white tracking-wide">GLOBETROTTER ADVENTURES</span>
          </div>
          <div className="text-gray-400 text-center sm:text-right text-xs">
            REACT VITE &bull; NEON POSTGRESQL &bull; EXPRESS API &bull; JWT SECURED
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
