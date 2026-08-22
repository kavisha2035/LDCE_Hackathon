import React, { useState, useEffect } from 'react';
import { Compass, Server, CheckCircle2, ShieldCheck, MapPin, DollarSign, Calendar, Users, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const roles = [
    {
      person: 'A',
      title: 'Auth & Core Backend',
      desc: 'Login/Signup, Profile/Settings, DB Schema, Auth APIs',
      icon: ShieldCheck,
      color: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/30 text-cyan-400'
    },
    {
      person: 'B',
      title: 'Trip Management',
      desc: 'Dashboard, Create Trip, My Trips, Itinerary Builder',
      icon: MapPin,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400'
    },
    {
      person: 'C',
      title: 'Discovery & Budget',
      desc: 'City Search, Activity Search, Trip Budget Analytics',
      icon: DollarSign,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400'
    },
    {
      person: 'D',
      title: 'Visualization & Sharing',
      desc: 'Itinerary View, FullCalendar, Public Share Link',
      icon: Calendar,
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Compass className="h-6 w-6 text-white animate-pulse" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              GlobeTrotter
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              Phase 0 Complete
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            Monorepo Setup Verified
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            GlobeTrotter Architecture Ready
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Client (<span className="text-cyan-400 font-mono">React + Vite + Tailwind</span>) and Server (<span className="text-emerald-400 font-mono">Express + Prisma + Postgres</span>) initialized.
          </p>
        </section>

        {/* Server Connection Status Card */}
        <section className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400">
                <Server className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Backend Health Check Status</h3>
                <p className="text-slate-400 text-xs font-mono">GET /api/health</p>
              </div>
            </div>
            
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 text-sm font-medium transition disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Re-test Connection
            </button>
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="flex items-center gap-3 text-slate-400 py-4">
                <RefreshCw className="h-5 w-5 animate-spin text-cyan-400" />
                Checking API server connection...
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                <span>Connection error: {error} (Ensure backend server is running on port 5000)</span>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  Backend Online ({health?.message})
                </div>
                <div className="text-xs text-emerald-400/80 font-mono">
                  Timestamp: {health?.timestamp} | Environment: {health?.environment}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Team Role Selector Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="h-6 w-6 text-cyan-400" />
                Select Your Role for Next Phases
              </h2>
              <p className="text-slate-400 text-sm">Choose which role to execute next (Phases 1–5)</p>
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
                    <p className="text-slate-300 text-xs leading-relaxed">{r.desc}</p>
                  </div>

                  <div className="pt-2 text-xs font-semibold flex items-center gap-1 opacity-70 hover:opacity-100 transition cursor-pointer">
                    Ready for assignment <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-slate-500 text-xs">
        GlobeTrotter Monorepo Setup &bull; Client: Vite React Tailwind &bull; Server: Express Prisma PostgreSQL
      </footer>
    </div>
  );
}
