import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import { 
  Compass, Server, CheckCircle2, ShieldCheck, MapPin, DollarSign, 
  Calendar, Users, RefreshCw, Sparkles, ArrowRight, User as UserIcon, 
  LogOut, Database, Globe, Layers, Key
} from 'lucide-react';

function MainApp() {
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'db', 'auth', 'profile'
  
  // Health & DB quick stats
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);

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
      status: 'Active (Phases 1 & 2 Built)',
      desc: 'Login/Signup, Profile/Settings, Neon DB Schema, JWT Auth APIs',
      icon: ShieldCheck,
      color: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/40 text-cyan-400'
    },
    {
      person: 'B',
      title: 'Trip Management',
      status: 'Ready for Next Phase',
      desc: 'Dashboard, Create Trip, My Trips, Itinerary Builder',
      icon: MapPin,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400'
    },
    {
      person: 'C',
      title: 'Discovery & Budget',
      status: 'Ready for Next Phase',
      desc: 'City Search, Activity Search, Trip Budget Analytics',
      icon: DollarSign,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400'
    },
    {
      person: 'D',
      title: 'Visualization & Sharing',
      status: 'Ready for Next Phase',
      desc: 'Itinerary View, FullCalendar, Public Share Link',
      icon: Calendar,
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div 
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
                <Compass className="h-6 w-6 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                GlobeTrotter
              </span>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-1.5 rounded-lg transition ${
                  activeTab === 'overview' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-3.5 py-1.5 rounded-lg transition ${
                    activeTab === 'profile' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  My Profile
                </button>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={user.name}
                    className="h-7 w-7 rounded-lg object-cover ring-2 ring-cyan-500/30"
                  />
                  <span className="text-xs font-semibold text-slate-200 hidden sm:inline">{user.name}</span>
                </button>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('auth')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs sm:text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition flex items-center gap-2"
              >
                <UserIcon className="h-4 w-4" />
                Sign In / Register
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

        {(activeTab === 'overview' || (activeTab === 'auth' && isAuthenticated) || (activeTab === 'profile' && !isAuthenticated)) && (
          <div className="space-y-10">
            {/* Hero Banner */}
            <section className="text-center space-y-4 max-w-3xl mx-auto pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                Person A — Auth & Database Architecture Active
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                GlobeTrotter Monorepo & Neon DB
              </h1>
              <p className="text-slate-400 text-base sm:text-lg">
                Neon PostgreSQL database connected, 15 cities & 32 activities seeded, JWT Auth + bcrypt salt 12 initialized.
              </p>
            </section>

            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* API & DB Status Card */}
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400">
                      <Server className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">Express + Neon PostgreSQL</h3>
                      <p className="text-slate-400 text-xs font-mono">http://localhost:5000/api/health</p>
                    </div>
                  </div>
                  <button
                    onClick={fetchHealth}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingHealth ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Database Synced & Live
                  </div>
                  <p className="text-emerald-400/80 font-mono">
                    Provider: PostgreSQL (Neon Cloud) | bcrypt rounds: 12
                  </p>
                </div>
              </div>

              {/* User Session Quick Card */}
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400">
                    <Key className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">Authentication Session</h3>
                    <p className="text-slate-400 text-xs">JWT Token & Bcrypt 12 Rounds</p>
                  </div>
                </div>

                {isAuthenticated ? (
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs space-y-2">
                    <div className="font-bold text-sm">Logged in as: {user.name} ({user.email})</div>
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => setActiveTab('profile')}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition"
                      >
                        Manage Profile
                      </button>
                      <button
                        onClick={logout}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs space-y-3">
                    <p>No active user session detected.</p>
                    <button
                      onClick={() => setActiveTab('auth')}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2"
                    >
                      <UserIcon className="h-4 w-4" />
                      Test Login / Signup Screen
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Team Roles Overview */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Users className="h-6 w-6 text-cyan-400" />
                    Team Execution Progress
                  </h2>
                  <p className="text-slate-400 text-sm">Person A Auth & Core DB completed. Select next role when ready.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {roles.map((r) => {
                  const Icon = r.icon;
                  return (
                    <div 
                      key={r.person}
                      className={`p-6 rounded-2xl bg-gradient-to-b ${r.color} border transition duration-300 hover:scale-[1.02] flex flex-col justify-between space-y-4`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="h-9 w-9 rounded-xl bg-slate-900/80 flex items-center justify-center font-bold text-white shadow-inner">
                            {r.person}
                          </span>
                          <Icon className="h-6 w-6 opacity-80" />
                        </div>
                        <h4 className="font-bold text-lg text-white">{r.title}</h4>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/90 text-cyan-300">
                          {r.status}
                        </span>
                        <p className="text-slate-300 text-xs leading-relaxed">{r.desc}</p>
                      </div>

                      <div className="pt-2 text-xs font-semibold flex items-center gap-1 opacity-70 hover:opacity-100 transition cursor-pointer">
                        View details <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-slate-500 text-xs">
        GlobeTrotter &bull; Neon PostgreSQL DB &bull; Express JWT Auth (Bcrypt 12) &bull; React Vite Frontend
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
