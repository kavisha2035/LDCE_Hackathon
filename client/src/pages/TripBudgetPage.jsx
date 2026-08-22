import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/apiClient';
import { formatCurrency, formatDateShort } from '../lib/format';
import {
  DollarSign, PieChart as PieChartIcon, BarChart3, AlertTriangle,
  ArrowLeft, RefreshCw, Calendar, MapPin, BedDouble, Plane,
  Ticket, CheckCircle2, ChevronRight, Sliders, Info, Plus, Compass, Edit3
} from 'lucide-react';

export default function TripBudgetPage({ tripId: propTripId, onBack, onNavigateToCalendar, onNavigate }) {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(propTripId || '');
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // User-configurable budget threshold
  const [budgetLimit, setBudgetLimit] = useState(2500);
  const [perStopLimit, setPerStopLimit] = useState(1000);
  const [showLimitConfig, setShowLimitConfig] = useState(false);

  // Fetch all trips for switcher
  useEffect(() => {
    apiFetch('/trips')
      .then(data => {
        const list = data?.trips || [];
        setTrips(list);
        if (list.length > 0) {
          const matched = propTripId && list.some(t => t.id === propTripId);
          setSelectedTripId(matched ? propTripId : list[0].id);
        } else {
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load trips:', err);
        setTrips([]);
        setLoading(false);
      });
  }, [propTripId]);

  // Fetch budget breakdown whenever selectedTripId changes
  const fetchBudget = () => {
    if (!selectedTripId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');

    apiFetch(`/trips/${selectedTripId}/budget`)
      .then(data => {
        if (data?.budget) {
          setBudgetData(data.budget);
          if (data.budget.tripTotal > 0) {
            setBudgetLimit(Math.ceil(data.budget.tripTotal * 1.2));
            setPerStopLimit(Math.ceil((data.budget.tripTotal / Math.max(1, data.budget.stops?.length || 1)) * 1.3));
          }
        } else {
          setError('No budget data found for this trip.');
        }
      })
      .catch(err => {
        console.error('Budget fetch error:', err);
        setError(err.message || 'Error loading budget calculation');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedTripId) {
      fetchBudget();
    }
  }, [selectedTripId]);

  // Calculations for charts and flags
  const total = budgetData?.tripTotal || 0;
  const isOverBudget = budgetLimit > 0 && total > budgetLimit;
  const budgetDifference = Math.abs(total - budgetLimit);
  const percentUsed = budgetLimit > 0 ? Math.min(100, Math.round((total / budgetLimit) * 100)) : 0;

  const stayCost = budgetData?.breakdownByCategory?.stay || 0;
  const transportCost = budgetData?.breakdownByCategory?.transport || 0;
  const activitiesCost = budgetData?.breakdownByCategory?.activities || 0;

  const stayPct = total > 0 ? Math.round((stayCost / total) * 100) : 0;
  const transportPct = total > 0 ? Math.round((transportCost / total) * 100) : 0;
  const activitiesPct = total > 0 ? Math.max(0, 100 - stayPct - transportPct) : 0;

  const maxStopCost = budgetData?.stops?.reduce((max, s) => Math.max(max, s.stopTotal || 0), 1) || 1;

  if (!loading && trips.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center bg-white border-2 border-[#1F2B2E] p-8 shadow-[4px_4px_0px_0px_#1F2B2E] space-y-4 font-sans">
        <Compass className="h-12 w-12 text-[#2C5F7C] mx-auto animate-pulse" />
        <h2 className="text-2xl font-serif font-bold text-[#1E232A]">NO ITINERARIES TO CALCULATE BUDGET</h2>
        <p className="text-xs text-gray-600 max-w-md mx-auto">
          Create an itinerary with destinations and activities to automatically compute accommodation rates, transit fares, and experience totals.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onNavigate && (
            <>
              <button
                onClick={() => onNavigate('my-trips')}
                className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#1E232A] font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                OPEN MY TRIPS
              </button>
              <button
                onClick={() => onNavigate('create-trip')}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md flex items-center justify-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                CREATE NEW TRIP
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-body">
      
      {/* Top Header & Trip Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#1F2B2E] pb-6">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[#2C5F7C] font-bold uppercase mb-2 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              BACK TO OVERVIEW
            </button>
          )}
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#2C5F7C] uppercase tracking-widest font-bold">
              FINANCIAL LEDGER & BREAKDOWN
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[#1F2B2E] mt-1">
            {budgetData?.tripName || 'TRIP BUDGET & COST BREAKDOWN'}
          </h1>
        </div>

        {/* Trip Switcher Dropdown */}
        <div className="flex items-center gap-2">
          {trips.length > 1 && (
            <div className="bg-white border-2 border-[#1F2B2E] px-3 py-1.5 shadow-[2px_2px_0px_0px_#1F2B2E]">
              <label className="block font-mono text-[9px] uppercase tracking-widest text-[#1F2B2E]/60 font-bold">
                SELECT TRIP
              </label>
              <select
                value={selectedTripId || ''}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="bg-transparent font-mono text-xs font-bold text-[#1F2B2E] focus:outline-none cursor-pointer"
              >
                {trips.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {onNavigate && selectedTripId && (
            <button
              onClick={() => onNavigate('builder', { tripId: selectedTripId })}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-[#1E232A] border-2 border-[#1F2B2E] font-mono text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_#1F2B2E]"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>EDIT STOPS</span>
            </button>
          )}

          <button
            onClick={fetchBudget}
            disabled={loading}
            title="Recalculate Budget"
            className="p-2.5 bg-white border-2 border-[#1F2B2E] shadow-[2px_2px_0px_0px_#1F2B2E] hover:bg-[#F6F3EC] transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#1F2B2E] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="bg-white border-2 border-[#1F2B2E] p-12 text-center shadow-[4px_4px_0px_0px_#1F2B2E]">
          <RefreshCw className="w-8 h-8 text-[#2C5F7C] animate-spin mx-auto mb-3" />
          <p className="font-mono text-sm uppercase text-[#1F2B2E] font-bold">
            CALCULATING ROUTE EXPENSES ACROSS NEON POSTGRESQL DB...
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-white border-2 border-[#B84A3E] p-6 shadow-[4px_4px_0px_0px_#B84A3E]">
          <div className="flex items-center gap-3 text-[#B84A3E]">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div className="font-mono text-xs font-bold uppercase">{error}</div>
          </div>
        </div>
      )}

      {!loading && !error && budgetData && (
        <>
          {/* Over-Budget Alert Banner */}
          {isOverBudget ? (
            <div className="bg-[#B84A3E] text-white border-2 border-[#1F2B2E] p-4 shadow-[4px_4px_0px_0px_#1F2B2E] flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white text-[#B84A3E] rounded-sm font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-bold text-lg uppercase tracking-wide">
                    OVER-BUDGET ALERT: EXCEEDED BY {formatCurrency(budgetDifference)}
                  </div>
                  <div className="font-mono text-xs text-white/90">
                    Total expenses ({formatCurrency(total)}) exceed your target ceiling of {formatCurrency(budgetLimit)}.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowLimitConfig(!showLimitConfig)}
                className="px-3 py-1.5 bg-white text-[#B84A3E] font-mono text-xs font-bold uppercase border border-[#1F2B2E] hover:bg-[#F6F3EC] cursor-pointer"
              >
                ADJUST CEILING
              </button>
            </div>
          ) : (
            <div className="bg-white border-2 border-[#1F2B2E] p-3 shadow-[3px_3px_0px_0px_#1F2B2E] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7FA69C]" />
                <span className="font-mono text-xs text-[#1F2B2E] font-bold uppercase">
                  BUDGET HEALTHY: {formatCurrency(budgetLimit - total)} REMAINING UNDER {formatCurrency(budgetLimit)} CEILING ({percentUsed}% COMMITTED)
                </span>
              </div>
              <button
                onClick={() => setShowLimitConfig(!showLimitConfig)}
                className="font-mono text-[11px] text-[#2C5F7C] font-bold uppercase underline hover:text-[#1F2B2E] cursor-pointer"
              >
                {showLimitConfig ? 'HIDE THRESHOLD SETTINGS' : 'SET BUDGET CEILING'}
              </button>
            </div>
          )}

          {/* Interactive Ceiling Config Drawer */}
          {showLimitConfig && (
            <div className="bg-[#F6F3EC] border-2 border-[#1F2B2E] p-4 shadow-[3px_3px_0px_0px_#1F2B2E] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase text-[#1F2B2E] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#2C5F7C]" />
                  CLIENT-SIDE THRESHOLD CONFIGURATION
                </span>
                <span className="font-mono text-[10px] text-[#1F2B2E]/60">
                  (TRIGGERS STAMP-RED ALERT STATE)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase font-bold text-[#1F2B2E]/70 mb-1">
                    OVERALL TRIP BUDGET TARGET
                  </label>
                  <input
                    type="number"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-white border border-[#1F2B2E] px-3 py-1.5 font-mono text-sm font-bold text-[#1F2B2E] focus:outline-none focus:ring-1 focus:ring-[#2C5F7C]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase font-bold text-[#1F2B2E]/70 mb-1">
                    MAX CEILING PER STOP
                  </label>
                  <input
                    type="number"
                    value={perStopLimit}
                    onChange={(e) => setPerStopLimit(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-white border border-[#1F2B2E] px-3 py-1.5 font-mono text-sm font-bold text-[#1F2B2E] focus:outline-none focus:ring-1 focus:ring-[#2C5F7C]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Primary Figures Header: Prominent Big Display Data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Total Trip Cost */}
            <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E] flex flex-col justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#1F2B2E]/60 font-bold block mb-1">
                  TOTAL ESTIMATED COST
                </span>
                <div className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight text-[#1F2B2E]">
                  {formatCurrency(budgetData.tripTotal)}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1F2B2E]/20 flex items-center justify-between font-mono text-xs">
                <span className="text-[#1F2B2E]/70">Route Duration:</span>
                <span className="font-bold text-[#1F2B2E]">{budgetData.totalTripDays} DAYS</span>
              </div>
            </div>

            {/* Average Daily Expense */}
            <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E] flex flex-col justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#B8823A] font-bold block mb-1">
                  DAILY RUN RATE
                </span>
                <div className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight text-[#B8823A]">
                  {formatCurrency(budgetData.avgPerDay)}
                  <span className="text-lg font-mono text-[#1F2B2E]/60 font-normal"> /day</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1F2B2E]/20 flex items-center justify-between font-mono text-xs">
                <span className="text-[#1F2B2E]/70">Calculated Across:</span>
                <span className="font-bold text-[#2C5F7C]">{budgetData.stops?.length || 0} STOPS</span>
              </div>
            </div>

            {/* Category Split Highlights */}
            <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E] flex flex-col justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#2C5F7C] font-bold block mb-2">
                EXPENSE ALLOCATION
              </span>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#1F2B2E]">
                    <span className="w-2.5 h-2.5 bg-[#2C5F7C]"></span>
                    Accommodations:
                  </span>
                  <span className="font-bold text-[#1F2B2E]">{formatCurrency(stayCost)} ({stayPct}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#1F2B2E]">
                    <span className="w-2.5 h-2.5 bg-[#B8823A]"></span>
                    Transport:
                  </span>
                  <span className="font-bold text-[#1F2B2E]">{formatCurrency(transportCost)} ({transportPct}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#1F2B2E]">
                    <span className="w-2.5 h-2.5 bg-[#7FA69C]"></span>
                    Activities:
                  </span>
                  <span className="font-bold text-[#1F2B2E]">{formatCurrency(activitiesCost)} ({activitiesPct}%)</span>
                </div>
              </div>
              <div className="w-full bg-[#F6F3EC] h-2.5 border border-[#1F2B2E] mt-3 flex overflow-hidden">
                <div style={{ width: `${stayPct}%` }} className="bg-[#2C5F7C] h-full" title={`Stay: ${stayPct}%`} />
                <div style={{ width: `${transportPct}%` }} className="bg-[#B8823A] h-full" title={`Transport: ${transportPct}%`} />
                <div style={{ width: `${activitiesPct}%` }} className="bg-[#7FA69C] h-full" title={`Activities: ${activitiesPct}%`} />
              </div>
            </div>

          </div>

          {/* Section 2: Visual Charts */}
          {budgetData.stops?.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Bar Chart: Cost per Stop */}
              <div className="lg:col-span-2 bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E] space-y-5">
                <div className="flex items-center justify-between border-b border-[#1F2B2E]/20 pb-3">
                  <div className="flex items-center gap-2 font-display text-xl font-bold text-[#1F2B2E] uppercase">
                    <BarChart3 className="w-5 h-5 text-[#2C5F7C]" />
                    EXPENDITURE PER DESTINATION STOP
                  </div>
                  <span className="font-mono text-[10px] text-[#1F2B2E]/60 uppercase">
                    STAY + TRANSPORT + ACTIVITIES
                  </span>
                </div>

                {/* Bar Chart Bars */}
                <div className="space-y-4 pt-2">
                  {budgetData.stops.map((stop, index) => {
                    const isStopOverLimit = perStopLimit > 0 && stop.stopTotal > perStopLimit;

                    return (
                      <div key={stop.stopId || index} className="space-y-1.5">
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="font-bold text-[#1F2B2E] uppercase flex items-center gap-2">
                            <span className="h-5 w-5 bg-[#1F2B2E] text-[#F6F3EC] flex items-center justify-center text-[10px]">
                              {index + 1}
                            </span>
                            {stop.cityName}, {stop.country}
                            <span className="text-[#1F2B2E]/50 font-normal">({stop.nights} nights)</span>
                          </span>
                          
                          <div className="flex items-center gap-2 font-bold">
                            {isStopOverLimit && (
                              <span className="text-[#B84A3E] text-[10px] bg-[#B84A3E]/10 px-1.5 py-0.5 border border-[#B84A3E]">
                                EXCEEDS {formatCurrency(perStopLimit)} CEILING
                              </span>
                            )}
                            <span className={isStopOverLimit ? 'text-[#B84A3E]' : 'text-[#1F2B2E]'}>
                              {formatCurrency(stop.stopTotal)}
                            </span>
                          </div>
                        </div>

                        {/* Stacked Segmented Bar */}
                        <div className="w-full bg-[#F6F3EC] h-6 border border-[#1F2B2E] flex overflow-hidden relative">
                          {/* Stay Segment */}
                          <div
                            style={{ width: `${(stop.stayCost / maxStopCost) * 100}%` }}
                            className="bg-[#2C5F7C] h-full flex items-center justify-center text-[10px] font-mono text-white font-bold"
                            title={`Stay: ${formatCurrency(stop.stayCost)}`}
                          >
                            {stop.stayCost > 0 && formatCurrency(stop.stayCost)}
                          </div>
                          {/* Transport Segment */}
                          <div
                            style={{ width: `${(stop.transportCost / maxStopCost) * 100}%` }}
                            className="bg-[#B8823A] h-full flex items-center justify-center text-[10px] font-mono text-white font-bold"
                            title={`Transport: ${formatCurrency(stop.transportCost)}`}
                          >
                            {stop.transportCost > 0 && formatCurrency(stop.transportCost)}
                          </div>
                          {/* Activities Segment */}
                          <div
                            style={{ width: `${(stop.activitiesCost / maxStopCost) * 100}%` }}
                            className="bg-[#7FA69C] h-full flex items-center justify-center text-[10px] font-mono text-[#1F2B2E] font-bold"
                            title={`Activities: ${formatCurrency(stop.activitiesCost)}`}
                          >
                            {stop.activitiesCost > 0 && formatCurrency(stop.activitiesCost)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chart Legend */}
                <div className="pt-3 border-t border-[#1F2B2E]/10 flex flex-wrap items-center gap-5 font-mono text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-[#2C5F7C]"></span>
                    Accommodations ({formatCurrency(stayCost)})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-[#B8823A]"></span>
                    Transit ({formatCurrency(transportCost)})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-[#7FA69C]"></span>
                    Activities ({formatCurrency(activitiesCost)})
                  </span>
                </div>
              </div>

              {/* Category Donut & Proportional Share */}
              <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E] flex flex-col justify-between space-y-4">
                <div className="flex items-center gap-2 font-display text-xl font-bold text-[#1F2B2E] uppercase border-b border-[#1F2B2E]/20 pb-3">
                  <PieChartIcon className="w-5 h-5 text-[#B8823A]" />
                  CATEGORY WEIGHTS
                </div>

                {/* SVG Donut Graphic */}
                <div className="flex items-center justify-center py-2">
                  <svg viewBox="0 0 100 100" className="w-40 h-40 transform -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#F6F3EC"
                      strokeWidth="16"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#2C5F7C"
                      strokeWidth="16"
                      strokeDasharray={`${stayPct * 2.388} 238.8`}
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#B8823A"
                      strokeWidth="16"
                      strokeDasharray={`${transportPct * 2.388} 238.8`}
                      strokeDashoffset={`-${stayPct * 2.388}`}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#7FA69C"
                      strokeWidth="16"
                      strokeDasharray={`${activitiesPct * 2.388} 238.8`}
                      strokeDashoffset={`-${(stayPct + transportPct) * 2.388}`}
                    />
                  </svg>
                </div>

                {/* Category Breakdown Cards */}
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-2.5 bg-[#2C5F7C]/10 border border-[#2C5F7C]/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BedDouble className="w-4 h-4 text-[#2C5F7C]" />
                      <span className="font-bold text-[#1F2B2E]">LODGING</span>
                    </div>
                    <span className="font-bold text-[#2C5F7C]">{formatCurrency(stayCost)}</span>
                  </div>

                  <div className="p-2.5 bg-[#B8823A]/10 border border-[#B8823A]/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-[#B8823A]" />
                      <span className="font-bold text-[#1F2B2E]">TRANSIT</span>
                    </div>
                    <span className="font-bold text-[#B8823A]">{formatCurrency(transportCost)}</span>
                  </div>

                  <div className="p-2.5 bg-[#7FA69C]/10 border border-[#7FA69C]/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-[#7FA69C]" />
                      <span className="font-bold text-[#1F2B2E]">EXPERIENCES</span>
                    </div>
                    <span className="font-bold text-[#7FA69C]">{formatCurrency(activitiesCost)}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border-2 border-[#1F2B2E] p-8 text-center shadow-[4px_4px_0px_0px_#1F2B2E] space-y-3 font-sans">
              <MapPin className="h-8 w-8 text-[#2C5F7C] mx-auto" />
              <h3 className="font-serif font-bold text-lg text-[#1E232A]">NO DESTINATION STOPS IN THIS ITINERARY</h3>
              <p className="text-xs text-gray-500">
                Add cities, hotel accommodations, and transport legs in the Itinerary Builder to compute stop-by-stop expenses.
              </p>
              {onNavigate && selectedTripId && (
                <button
                  onClick={() => onNavigate('builder', { tripId: selectedTripId })}
                  className="px-4 py-2 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-sm"
                >
                  ADD STOPS IN BUILDER
                </button>
              )}
            </div>
          )}

          {/* Section 3: Itemized Stop-by-Stop Ledger Table */}
          {budgetData.stops?.length > 0 && (
            <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F2B2E]/20 pb-3">
                <h3 className="font-display text-xl font-bold text-[#1F2B2E] uppercase">
                  ITEMIZED ROUTE ACCOUNTING LEDGER
                </h3>
                {onNavigateToCalendar && (
                  <button
                    onClick={onNavigateToCalendar}
                    className="font-mono text-xs font-bold text-[#2C5F7C] uppercase flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    VIEW ON TRIP CALENDAR <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#1F2B2E] text-[#F6F3EC] uppercase">
                      <th className="p-3">#</th>
                      <th className="p-3">DESTINATION</th>
                      <th className="p-3">DATES</th>
                      <th className="p-3 text-right">STAY RATE</th>
                      <th className="p-3 text-right">LODGING</th>
                      <th className="p-3 text-right">TRANSIT</th>
                      <th className="p-3 text-right">EXPERIENCES</th>
                      <th className="p-3 text-right">SUBTOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2B2E]/20">
                    {budgetData.stops.map((stop, idx) => {
                      const isStopOverLimit = perStopLimit > 0 && stop.stopTotal > perStopLimit;
                      return (
                        <React.Fragment key={stop.stopId || idx}>
                          <tr className={`hover:bg-[#F6F3EC] transition ${isStopOverLimit ? 'bg-[#B84A3E]/5' : ''}`}>
                            <td className="p-3 font-bold">{idx + 1}</td>
                            <td className="p-3 font-bold text-[#1F2B2E]">
                              {stop.cityName}, {stop.country}
                              {isStopOverLimit && (
                                <span className="ml-2 text-[10px] text-[#B84A3E] font-bold uppercase">
                                  [! CEILING EXCEEDED]
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-[#1F2B2E]/70">
                              {formatDateShort(stop.startDate)}
                              {' — '}
                              {formatDateShort(stop.endDate)}
                              <span className="text-[10px] text-[#1F2B2E]/50 block">({stop.nights} nights)</span>
                            </td>
                            <td className="p-3 text-right text-[#1F2B2E]">
                              {formatCurrency(stop.estStayCostPerDay)}/night
                            </td>
                            <td className="p-3 text-right font-bold text-[#2C5F7C]">
                              {formatCurrency(stop.stayCost)}
                            </td>
                            <td className="p-3 text-right font-bold text-[#B8823A]">
                              {formatCurrency(stop.transportCost)}
                            </td>
                            <td className="p-3 text-right font-bold text-[#7FA69C]">
                              {formatCurrency(stop.activitiesCost)}
                            </td>
                            <td className={`p-3 text-right font-bold text-sm ${isStopOverLimit ? 'text-[#B84A3E]' : 'text-[#1F2B2E]'}`}>
                              {formatCurrency(stop.stopTotal)}
                            </td>
                          </tr>

                          {/* Expandable Activities Detail Rows */}
                          {stop.activities?.length > 0 && (
                            <tr className="bg-[#F6F3EC]/50">
                              <td colSpan={8} className="px-6 py-2">
                                <div className="space-y-1">
                                  <span className="text-[10px] uppercase font-bold text-[#1F2B2E]/50">
                                    Itemized Scheduled Activities:
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {stop.activities.map((act) => (
                                      <div key={act.id} className="p-1.5 bg-white border border-[#1F2B2E]/20 text-[11px] flex items-center justify-between">
                                        <span className="truncate pr-2">{act.name}</span>
                                        <span className="font-bold text-[#7FA69C] shrink-0">
                                          {act.cost > 0 ? formatCurrency(act.cost) : 'Free'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#1F2B2E] text-[#F6F3EC] font-bold text-sm">
                      <td colSpan={4} className="p-3 uppercase">TOTAL COMMITTED EXPENSES:</td>
                      <td className="p-3 text-right">{formatCurrency(stayCost)}</td>
                      <td className="p-3 text-right">{formatCurrency(transportCost)}</td>
                      <td className="p-3 text-right">{formatCurrency(activitiesCost)}</td>
                      <td className="p-3 text-right text-base text-[#B8823A]">
                        {formatCurrency(total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
