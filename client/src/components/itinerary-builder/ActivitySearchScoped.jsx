import React, { useState } from 'react';
import { useCityActivities } from '../../hooks/useCityActivities';
import { formatCurrency, formatDuration } from '../../lib/format';
import { Search, Plus, Loader2, Check, Sparkles, X, Compass, DollarSign, Tag } from 'lucide-react';

const CATEGORIES = ['sightseeing', 'food', 'adventure', 'culture', 'nightlife'];

export default function ActivitySearchScoped({ cityId, onAdd, onClose }) {
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [addingId, setAddingId] = useState(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('sightseeing');
  const [customCost, setCustomCost] = useState('2500');

  const { data: activities = [], isLoading } = useCityActivities(cityId, { category });

  const filteredActivities = activities.filter((act) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return act.name.toLowerCase().includes(q) || (act.description && act.description.toLowerCase().includes(q));
  });

  const handleAddActivity = async (activity) => {
    setAddingId(activity.id);
    try {
      await onAdd(activity.id, activity);
    } finally {
      setAddingId(null);
    }
  };

  const handleAddCustom = async (e) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const tempId = `act-custom-${Date.now()}`;
    const customActivity = {
      id: tempId,
      name: customName.trim(),
      category: customCategory,
      cost: parseFloat(customCost || 0),
      duration_hours: 2,
    };
    setAddingId(tempId);
    try {
      await onAdd(tempId, customActivity);
      setCustomName('');
      setShowCustomForm(false);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="w-full mt-4 border border-gray-200 rounded-3xl bg-[#FAF9F6] p-6 shadow-lg space-y-4 font-sans animate-in fade-in zoom-in-95 duration-200">
      
      {/* Header & Controls */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-[#F5B800]/20 text-[#1E232A] flex items-center justify-center font-bold">
            <Sparkles className="h-4 w-4 text-[#F5B800]" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-base text-[#1E232A] leading-tight">
              Select Curated Experiences
            </h4>
            <p className="text-xs text-gray-500">Add attractions & signature tours to this stop</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full text-gray-400 hover:text-[#1E232A] hover:bg-white transition cursor-pointer"
          title="Close search"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search attractions, museums, food tours..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full font-sans text-xs text-[#1E232A] focus:outline-none focus:ring-2 focus:ring-[#F5B800] transition shadow-xs"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setCategory('')}
            className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              category === ''
                ? 'bg-[#1E232A] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap transition cursor-pointer ${
                category === c
                  ? 'bg-[#F5B800] text-[#1E232A] shadow-xs font-extrabold'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Activities List */}
      {isLoading ? (
        <div className="py-8 text-center font-sans text-xs text-gray-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#F5B800]" />
          <span>Searching destination experiences…</span>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="py-6 text-center space-y-3 bg-white rounded-2xl p-5 border border-dashed border-gray-300">
          <p className="font-sans text-xs text-gray-500">
            No matching activities found for this category.
          </p>
          {!showCustomForm && (
            <button
              type="button"
              onClick={() => setShowCustomForm(true)}
              className="px-5 py-2 bg-[#FAF9F6] hover:bg-[#F5B800] hover:text-[#1E232A] border border-gray-300 text-[#1E232A] font-extrabold text-xs uppercase tracking-wider rounded-full shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Custom Activity
            </button>
          )}
        </div>
      ) : (
        <ul className="max-h-72 overflow-y-auto divide-y divide-gray-200 bg-white rounded-2xl border border-gray-200 px-3 shadow-xs">
          {filteredActivities.map((activity) => {
            const isAdding = addingId === activity.id;
            return (
              <li key={activity.id} className="flex items-center justify-between gap-4 py-3.5 px-3 hover:bg-[#FAF9F6] transition rounded-xl">
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-sm font-bold text-[#1E232A] truncate">
                    {activity.name}
                  </p>
                  <div className="flex items-center gap-2.5 mt-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F5B800] bg-[#F5B800]/15 px-2.5 py-0.5 rounded-full">
                      {activity.category}
                    </span>
                    <span className="text-gray-400 text-xs font-sans">
                      {formatDuration(activity.duration_hours || activity.durationHours || 2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 shrink-0">
                  <span className="font-bold font-sans text-sm text-[#1E232A]">
                    {formatCurrency(activity.cost)}
                  </span>
                  <button
                    type="button"
                    disabled={isAdding}
                    onClick={() => handleAddActivity(activity)}
                    className="px-4 py-2 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-sans text-xs font-extrabold uppercase tracking-wider rounded-full shadow-xs hover:shadow-md flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    {isAdding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                    Add
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Custom Activity Toggle / Form */}
      {showCustomForm ? (
        <form onSubmit={handleAddCustom} className="pt-3 border-t border-gray-200 space-y-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-xs text-[#1E232A] uppercase tracking-wide">
              Add Custom Stop Activity:
            </span>
            <button
              type="button"
              onClick={() => setShowCustomForm(false)}
              className="text-xs text-gray-400 hover:text-red-500 font-bold"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Activity name (e.g. Michelin Dinner)..."
              className="sm:col-span-2 px-4 py-2.5 bg-[#FAF9F6] border border-gray-300 rounded-full font-sans text-xs text-[#1E232A] focus:outline-none focus:ring-2 focus:ring-[#F5B800] focus:bg-white"
            />
            <input
              type="number"
              min="0"
              value={customCost}
              onChange={(e) => setCustomCost(e.target.value)}
              placeholder="Cost (₹)"
              className="px-4 py-2.5 bg-[#FAF9F6] border border-gray-300 rounded-full font-sans text-xs text-[#1E232A] focus:outline-none focus:ring-2 focus:ring-[#F5B800] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={addingId !== null}
            className="w-full py-3 bg-[#1E232A] hover:bg-[#F5B800] text-white hover:text-[#1E232A] font-sans text-xs font-extrabold uppercase tracking-widest rounded-full transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            {addingId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Save & Add to Stop
          </button>
        </form>
      ) : (
        <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setShowCustomForm(true)}
            className="text-gray-600 hover:text-[#1E232A] font-bold inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-[#F5B800]" />
            Need something bespoke? Add custom experience
          </button>
        </div>
      )}

    </div>
  );
}
