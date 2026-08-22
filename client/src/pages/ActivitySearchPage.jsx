import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Filter, MapPin, Clock, DollarSign, Eye, Camera,
  Utensils, Mountain, Palette, Moon, ShoppingBag, ChevronDown,
  X, Plus, Minus, ArrowLeft, Sparkles, Loader2
} from 'lucide-react';

// Category config — reuse palette tokens per frontend-design.md:
// sea (#7FA69C), ochre (#B8823A), route-blue (#2C5F7C). No new hues.
const CATEGORY_CONFIG = {
  sightseeing: {
    label: 'Sightseeing',
    icon: Camera,
    bg: 'bg-[#2C5F7C]/15',
    border: 'border-[#2C5F7C]/40',
    text: 'text-[#2C5F7C]',
    dot: 'bg-[#2C5F7C]',
  },
  food: {
    label: 'Food & Drink',
    icon: Utensils,
    bg: 'bg-[#B8823A]/15',
    border: 'border-[#B8823A]/40',
    text: 'text-[#B8823A]',
    dot: 'bg-[#B8823A]',
  },
  adventure: {
    label: 'Adventure',
    icon: Mountain,
    bg: 'bg-[#7FA69C]/15',
    border: 'border-[#7FA69C]/40',
    text: 'text-[#7FA69C]',
    dot: 'bg-[#7FA69C]',
  },
  culture: {
    label: 'Culture',
    icon: Palette,
    bg: 'bg-[#2C5F7C]/15',
    border: 'border-[#2C5F7C]/40',
    text: 'text-[#2C5F7C]',
    dot: 'bg-[#2C5F7C]',
  },
  nightlife: {
    label: 'Nightlife',
    icon: Moon,
    bg: 'bg-[#B8823A]/15',
    border: 'border-[#B8823A]/40',
    text: 'text-[#B8823A]',
    dot: 'bg-[#B8823A]',
  },
  shopping: {
    label: 'Shopping',
    icon: ShoppingBag,
    bg: 'bg-[#7FA69C]/15',
    border: 'border-[#7FA69C]/40',
    text: 'text-[#7FA69C]',
    dot: 'bg-[#7FA69C]',
  },
};

function getCategoryConfig(category) {
  return CATEGORY_CONFIG[category?.toLowerCase()] || {
    label: category || 'Other',
    icon: Sparkles,
    bg: 'bg-slate-500/15',
    border: 'border-slate-500/40',
    text: 'text-slate-400',
    dot: 'bg-slate-500',
  };
}

function formatDuration(hours) {
  if (!hours && hours !== 0) return '';
  const num = parseFloat(hours);
  if (isNaN(num)) return '';
  if (num < 1) {
    return `${Math.round(num * 60)}min`;
  }
  const fullHours = Math.floor(num);
  const minutes = Math.round((num - fullHours) * 60);
  if (minutes === 0) return `${fullHours}h`;
  return `${fullHours}h ${minutes}m`;
}

function formatCost(cost) {
  if (cost === 0 || cost === null || cost === undefined) return 'Free';
  return `$${cost.toFixed(0)}`;
}

// ----------- Activity Card Component -----------
function ActivityCard({ activity, isSelected, onToggle, onPreview }) {
  const cat = getCategoryConfig(activity.category || activity.type);
  const CatIcon = cat.icon;

  return (
    <div
      className={`
        group relative rounded-sm border overflow-hidden transition-all duration-200
        ${isSelected
          ? 'border-[#2C5F7C] bg-[#2C5F7C]/5 ring-1 ring-[#2C5F7C]/30'
          : 'border-[#1F2B2E]/15 bg-white hover:border-[#1F2B2E]/30 hover:shadow-sm'
        }
      `}
      style={{ fontFamily: "'Inter', 'IBM Plex Sans', sans-serif" }}
    >
      {/* Image strip */}
      {activity.imageUrl && (
        <div className="relative h-36 overflow-hidden">
          <img
            src={activity.imageUrl}
            alt={activity.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            loading="lazy"
          />
          {/* Category tag - overlaid on image */}
          <div className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider border ${cat.bg} ${cat.border} ${cat.text} backdrop-blur-sm`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`}></span>
            {cat.label}
          </div>
          {/* Quick preview button */}
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(activity); }}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-sm bg-white/80 backdrop-blur-sm border border-[#1F2B2E]/10 text-[#1F2B2E]/60 hover:text-[#2C5F7C] hover:bg-white transition opacity-0 group-hover:opacity-100"
            title="Quick view"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Content body */}
      <div className="p-3.5 space-y-2.5">
        {/* Name */}
        <h4
          className="font-semibold text-[#1F2B2E] text-sm leading-snug line-clamp-2"
          style={{ fontFamily: "'Barlow Condensed', 'Inter', sans-serif", fontWeight: 600 }}
        >
          {activity.name}
        </h4>

        {/* Description */}
        {activity.description && (
          <p className="text-[#1F2B2E]/55 text-xs leading-relaxed line-clamp-2">
            {activity.description}
          </p>
        )}

        {/* Meta row: cost + duration */}
        <div className="flex items-center gap-3 pt-0.5">
          <span
            className="inline-flex items-center gap-1 text-xs font-bold"
            style={{
              fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
              color: activity.cost > 0 ? '#B8823A' : '#7FA69C',
            }}
          >
            <DollarSign className="w-3 h-3" />
            {formatCost(activity.cost)}
          </span>
          {(activity.durationHours !== undefined || activity.duration !== undefined) && (
            <span
              className="inline-flex items-center gap-1 text-xs text-[#1F2B2E]/50"
              style={{ fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace" }}
            >
              <Clock className="w-3 h-3" />
              {formatDuration(activity.durationHours ?? activity.duration)}
            </span>
          )}
        </div>

        {/* Add / Remove button */}
        <button
          onClick={() => onToggle(activity)}
          className={`
            w-full mt-1 py-2 rounded-sm text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-150 border
            ${isSelected
              ? 'border-[#B84A3E]/30 bg-[#B84A3E]/5 text-[#B84A3E] hover:bg-[#B84A3E]/10'
              : 'border-[#2C5F7C]/30 bg-[#2C5F7C]/5 text-[#2C5F7C] hover:bg-[#2C5F7C]/10'
            }
          `}
        >
          {isSelected ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {isSelected ? 'Remove from stop' : 'Add to stop'}
        </button>
      </div>
    </div>
  );
}

// ----------- Activity Detail Modal -----------
function ActivityDetailModal({ activity, onClose, isSelected, onToggle }) {
  if (!activity) return null;
  const cat = getCategoryConfig(activity.category || activity.type);
  const CatIcon = cat.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#1F2B2E]/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-[#F6F3EC] border border-[#1F2B2E]/15 rounded-sm max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Inter', 'IBM Plex Sans', sans-serif" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-sm bg-white/80 backdrop-blur-sm border border-[#1F2B2E]/10 text-[#1F2B2E]/60 hover:text-[#1F2B2E] transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Image */}
        {activity.imageUrl && (
          <div className="h-52 overflow-hidden">
            <img
              src={activity.imageUrl}
              alt={activity.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Category tag */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-semibold uppercase tracking-wider border ${cat.bg} ${cat.border} ${cat.text}`}>
            <CatIcon className="w-3.5 h-3.5" />
            {cat.label}
          </div>

          {/* Title */}
          <h3
            className="text-xl font-bold text-[#1F2B2E] leading-tight"
            style={{ fontFamily: "'Barlow Condensed', 'Inter', sans-serif" }}
          >
            {activity.name}
          </h3>

          {/* Description */}
          {activity.description && (
            <p className="text-[#1F2B2E]/65 text-sm leading-relaxed">
              {activity.description}
            </p>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-5 py-2 border-y border-[#1F2B2E]/10">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#B8823A]" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#1F2B2E]/40 font-semibold">Cost</div>
                <div
                  className="text-sm font-bold"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: activity.cost > 0 ? '#B8823A' : '#7FA69C'
                  }}
                >
                  {formatCost(activity.cost)}
                </div>
              </div>
            </div>
            {(activity.durationHours !== undefined || activity.duration !== undefined) && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2C5F7C]" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#1F2B2E]/40 font-semibold">Duration</div>
                  <div
                    className="text-sm font-bold text-[#1F2B2E]"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {formatDuration(activity.durationHours ?? activity.duration)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action */}
          <button
            onClick={() => { onToggle(activity); onClose(); }}
            className={`
              w-full py-2.5 rounded-sm text-sm font-semibold flex items-center justify-center gap-2 transition border
              ${isSelected
                ? 'border-[#B84A3E]/30 bg-[#B84A3E]/8 text-[#B84A3E] hover:bg-[#B84A3E]/15'
                : 'border-[#2C5F7C] bg-[#2C5F7C] text-white hover:bg-[#2C5F7C]/90'
              }
            `}
          >
            {isSelected ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isSelected ? 'Remove from stop' : 'Add to stop'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------- Main Activity Search Page -----------
export default function ActivitySearchPage({
  cityId,
  initialCityName,
  initialSearch = '',
  onBack,
  onAddActivity,
  onRemoveActivity,
  selectedActivityIds = []
}) {
  const [city, setCity] = useState(null);
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxCost, setMaxCost] = useState('');
  const [maxDuration, setMaxDuration] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Detail modal
  const [previewActivity, setPreviewActivity] = useState(null);

  // Cities list for standalone mode (when no cityId prop given)
  const [cities, setCities] = useState([]);
  const [activeCityId, setActiveCityId] = useState(cityId || null);
  const [loadingCities, setLoadingCities] = useState(!cityId);

  // Fetch cities list if no cityId passed
  useEffect(() => {
    if (!cityId) {
      setLoadingCities(true);
      fetch('/api/cities')
        .then(res => res.json())
        .then(data => {
          const list = data.cities || [];
          setCities(list);
          if (list.length > 0 && !activeCityId) {
            if (initialCityName) {
              const matched = list.find(c => c.name.toLowerCase() === initialCityName.toLowerCase());
              if (matched) {
                setActiveCityId(matched.id);
                return;
              }
            }
            setActiveCityId(list[0].id);
          }
        })
        .catch(() => setError('Failed to load cities'))
        .finally(() => setLoadingCities(false));
    }
  }, [cityId, initialCityName]);

  // Fetch activities when city or filters change
  useEffect(() => {
    if (!activeCityId) return;

    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (maxCost) params.set('maxCost', maxCost);
    if (maxDuration) params.set('maxDuration', maxDuration);
    if (searchQuery) params.set('search', searchQuery);

    fetch(`/api/cities/${activeCityId}/activities?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load activities');
        return res.json();
      })
      .then((data) => {
        setCity(data.city);
        setActivities(data.activities || []);
        setCategories(data.categories || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeCityId, selectedCategory, maxCost, maxDuration, searchQuery]);

  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleToggle = (activity) => {
    if (selectedActivityIds.includes(activity.id)) {
      onRemoveActivity?.(activity);
    } else {
      onAddActivity?.(activity);
    }
  };

  const activeFilterCount = [
    selectedCategory !== 'all',
    maxCost !== '',
    maxDuration !== '',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategory('all');
    setMaxCost('');
    setMaxDuration('');
    setSearchInput('');
    setSearchQuery('');
  };

  return (
    <div
      className="min-h-[80vh]"
      style={{ fontFamily: "'Inter', 'IBM Plex Sans', sans-serif" }}
    >
      {/* Header */}
      <div className="mb-6">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#2C5F7C] hover:text-[#2C5F7C]/80 mb-3 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to itinerary
          </button>
        )}

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2
              className="text-2xl font-bold text-[#1F2B2E] tracking-tight"
              style={{ fontFamily: "'Barlow Condensed', 'Inter', sans-serif", fontWeight: 700 }}
            >
              Activity Search
            </h2>
            {city && (
              <p className="flex items-center gap-1.5 text-sm text-[#1F2B2E]/50 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  {city.name}, {city.country}
                </span>
              </p>
            )}
          </div>
          {selectedActivityIds.length > 0 && (
            <div
              className="px-3 py-1.5 rounded-sm border border-[#7FA69C]/30 bg-[#7FA69C]/8 text-[#7FA69C] text-xs font-semibold"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {selectedActivityIds.length} selected
            </div>
          )}
        </div>
      </div>

      {/* City selector (standalone mode) */}
      {!cityId && cities.length > 0 && (
        <div className="mb-5">
          <label className="text-[10px] uppercase tracking-wider text-[#1F2B2E]/40 font-semibold mb-1.5 block">
            Select city
          </label>
          <div className="flex flex-wrap gap-2">
            {cities.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCityId(c.id)}
                className={`
                  px-3 py-1.5 rounded-sm text-xs font-semibold border transition
                  ${activeCityId === c.id
                    ? 'border-[#2C5F7C] bg-[#2C5F7C] text-white'
                    : 'border-[#1F2B2E]/15 text-[#1F2B2E]/60 hover:border-[#2C5F7C]/40 hover:text-[#2C5F7C]'
                  }
                `}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search bar + filter toggle */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F2B2E]/30" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="e.g. Eiffel Tower, sushi tasting…"
            className="w-full bg-white border border-[#1F2B2E]/15 rounded-sm pl-9 pr-4 py-2.5 text-sm text-[#1F2B2E] placeholder-[#1F2B2E]/30 focus:outline-none focus:border-[#2C5F7C] focus:ring-1 focus:ring-[#2C5F7C]/20 transition"
            style={{ fontFamily: "'IBM Plex Mono', 'Inter', monospace" }}
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(''); setSearchQuery(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1F2B2E]/30 hover:text-[#1F2B2E]/60 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-sm text-xs font-semibold border transition
            ${showFilters || activeFilterCount > 0
              ? 'border-[#2C5F7C] bg-[#2C5F7C]/5 text-[#2C5F7C]'
              : 'border-[#1F2B2E]/15 text-[#1F2B2E]/50 hover:border-[#1F2B2E]/30'
            }
          `}
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 w-4.5 h-4.5 rounded-full bg-[#2C5F7C] text-white text-[10px] flex items-center justify-center font-bold leading-none px-1.5 py-0.5">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-5 p-4 bg-white border border-[#1F2B2E]/10 rounded-sm space-y-4 animate-in slide-in-from-top-1">
          {/* Category pills */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#1F2B2E]/40 font-semibold mb-2 block">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-sm text-[11px] font-semibold border transition ${
                  selectedCategory === 'all'
                    ? 'border-[#1F2B2E] bg-[#1F2B2E] text-[#F6F3EC]'
                    : 'border-[#1F2B2E]/15 text-[#1F2B2E]/50 hover:border-[#1F2B2E]/30'
                }`}
              >
                All
              </button>
              {categories.map((cat) => {
                const cfg = getCategoryConfig(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[11px] font-semibold border transition ${
                      selectedCategory === cat
                        ? `${cfg.bg} ${cfg.border} ${cfg.text}`
                        : 'border-[#1F2B2E]/15 text-[#1F2B2E]/50 hover:border-[#1F2B2E]/30'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cost + Duration range */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] uppercase tracking-wider text-[#1F2B2E]/40 font-semibold mb-1.5 block">
                Max cost ($)
              </label>
              <input
                type="number"
                value={maxCost}
                onChange={(e) => setMaxCost(e.target.value)}
                placeholder="No limit"
                min={0}
                className="w-full bg-[#F6F3EC] border border-[#1F2B2E]/15 rounded-sm px-3 py-2 text-xs text-[#1F2B2E] placeholder-[#1F2B2E]/30 focus:outline-none focus:border-[#2C5F7C] transition"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] uppercase tracking-wider text-[#1F2B2E]/40 font-semibold mb-1.5 block">
                Max duration (hours)
              </label>
              <input
                type="number"
                value={maxDuration}
                onChange={(e) => setMaxDuration(e.target.value)}
                placeholder="No limit"
                min={0}
                step={0.5}
                className="w-full bg-[#F6F3EC] border border-[#1F2B2E]/15 rounded-sm px-3 py-2 text-xs text-[#1F2B2E] placeholder-[#1F2B2E]/30 focus:outline-none focus:border-[#2C5F7C] transition"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              />
            </div>
          </div>

          {/* Clear all */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-[#B84A3E] font-semibold hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#2C5F7C] animate-spin" />
          <span className="ml-2 text-sm text-[#1F2B2E]/40">Loading activities…</span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-4 rounded-sm border border-[#B84A3E]/20 bg-[#B84A3E]/5 text-[#B84A3E] text-sm">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && activities.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#1F2B2E]/5 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6 text-[#1F2B2E]/25" />
          </div>
          <p className="text-[#1F2B2E]/50 text-sm">
            {searchQuery || selectedCategory !== 'all' || maxCost || maxDuration
              ? 'No activities match your filters. Try broadening your search.'
              : 'No activities found for this city.'
            }
          </p>
          {(searchQuery || selectedCategory !== 'all' || maxCost || maxDuration) && (
            <button
              onClick={clearFilters}
              className="text-xs text-[#2C5F7C] font-semibold hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Activity grid */}
      {!loading && !error && activities.length > 0 && (
        <>
          <p className="text-[10px] uppercase tracking-wider text-[#1F2B2E]/35 font-semibold mb-3">
            {activities.length} {activities.length === 1 ? 'activity' : 'activities'} found
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isSelected={selectedActivityIds.includes(activity.id)}
                onToggle={handleToggle}
                onPreview={setPreviewActivity}
              />
            ))}
          </div>
        </>
      )}

      {/* Detail modal */}
      {previewActivity && (
        <ActivityDetailModal
          activity={previewActivity}
          onClose={() => setPreviewActivity(null)}
          isSelected={selectedActivityIds.includes(previewActivity.id)}
          onToggle={handleToggle}
        />
      )}
    </div>
  );
}
