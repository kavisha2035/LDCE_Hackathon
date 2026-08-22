import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, MapPin, Compass, TrendingUp, Search,
  Trash2, Eye, ChevronUp, ChevronDown, ChevronsUpDown, Shield,
  AlertTriangle, X, Check, RefreshCw, Award, Star
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar
} from 'recharts';
import StatCard from '../components/budget/StatCard';
import CostDots from '../components/city-search/CostDots';
import { categoryColor } from '../components/activity-search/categoryColor';
import { formatCurrency, formatDuration } from '../lib/format';
import { chartPalette } from '../components/budget/chartColors';

/* ── MOCK DATA ── */
const MOCK_USERS = [
  { id: 'u1',  name: 'Arjun Mehta',     email: 'arjun@globetrotter.io',  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',  joinDate: '2026-01-12', totalTrips: 7,  status: 'active',    isAdmin: true  },
  { id: 'u2',  name: 'Priya Shah',      email: 'priya@globetrotter.io',  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',  joinDate: '2026-02-04', totalTrips: 4,  status: 'active',    isAdmin: false },
  { id: 'u3',  name: 'Lena Mueller',    email: 'lena.m@example.de',      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lena',   joinDate: '2026-02-19', totalTrips: 2,  status: 'active',    isAdmin: false },
  { id: 'u4',  name: 'Rahul Patel',     email: 'rahul.p@example.in',     avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',  joinDate: '2026-03-08', totalTrips: 0,  status: 'inactive',  isAdmin: false },
  { id: 'u5',  name: 'Sofia Rivera',    email: 'sofia.r@example.mx',     avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',  joinDate: '2026-03-22', totalTrips: 5,  status: 'active',    isAdmin: false },
  { id: 'u6',  name: 'James OBrien',    email: 'james.ob@example.ie',    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',  joinDate: '2026-04-11', totalTrips: 3,  status: 'active',    isAdmin: false },
  { id: 'u7',  name: 'Yuki Tanaka',     email: 'yuki.t@example.jp',      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki',   joinDate: '2026-04-30', totalTrips: 6,  status: 'active',    isAdmin: false },
  { id: 'u8',  name: 'Fatima Al-Sayed', email: 'fatima.a@example.ae',    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima', joinDate: '2026-05-14', totalTrips: 1,  status: 'suspended', isAdmin: false },
  { id: 'u9',  name: 'Carlos Diaz',     email: 'carlos.d@example.co',    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos', joinDate: '2026-06-01', totalTrips: 9,  status: 'active',    isAdmin: false },
  { id: 'u10', name: 'Anika Novak',     email: 'anika.n@example.cz',     avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anika',  joinDate: '2026-06-18', totalTrips: 2,  status: 'inactive',  isAdmin: false },
];

const MOCK_CITIES = [
  { id: 'city-paris',  name: 'Paris',     country: 'France',    region: 'Europe',     costIndex: 4, popularity: 98, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80', _count: { activities: 4 } },
  { id: 'city-london', name: 'London',    country: 'UK',        region: 'Europe',     costIndex: 5, popularity: 97, imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80', _count: { activities: 2 } },
  { id: 'city-tokyo',  name: 'Tokyo',     country: 'Japan',     region: 'Asia',       costIndex: 4, popularity: 96, imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80', _count: { activities: 4 } },
  { id: 'city-ny',     name: 'New York',  country: 'USA',       region: 'N. America', costIndex: 5, popularity: 95, imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80', _count: { activities: 3 } },
  { id: 'city-rome',   name: 'Rome',      country: 'Italy',     region: 'Europe',     costIndex: 3, popularity: 94, imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80', _count: { activities: 3 } },
  { id: 'city-bkk',   name: 'Bangkok',   country: 'Thailand',  region: 'Asia',       costIndex: 2, popularity: 94, imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80', _count: { activities: 2 } },
  { id: 'city-bali',  name: 'Bali',      country: 'Indonesia', region: 'Asia',       costIndex: 2, popularity: 93, imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80', _count: { activities: 2 } },
  { id: 'city-kyoto',  name: 'Kyoto',     country: 'Japan',     region: 'Asia',       costIndex: 3, popularity: 92, imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80', _count: { activities: 2 } },
  { id: 'city-bcn',    name: 'Barcelona', country: 'Spain',     region: 'Europe',     costIndex: 3, popularity: 91, imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=600&q=80', _count: { activities: 2 } },
  { id: 'city-cairo',  name: 'Cairo',     country: 'Egypt',     region: 'Africa',     costIndex: 1, popularity: 85, imageUrl: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=600&q=80', _count: { activities: 1 } },
];

const MOCK_ACTIVITIES = [
  { id: 'a1', name: 'Eiffel Tower Summit Tour',        cityName: 'Paris',     category: 'sightseeing', cost: 35, durationHours: 2.5, tripCount: 42, imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80', description: 'Ascend to the top for panoramic views of Paris.' },
  { id: 'a2', name: 'Senso-ji Temple Exploration',     cityName: 'Tokyo',     category: 'culture',     cost: 0,  durationHours: 2.0, tripCount: 38, imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80', description: 'Visit Tokyo oldest and most iconic Buddhist temple.' },
  { id: 'a3', name: 'Fushimi Inari Torii Gates Hike',  cityName: 'Kyoto',     category: 'sightseeing', cost: 0,  durationHours: 2.5, tripCount: 35, imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80', description: 'Hike through sacred vermilion torii gate pathways.' },
  { id: 'a4', name: 'Colosseum Underground Tour',      cityName: 'Rome',      category: 'sightseeing', cost: 48, durationHours: 3.0, tripCount: 31, imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80', description: 'Step back into gladiator history and ancient Roman politics.' },
  { id: 'a5', name: 'Louvre Museum Guided Walk',       cityName: 'Paris',     category: 'culture',     cost: 25, durationHours: 3.0, tripCount: 29, imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80', description: 'Explore Mona Lisa and thousands of world-famous masterpieces.' },
  { id: 'a6', name: 'Grand Palace Temple Tour',        cityName: 'Bangkok',   category: 'culture',     cost: 16, durationHours: 2.5, tripCount: 27, imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80', description: 'Sacred royal ceremonial complex with dazzling golden spires.' },
  { id: 'a7', name: 'Sagrada Familia Tour',            cityName: 'Barcelona', category: 'culture',     cost: 34, durationHours: 1.5, tripCount: 25, imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=600&q=80', description: 'Gaudi unfinished architectural masterpiece.' },
  { id: 'a8', name: 'Tower of London Crown Jewels',    cityName: 'London',    category: 'sightseeing', cost: 38, durationHours: 2.5, tripCount: 22, imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80', description: 'Explore 1,000 years of royal history and guards.' },
];

const ANALYTICS = {
  langPrefs:  [{ name: 'English', value: 54 }, { name: 'Spanish', value: 18 }, { name: 'Japanese', value: 14 }, { name: 'German', value: 9 }, { name: 'Other', value: 5 }],
  tripTrends: [{ month: 'Feb', trips: 4 }, { month: 'Mar', trips: 9 }, { month: 'Apr', trips: 14 }, { month: 'May', trips: 22 }, { month: 'Jun', trips: 19 }, { month: 'Jul', trips: 31 }, { month: 'Aug', trips: 28 }],
  topCities:  [{ city: 'Paris', visits: 42 }, { city: 'Tokyo', visits: 38 }, { city: 'Kyoto', visits: 31 }, { city: 'Rome', visits: 27 }, { city: 'Bangkok', visits: 23 }],
};

/* ── STATUS BADGE ── */
function StatusBadge({ status }) {
  const map = { active: { label: 'ACTIVE', cls: 'border-sea text-sea bg-sea/10' }, inactive: { label: 'INACTIVE', cls: 'border-ink/40 text-ink/50 bg-ink/5' }, suspended: { label: 'SUSPENDED', cls: 'border-stamp-red text-stamp-red bg-stamp-red/10' } };
  const s = map[status] || map.inactive;
  return <span className={`px-2 py-0.5 border font-mono text-[10px] font-bold uppercase ${s.cls}`}>{s.label}</span>;
}

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <ChevronsUpDown className="h-3 w-3 opacity-30" />;
  return sortDir === 'asc' ? <ChevronUp className="h-3 w-3 text-route-blue" /> : <ChevronDown className="h-3 w-3 text-route-blue" />;
}

/* ── CONFIRM DIALOG ── */
function ConfirmDialog({ user, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60">
      <div className="bg-paper border-2 border-ink shadow-[6px_6px_0px_0px_#1F2B2E] w-full max-w-sm mx-4 p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="h-5 w-5 text-stamp-red shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display font-bold text-lg text-ink uppercase">Delete Account</h3>
            <p className="text-xs font-body text-ink/70 mt-1 leading-relaxed">Permanently delete <span className="font-bold text-ink">{user.name}</span> and all their trip data. This cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onCancel} className="flex-1 py-2 border border-ink font-mono text-xs font-bold uppercase hover:bg-ink/5 transition"><X className="h-3.5 w-3.5 inline mr-1.5" />CANCEL</button>
          <button onClick={onConfirm} className="flex-1 py-2 bg-stamp-red border border-ink text-white font-mono text-xs font-bold uppercase hover:bg-ink transition shadow-[2px_2px_0px_0px_#1F2B2E]"><Trash2 className="h-3.5 w-3.5 inline mr-1.5" />DELETE</button>
        </div>
      </div>
    </div>
  );
}

/* ── TAB 1: MANAGE USERS ── */
function ManageUsersTab() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilter] = useState('all');
  const [sortField, setSortField] = useState('joinDate');
  const [sortDir, setSortDir] = useState('desc');
  const [groupBy, setGroupBy] = useState('none');
  const [toDelete, setToDelete] = useState(null);
  const [viewUser, setViewUser] = useState(null);

  const handleSort = (field) => { if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortField(field); setSortDir('asc'); } };

  const filtered = useMemo(() => {
    let list = [...users];
    if (search) { const q = search.toLowerCase(); list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)); }
    if (filterStatus !== 'all') list = list.filter(u => u.status === filterStatus);
    list.sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === 'joinDate') { va = new Date(va); vb = new Date(vb); }
      if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [users, search, filterStatus, sortField, sortDir]);

  const grouped = useMemo(() => {
    if (groupBy === 'none') return { '': filtered };
    const map = {};
    filtered.forEach(u => { const key = groupBy === 'status' ? u.status.toUpperCase() : u.joinDate.slice(0, 7); if (!map[key]) map[key] = []; map[key].push(u); });
    return map;
  }, [filtered, groupBy]);

  const ThCell = ({ label, field }) => (
    <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink/50 cursor-pointer hover:text-ink select-none" onClick={() => handleSort(field)}>
      <span className="flex items-center gap-1.5">{label}<SortIcon field={field} sortField={sortField} sortDir={sortDir} /></span>
    </th>
  );

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="bg-white border-2 border-ink shadow-[4px_4px_0px_0px_#1F2B2E] p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink/40" />
          <input type="text" placeholder="Search users by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-paper border border-ink font-mono text-xs placeholder:text-ink/30 focus:outline-none focus:ring-1 focus:ring-route-blue" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[10px] text-ink/50 uppercase">Filter</span>
          <select value={filterStatus} onChange={e => setFilter(e.target.value)} className="border border-ink bg-paper font-mono text-xs py-2 px-3 focus:outline-none cursor-pointer">
            <option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option>
          </select>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[10px] text-ink/50 uppercase">Group</span>
          <select value={groupBy} onChange={e => setGroupBy(e.target.value)} className="border border-ink bg-paper font-mono text-xs py-2 px-3 focus:outline-none cursor-pointer">
            <option value="none">No Grouping</option><option value="status">By Status</option><option value="month">By Month</option>
          </select>
        </div>
        <div className="font-mono text-[10px] text-ink/40 shrink-0">{filtered.length}/{users.length} USERS</div>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-ink shadow-[4px_4px_0px_0px_#1F2B2E] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="border-b-2 border-ink bg-paper">
              <tr>
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink/50 w-10">#</th>
                <ThCell label="Name" field="name" /><ThCell label="Email" field="email" /><ThCell label="Joined" field="joinDate" /><ThCell label="Trips" field="totalTrips" />
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink/50">Status</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink/50">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([group, rows]) => (
                <React.Fragment key={group}>
                  {group && <tr className="bg-ink/5 border-y border-ink/20"><td colSpan={7} className="px-4 py-1.5 font-mono text-[10px] font-bold text-ink/50 uppercase tracking-widest">-- {group}</td></tr>}
                  {rows.map((u, idx) => (
                    <tr key={u.id} className="border-b border-ink/10 hover:bg-paper/60 transition-colors">
                      <td className="px-4 py-3 font-mono text-[10px] text-ink/30">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img src={u.avatar} alt={u.name} className="h-7 w-7 border border-ink/20 bg-paper shrink-0" />
                          <div>
                            <p className="font-body font-semibold text-sm text-ink leading-tight">{u.name}</p>
                            {u.isAdmin && <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-route-blue uppercase font-bold"><Shield className="h-2.5 w-2.5" /> ADMIN</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-ink/60">{u.email}</td>
                      <td className="px-4 py-3 font-mono text-xs text-ink/60">{new Date(u.joinDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="px-4 py-3 font-mono text-sm font-bold text-ink">{u.totalTrips}</td>
                      <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setViewUser(u)} className="p-1.5 border border-ink/20 text-ink/50 hover:border-route-blue hover:text-route-blue transition" title="View Profile"><Eye className="h-3.5 w-3.5" /></button>
                          {!u.isAdmin && <button onClick={() => setToDelete(u)} className="p-1.5 border border-ink/20 text-ink/50 hover:border-stamp-red hover:text-stamp-red transition" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-16 text-center font-mono text-sm text-ink/30 uppercase tracking-widest">No users match your filters</div>}
        </div>
      </div>

      {toDelete && <ConfirmDialog user={toDelete} onConfirm={() => { setUsers(p => p.filter(u => u.id !== toDelete.id)); setToDelete(null); }} onCancel={() => setToDelete(null)} />}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60">
          <div className="bg-paper border-2 border-ink shadow-[6px_6px_0px_0px_#1F2B2E] w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] font-bold uppercase text-ink/40 tracking-widest">User Profile</span>
              <button onClick={() => setViewUser(null)}><X className="h-4 w-4 text-ink/40 hover:text-ink" /></button>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <img src={viewUser.avatar} alt={viewUser.name} className="h-16 w-16 border-2 border-ink shadow-[2px_2px_0px_0px_#1F2B2E]" />
              <div>
                <h3 className="font-display font-bold text-xl text-ink uppercase">{viewUser.name}</h3>
                <p className="font-mono text-xs text-ink/60">{viewUser.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              {[['User ID', viewUser.id], ['Joined', new Date(viewUser.joinDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })], ['Total Trips', viewUser.totalTrips], ['Status', <StatusBadge key="s" status={viewUser.status} />]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-1.5 border-b border-ink/10">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40">{k}</span>
                  <span className="font-mono text-xs text-ink font-bold">{v}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setViewUser(null)} className="mt-5 w-full py-2 bg-ink text-paper font-mono text-xs font-bold uppercase hover:bg-route-blue transition border border-ink"><Check className="h-3.5 w-3.5 inline mr-1.5" />CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── TAB 2: POPULAR CITIES ── */
function PopularCitiesTab() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const rankColors = ['#B8823A', '#7FA69C', '#2C5F7C'];

  useEffect(() => {
    const go = async () => {
      try {
        const res = await fetch('/api/cities?sortBy=popularity');
        if (res.ok) { const data = await res.json(); if (data.cities && data.cities.length > 0) { setCities(data.cities); setLoading(false); return; } }
      } catch (_) {}
      setCities(MOCK_CITIES); setLoading(false);
    };
    go();
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Cities"     value={cities.length} accent="text-route-blue" />
        <StatCard label="Avg Popularity"   value={cities.length ? Math.round(cities.reduce((s, c) => s + c.popularity, 0) / cities.length) : '--'} accent="text-ochre" />
        <StatCard label="Regions Covered"  value={[...new Set(cities.map(c => c.region).filter(Boolean))].length} accent="text-sea" />
        <StatCard label="Total Activities" value={cities.reduce((s, c) => s + (c._count?.activities || 0), 0)} accent="text-ink" />
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-24 font-mono text-sm text-ink/30 uppercase tracking-widest"><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Loading cities...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {cities.map((city, idx) => (
            <div key={city.id} className="bg-white border-2 border-ink shadow-[4px_4px_0px_0px_#1F2B2E] flex flex-col overflow-hidden group">
              <div className="relative h-36 bg-ink/10 overflow-hidden">
                {city.imageUrl && <img src={city.imageUrl} alt={city.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                <div className="absolute top-2 left-2 h-8 w-8 flex items-center justify-center border-2 border-white font-mono font-extrabold text-sm text-white shadow-md" style={{ backgroundColor: rankColors[idx] || '#1F2B2E' }}>{String(idx + 1).padStart(2, '0')}</div>
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-ink/80 text-paper font-mono text-[10px] font-bold uppercase">POP {city.popularity}</div>
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-extrabold text-lg text-ink uppercase leading-tight">{city.name}</h3>
                  <span className="font-mono text-[10px] text-ink/50 shrink-0 pt-0.5">{city.country}</span>
                </div>
                {city.region && <span className="inline-block border border-ink/20 px-2 py-0.5 font-mono text-[10px] text-ink/50 uppercase self-start">{city.region}</span>}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-ink/10">
                  <div className="flex flex-col gap-0.5"><span className="font-mono text-[9px] uppercase tracking-widest text-ink/40">Cost Index</span><CostDots costIndex={city.costIndex} /></div>
                  <div className="text-right"><span className="font-mono text-[9px] uppercase tracking-widest text-ink/40 block">Activities</span><span className="font-mono text-sm font-bold text-route-blue">{city._count?.activities ?? 0}</span></div>
                </div>
              </div>
              <div className="border-t-2 border-dashed border-ink/20 mx-4 mb-3" />
              <div className="px-4 pb-3 flex items-center justify-between">
                <span className="font-mono text-[9px] text-ink/30 uppercase tracking-widest">DESTINATION #{String(idx + 1).padStart(2, '0')}</span>
                <Award className="h-3.5 w-3.5 text-ochre opacity-60" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── TAB 3: POPULAR ACTIVITIES ── */
function PopularActivitiesTab() {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const categories = ['all', ...new Set(MOCK_ACTIVITIES.map(a => a.category))];

  const filtered = useMemo(() => {
    let list = [...MOCK_ACTIVITIES];
    if (search) { const q = search.toLowerCase(); list = list.filter(a => a.name.toLowerCase().includes(q) || a.cityName.toLowerCase().includes(q)); }
    if (filterCat !== 'all') list = list.filter(a => a.category === filterCat);
    return list;
  }, [search, filterCat]);

  return (
    <div className="space-y-5">
      <div className="bg-white border-2 border-ink shadow-[4px_4px_0px_0px_#1F2B2E] p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink/40" />
          <input type="text" placeholder="Search activities or cities..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-paper border border-ink font-mono text-xs placeholder:text-ink/30 focus:outline-none focus:ring-1 focus:ring-route-blue" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 border font-mono text-[10px] font-bold uppercase transition ${filterCat === cat ? 'bg-ink text-paper border-ink shadow-[2px_2px_0px_0px_#2C5F7C]' : 'bg-white border-ink/30 text-ink/50 hover:border-ink hover:text-ink'}`}>{cat}</button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {filtered.map((act, idx) => {
          const color = categoryColor(act.category);
          return (
            <div key={act.id} className="bg-white border-2 border-ink shadow-[3px_3px_0px_0px_#1F2B2E] flex overflow-hidden group">
              <div className="w-14 shrink-0 bg-paper border-r-2 border-ink flex flex-col items-center justify-center gap-1 py-4">
                <span className="font-mono font-extrabold text-xl text-ink leading-none">{String(idx + 1).padStart(2, '0')}</span>
                <Star className="h-3 w-3 text-ochre" />
              </div>
              <div className="w-24 shrink-0 bg-ink/10 overflow-hidden">
                {act.imageUrl && <img src={act.imageUrl} alt={act.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />}
              </div>
              <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-display font-bold text-base text-ink leading-tight">{act.name}</h3>
                    <span className={`px-2 py-0.5 border ${color.border} ${color.text} text-[10px] font-mono font-bold uppercase shrink-0`}>{act.category}</span>
                  </div>
                  <p className="text-xs font-body text-ink/60 line-clamp-1">{act.description}</p>
                  <div className="flex items-center gap-3 mt-1.5 font-mono text-xs text-ink/50">
                    <span className="text-ochre font-bold">{act.cost === 0 ? 'FREE' : formatCurrency(act.cost)}</span>
                    <span>{formatDuration(act.durationHours)}</span>
                    <span className="border border-ink/20 px-2 py-0.5 text-[10px]">{act.cityName}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right sm:text-center">
                  <div className="inline-flex flex-col items-center border-2 border-ink px-4 py-2 shadow-[2px_2px_0px_0px_#1F2B2E] bg-paper">
                    <span className="font-mono font-extrabold text-xl text-route-blue leading-none">{act.tripCount}</span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-ink/40 mt-0.5">TRIPS</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="py-16 text-center border-2 border-ink bg-white font-mono text-sm text-ink/30 uppercase tracking-widest">No activities match your search</div>}
      </div>
    </div>
  );
}

/* ── TAB 4: ANALYTICS ── */
const MONO_STYLE = { fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fill: '#1F2B2E' };
const TT = { fontFamily: 'JetBrains Mono, monospace', fontSize: 11, border: '1px solid #1F2B2E', borderRadius: 2, backgroundColor: '#F6F3EC' };

function UserTrendsTab() {
  const pieColors = chartPalette(ANALYTICS.langPrefs.length);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"   value={MOCK_USERS.length} accent="text-route-blue" />
        <StatCard label="Total Trips"   value={MOCK_USERS.reduce((s, u) => s + u.totalTrips, 0)} accent="text-ochre" />
        <StatCard label="Total Cities"  value={MOCK_CITIES.length} accent="text-sea" />
        <StatCard label="Avg Acts/Trip" value={(MOCK_ACTIVITIES.reduce((s, a) => s + a.tripCount, 0) / Math.max(1, MOCK_USERS.reduce((s, u) => s + u.totalTrips, 0))).toFixed(1)} accent="text-ink" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border-2 border-ink shadow-[4px_4px_0px_0px_#1F2B2E] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-ink/60">Users by Language Preference</h3>
            <span className="font-mono text-[10px] text-ink/30 uppercase">PIE CHART</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ANALYTICS.langPrefs} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={88} paddingAngle={2}>
                  {ANALYTICS.langPrefs.map((_, i) => <Cell key={i} fill={pieColors[i]} stroke="#1F2B2E" strokeWidth={1} />)}
                </Pie>
                <Tooltip contentStyle={TT} formatter={(v) => [`${v}%`, 'Users']} />
                <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase' }} iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white border-2 border-ink shadow-[4px_4px_0px_0px_#1F2B2E] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-ink/60">Trip Creation Trend 2026</h3>
            <span className="font-mono text-[10px] text-ink/30 uppercase">MONTHLY</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ANALYTICS.tripTrends} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2B2E" strokeOpacity={0.08} vertical={false} />
                <XAxis dataKey="month" tick={MONO_STYLE} axisLine={{ stroke: '#1F2B2E' }} tickLine={false} />
                <YAxis tick={MONO_STYLE} axisLine={{ stroke: '#1F2B2E' }} tickLine={false} />
                <Tooltip contentStyle={TT} />
                <Line type="monotone" dataKey="trips" stroke="#2C5F7C" strokeWidth={2.5} dot={{ fill: '#2C5F7C', stroke: '#1F2B2E', strokeWidth: 1.5, r: 4 }} activeDot={{ r: 6, stroke: '#1F2B2E', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="bg-white border-2 border-ink shadow-[4px_4px_0px_0px_#1F2B2E] p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-ink/60">Top 5 Most Visited Cities</h3>
          <span className="font-mono text-[10px] text-ink/30 uppercase">BY TRIP COUNT</span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ANALYTICS.topCities} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2B2E" strokeOpacity={0.08} vertical={false} />
              <XAxis dataKey="city" tick={MONO_STYLE} axisLine={{ stroke: '#1F2B2E' }} tickLine={false} />
              <YAxis tick={MONO_STYLE} axisLine={{ stroke: '#1F2B2E' }} tickLine={false} />
              <Tooltip contentStyle={TT} />
              <Bar dataKey="visits" fill="#B8823A" stroke="#1F2B2E" strokeWidth={1.5} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white border-2 border-ink shadow-[4px_4px_0px_0px_#1F2B2E] overflow-hidden">
        <div className="border-b-2 border-ink px-5 py-3 bg-paper">
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-ink/60">Activity Performance Snapshot</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-ink/20 bg-paper/50">
              <tr>{['Rank','Activity','City','Category','Cost','Trips'].map(h => <th key={h} className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-ink/40">{h}</th>)}</tr>
            </thead>
            <tbody>
              {MOCK_ACTIVITIES.slice(0, 5).map((act, idx) => {
                const color = categoryColor(act.category);
                return (
                  <tr key={act.id} className="border-b border-ink/10 hover:bg-paper/50 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-[10px] font-bold text-ink/40">#{idx + 1}</td>
                    <td className="px-4 py-2.5 font-body text-sm text-ink font-semibold">{act.name}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-ink/60">{act.cityName}</td>
                    <td className="px-4 py-2.5"><span className={`px-2 py-0.5 border ${color.border} ${color.text} text-[10px] font-mono font-bold uppercase`}>{act.category}</span></td>
                    <td className="px-4 py-2.5 font-mono text-xs text-ochre font-bold">{act.cost === 0 ? 'FREE' : formatCurrency(act.cost)}</td>
                    <td className="px-4 py-2.5 font-mono text-sm font-bold text-route-blue">{act.tripCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN PAGE ── */
const TABS = [
  { id: 'users',      label: 'MANAGE USERS',           icon: Users      },
  { id: 'cities',     label: 'POPULAR CITIES',          icon: MapPin     },
  { id: 'activities', label: 'POPULAR ACTIVITIES',      icon: Compass    },
  { id: 'analytics',  label: 'USER TRENDS & ANALYTICS', icon: TrendingUp },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');
  return (
    <div className="space-y-6">
      <div className="bg-white border-2 border-ink shadow-[4px_4px_0px_0px_#1F2B2E] px-6 py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-6 w-6 bg-stamp-red border border-ink flex items-center justify-center"><Shield className="h-3.5 w-3.5 text-white" /></div>
              <span className="font-mono text-[10px] font-bold text-stamp-red uppercase tracking-widest">Admin Access -- Screen 13</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink uppercase tracking-tight leading-none">Admin Control Panel</h1>
            <p className="font-body text-sm text-ink/60 mt-1">Manage users, monitor platform trends, and view analytics across the GlobeTrotter network.</p>
          </div>
          <div className="shrink-0 border-2 border-ink p-3 bg-paper shadow-[2px_2px_0px_0px_#1F2B2E] font-mono text-xs space-y-1">
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sea animate-pulse" /><span className="text-ink/60 uppercase">PLATFORM LIVE</span></div>
            <div className="text-ink/40 text-[10px]">{new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 border-2 border-ink font-mono text-xs font-bold uppercase transition-all ${active ? 'bg-ink text-paper shadow-[3px_3px_0px_0px_#2C5F7C]' : 'bg-white text-ink hover:bg-paper shadow-[2px_2px_0px_0px_#1F2B2E]'}`}>
              <Icon className={`h-3.5 w-3.5 ${active ? 'text-paper' : 'text-ink/50'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>
      <div>
        {activeTab === 'users'      && <ManageUsersTab />}
        {activeTab === 'cities'     && <PopularCitiesTab />}
        {activeTab === 'activities' && <PopularActivitiesTab />}
        {activeTab === 'analytics'  && <UserTrendsTab />}
      </div>
    </div>
  );
}
