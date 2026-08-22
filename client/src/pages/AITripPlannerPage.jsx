import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createTrip } from '../api/tripsApi';
import {
  Sparkles, Compass, Calendar, DollarSign, MapPin, Clock,
  CheckCircle2, ArrowRight, Loader2, Lightbulb, Save, Sliders,
  Check, RefreshCw, Zap, Star, ShieldCheck, Heart, AlertCircle
} from 'lucide-react';

const PRESET_PROMPTS = [
  {
    title: '🗼 Japan Cultural & Food Trail',
    destination: 'Tokyo & Kyoto, Japan',
    days: 7,
    style: 'Culture & Food',
    budget: 1800,
    currency: 'USD',
    prompt: 'Experience Fushimi Inari at sunrise, Tsukiji outer market food, Senso-ji temple, teamLab digital art, and Arashiyama bamboo forest with local ramen spots.'
  },
  {
    title: '🏛️ European Empire Tour',
    destination: 'Paris & Rome',
    days: 10,
    style: 'History & Art',
    budget: 2500,
    currency: 'USD',
    prompt: 'Eiffel tower summit at golden hour, Louvre museum, Mona Lisa, Colosseum underground, Vatican Sistine chapel, and evening Seine river cruise.'
  },
  {
    title: '🏖️ Bali Tropical Beach & Temple Escape',
    destination: 'Bali, Indonesia',
    days: 5,
    style: 'Backpacking & Nature',
    budget: 950,
    currency: 'USD',
    prompt: 'Ubud rice terraces, Uluwatu cliffside temple sunset, Mount Batur sunrise trek, and beachside seafood dinner in Jimbaran.'
  },
  {
    title: '🏰 Barcelona Architecture & Tapas Walk',
    destination: 'Barcelona, Spain',
    days: 5,
    style: 'Foodie & Culture',
    budget: 1400,
    currency: 'USD',
    prompt: 'Sagrada Família guided tour, Park Güell stroll, Gothic Quarter vermouth and tapas crawl, and Barceloneta beach sunset.'
  }
];

export default function AITripPlannerPage({ onNavigate }) {
  const { user, isAuthenticated } = useAuth();

  // Form State
  const [destination, setDestination] = useState('Tokyo & Kyoto, Japan');
  const [durationDays, setDurationDays] = useState(7);
  const [travelStyle, setTravelStyle] = useState('Culture & Food');
  const [budget, setBudget] = useState(1800);
  const [currency, setCurrency] = useState('USD');
  const [prompt, setPrompt] = useState('Focus on top iconic landmarks, local food markets, easy transit routes, and morning temple visits.');

  // Processing & Output State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedTrip, setGeneratedTrip] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Handle Preset selection
  const handleApplyPreset = (preset) => {
    setDestination(preset.destination);
    setDurationDays(preset.days);
    setTravelStyle(preset.style);
    setBudget(preset.budget);
    setCurrency(preset.currency);
    setPrompt(preset.prompt);
  };

  // Generate Itinerary API Call to Express backend (Grok API)
  const handleGenerateItinerary = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedTrip(null);
    setSaveSuccessMessage('');

    try {
      const res = await fetch('/api/ai/generate-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          durationDays: Number(durationDays),
          travelStyle,
          budget: Number(budget),
          currency,
          prompt
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to generate itinerary with Grok AI.');
      }

      if (data.itinerary) {
        setGeneratedTrip(data.itinerary);
      } else {
        throw new Error('Received invalid itinerary format from AI server.');
      }

    } catch (err) {
      console.error('AI Generation Error:', err);
      setError(err.message || 'Something went wrong while contacting Grok AI.');
    } finally {
      setLoading(false);
    }
  };

  // Save AI Generated Trip to Database
  const handleSaveToWallet = async () => {
    if (!isAuthenticated) {
      onNavigate('auth');
      return;
    }

    if (!generatedTrip) return;
    setSaveLoading(true);
    try {
      const today = new Date();
      const endDate = new Date(today.getTime() + (generatedTrip.durationDays || 7) * 86400000);

      const tripPayload = {
        name: generatedTrip.name || `AI Trip: ${destination}`,
        description: generatedTrip.description || `Grok AI generated ${travelStyle} trip to ${destination}`,
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        coverPhoto: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
        initialCityId: 'city-paris',
        estStayCostPerDay: 120,
        estTransportCost: 180
      };

      const result = await createTrip(tripPayload);
      const savedId = result?.trip?.id || result?.id;
      
      setSaveSuccessMessage('AI Itinerary saved to your My Trips Wallet!');
      setTimeout(() => {
        onNavigate('my-trips');
      }, 1500);

    } catch (err) {
      console.error('Save AI trip error:', err);
      alert(err.message || 'Failed to save AI trip to database');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="w-full px-6 sm:px-12 pt-4 pb-20 space-y-8 font-sans">
      
      {/* Toast Notification */}
      {saveSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#F5B800] text-[#1E232A] px-6 py-3.5 rounded-full font-bold text-sm shadow-2xl flex items-center gap-2 animate-bounce border border-black/10">
          <CheckCircle2 className="h-5 w-5 text-[#1E232A]" />
          {saveSuccessMessage}
        </div>
      )}

      {/* Screen Header Banner */}
      <div className="bg-[#1A1D23] text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-gray-800 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 z-10 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#F5B800] text-[#1E232A] text-[11px] font-extrabold tracking-widest uppercase rounded-full flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              AI Intelligence Engine
            </span>
            <span className="text-gray-400 text-xs font-medium">Real-Time Itinerary Generator</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-white flex items-center gap-3">
            AI Trip Planner
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed font-sans">
            Describe your ideal vacation, target budget, and desired style. Our AI engine will generate a complete day-by-day itinerary, activity timeline, and cost ledger tailored to your preferences.
          </p>
        </div>

        {/* Decorative AI Icon */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <Sparkles className="h-96 w-96 text-[#F5B800]" />
        </div>
      </div>

      {/* Quick Inspiration Presets */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#F5B800]" />
          Quick Preset Prompts:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESET_PROMPTS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="p-4 bg-white border border-gray-200 hover:border-[#F5B800] hover:shadow-lg rounded-2xl text-left transition duration-200 cursor-pointer space-y-2 group"
            >
              <div className="font-bold text-sm text-[#1E232A] group-hover:text-[#F5B800] transition">
                {preset.title}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <span>📅 {preset.days} Days</span>
                <span>•</span>
                <span>💰 ${preset.budget}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form & Configuration Studio */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        
        <form onSubmit={handleGenerateItinerary} className="space-y-6">
          
          {/* Row 1: Destination & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                Destination City / Country *
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Paris & Rome, Tokyo, Bali..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-sm font-bold text-[#1E232A] focus:outline-none focus:border-[#F5B800]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                Duration (Days): {durationDays} Days
              </label>
              <input
                type="range"
                min="1"
                max="14"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#F5B800] mt-3"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                <span>1 Day</span>
                <span>7 Days</span>
                <span>14 Days</span>
              </div>
            </div>

          </div>

          {/* Row 2: Travel Style, Budget & Currency */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                Travel Style / Theme
              </label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-extrabold text-[#1E232A] focus:outline-none focus:border-[#F5B800]"
              >
                <option value="Culture & Food">Culture & Food</option>
                <option value="Backpacking & Nature">Backpacking & Nature</option>
                <option value="History & Art">History & Art</option>
                <option value="Luxury & Relaxing">Luxury & Relaxing</option>
                <option value="Family Friendly">Family Friendly</option>
                <option value="Nightlife & Party">Nightlife & Party</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                Target Budget
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-sm font-bold text-[#1E232A] focus:outline-none focus:border-[#F5B800]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-extrabold text-[#1E232A] focus:outline-none focus:border-[#F5B800]"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

          </div>

          {/* Row 3: Custom Wishes Prompt Text */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider">
              Specific Wishes, Activities or Requirements
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Add special notes e.g., must include street food, sunrise hikes, early morning temples, fast-track museum passes..."
              className="w-full p-4 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#F5B800]"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-extrabold text-sm uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-3 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                AI IS CRAFTING YOUR ITINERARY...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-[#1E232A]" />
                GENERATE ITINERARY WITH AI
              </>
            )}
          </button>

        </form>

      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="h-6 w-6 text-red-500 shrink-0" />
          <div>
            <div className="font-bold">Generation Failed</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Generated AI Results Output Display */}
      {generatedTrip && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Output Master Summary Card */}
          <div className="bg-[#1A1D23] text-white border border-gray-800 rounded-3xl p-8 shadow-2xl space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
              <div className="space-y-2">
                <span className="px-3 py-1 bg-[#F5B800] text-[#1E232A] text-[10px] font-extrabold uppercase tracking-widest rounded-full">
                  AI Generated Journey
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-black text-white">
                  {generatedTrip.name}
                </h2>
                <p className="text-xs text-gray-300 leading-relaxed font-sans max-w-2xl">
                  {generatedTrip.description}
                </p>
              </div>

              {/* Save to Wallet Button */}
              <button
                onClick={handleSaveToWallet}
                disabled={saveLoading}
                className="px-6 py-3.5 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-extrabold text-xs uppercase tracking-widest rounded-full shadow-xl flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {saveLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                SAVE TO MY TRIPS WALLET
              </button>
            </div>

            {/* Estimated Budget Cards */}
            {generatedTrip.estimatedBudget && (
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-[#F5B800] uppercase tracking-widest flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Estimated Budget Ledger Breakdown:
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Estimated</span>
                    <span className="text-lg font-black text-[#F5B800]">
                      {currency === 'INR' ? '₹' : '$'}{generatedTrip.estimatedBudget.total}
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Stay / Hotel</span>
                    <span className="text-base font-bold text-white">
                      {currency === 'INR' ? '₹' : '$'}{generatedTrip.estimatedBudget.breakdown?.accommodation || 0}
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Transport</span>
                    <span className="text-base font-bold text-white">
                      {currency === 'INR' ? '₹' : '$'}{generatedTrip.estimatedBudget.breakdown?.transportation || 0}
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Activities</span>
                    <span className="text-base font-bold text-white">
                      {currency === 'INR' ? '₹' : '$'}{generatedTrip.estimatedBudget.breakdown?.activities || 0}
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Food & Misc</span>
                    <span className="text-base font-bold text-white">
                      {currency === 'INR' ? '₹' : '$'}{generatedTrip.estimatedBudget.breakdown?.foodAndMisc || 0}
                    </span>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* Day Wise Itinerary Accordion / Timeline */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-black text-[#1E232A] flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#F5B800]" />
              Day-by-Day AI Timeline ({generatedTrip.durationDays} Days)
            </h3>

            <div className="space-y-4">
              {generatedTrip.dayWiseItinerary?.map((dayPlan, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-3xl p-6 shadow-md hover:shadow-xl transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 bg-[#1E232A] text-[#F5B800] font-black rounded-full flex items-center justify-center text-sm shadow">
                        D{dayPlan.day}
                      </span>
                      <div>
                        <h4 className="font-serif font-bold text-lg text-[#1E232A]">
                          Day {dayPlan.day}: {dayPlan.theme || dayPlan.city}
                        </h4>
                        <span className="text-xs text-gray-500 font-medium">📍 Location: {dayPlan.city}</span>
                      </div>
                    </div>

                    {dayPlan.estimatedDayCost && (
                      <span className="px-3 py-1 bg-amber-50 text-amber-800 rounded-full font-bold text-xs border border-amber-200 self-start sm:self-auto">
                        Est. Day Cost: ${dayPlan.estimatedDayCost}
                      </span>
                    )}
                  </div>

                  {/* Activities List */}
                  <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-[#F5B800]">
                    {dayPlan.schedule?.map((act, actIdx) => (
                      <div key={actIdx} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-[#1E232A] text-white text-[10px] font-extrabold rounded-full">
                              {act.time}
                            </span>
                            <h5 className="font-bold text-sm text-[#1E232A]">{act.activityName}</h5>
                          </div>
                          <span className="text-xs font-extrabold text-[#F5B800]">
                            {act.cost > 0 ? `$${act.cost}` : 'Free'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium pl-1">{act.description}</p>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>

          </div>

          {/* AI Insider Travel Tips */}
          {generatedTrip.insiderTips && generatedTrip.insiderTips.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-4">
              <h4 className="font-serif font-black text-lg text-amber-900 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                AI Insider Travel Tips:
              </h4>
              <ul className="space-y-2">
                {generatedTrip.insiderTips.map((tip, tipIdx) => (
                  <li key={tipIdx} className="flex items-start gap-2.5 text-xs text-amber-900 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
