import React, { useState, useEffect } from 'react';
import {
  Share2, Copy, Check, ExternalLink, Calendar, MapPin,
  Clock, DollarSign, ArrowLeft, BookmarkPlus, Sparkles,
  Printer, MessageCircle, Send, Globe, ChevronRight, User, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StopTicketCard from '../components/ticket/StopTicketCard';

export default function PublicItineraryPage({ shareSlug = 'europe-grand-2026-x8f1', onBack, onNavigateToAuth }) {
  const { isAuthenticated, user } = useAuth();
  
  const [trip, setTrip] = useState(null);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [copiedLink, setCopiedLink] = useState(false);
  const [copyingTrip, setCopyingTrip] = useState(false);
  const [tripClonedSuccess, setTripClonedSuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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
    const url = window.location.origin + `/share/${trip?.shareSlug || selectedSlug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCloneTrip = async () => {
    if (!isAuthenticated) {
      if (onNavigateToAuth) {
        onNavigateToAuth();
      } else {
        alert('Please sign in or register to clone this trip to your account.');
      }
      return;
    }

    setCopyingTrip(true);
    try {
      const res = await fetch(`/api/public/trips/${selectedSlug}/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      const data = await res.json();
      if (res.ok) {
        setTripClonedSuccess(true);
      } else {
        alert(data.message || 'Failed to copy trip.');
      }
    } catch (e) {
      console.error('Clone error:', e);
      alert('Error cloning trip.');
    } finally {
      setCopyingTrip(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 font-body max-w-4xl mx-auto">

      {/* Top Breadcrumb & Share Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#1F2B2E] pb-4">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[#2C5F7C] font-bold uppercase mb-2 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              BACK TO GLOBETROTTER
            </button>
          )}
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#2C5F7C] uppercase tracking-widest font-bold">
              PUBLIC SHAREABLE ITINERARY PASS
            </span>
          </div>
        </div>

        {/* Demo Itinerary Switcher */}
        <div className="flex items-center gap-2">
          <div className="bg-white border-2 border-[#1F2B2E] px-3 py-1 shadow-[2px_2px_0px_0px_#1F2B2E]">
            <label className="block font-mono text-[9px] uppercase tracking-widest text-[#1F2B2E]/60 font-bold">
              EXPLORE PUBLIC ITINERARY
            </label>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="bg-transparent font-mono text-xs font-bold text-[#1F2B2E] focus:outline-none cursor-pointer"
            >
              {DEMO_SLUGS.map(s => (
                <option key={s.slug} value={s.slug}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="bg-white border-2 border-[#1F2B2E] p-12 text-center shadow-[4px_4px_0px_0px_#1F2B2E]">
          <div className="w-8 h-8 border-3 border-[#2C5F7C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-mono text-sm uppercase text-[#1F2B2E] font-bold">
            LOADING VERIFIED PUBLIC ROUTE SHEET...
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-white border-2 border-[#B84A3E] p-6 shadow-[4px_4px_0px_0px_#B84A3E]">
          <p className="font-mono text-xs font-bold text-[#B84A3E] uppercase">{error}</p>
        </div>
      )}

      {!loading && !error && trip && (
        <>
          {/* Header Banner: Whose Trip This Is & Signature "Copy this Trip" Button */}
          <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E] relative overflow-hidden">
            
            {/* Top Author Metadata Tag */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F2B2E]/20 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <img
                  src={trip.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={trip.user?.name || 'Traveler'}
                  className="w-10 h-10 object-cover border-2 border-[#1F2B2E] rounded-sm"
                />
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[#2C5F7C] font-bold">
                    CURATED BY
                  </div>
                  <div className="font-bold text-sm text-[#1F2B2E] uppercase font-mono">
                    {trip.user?.name || 'Globetrotter Traveler'}
                  </div>
                </div>
              </div>

              {/* Public Badge & Share Slug */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2.5 py-1 bg-[#7FA69C]/15 border border-[#7FA69C] text-[#2C5F7C] font-bold uppercase">
                  PUBLIC ITINERARY
                </span>
                <span className="px-2.5 py-1 bg-[#F6F3EC] border border-[#1F2B2E] text-[#1F2B2E]/70">
                  /share/{trip.shareSlug || selectedSlug}
                </span>
              </div>
            </div>

            {/* Main Header Content */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[#1F2B2E] leading-none uppercase">
                  {trip.name}
                </h1>
                {trip.description && (
                  <p className="text-xs sm:text-sm text-[#1F2B2E]/80 font-body leading-relaxed">
                    {trip.description}
                  </p>
                )}
                
                {/* Date & Stops Meta */}
                <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-xs text-[#1F2B2E]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#B8823A]" />
                    {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' — '}
                    {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span>&bull;</span>
                  <span className="font-bold text-[#2C5F7C]">
                    {trip.stops?.length || 0} DESTINATION STOPS
                  </span>
                  {budget && (
                    <>
                      <span>&bull;</span>
                      <span className="font-bold text-[#B8823A]">
                        ${budget.tripTotal?.toFixed(2)} TOTAL RUN RATE
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons: Copy Trip & Share */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                
                {/* Signature "Copy this Trip" Ticket-Stub Button */}
                <button
                  onClick={handleCloneTrip}
                  disabled={copyingTrip || tripClonedSuccess}
                  className={`
                    px-5 py-3 border-2 border-[#1F2B2E] font-mono text-xs font-bold uppercase transition flex items-center justify-center gap-2
                    shadow-[3px_3px_0px_0px_#1F2B2E]
                    ${tripClonedSuccess
                      ? 'bg-[#7FA69C] text-white'
                      : 'bg-[#B8823A] text-white hover:bg-[#1F2B2E]'
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

                {/* Share Utilities Row */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 px-3 py-2 bg-white border-2 border-[#1F2B2E] font-mono text-xs font-bold text-[#1F2B2E] uppercase hover:bg-[#F6F3EC] transition flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#1F2B2E]"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-[#7FA69C]" /> : <Copy className="w-3.5 h-3.5 text-[#2C5F7C]" />}
                    {copiedLink ? 'LINK COPIED' : 'SHARE LINK'}
                  </button>

                  <button
                    onClick={handlePrint}
                    title="Print / Save as PDF"
                    className="p-2 bg-white border-2 border-[#1F2B2E] font-mono text-xs font-bold text-[#1F2B2E] hover:bg-[#F6F3EC] transition shadow-[2px_2px_0px_0px_#1F2B2E]"
                  >
                    <Printer className="w-4 h-4 text-[#1F2B2E]" />
                  </button>
                </div>

              </div>
            </div>

          </div>

          {/* Read-Only Itinerary Vertical Route Sheet (Screen 6 Continuity) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#1F2B2E]/20 pb-2">
              <h2 className="text-xl font-bold font-display text-[#1F2B2E] uppercase">
                COMPLETE DESTINATION ROUTE TIMELINE
              </h2>
              <span className="font-mono text-[10px] text-[#1F2B2E]/60 uppercase">
                READ-ONLY VERIFIED ROUTE
              </span>
            </div>

            {/* Vertical Timeline Track */}
            <div className="relative pl-8 space-y-8">
              {/* Left-edge connecting vertical line */}
              <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-[#1F2B2E] z-0" aria-hidden="true" />

              {trip.stops?.map((stop, index) => {
                const sStart = new Date(stop.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const sEnd = new Date(stop.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                return (
                  <div key={stop.id || index} className="relative z-10">
                    
                    {/* Numbered Sequence Pin on Left Rail */}
                    <span
                      className="absolute -left-8 top-5 w-6 h-6 rounded-full bg-[#1F2B2E] text-[#F6F3EC] border border-[#1F2B2E] font-mono text-[11px] font-bold flex items-center justify-center shadow-[1px_1px_0px_0px_#2C5F7C]"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>

                    {/* Signature Ticket Stub Card */}
                    <div className="relative flex flex-col sm:flex-row bg-white border-2 border-[#1F2B2E] shadow-[4px_4px_0px_0px_#1F2B2E]">
                      
                      {/* Left Solid-Fill Stub (Destination & Dates) */}
                      <div
                        className="relative shrink-0 sm:w-52 bg-[#2C5F7C] text-[#F6F3EC] px-5 py-5 flex flex-row sm:flex-col justify-between sm:justify-center gap-1 border-b sm:border-b-0 sm:border-r-2 border-dashed border-[#F6F3EC]/40
                          before:content-[''] before:hidden sm:before:block before:absolute before:-right-2 before:top-0 before:-translate-y-1/2 before:w-4 before:h-4 before:rounded-full before:bg-[#F6F3EC] before:border-2 before:border-[#1F2B2E] before:z-10
                          after:content-[''] after:hidden sm:after:block after:absolute after:-right-2 after:bottom-0 after:translate-y-1/2 after:w-4 after:h-4 after:rounded-full after:bg-[#F6F3EC] after:border-2 after:border-[#1F2B2E] after:z-10"
                      >
                        <div>
                          <div className="text-[10px] font-mono text-white/70 uppercase tracking-widest">
                            STOP 0{index + 1}
                          </div>
                          <p className="font-display font-bold text-2xl leading-tight uppercase">
                            {stop.city?.name || stop.cityName || 'City'}
                          </p>
                          {(stop.city?.country || stop.country) && (
                            <p className="text-[10px] font-mono uppercase tracking-wide text-white/80">
                              {stop.city?.country || stop.country}
                            </p>
                          )}
                        </div>
                        <p className="font-mono text-xs text-white/95 mt-2">
                          {sStart} — {sEnd}
                        </p>
                      </div>

                      {/* Right Body: Day-Grouped Activities */}
                      <div className="flex-1 min-w-0 p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-[#1F2B2E]/10 pb-2">
                          <span className="font-mono text-[10px] uppercase font-bold text-[#1F2B2E]/60">
                            SCHEDULED EXPERIENCES ({stop.tripActivities?.length || 0})
                          </span>
                          <span className="font-mono text-[10px] font-bold text-[#7FA69C] uppercase bg-[#7FA69C]/10 px-2 py-0.5 border border-[#7FA69C]">
                            CONFIRMED ROUTE
                          </span>
                        </div>

                        {stop.tripActivities?.length === 0 ? (
                          <p className="font-mono text-xs text-[#1F2B2E]/50 italic py-2">
                            No activities scheduled for this stop.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {stop.tripActivities?.map((ta, actIdx) => (
                              <div
                                key={ta.id || actIdx}
                                className="p-3 bg-[#F6F3EC] border border-[#1F2B2E] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    {ta.scheduledTime && (
                                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-[#1F2B2E] text-[#F6F3EC]">
                                        {ta.scheduledTime}
                                      </span>
                                    )}
                                    <span className="font-mono text-[10px] font-bold uppercase text-[#2C5F7C]">
                                      #{ta.activity?.category || 'sightseeing'}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-sm text-[#1F2B2E]">
                                    {ta.activity?.name || ta.name || 'Activity'}
                                  </h4>
                                  {(ta.activity?.description || ta.notes) && (
                                    <p className="text-xs text-[#1F2B2E]/70 font-body">
                                      {ta.activity?.description || ta.notes}
                                    </p>
                                  )}
                                </div>

                                <div className="flex sm:flex-col items-end justify-between sm:justify-center font-mono text-xs shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#1F2B2E]/10">
                                  <span className="font-bold text-[#B8823A]">
                                    {ta.activity?.cost > 0 ? `$${ta.activity.cost.toFixed(2)}` : 'Free'}
                                  </span>
                                  {ta.activity?.durationHours && (
                                    <span className="text-[10px] text-[#1F2B2E]/50">
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
          <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E] text-center space-y-4">
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="font-display font-bold text-2xl text-[#1F2B2E] uppercase">
                PLANNING A SIMILAR JOURNEY?
              </h3>
              <p className="text-xs text-[#1F2B2E]/80 font-body leading-relaxed">
                Copy this entire itinerary into your own GlobeTrotter workspace with one click to customize dates, swap activities, and track your budget.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleCloneTrip}
                className="px-6 py-3 bg-[#B8823A] text-white border-2 border-[#1F2B2E] font-mono text-xs font-bold uppercase hover:bg-[#1F2B2E] transition shadow-[3px_3px_0px_0px_#1F2B2E] flex items-center gap-2"
              >
                <BookmarkPlus className="w-4 h-4" />
                COPY THIS TRIP TO MY ACCOUNT
              </button>

              <button
                onClick={handleCopyLink}
                className="px-5 py-3 bg-[#F6F3EC] text-[#1F2B2E] border-2 border-[#1F2B2E] font-mono text-xs font-bold uppercase hover:bg-white transition shadow-[2px_2px_0px_0px_#1F2B2E] flex items-center gap-2"
              >
                <Copy className="w-4 h-4 text-[#2C5F7C]" />
                {copiedLink ? 'LINK COPIED!' : 'COPY SHARE LINK'}
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
