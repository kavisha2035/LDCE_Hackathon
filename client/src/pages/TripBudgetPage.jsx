import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/apiClient';
import { formatCurrency, formatDateShort } from '../lib/format';
import CategoryPieChart from '../components/budget/CategoryPieChart';
import StopBarChart from '../components/budget/StopBarChart';
import StatCard from '../components/budget/StatCard';
import {
  DollarSign, PieChart as PieChartIcon, BarChart3, AlertTriangle,
  ArrowLeft, RefreshCw, Calendar, MapPin, BedDouble, Plane,
  Ticket, CheckCircle2, ChevronRight, Sliders, Info, Plus, Compass, Edit3, Sparkles
} from 'lucide-react';

export default function TripBudgetPage({ tripId: propTripId, onBack, onNavigateToCalendar, onNavigate }) {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(propTripId || '');
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // User-configurable budget threshold
  const [budgetLimit, setBudgetLimit] = useState(25000);
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

  const categoryBreakdown = [
    { category: 'Accommodation', amount: stayCost },
    { category: 'Transportation', amount: transportCost },
    { category: 'Experiences', amount: activitiesCost },
  ].filter(c => c.amount > 0);

  const perStopData = (budgetData?.stops || []).map(s => ({
    city_name: s.cityName || s.city?.name || 'Stop',
    amount: s.stopTotal || 0,
  }));

  if (!loading && trips.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-8 text-center bg-white border border-gray-200 rounded-3xl shadow-xl space-y-6 font-sans">
        <div className="h-16 w-16 bg-[#F5B800]/20 text-[#1E232A] rounded-full flex items-center justify-center mx-auto shadow-md">
          <Compass className="h-8 w-8 text-[#F5B800]" />
        </div>
        <div className="space-y-2">
          <span className="font-script text-[#F5B800] text-3xl block">financial ledger</span>
          <h2 className="text-3xl font-serif font-black text-[#1E232A] uppercase">
            No Itineraries to Calculate
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
            Create an itinerary with destinations and activities to automatically compute accommodation rates, transit fares, and experience totals.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onNavigate && (
            <>
              <button
                onClick={() => onNavigate('my-trips')}
                className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-[#1E232A] font-extrabold text-xs uppercase tracking-wider rounded-full transition cursor-pointer"
              >
                OPEN MY TRIPS
              </button>
              <button
                onClick={() => onNavigate('create-trip')}
                className="w-full sm:w-auto px-6 py-3 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-extrabold text-xs uppercase tracking-wider rounded-full transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                CREATE NEW TRIP
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 font-sans">
      
      {/* Top Header Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="font-script text-[#F5B800] text-3xl block leading-none">
              financial ledger
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-[#1E232A] leading-tight">
            {budgetData?.tripName || 'Trip Budget & Cost Ledger'}
          </h1>
          <p className="text-xs text-gray-500 font-sans">
            Real-time financial reconciliation for accommodations, inter-city transport, and scheduled activities.
          </p>
        </div>

        {/* Controls: Trip Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {trips.length > 1 && (
            <select
              value={selectedTripId || ''}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="px-4 py-2.5 bg-[#FAF9F6] border border-gray-300 rounded-full font-sans text-xs font-bold text-[#1E232A] focus:outline-none focus:ring-2 focus:ring-[#F5B800] transition cursor-pointer"
            >
              {trips.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}

          {onNavigate && selectedTripId && (
            <button
              onClick={() => onNavigate('builder', { tripId: selectedTripId })}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#1E232A] font-extrabold text-xs uppercase tracking-wider rounded-full transition flex items-center gap-1.5 cursor-pointer border border-gray-200"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>EDIT STOPS</span>
            </button>
          )}

          <button
            onClick={fetchBudget}
            disabled={loading}
            title="Recalculate Budget"
            className="p-2.5 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 text-[#1E232A] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="py-20 text-center space-y-3 bg-white border border-gray-200 rounded-3xl shadow-xl p-8">
          <RefreshCw className="w-8 h-8 text-[#F5B800] animate-spin mx-auto" />
          <h3 className="font-serif font-bold text-lg text-[#1E232A]">Computing Travel Ledger</h3>
          <p className="text-xs text-gray-500 font-sans">Calculating route expenses, hotel averages, and activity tariffs…</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl shadow-md flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 shrink-0 text-red-500" />
          <div>
            <h4 className="font-bold text-sm">Ledger Computation Notice</h4>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && budgetData && (
        <>
          {/* Health & Ceiling Alert Banner */}
          {isOverBudget ? (
            <div className="bg-[#1A1D23] text-white border-2 border-red-500 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-sm text-red-400 uppercase tracking-widest block">
                    OVER-BUDGET ALERT &bull; EXCEEDED BY {formatCurrency(budgetDifference)}
                  </span>
                  <p className="text-xs text-gray-300 font-sans">
                    Total expenses of <strong>{formatCurrency(total)}</strong> exceed your target ceiling of {formatCurrency(budgetLimit)}.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLimitConfig(!showLimitConfig)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-full transition shadow cursor-pointer shrink-0"
              >
                ADJUST CEILING
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="font-serif font-bold text-base text-[#1E232A] block">
                    Budget Healthy &bull; {formatCurrency(budgetLimit - total)} Remaining
                  </span>
                  <p className="text-xs text-gray-500 font-sans">
                    {percentUsed}% committed against {formatCurrency(budgetLimit)} target ceiling.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLimitConfig(!showLimitConfig)}
                className="px-4 py-2 bg-[#FAF9F6] hover:bg-gray-100 border border-gray-300 text-[#1E232A] font-bold text-xs uppercase tracking-wider rounded-full transition cursor-pointer"
              >
                {showLimitConfig ? 'Hide Settings' : 'Adjust Ceiling'}
              </button>
            </div>
          )}

          {/* Configurable Threshold Drawer */}
          {showLimitConfig && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <Sliders className="h-5 w-5 text-[#F5B800]" />
                <h3 className="font-serif font-bold text-lg text-[#1E232A]">Set Budget Ceiling Target</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-gray-600 uppercase">Target Trip Maximum (₹)</span>
                  <input
                    type="number"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(Number(e.target.value) || 0)}
                    className="px-4 py-2.5 rounded-full border border-gray-300 bg-[#FAF9F6] font-sans text-sm font-bold text-[#1E232A] focus:outline-none focus:ring-2 focus:ring-[#F5B800]"
                  />
                </label>
              </div>
            </div>
          )}

          {/* 4 Top KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="TOTAL TRIP ESTIMATE"
              value={formatCurrency(total)}
              accent="text-[#1E232A]"
              icon={DollarSign}
              subtext="Sum of all segments"
            />
            <StatCard
              label="ACCOMMODATION"
              value={formatCurrency(stayCost)}
              accent="text-[#F5B800]"
              icon={BedDouble}
              subtext={`${stayCost > 0 ? Math.round((stayCost / total) * 100) : 0}% of budget`}
            />
            <StatCard
              label="TRANSPORTATION"
              value={formatCurrency(transportCost)}
              accent="text-[#10B981]"
              icon={Plane}
              subtext={`${transportCost > 0 ? Math.round((transportCost / total) * 100) : 0}% of budget`}
            />
            <StatCard
              label="EXPERIENCES"
              value={formatCurrency(activitiesCost)}
              accent="text-[#6366F1]"
              icon={Ticket}
              subtext={`${activitiesCost > 0 ? Math.round((activitiesCost / total) * 100) : 0}% of budget`}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CategoryPieChart breakdown={categoryBreakdown} />
            <StopBarChart perStop={perStopData} />
          </div>

          {/* Detailed Destination Stop Ledger */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-serif font-black text-2xl text-[#1E232A]">
                  Destination Stop Breakdown
                </h3>
                <p className="text-xs text-gray-500 font-sans">
                  Itemized rates for hotel stays, transit connections, and scheduled activities per city.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-extrabold uppercase tracking-wider">
                    <th className="pb-3 px-2">Destination Stop</th>
                    <th className="pb-3 px-2">Dates</th>
                    <th className="pb-3 px-2">Stay Subtotal</th>
                    <th className="pb-3 px-2">Transit</th>
                    <th className="pb-3 px-2">Activities</th>
                    <th className="pb-3 px-2 text-right">Stop Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(budgetData.stops || []).map((s, idx) => (
                    <tr key={s.id || idx} className="hover:bg-[#FAF9F6] transition">
                      <td className="py-4 px-2 font-bold text-sm text-[#1E232A] flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-[#1E232A] text-[#F5B800] font-serif font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        {s.cityName || s.city?.name || 'Stop'}
                      </td>
                      <td className="py-4 px-2 text-gray-500">
                        {formatDateShort(s.startDate || s.start_date)} &ndash; {formatDateShort(s.endDate || s.end_date)}
                      </td>
                      <td className="py-4 px-2 font-semibold text-[#1E232A]">
                        {formatCurrency(s.stayCost || 0)}
                      </td>
                      <td className="py-4 px-2 font-semibold text-[#1E232A]">
                        {formatCurrency(s.transportCost || 0)}
                      </td>
                      <td className="py-4 px-2 font-semibold text-[#1E232A]">
                        {formatCurrency(s.activitiesCost || 0)} ({s.activities?.length || 0})
                      </td>
                      <td className="py-4 px-2 text-right font-serif font-black text-sm text-[#F5B800]">
                        {formatCurrency(s.stopTotal || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="bg-[#1A1D23] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-serif font-bold text-lg text-white">Ready to Schedule Timeline?</h4>
              <p className="text-xs text-gray-400 font-sans">View daily activity calendars or return to the itinerary builder.</p>
            </div>
            <div className="flex items-center gap-3">
              {onNavigateToCalendar && (
                <button
                  onClick={onNavigateToCalendar}
                  className="px-6 py-3 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-extrabold text-xs uppercase tracking-wider rounded-full transition shadow-md cursor-pointer"
                >
                  VIEW TIMELINE CALENDAR &gt;
                </button>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
