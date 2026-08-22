import React, { useState, useEffect } from 'react';
import {
  Share2, Copy, Check, ExternalLink, Calendar, MapPin,
  Clock, DollarSign, ArrowLeft, BookmarkPlus, Sparkles,
  Printer, MessageCircle, Send, Globe, ChevronRight, User, Eye, Ticket
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import InstagramBoardingPassModal from '../components/ticket/InstagramBoardingPassModal';
import { formatCurrency, formatDateShort } from '../lib/format';

export default function PublicItineraryPage({ shareSlug = 'europe-grand-2026-x8f1', onBack, onNavigateToAuth }) {
  const { isAuthenticated, user } = useAuth();
  
  const [trip, setTrip] = useState(null);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [copiedLink, setCopiedLink] = useState(false);
  const [copyingTrip, setCopyingTrip] = useState(false);
  const [tripClonedSuccess, setTripClonedSuccess] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);

  // Available public trips to explore in demo
  const [selectedSlug, setSelectedSlug] = useState(shareSlug);

  const DEMO_SLUGS = [
    { slug: 'europe-grand-2026-x8f1', label: 'European Grand Journey (Paris & Rome)' },
    { slug: 'japan-autumn-2026-j7a2', label: 'Japan Autumn Route (Tokyo & Kyoto)' }
  ];

  const fetchPublicTrip = (slug) => {
    setLoading(true);
    setError('');
    setTripClonedSuccess(false);

    fetch(`/api/public/trips/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load shared itinerary`);
        return res.json();
      })
      .then(data => {
        if (data.trip) {
          setTrip(data.trip);
          setBudget(data.budget);
        } else {
          setError('Shared itinerary not found or has expired.');
        }
      })
      .catch(err => {
        console.error('Public trip load error:', err);
        setError(err.message || 'Error loading public itinerary');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPublicTrip(selectedSlug);
  }, [selectedSlug]);

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/share/${trip?.shareSlug || selectedSlug}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleCloneTrip = async () => {
    if (!isAuthenticated) {
      if (onNavigateToAuth) onNavigateToAuth();
      return;
    }

    setCopyingTrip(true);
    try {
      const res = await fetch(`/api/public/trips/${selectedSlug}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('gt_token')}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to clone trip');
      
      setTripClonedSuccess(true);
    } catch (err) {
      alert(err.message || 'Error cloning route to your passport wallet');
    } finally {
      setCopyingTrip(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto pb-16">

      {/* Top Header Card & Selector */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-script text-[#F5B800] text-3xl block leading-none">
            public route pass
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#1E232A] mt-1">
            Verified Explorer Itinerary
          </h1>
        </div>

        {/* Demo Itinerary Switcher */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="px-4 py-2.5 bg-[#FAF9F6] border border-gray-300 rounded-full font-sans text-xs font-bold text-[#1E232A] focus:outline-none focus:ring-2 focus:ring-[#F5B800] transition cursor-pointer"
          >
            {DEMO_SLUGS.map(s => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="py-24 bg-white border border-gray-200 rounded-3xl shadow-xl p-8 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#F5B800] border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="font-serif font-bold text-lg text-[#1E232A]">Loading Verified Route</h3>
          <p className="text-xs text-gray-400">Retrieving stops and public pass details…</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl shadow-md">
          <p className="text-xs font-bold uppercase">{error}</p>
        </div>
      )}

      {!loading && !error && trip && (
        <>
          {/* Header Card: Whose Trip This Is & Actions */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
            
            {/* Top Author Metadata Tag */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div className="flex items-center gap-3">
                <img
                  src={trip.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={trip.user?.name || 'Traveler'}
                  className="w-11 h-11 object-cover rounded-full border-2 border-[#F5B800] shadow-sm"
                />
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#F5B800] font-extrabold block leading-tight">
                    CURATED BY EXPLORER
                  </span>
                  <span className="font-bold text-sm text-[#1E232A] uppercase">
                    {trip.user?.name || 'Globetrotter Traveler'}
                  </span>
                </div>
              </div>

              {/* Public Badge & Share Slug */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase rounded-full">
                  PUBLIC ITINERARY
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                  /share/{trip.shareSlug || selectedSlug}
                </span>
              </div>
            </div>

            {/* Main Header Content */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-[#1E232A] leading-tight">
                  {trip.name}
                </h2>
                {trip.description && (
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans font-medium">
                    {trip.description}
                  </p>
                )}
                
                {/* Date & Stops Meta */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold text-gray-600">
                  <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                    <Calendar className="w-3.5 h-3.5 text-[#F5B800]" />
                    {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' &ndash; '}
                    {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-[#1E232A] font-bold">
                    <MapPin className="w-3.5 h-3.5 text-[#F5B800]" />
                    {trip.stops?.length || 0} DESTINATION STOPS
                  </span>
                  {budget && (
                    <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full font-bold text-[#B8823A]">
                      {formatCurrency(budget.tripTotal || 0)} TOTAL RUN RATE
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons: Copy Trip & Share */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                
                {/* Signature "Copy this Trip" Button */}
                <button
                  onClick={handleCloneTrip}
                  disabled={copyingTrip || tripClonedSuccess}
                  className={`
                    px-6 py-3.5 rounded-full font-extrabold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer
                    ${tripClonedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A]'
                    }
                  `}
                >
                  {tripClonedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      COPIED TO YOUR ACCOUNT!
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4" />
                      {copyingTrip ? 'CLONING ROUTE...' : 'COPY THIS TRIP'}
                    </>
                  )}
                </button>

                {/* Share & Instagram Pass Row */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    onClick={() => setShowPassModal(true)}
                    className="w-full sm:flex-1 px-4 py-2.5 bg-[#1E232A] hover:bg-gray-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-full transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Ticket className="w-4 h-4 text-[#F5B800]" />
                    <span>INSTA PASS</span>
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="w-full sm:flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#1E232A] font-bold text-xs uppercase tracking-wider rounded-full transition flex items-center justify-center gap-1.5 border border-gray-300 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-600" />}
                    <span>{copiedLink ? 'LINK COPIED' : 'SHARE LINK'}</span>
                  </button>
                </div>

              </div>
            </div>

          </div>

          {/* Read-Only Itinerary Vertical Route Sheet */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1E232A] uppercase">
                COMPLETE ROUTE TIMELINE
              </h3>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                VERIFIED ROUTE SHEET
              </span>
            </div>

            {/* Vertical Timeline Track */}
            <div className="relative pl-10 sm:pl-12 space-y-8">
              {/* Left-edge connecting vertical line */}
              <div className="absolute left-[19px] sm:left-[23px] top-6 bottom-6 w-1 bg-gradient-to-b from-[#F5B800] via-[#1E232A]/30 to-gray-300 rounded-full" aria-hidden="true" />

              {trip.stops?.map((stop, index) => {
                const sStart = new Date(stop.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const sEnd = new Date(stop.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                return (
                  <div key={stop.id || index} className="relative z-10">
                    
                    {/* Numbered Sequence Pin on Left Rail */}
                    <span
                      className="absolute -left-10 sm:-left-12 top-6 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1E232A] text-[#F5B800] border-2 border-[#F5B800] font-serif font-black text-sm flex items-center justify-center shadow-lg"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>

                    {/* Signature Ticket Stub Card */}
                    <div className="relative flex flex-col md:flex-row bg-white border border-gray-200 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 overflow-hidden">
                      
                      {/* Left Solid-Fill Stub (Destination & Dates) */}
                      <div className="relative shrink-0 md:w-60 bg-[#1A1D23] text-white p-6 sm:p-8 flex flex-row md:flex-col justify-between md:justify-between gap-4 border-b md:border-b-0 md:border-r border-dashed border-white/20">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-sans font-extrabold uppercase tracking-widest text-[#F5B800]">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>STOP 0{index + 1}</span>
                          </div>
                          <h4 className="font-serif font-black text-2xl sm:text-3xl text-white tracking-wide leading-tight">
                            {stop.city?.name || stop.cityName || 'City'}
                          </h4>
                          {(stop.city?.country || stop.country) && (
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                              {stop.city?.country || stop.country}
                            </p>
                          )}
                        </div>
                        <div className="pt-2 sm:pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-sans text-gray-300">
                          <Calendar className="h-4 w-4 text-[#F5B800] shrink-0" />
                          <span className="font-medium">{sStart} &ndash; {sEnd}</span>
                        </div>
                      </div>

                      {/* Right Body: Day-Grouped Activities */}
                      <div className="flex-1 min-w-0 p-6 sm:p-8 space-y-4 bg-white">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                            SCHEDULED EXPERIENCES ({stop.tripActivities?.length || 0})
                          </span>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase rounded-full">
                            CONFIRMED ROUTE
                          </span>
                        </div>

                        {stop.tripActivities?.length === 0 ? (
                          <p className="text-xs text-gray-400 italic py-2 font-sans">
                            No activities scheduled for this stop.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {stop.tripActivities?.map((ta, actIdx) => (
                              <div
                                key={ta.id || actIdx}
                                className="p-4 bg-[#FAF9F6] border border-gray-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white hover:shadow-xs transition"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    {ta.scheduledTime && (
                                      <span className="font-bold text-[10px] px-2 py-0.5 bg-[#1E232A] text-white rounded-full">
                                        {ta.scheduledTime}
                                      </span>
                                    )}
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F5B800] bg-[#F5B800]/15 px-2.5 py-0.5 rounded-full">
                                      #{ta.activity?.category || 'sightseeing'}
                                    </span>
                                  </div>
                                  <h5 className="font-bold text-sm text-[#1E232A]">
                                    {ta.activity?.name || ta.name || 'Activity'}
                                  </h5>
                                  {(ta.activity?.description || ta.notes) && (
                                    <p className="text-xs text-gray-500 font-sans leading-relaxed">
                                      {ta.activity?.description || ta.notes}
                                    </p>
                                  )}
                                </div>

                                <div className="flex sm:flex-col items-end justify-between sm:justify-center font-sans text-xs shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-200">
                                  <span className="font-serif font-black text-sm text-[#F5B800]">
                                    {ta.activity?.cost > 0 ? formatCurrency(ta.activity.cost) : 'Free'}
                                  </span>
                                  {ta.activity?.durationHours && (
                                    <span className="text-[10px] text-gray-400 font-semibold">
                                      {ta.activity.durationHours}h duration
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Social Share & Copy Invitation Drawer at Bottom */}
          <div className="bg-[#1A1D23] text-white p-8 sm:p-10 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-t-4 border-[#F5B800]">
            <div className="space-y-2 text-center md:text-left">
              <span className="font-script text-[#F5B800] text-3xl block leading-none">planning a similar journey?</span>
              <h3 className="font-serif font-bold text-2xl text-white uppercase">
                CLONE THIS CURATED ROUTE
              </h3>
              <p className="text-xs text-gray-300 font-sans max-w-lg leading-relaxed">
                Copy this entire itinerary into your own GlobeTrotter workspace with one click to customize dates, swap activities, and track your ledger.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <button
                onClick={handleCloneTrip}
                className="px-8 py-3.5 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-extrabold text-xs uppercase tracking-widest rounded-full transition shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <BookmarkPlus className="w-4 h-4" />
                COPY TO MY ACCOUNT
              </button>

              <button
                onClick={handleCopyLink}
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-widest rounded-full transition border border-white/20 flex items-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4 text-[#F5B800]" />
                {copiedLink ? 'LINK COPIED!' : 'SHARE LINK'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Instagram & PDF Boarding Pass Modal */}
      {showPassModal && trip && (
        <InstagramBoardingPassModal
          trip={trip}
          user={user}
          isOpen={showPassModal}
          onClose={() => setShowPassModal(false)}
        />
      )}

    </div>
  );
}
