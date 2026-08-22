import React, { useState } from 'react';
import { useCityActivities } from '../../hooks/useCityActivities';
import { formatCurrency, formatDuration } from '../../lib/format';
import { Search, Plus, Loader2, Check, Sparkles } from 'lucide-react';

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
    <div className="mt-3 border-2 border-[#1F2B2E] rounded-sm bg-[#F6F3EC] p-3.5 shadow-[3px_3px_0px_0px_#1F2B2E] space-y-3">
      
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1F2B2E]/20 pb-2">
        <span className="font-mono text-xs font-bold text-[#1F2B2E] uppercase flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#2C5F7C]" />
          Select Activity for this Stop
        </span>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-xs text-[#1F2B2E]/60 hover:text-[#B84A3E] font-bold cursor-pointer"
        >
          ✕ Close
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        <div className="sm:col-span-7 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1F2B2E]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activities..."
            className="w-full pl-8 pr-2 py-1.5 bg-white border border-[#1F2B2E] font-mono text-xs text-[#1F2B2E] focus:outline-none focus:ring-1 focus:ring-[#2C5F7C]"
          />
        </div>

        <div className="sm:col-span-5 flex gap-1.5">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 px-2 py-1.5 bg-white border border-[#1F2B2E] font-mono text-xs text-[#1F2B2E] focus:outline-none"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Activities List */}
      {isLoading ? (
        <div className="py-4 text-center font-mono text-xs text-[#1F2B2E]/60 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-[#2C5F7C]" />
          Loading activities…
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="py-3 text-center space-y-2">
          <p className="font-mono text-xs text-[#1F2B2E]/60">No matching activities found for this city.</p>
          {!showCustomForm && (
            <button
              type="button"
              onClick={() => setShowCustomForm(true)}
              className="px-3 py-1 bg-white border border-[#1F2B2E] font-mono text-xs font-bold text-[#2C5F7C] hover:bg-[#2C5F7C] hover:text-white transition cursor-pointer"
            >
              + Create Custom Activity
            </button>
          )}
        </div>
      ) : (
        <ul className="max-h-52 overflow-y-auto divide-y divide-[#1F2B2E]/10 pr-1">
          {filteredActivities.map((activity) => {
            const isAdding = addingId === activity.id;
            return (
              <li key={activity.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="font-body text-xs font-bold text-[#1F2B2E] truncate">{activity.name}</p>
                  <p className="font-mono text-[10px] text-[#1F2B2E]/60 capitalize">{activity.category}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                  <span className="font-bold text-[#B8823A]">{formatCurrency(activity.cost)}</span>
                  <span className="text-[#1F2B2E]/50 text-[11px]">{formatDuration(activity.duration_hours || activity.durationHours || 2)}</span>
                  <button
                    type="button"
                    disabled={isAdding}
                    onClick={() => handleAddActivity(activity)}
                    className="px-2.5 py-1 bg-[#2C5F7C] hover:bg-[#1F2B2E] text-white font-mono text-xs font-bold rounded-sm border border-[#1F2B2E] flex items-center gap-1 transition cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
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
        <form onSubmit={handleAddCustom} className="pt-2 border-t border-[#1F2B2E]/20 space-y-2 bg-white p-2.5 border border-[#1F2B2E]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold text-[#1F2B2E] uppercase">Add Custom Activity:</span>
            <button
              type="button"
              onClick={() => setShowCustomForm(false)}
              className="font-mono text-[10px] text-[#1F2B2E]/50 hover:text-[#B84A3E]"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              required
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Activity name..."
              className="sm:col-span-2 px-2 py-1 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-xs text-[#1F2B2E]"
            />
            <input
              type="number"
              min="0"
              value={customCost}
              onChange={(e) => setCustomCost(e.target.value)}
              placeholder="Cost (₹)"
              className="px-2 py-1 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-xs text-[#1F2B2E]"
            />
          </div>
          <button
            type="submit"
            disabled={addingId !== null}
            className="w-full py-1 bg-[#B8823A] hover:bg-[#1F2B2E] text-white font-mono text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {addingId ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            Save & Add to Stop
          </button>
        </form>
      ) : (
        <div className="pt-2 border-t border-[#1F2B2E]/10 flex items-center justify-between font-mono text-[11px]">
          <button
            type="button"
            onClick={() => setShowCustomForm(true)}
            className="text-[#2C5F7C] hover:underline font-bold cursor-pointer"
          >
            + Need something else? Add custom activity
          </button>
        </div>
      )}

    </div>
  );
}
