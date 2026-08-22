import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import TicketCard from './components/TicketCard';
import ActivitySearchPage from './pages/ActivitySearchPage';
import CitySearch from './components/city-search/CitySearch';
import ItineraryBuilder from './components/itinerary-builder/ItineraryBuilder';
import ItineraryView from './components/itinerary-view/ItineraryView';
import { TRIP_ID } from './api/mockData';
import TripBudgetPage from './pages/TripBudgetPage';
import TripCalendarPage from './pages/TripCalendarPage';
import PublicItineraryPage from './pages/PublicItineraryPage';
import { 
  Compass, Server, CheckCircle2, ShieldCheck, MapPin, DollarSign, 
  Calendar, Users, RefreshCw, Sparkles, ArrowRight, User as UserIcon, 
  LogOut, Database, Globe, Layers, Key, Search, PieChart
} from 'lucide-react';

function MainApp() {
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'activities', 'budget', 'calendar', 'profile', 'auth'
  
  // Health check & Cities data
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      console.error('Health fetch error:', err);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const roles = [
    {
      person: 'A',
      title: 'Auth & Core Backend',
      status: 'COMPLETED & REFACTORED',
      desc: 'Login/Signup, Profile/Settings, Neon DB Schema (design.md aligned), JWT Auth APIs',
      color: 'bg-white border-2 border-[#1F2B2E]'
    },
    {
      person: 'B',
      title: 'Trip Management',
      status: 'READY FOR PHASE 3',
      desc: 'Dashboard (Screen 2), Create Trip (Screen 3), My Trips (Screen 4), Itinerary Builder (Screen 5)',
      color: 'bg-white border-2 border-[#1F2B2E]'
    },
    {
      person: 'C',
      title: 'Discovery & Budget',
      status: 'COMPLETED (SCR 7, 8, 9)',
      desc: 'City Search (Screen 7), Activity Search (Screen 8), Budget Breakdown (Screen 9)',
      color: 'bg-white border-2 border-[#1F2B2E]'
    },
    {
      person: 'D',
      title: 'Visualization & Sharing',
      status: 'CALENDAR READY (SCR 10)',
      desc: 'Itinerary View (Screen 6), Calendar (Screen 10), Public Share (Screen 11), Admin (Screen 13)',
      color: 'bg-white border-2 border-[#1F2B2E]'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#1F2B2E] flex flex-col font-body selection:bg-[#2C5F7C] selection:text-[#F6F3EC]">

      {/* Top Boarding Pass Header Shell */}
      <header className="bg-white border-b-2 border-[#1F2B2E] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-6">
            <div
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="h-10 w-10 bg-[#1F2B2E] text-[#F6F3EC] flex items-center justify-center font-mono font-extrabold text-xl rounded-sm shadow-[2px_2px_0px_0px_#2C5F7C]">
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
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-2 font-mono text-xs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 border border-[#1F2B2E] uppercase font-bold transition ${activeTab === 'overview' ? 'bg-[#1F2B2E] text-[#F6F3EC]' : 'bg-white text-[#1F2B2E] hover:bg-[#F6F3EC]'
                  }`}
              >
                OVERVIEW
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`px-3 py-1.5 border border-[#1F2B2E] uppercase font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'activities' ? 'bg-[#1F2B2E] text-[#F6F3EC]' : 'bg-white text-[#1F2B2E] hover:bg-[#F6F3EC]'
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                ACTIVITIES (SCR 8)
              </button>
              <button
                onClick={() => setActiveTab('cities')}
                className={`px-3 py-1.5 border border-[#1F2B2E] uppercase font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'cities' ? 'bg-[#1F2B2E] text-[#F6F3EC]' : 'bg-white text-[#1F2B2E] hover:bg-[#F6F3EC]'
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                CITIES (SCR 7)
              </button>
              <button
                onClick={() => setActiveTab('builder')}
                className={`px-3 py-1.5 border border-[#1F2B2E] uppercase font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'builder' ? 'bg-[#1F2B2E] text-[#F6F3EC]' : 'bg-white text-[#1F2B2E] hover:bg-[#F6F3EC]'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                BUILDER (SCR 5)
              </button>
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`px-3 py-1.5 border border-[#1F2B2E] uppercase font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'itinerary' ? 'bg-[#1F2B2E] text-[#F6F3EC]' : 'bg-white text-[#1F2B2E] hover:bg-[#F6F3EC]'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                ITINERARY (SCR 6)
              </button>
              <button
                onClick={() => setActiveTab('budget')}
                className={`px-3 py-1.5 border border-[#1F2B2E] uppercase font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'budget' ? 'bg-[#1F2B2E] text-[#F6F3EC]' : 'bg-white text-[#1F2B2E] hover:bg-[#F6F3EC]'
                }`}
              >
                <DollarSign className="h-3.5 w-3.5 text-[#B8823A]" />
                BUDGET (SCR 9)
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-3 py-1.5 border border-[#1F2B2E] uppercase font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'calendar' ? 'bg-[#1F2B2E] text-[#F6F3EC]' : 'bg-white text-[#1F2B2E] hover:bg-[#F6F3EC]'
                }`}
              >
                <Calendar className="h-3.5 w-3.5 text-[#2C5F7C]" />
                CALENDAR (SCR 10)
              </button>
              <button
                onClick={() => setActiveTab('share')}
                className={`px-3 py-1.5 border border-[#1F2B2E] uppercase font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'share' ? 'bg-[#1F2B2E] text-[#F6F3EC]' : 'bg-white text-[#1F2B2E] hover:bg-[#F6F3EC]'
                }`}
              >
                <Globe className="h-3.5 w-3.5 text-[#7FA69C]" />
                SHARE (SCR 11)
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-3 py-1.5 border border-[#1F2B2E] uppercase font-bold transition ${activeTab === 'profile' ? 'bg-[#1F2B2E] text-[#F6F3EC]' : 'bg-white text-[#1F2B2E] hover:bg-[#F6F3EC]'
                    }`}
                >
                  PROFILE (SCR 12)
                </button>
              )}
            </nav>
          </div>

          {/* User Auth Action */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 px-3 py-1 bg-white border border-[#1F2B2E] font-mono text-xs font-bold"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={user.name}
                    className="h-6 w-6 object-cover border border-[#1F2B2E]"
                  />
                  <span className="text-[#1F2B2E] uppercase">{user.name}</span>
                </button>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 bg-white border border-[#1F2B2E] text-[#1F2B2E] hover:bg-[#B84A3E] hover:text-white transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('auth')}
                className="px-4 py-2 bg-[#2C5F7C] hover:bg-[#1F2B2E] text-[#F6F3EC] border border-[#1F2B2E] font-mono text-xs font-bold uppercase transition shadow-[2px_2px_0px_0px_#1F2B2E] flex items-center gap-2"
              >
                <UserIcon className="h-4 w-4" />
                SIGN IN / REGISTER
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">

        {activeTab === 'auth' && !isAuthenticated && (
          <AuthPage onSuccess={() => setActiveTab('profile')} />
        )}

        {activeTab === 'profile' && isAuthenticated && (
          <ProfilePage />
        )}

        {activeTab === 'activities' && (
          <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E]">
            <ActivitySearchPage
              onBack={() => setActiveTab('overview')}
              onAddActivity={(activity) => console.log('Add activity:', activity)}
              onRemoveActivity={(activity) => console.log('Remove activity:', activity)}
              selectedActivityIds={[]}
            />
          </div>
        )}

        {activeTab === 'cities' && (
          <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E]">
            <CitySearch onAddToTrip={(city) => console.log('Add to trip:', city)} />
          </div>
        )}

        {activeTab === 'builder' && (
          <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E]">
            <ItineraryBuilder tripId={TRIP_ID} />
          </div>
        )}

        {activeTab === 'itinerary' && (
          <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E]">
            <ItineraryView tripId={TRIP_ID} />
          </div>
        )}

        {activeTab === 'budget' && (
          <TripBudgetPage
            onBack={() => setActiveTab('overview')}
            onNavigateToCalendar={() => setActiveTab('calendar')}
          />
        )}

        {activeTab === 'calendar' && (
          <TripCalendarPage
            onBack={() => setActiveTab('overview')}
            onNavigateToBudget={() => setActiveTab('budget')}
            onNavigateToActivities={() => setActiveTab('activities')}
          />
        )}

        {activeTab === 'share' && (
          <PublicItineraryPage
            onBack={() => setActiveTab('overview')}
            onNavigateToAuth={() => setActiveTab('auth')}
          />
        )}

        {(activeTab === 'overview' || (activeTab === 'auth' && isAuthenticated) || (activeTab === 'profile' && !isAuthenticated)) && (
          <div className="space-y-10">

            {/* Document Hero Header */}
            <section className="bg-white border-2 border-[#1F2B2E] p-8 shadow-[4px_4px_0px_0px_#1F2B2E] relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#B8823A] text-white font-mono text-xs font-bold uppercase">
                    <span>DESIGN.MD ALIGNED</span>
                    <span>&bull;</span>
                    <span>NEON POSTGRESQL</span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight text-[#1F2B2E]">
                    GLOBETROTTER ARCHITECTURE
                  </h1>
                  <p className="text-[#1F2B2E]/80 text-sm font-body leading-relaxed">
                    Designed around the <span className="font-mono text-[#2C5F7C] font-bold">"Itinerary-as-Document"</span> identity. Powered by React (Vite), Express API, Neon PostgreSQL DB, and bcrypt 12 salt rounds.
                  </p>
                </div>

                <div className="p-4 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-xs space-y-1 shrink-0">
                  <div className="font-bold text-[#2C5F7C] uppercase">API STATUS</div>
                  <div className="text-[#1F2B2E]">PORT: 5000</div>
                  <div className="text-[#1F2B2E]">DB: Neon Cloud PostgreSQL</div>
                  <div className="text-[#B8823A]">BCRYPT: 12 Rounds</div>
                </div>
              </div>
            </section>

            {/* Ticket Stub Demo Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-display text-[#1F2B2E] uppercase">
                  Signature Ticket Stub StopCard Component (Scr 2, 4, 5, 6)
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TicketCard
                  city="PARIS"
                  country="FRANCE"
                  dates="OCT 12 — OCT 16, 2026"
                  cost={32500}
                  activitiesCount={4}
                  badge="DESTINATION 01"
                >
                  <p className="text-xs text-[#1F2B2E] font-body mb-3">
                    The City of Light, featuring Eiffel Tower summit tour, Seine river evening cruise, and Montmartre food tastings.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-[10px] text-[#2C5F7C] font-bold">
                      #sightseeing
                    </span>
                    <span className="px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-[10px] text-[#B8823A] font-bold">
                      #culture
                    </span>
                    <span className="px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-[10px] text-[#7FA69C] font-bold">
                      #food
                    </span>
                  </div>
                </TicketCard>

                <TicketCard
                  city="TOKYO"
                  country="JAPAN"
                  dates="NOV 02 — NOV 08, 2026"
                  cost={48000}
                  activitiesCount={4}
                  badge="DESTINATION 02"
                >
                  <p className="text-xs text-[#1F2B2E] font-body mb-3">
                    Ultra-modern metropolis blending neon skyscrapers with historic Senso-ji temple and Tsukiji market sushi.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-[10px] text-[#2C5F7C] font-bold">
                      #culture
                    </span>
                    <span className="px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-[10px] text-[#7FA69C] font-bold">
                      #food
                    </span>
                  </div>
                </TicketCard>
              </div>
            </section>

            {/* Team Execution Matrix */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-display text-[#1F2B2E] uppercase">
                Team Role Architecture & Screen Assignments
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {roles.map((r) => (
                  <div
                    key={r.person}
                    className="bg-white border-2 border-[#1F2B2E] p-5 shadow-[3px_3px_0px_0px_#1F2B2E] flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="h-8 w-8 bg-[#1F2B2E] text-[#F6F3EC] flex items-center justify-center font-mono font-bold text-sm">
                          {r.person}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] text-[#2C5F7C]">
                          {r.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-lg font-display text-[#1F2B2E]">{r.title}</h4>
                      <p className="text-xs font-body text-[#1F2B2E]/80 leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}
      </main>

      {/* Footer Document Note */}
      <footer className="border-t-2 border-[#1F2B2E] bg-white py-4 text-center font-mono text-xs text-[#1F2B2E]">
        GLOBETROTTER &bull; INKED MAP DESIGN SYSTEM &bull; REACT VITE &bull; EXPRESS API &bull; NEON POSTGRESQL DB
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
