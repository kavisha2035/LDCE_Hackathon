import React, { useState, useEffect } from 'react';
import {
  Search, Filter, MapPin, Clock, DollarSign, Eye, Camera,
  Utensils, Mountain, Palette, Moon, ShoppingBag, ChevronDown,
  X, Plus, Minus, ArrowLeft, Sparkles, Loader2
} from 'lucide-react';

const CATEGORY_CONFIG = {
  sightseeing: {
    label: 'Sightseeing',
    icon: Camera,
    bg: 'bg-[#F5B800]',
    text: 'text-[#1E232A]',
  },
  food: {
    label: 'Food & Drink',
    icon: Utensils,
    bg: 'bg-[#1E232A]',
    text: 'text-white',
  },
  adventure: {
    label: 'Adventure',
    icon: Mountain,
    bg: 'bg-emerald-600',
    text: 'text-white',
  },
  culture: {
    label: 'Culture',
    icon: Palette,
    bg: 'bg-purple-700',
    text: 'text-white',
  },
  nightlife: {
    label: 'Nightlife',
    icon: Moon,
    bg: 'bg-indigo-700',
    text: 'text-white',
  },
  shopping: {
    label: 'Shopping',
    icon: ShoppingBag,
    bg: 'bg-rose-600',
    text: 'text-white',
  },
};

function getCategoryConfig(category) {
  return CATEGORY_CONFIG[category?.toLowerCase()] || {
    label: category || 'Experience',
    icon: Sparkles,
    bg: 'bg-[#F5B800]',
    text: 'text-[#1E232A]',
  };
}

function formatDuration(hours) {
  if (!hours && hours !== 0) return '';
  const num = parseFloat(hours);
  if (isNaN(num)) return '';
  if (num < 1) {
    return `${Math.round(num * 60)} mins`;
  }
  const fullHours = Math.floor(num);
  const minutes = Math.round((num - fullHours) * 60);
  if (minutes === 0) return `${fullHours} hrs`;
  return `${fullHours}h ${minutes}m`;
}

function formatCost(cost) {
  if (cost === 0 || cost === null || cost === undefined) return 'Included (Free)';
  return `$${cost.toFixed(0)}`;
}

// ----------- Activity Card Component -----------
function ActivityCard({ activity, isSelected, onToggle, onPreview }) {
  const cat = getCategoryConfig(activity.category || activity.type);
  const CatIcon = cat.icon;

  return (
    <div
      className={`
        group relative rounded-3xl border border-gray-200 overflow-hidden bg-white shadow-xl hover:shadow-2xl transition duration-300 flex flex-col justify-between min-h-[480px]
        ${isSelected ? 'ring-2 ring-[#F5B800]' : ''}
      `}
    >
      <div>
        {/* Image Banner */}
        <div className="relative h-64 sm:h-72 overflow-hidden">
          <img
            src={activity.imageUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'}
            alt={activity.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

          {/* Category Pill */}
          <div className={`absolute top-4 left-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${cat.bg} ${cat.text} shadow-md`}>
            <CatIcon className="w-3.5 h-3.5" />
            {cat.label}
          </div>

          {/* Quick Preview Button */}
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(activity); }}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/90 hover:bg-white text-[#1E232A] shadow-md transition cursor-pointer"
            title="Quick view"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Cost & Duration Badges on Image */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
            <span className="px-3.5 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-xs font-extrabold font-sans text-[#F5B800]">
              {formatCost(activity.cost)}
            </span>
            {(activity.durationHours !== undefined || activity.duration !== undefined) && (
              <span className="px-3.5 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold font-sans text-gray-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F5B800]" />
                {formatDuration(activity.durationHours ?? activity.duration)}
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-7 space-y-3">
          <h4 className="font-serif font-black text-[#1E232A] text-2xl leading-snug line-clamp-2">
            {activity.name}
          </h4>

          {activity.description && (
            <p className="text-gray-600 text-sm font-sans leading-relaxed line-clamp-3">
              {activity.description}
            </p>
          )}
        </div>
      </div>

      {/* Curvy Action Button */}
      <div className="p-7 pt-0">
        <button
          onClick={() => onToggle(activity)}
          className={`
            w-full py-3.5 px-6 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-md
            ${isSelected
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A]'
            }
          `}
        >
          {isSelected ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isSelected ? 'Remove Stop' : 'Add to Journey'}
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative bg-white rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/90 text-[#1E232A] hover:bg-white transition cursor-pointer shadow"
        >
          <X className="w-5 h-5" />
        </button>

        {activity.imageUrl && (
          <div className="h-64 overflow-hidden relative">
            <img
              src={activity.imageUrl}
              alt={activity.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
        )}

        <div className="p-8 space-y-5">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${cat.bg} ${cat.text}`}>
            <CatIcon className="w-4 h-4" />
            {cat.label}
          </div>

          <h3 className="text-3xl font-serif font-bold text-[#1E232A]">
            {activity.name}
          </h3>

          {activity.description && (
            <p className="text-gray-600 text-sm font-sans leading-relaxed">
              {activity.description}
            </p>
          )}

          <div className="flex items-center justify-between py-4 border-y border-gray-100 font-sans">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Est. Cost</span>
              <span className="text-lg font-extrabold text-[#F5B800]">{formatCost(activity.cost)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Duration</span>
              <span className="text-base font-bold text-[#1E232A]">{formatDuration(activity.durationHours ?? activity.duration)}</span>
            </div>
          </div>

          <button
            onClick={() => { onToggle(activity); onClose(); }}
            className={`
              w-full py-4 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg
              ${isSelected
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A]'
              }
            `}
          >
            {isSelected ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isSelected ? 'Remove from Stop' : 'Add to Journey'}
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

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewActivity, setPreviewActivity] = useState(null);

  const [cities, setCities] = useState([]);
  const [activeCityId, setActiveCityId] = useState(cityId || null);

  useEffect(() => {
    if (!cityId) {
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
        .catch(() => setError('Failed to load cities'));
    }
  }, [cityId, initialCityName]);

  useEffect(() => {
    if (!activeCityId) return;
    setLoading(true);

    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (searchQuery) params.set('search', searchQuery);

    fetch(`/api/cities/${activeCityId}/activities?${params}`)
      .then(res => res.json())
      .then(data => {
        setCity(data.city);
        setActivities(data.activities || []);
        setCategories(data.categories || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeCityId, selectedCategory, searchQuery]);

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

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-12 py-8 space-y-8 font-sans bg-[#FAF9F6] text-[#1E232A]">
      
      {/* Page Header */}
      <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-xl space-y-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-[#1E232A] hover:text-[#F5B800] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Itinerary
          </button>
        )}

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="font-script text-[#F5B800] text-3xl block">discover tours</span>
            <h1 className="text-4xl font-serif font-bold text-[#1E232A] uppercase">
              TOURS & ACTIVITIES CATALOG
            </h1>
            {city && (
              <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 mt-1">
                <MapPin className="w-4 h-4 text-[#F5B800]" />
                {city.name}, {city.country}
              </p>
            )}
          </div>
        </div>

        {/* City Filter Pills */}
        {!cityId && cities.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">Select Destination:</span>
            <div className="flex flex-wrap gap-2">
              {cities.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCityId(c.id)}
                  className={`
                    px-5 py-2.5 rounded-full text-xs font-bold uppercase transition cursor-pointer shadow-sm
                    ${activeCityId === c.id
                      ? 'bg-[#1E232A] text-[#F5B800]'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Input Bar */}
      <div className="relative w-full">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search tours by title (e.g. Eiffel Tower, Senso-ji, Colosseum)..."
          className="w-full bg-white border border-gray-300 rounded-full pl-14 pr-12 py-4 text-sm font-semibold text-[#1E232A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5B800] shadow-md"
        />
        {searchInput && (
          <button
            onClick={() => { setSearchInput(''); setSearchQuery(''); }}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Activity Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-gray-200">
          <Loader2 className="w-8 h-8 text-[#F5B800] animate-spin" />
          <span className="ml-3 text-sm font-bold text-gray-500 uppercase">Loading Activities Catalog...</span>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 space-y-3">
          <Search className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500 font-semibold text-sm">No experiences found for this selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
      )}

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
