import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
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
import { TRIP_ID } from './api/mockData';
import {
  Compass, ArrowLeft, Layers, Calendar, DollarSign,
  Globe, Search, MapPin, Shield, User, Sparkles
} from 'lucide-react';

function MainApp() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'cities', 'activities', 'builder', 'itinerary', 'budget', 'calendar', 'share', 'admin', 'profile', 'auth'
  const [navParams, setNavParams] = useState({});

  const navigate = (tab, params = {}) => {
    setActiveTab(tab);
    setNavParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Subpage title helper
  const getSubpageInfo = () => {
    switch (activeTab) {
      case 'cities':
        return { title: 'CITY DISCOVERY & SEARCH', screen: 'SCREEN 7 • DISCOVERY', icon: MapPin, color: 'text-[#2C5F7C]' };
      case 'activities':
        return { title: 'ACTIVITY & EXPERIENCE CATALOG', screen: 'SCREEN 8 • CATALOG', icon: Search, color: 'text-[#B8823A]' };
      case 'builder':
        return { title: 'ITINERARY BUILDER & ROUTE DRAFT', screen: 'SCREEN 5 • WORKSPACE', icon: Layers, color: 'text-[#2C5F7C]' };
      case 'itinerary':
        return { title: 'ITINERARY DOCUMENT VIEW', screen: 'SCREEN 6 • READING VIEW', icon: Layers, color: 'text-[#1F2B2E]' };
      case 'budget':
        return { title: 'TRIP BUDGET & COST LEDGER', screen: 'SCREEN 9 • SERVER ARITHMETIC', icon: DollarSign, color: 'text-[#B8823A]' };
      case 'calendar':
        return { title: 'TRIP CALENDAR & TIMELINE', screen: 'SCREEN 10 • SCHEDULE', icon: Calendar, color: 'text-[#2C5F7C]' };
      case 'share':
        return { title: 'PUBLIC SHAREABLE ITINERARY PASS', screen: 'SCREEN 11 • PUBLIC PASS', icon: Globe, color: 'text-[#7FA69C]' };
      case 'admin':
        return { title: 'SYSTEM & ANALYTICS DASHBOARD', screen: 'SCREEN 13 • ADMIN PORTAL', icon: Shield, color: 'text-[#B84A3E]' };
      case 'profile':
        return { title: 'PASSENGER PASSPORT & SETTINGS', screen: 'SCREEN 12 • USER PROFILE', icon: User, color: 'text-[#1F2B2E]' };
      case 'auth':
        return { title: 'PASSENGER CHECK-IN & AUTHENTICATION', screen: 'SCREEN 1 • AUTH', icon: User, color: 'text-[#2C5F7C]' };
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
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
        
        {/* Breadcrumb / Subpage Header if not on Home */}
        {activeTab !== 'home' && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border-2 border-[#1F2B2E] p-4 shadow-[3px_3px_0px_0px_#1F2B2E]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('home')}
                className="px-3 py-1.5 bg-[#F6F3EC] hover:bg-[#1F2B2E] hover:text-white border border-[#1F2B2E] font-mono text-xs font-bold uppercase transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                DASHBOARD
              </button>

              {subpageInfo && (
                <div>
                  <div className="font-mono text-[10px] uppercase font-bold text-[#2C5F7C] leading-none">
                    {subpageInfo.screen}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[#1F2B2E] leading-tight flex items-center gap-2">
                    <subpageInfo.icon className={`h-5 w-5 ${subpageInfo.color}`} />
                    {subpageInfo.title}
                  </h2>
                </div>
              )}
            </div>

            {/* Quick Trip Workspace Switchers for Itinerary / Builder / Budget / Calendar / Share */}
            {['builder', 'itinerary', 'budget', 'calendar', 'share'].includes(activeTab) && (
              <div className="flex flex-wrap items-center gap-1 font-mono text-[11px]">
                <button
                  onClick={() => navigate('itinerary')}
                  className={`px-2.5 py-1 border border-[#1F2B2E] uppercase font-bold transition cursor-pointer ${
                    activeTab === 'itinerary' ? 'bg-[#1F2B2E] text-white' : 'bg-white hover:bg-[#F6F3EC]'
                  }`}
                >
                  View
                </button>
                <button
                  onClick={() => navigate('builder')}
                  className={`px-2.5 py-1 border border-[#1F2B2E] uppercase font-bold transition cursor-pointer ${
                    activeTab === 'builder' ? 'bg-[#1F2B2E] text-white' : 'bg-white hover:bg-[#F6F3EC]'
                  }`}
                >
                  Builder
                </button>
                <button
                  onClick={() => navigate('budget')}
                  className={`px-2.5 py-1 border border-[#1F2B2E] uppercase font-bold transition cursor-pointer ${
                    activeTab === 'budget' ? 'bg-[#1F2B2E] text-white' : 'bg-white hover:bg-[#F6F3EC]'
                  }`}
                >
                  Budget
                </button>
                <button
                  onClick={() => navigate('calendar')}
                  className={`px-2.5 py-1 border border-[#1F2B2E] uppercase font-bold transition cursor-pointer ${
                    activeTab === 'calendar' ? 'bg-[#1F2B2E] text-white' : 'bg-white hover:bg-[#F6F3EC]'
                  }`}
                >
                  Calendar
                </button>
                <button
                  onClick={() => navigate('share')}
                  className={`px-2.5 py-1 border border-[#1F2B2E] uppercase font-bold transition cursor-pointer ${
                    activeTab === 'share' ? 'bg-[#7FA69C] text-white' : 'bg-white hover:bg-[#F6F3EC]'
                  }`}
                >
                  Share
                </button>
              </div>
            )}
          </div>
        )}

        {/* View Switching */}
        {activeTab === 'home' && (
          <HomePage
            onNavigate={navigate}
            onSelectCity={(cityName) => navigate('cities', { search: cityName })}
            onSelectActivity={(actName) => navigate('activities', { search: actName })}
          />
        )}

        {activeTab === 'cities' && (
          <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E]">
            <CitySearch
              initialSearch={navParams.search || ''}
              onAddToTrip={(city) => {
                navigate('builder', { cityId: city.id });
              }}
            />
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E]">
            <ActivitySearchPage
              initialCityName={navParams.city}
              initialSearch={navParams.search || ''}
              onBack={() => navigate('home')}
              onAddActivity={(activity) => console.log('Add activity:', activity)}
              onRemoveActivity={(activity) => console.log('Remove activity:', activity)}
              selectedActivityIds={[]}
            />
          </div>
        )}

        {activeTab === 'builder' && (
          <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E]">
            <ItineraryBuilder tripId={navParams.tripId || TRIP_ID} />
          </div>
        )}

        {activeTab === 'itinerary' && (
          <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E]">
            <ItineraryView tripId={navParams.tripId || TRIP_ID} />
          </div>
        )}

        {activeTab === 'budget' && (
          <TripBudgetPage
            tripId={navParams.tripId || null}
            onBack={() => navigate('home')}
            onNavigateToCalendar={() => navigate('calendar')}
          />
        )}

        {activeTab === 'calendar' && (
          <TripCalendarPage
            tripId={navParams.tripId || null}
            onBack={() => navigate('home')}
            onNavigateToBudget={() => navigate('budget')}
            onNavigateToActivities={() => navigate('activities')}
          />
        )}

        {activeTab === 'share' && (
          <PublicItineraryPage
            shareSlug={navParams.slug || 'europe-grand-2026-x8f1'}
            onBack={() => navigate('home')}
            onNavigateToAuth={() => navigate('auth')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPage />
        )}

        {activeTab === 'profile' && isAuthenticated && (
          <ProfilePage />
        )}

        {activeTab === 'profile' && !isAuthenticated && (
          <AuthPage onSuccess={() => navigate('profile')} />
        )}

        {activeTab === 'auth' && (
          <AuthPage onSuccess={() => navigate('home')} />
        )}

      </main>

      {/* Footer Inked Seal */}
      <footer className="border-t-2 border-[#1F2B2E] bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#1F2B2E]">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 bg-[#1F2B2E] text-[#F6F3EC] flex items-center justify-center font-bold text-xs">GT</span>
            <span className="font-bold">GLOBETROTTER &bull; INKED MAP ROUTE SYSTEM</span>
          </div>
          <div className="text-[#1F2B2E]/70 text-center sm:text-right text-[11px]">
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
