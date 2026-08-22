import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, MapPin, Compass, TrendingUp, Search,
  Trash2, Eye, ChevronUp, ChevronDown, ChevronsUpDown, Shield,
  AlertTriangle, X, Check, RefreshCw, Award, Star, Globe,
  Activity, BarChart3, CheckCircle2, Clock
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar
} from 'recharts';
import { formatCurrency, formatDuration } from '../lib/format';
import { apiFetch } from '../api/apiClient';
import { fetchAdminDashboard, deleteAdminUser } from '../api/adminApi';

const EMPTY_ANALYTICS = {
  langPrefs: [],
  tripTrends: [],
  topCities: [],
};

const CHART_PALETTE = ['#F5B800', '#2C5F7C', '#10B981', '#B8823A', '#8B5CF6', '#EC4899'];

/* ── STATUS BADGE ── */
function StatusBadge({ status }) {
  const map = {
    active: { label: 'ACTIVE', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
    inactive: { label: 'INACTIVE', cls: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
    suspended: { label: 'SUSPENDED', cls: 'bg-red-500/10 text-red-500 border-red-500/30' }
  };
  const s = map[status] || map.inactive;
  return (
    <span className={`px-2.5 py-0.5 border text-[10px] font-mono font-bold uppercase rounded-full ${s.cls}`}>
      {s.label}
    </span>
  );
}

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-30" />;
  return sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-[#F5B800]" /> : <ChevronDown className="h-3.5 w-3.5 text-[#F5B800]" />;
}

/* ── CONFIRM DIALOG ── */
function ConfirmDialog({ user, deleting, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#1A1D23] text-white border border-gray-800 shadow-2xl rounded-3xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-red-500/20 text-red-400 rounded-2xl">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl uppercase tracking-wide">Delete User Account</h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Are you sure you want to permanently delete <span className="font-bold text-white">{user.name}</span>? All their trip itineraries and data will be removed.
            </p>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {deleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            <span>{deleting ? 'Deleting...' : 'Delete Account'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── TAB 1: MANAGE USERS ── */
function ManageUsersTab({ usersData, loading }) {
  const [users, setUsers] = useState(usersData || []);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilter] = useState('all');
  const [sortField, setSortField] = useState('joinDate');
  const [sortDir, setSortDir] = useState('desc');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteAdminUser(toDelete.id);
      setUsers(p => p.filter(u => u.id !== toDelete.id));
      setToDelete(null);
    } catch (err) {
      console.error('Delete user failed:', err);
      alert(err.message || 'Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    setUsers(usersData || []);
  }, [usersData]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    let list = [...users];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (filterStatus !== 'all') {
      list = list.filter(u => u.status === filterStatus);
    }
    list.sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === 'joinDate') { va = new Date(va); vb = new Date(vb); }
      if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [users, search, filterStatus, sortField, sortDir]);

  const ThCell = ({ label, field }) => (
    <th
      className="px-5 py-3.5 text-left font-sans text-xs font-bold uppercase tracking-wider text-gray-500 cursor-pointer hover:text-[#1E232A] select-none"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1.5">
        {label}
        <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
      </span>
    </th>
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 min-w-0 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search passengers by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F5B800]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={e => setFilter(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold py-2.5 px-3 focus:outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          <span className="px-3 py-2 bg-gray-100 rounded-xl text-xs font-mono font-bold text-gray-600 shrink-0">
            {filtered.length} Users
          </span>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-md overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center py-24 text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">
            <RefreshCw className="h-5 w-5 mr-2 animate-spin text-[#F5B800]" />
            Loading passengers...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5 font-sans text-xs font-bold uppercase tracking-wider text-gray-500 w-12">#</th>
                  <ThCell label="User" field="name" />
                  <ThCell label="Email" field="email" />
                  <ThCell label="Joined" field="joinDate" />
                  <ThCell label="Trips" field="totalTrips" />
                  <th className="px-5 py-3.5 font-sans text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-5 py-3.5 font-sans text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans text-xs">
                {filtered.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-amber-50/30 transition">
                    <td className="px-5 py-4 font-mono text-gray-400 font-bold">{idx + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#1E232A] text-[#F5B800] font-bold flex items-center justify-center text-xs shrink-0 border border-gray-700">
                          {u.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-[#1E232A] text-sm">{u.name}</p>
                          {u.isAdmin && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#F5B800] bg-[#1E232A] px-2 py-0.5 rounded-full font-bold uppercase mt-0.5">
                              <Shield className="h-2.5 w-2.5" /> ADMIN
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-gray-600">{u.email}</td>
                    <td className="px-5 py-4 text-gray-500">
                      {new Date(u.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#1E232A] font-mono text-sm">
                      {u.totalTrips || 0}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewUser(u)}
                          className="p-2 text-gray-600 hover:text-[#1E232A] hover:bg-gray-100 rounded-lg transition cursor-pointer"
                          title="View Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {!u.isAdmin && (
                          <button
                            onClick={() => setToDelete(u)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">
                No users match your filters
              </div>
            )}
          </div>
        )}
      </div>

      {toDelete && (
        <ConfirmDialog
          user={toDelete}
          deleting={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}

      {/* User Details Modal */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-gray-200 shadow-2xl rounded-3xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="font-mono text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                PASSENGER PASSPORT RECORD
              </span>
              <button
                onClick={() => setViewUser(null)}
                className="p-1 hover:bg-gray-100 rounded-full transition cursor-pointer text-gray-400 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-[#1E232A] text-[#F5B800] font-serif font-bold text-2xl flex items-center justify-center shadow-md">
                {viewUser.name?.charAt(0)?.toUpperCase() || 'P'}
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-[#1E232A]">{viewUser.name}</h3>
                <p className="font-mono text-xs text-gray-500">{viewUser.email}</p>
              </div>
            </div>
            <div className="space-y-2.5 font-sans text-xs bg-gray-50 p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">User ID</span>
                <span className="font-mono text-gray-800 font-bold">{viewUser.id?.slice(0, 16)}...</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Date Registered</span>
                <span className="font-bold text-gray-800">
                  {new Date(viewUser.joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Itineraries Created</span>
                <span className="font-bold text-[#F5B800] text-sm font-mono">{viewUser.totalTrips || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Role</span>
                <span className="font-bold text-gray-800">{viewUser.isAdmin ? 'Administrator' : 'Explorer'}</span>
              </div>
            </div>
            <button
              onClick={() => setViewUser(null)}
              className="w-full py-3 bg-[#1E232A] hover:bg-black text-[#F5B800] font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── TAB 2: POPULAR CITIES ── */
function PopularCitiesTab({ cities, loading }) {
  return (
    <div className="space-y-6">
      {/* City Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm text-center">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">TOTAL DESTINATIONS</span>
          <strong className="text-3xl font-serif font-bold text-[#1E232A] mt-1 block">{cities.length}</strong>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm text-center">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">AVG POPULARITY</span>
          <strong className="text-3xl font-serif font-bold text-[#F5B800] mt-1 block">
            {cities.length ? Math.round(cities.reduce((s, c) => s + c.popularity, 0) / cities.length) : '--'}
          </strong>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm text-center">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">REGIONS ACTIVE</span>
          <strong className="text-3xl font-serif font-bold text-[#2C5F7C] mt-1 block">
            {[...new Set(cities.map(c => c.region).filter(Boolean))].length}
          </strong>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm text-center">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">CATALOG ACTIVITIES</span>
          <strong className="text-3xl font-serif font-bold text-emerald-600 mt-1 block">
            {cities.reduce((s, c) => s + (c._count?.activities || 0), 0)}
          </strong>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">
          <RefreshCw className="h-5 w-5 mr-2 animate-spin text-[#F5B800]" />
          Loading destinations...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cities.map((city, idx) => (
            <div
              key={city.id}
              className="bg-white border border-gray-200 rounded-3xl shadow-md overflow-hidden flex flex-col justify-between group hover:shadow-xl transition duration-300"
            >
              <div>
                <div className="relative h-44 bg-gray-100 overflow-hidden">
                  {city.imageUrl && (
                    <img
                      src={city.imageUrl}
                      alt={city.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  {/* Rank Badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#1E232A] text-[#F5B800] rounded-full text-xs font-bold font-mono shadow-md">
                    #{idx + 1}
                  </div>

                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-xs text-white rounded-full text-[10px] font-bold uppercase">
                    ⭐ POP {city.popularity}
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="font-serif font-bold text-xl tracking-wide">{city.name}</h3>
                    <p className="text-xs text-gray-300">{city.country}</p>
                  </div>
                </div>

                <div className="p-5 space-y-3 font-sans">
                  {city.description && (
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {city.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                    <span className="text-gray-500 font-semibold">Cost Index</span>
                    <span className="font-mono font-bold text-[#B8823A]">
                      {'$'.repeat(city.costIndex || 1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between text-xs font-bold border-t border-gray-100 mt-2">
                <span className="text-gray-500 font-mono text-[11px]">ACTIVITIES</span>
                <span className="px-2.5 py-1 bg-amber-50 text-[#B8823A] rounded-full font-mono text-xs">
                  {city._count?.activities ?? 0} experiences
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── TAB 3: POPULAR ACTIVITIES ── */
function PopularActivitiesTab({ activities, loading }) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const categories = ['all', ...new Set((activities || []).map(a => a.category))];

  const filtered = useMemo(() => {
    let list = [...(activities || [])];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a => a.name.toLowerCase().includes(q) || a.cityName.toLowerCase().includes(q));
    }
    if (filterCat !== 'all') list = list.filter(a => a.category === filterCat);
    return list;
  }, [activities, search, filterCat]);

  return (
    <div className="space-y-6">
      {/* Category Pills & Search */}
      <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 min-w-0 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search activities or cities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F5B800]"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-xl font-sans text-xs font-bold uppercase transition cursor-pointer ${
                filterCat === cat
                  ? 'bg-[#1E232A] text-[#F5B800] shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading && filtered.length === 0 ? (
        <div className="flex items-center justify-center py-24 text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">
          <RefreshCw className="h-5 w-5 mr-2 animate-spin text-[#F5B800]" />
          Loading experiences...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((act, idx) => (
            <div
              key={act.id}
              className="bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md p-5 flex flex-col justify-between transition group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="h-8 w-8 rounded-xl bg-amber-50 text-[#B8823A] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 font-mono text-[10px] font-bold uppercase rounded-full">
                    {act.category}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-base text-[#1E232A] group-hover:text-[#2C5F7C] transition">
                  {act.name}
                </h4>
                <p className="text-xs text-gray-500 font-sans mt-1 line-clamp-2">
                  {act.description || 'Curated journey activity and sightseeing.'}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-emerald-600">
                  {act.cost === 0 ? 'FREE' : formatCurrency(act.cost)}
                </span>
                <span className="text-gray-500 font-sans">
                  📍 {act.cityName}
                </span>
                <span className="px-2 py-0.5 bg-[#1E232A] text-[#F5B800] rounded-full text-[10px] font-bold">
                  {act.tripCount || 0} TRIPS
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── TAB 4: ANALYTICS ── */
function UserTrendsTab({ users, cities, activities, analytics }) {
  const safeAnalytics = analytics || EMPTY_ANALYTICS;
  const totalTrips = users.reduce((sum, user) => sum + (user.totalTrips || 0), 0);
  const totalActivityUsages = activities.reduce((sum, act) => sum + (act.tripCount || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm text-center">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">REGISTERED USERS</span>
          <strong className="text-3xl font-serif font-bold text-[#1E232A] mt-1 block">{users.length}</strong>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm text-center">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">TOTAL ITINERARIES</span>
          <strong className="text-3xl font-serif font-bold text-[#F5B800] mt-1 block">{totalTrips}</strong>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm text-center">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">CURATED CITIES</span>
          <strong className="text-3xl font-serif font-bold text-[#2C5F7C] mt-1 block">{cities.length}</strong>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm text-center">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">AVG ACTIVITIES / TRIP</span>
          <strong className="text-3xl font-serif font-bold text-emerald-600 mt-1 block">
            {(totalActivityUsages / Math.max(1, totalTrips)).toFixed(1)}
          </strong>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-3xl shadow-md p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-[#1E232A]">Users by Language Preference</h3>
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">DISTRIBUTION</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={safeAnalytics.langPrefs}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {safeAnalytics.langPrefs.map((_, i) => (
                    <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} stroke="#1E232A" strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, 'Users']} />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }} iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl shadow-md p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-[#1E232A]">Trip Creation Trend</h3>
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">MONTHLY VOLUME</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={safeAnalytics.tripTrends} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="trips"
                  stroke="#F5B800"
                  strokeWidth={3}
                  dot={{ fill: '#1E232A', stroke: '#F5B800', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bar Chart: Most Visited Destinations */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-[#1E232A]">Top 5 Most Visited Destinations</h3>
          <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">BY TRIP COUNT</span>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={safeAnalytics.topCities} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="city" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="visits" fill="#2C5F7C" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN ADMIN PAGE ── */
const TABS = [
  { id: 'users',      label: 'PASSENGERS & USERS',    icon: Users      },
  { id: 'cities',     label: 'DESTINATIONS CATALOG',  icon: MapPin     },
  { id: 'activities', label: 'EXPERIENCES CATALOG',   icon: Compass    },
  { id: 'analytics',  label: 'SYSTEM ANALYTICS',      icon: TrendingUp },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const [dashboardData, cityData] = await Promise.all([
          fetchAdminDashboard(),
          apiFetch('/cities?sortBy=popularity'),
        ]);
        if (cancelled) return;

        setUsers(dashboardData.users || []);
        setActivities(dashboardData.activities || []);
        setAnalytics(dashboardData.analytics || EMPTY_ANALYTICS);
        setCities(Array.isArray(cityData?.cities) ? cityData.cities : []);
      } catch (err) {
        if (cancelled) return;
        setUsers([]);
        setActivities([]);
        setCities([]);
        setAnalytics(EMPTY_ANALYTICS);
        setError(err?.message || 'Unable to load admin dashboard data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full px-6 sm:px-12 lg:px-16 py-6 space-y-8 font-sans bg-[#FAF9F6] text-[#1E232A]">
      
      {/* Header Banner matching GlobeTrotter brand */}
      <div className="bg-white border border-gray-200 p-8 shadow-xl rounded-3xl relative overflow-hidden bg-map-pattern">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="font-script text-[#F5B800] text-3xl block">control center</span>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#1E232A] uppercase tracking-wide">
              ADMIN CONTROL PANEL
            </h1>
            <p className="text-sm text-gray-600 font-sans max-w-2xl mt-1">
              Manage registered travelers, monitor destination popularity, and inspect network metrics across the GlobeTrotter platform.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-4 bg-gray-50 border border-gray-200 text-center min-w-[110px] rounded-2xl">
              <span className="text-[10px] text-gray-500 uppercase font-bold block">PLATFORM</span>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <strong className="text-sm font-bold text-emerald-700">ONLINE</strong>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 text-center min-w-[110px] rounded-2xl">
              <span className="text-[10px] text-gray-500 uppercase font-bold block">EXPLORERS</span>
              <strong className="text-2xl font-serif font-bold text-[#F5B800]">{users.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Pill Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full font-sans text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                active
                  ? 'bg-[#1E232A] text-[#F5B800] shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-[#F5B800]' : 'text-gray-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-sans flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-white border border-red-300 rounded-lg font-bold uppercase"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tab Panels */}
      <div>
        {activeTab === 'users'      && <ManageUsersTab usersData={users} loading={loading} />}
        {activeTab === 'cities'     && <PopularCitiesTab cities={cities} loading={loading} />}
        {activeTab === 'activities' && <PopularActivitiesTab activities={activities} loading={loading} />}
        {activeTab === 'analytics'  && <UserTrendsTab users={users} cities={cities} activities={activities} analytics={analytics} />}
      </div>

    </div>
  );
}
