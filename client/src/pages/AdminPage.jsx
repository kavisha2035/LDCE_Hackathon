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
import { apiFetch } from '../api/apiClient';
import { fetchAdminDashboard, deleteAdminUser } from '../api/adminApi';

const EMPTY_ANALYTICS = {
  langPrefs: [],
  tripTrends: [],
  topCities: [],
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
function ConfirmDialog({ user, deleting, onConfirm, onCancel }) {
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
          <button onClick={onCancel} disabled={deleting} className="flex-1 py-2 border border-ink font-mono text-xs font-bold uppercase hover:bg-ink/5 transition disabled:opacity-50"><X className="h-3.5 w-3.5 inline mr-1.5" />CANCEL</button>
          <button onClick={onConfirm} disabled={deleting} className="flex-1 py-2 bg-stamp-red border border-ink text-white font-mono text-xs font-bold uppercase hover:bg-ink transition shadow-[2px_2px_0px_0px_#1F2B2E] disabled:opacity-50"><Trash2 className="h-3.5 w-3.5 inline mr-1.5" />{deleting ? 'DELETING...' : 'DELETE'}</button>
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
  const [groupBy, setGroupBy] = useState('none');
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
        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center py-24 font-mono text-sm text-ink/30 uppercase tracking-widest"><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Loading users...</div>
        ) : (
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
        )}
      </div>

      {toDelete && <ConfirmDialog user={toDelete} deleting={deleting} onConfirm={handleConfirmDelete} onCancel={() => setToDelete(null)} />}
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
function PopularCitiesTab({ cities, loading }) {
  const rankColors = ['#B8823A', '#7FA69C', '#2C5F7C'];

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
function PopularActivitiesTab({ activities, loading }) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const categories = ['all', ...new Set((activities || []).map(a => a.category))];

  const filtered = useMemo(() => {
    let list = [...(activities || [])];
    if (search) { const q = search.toLowerCase(); list = list.filter(a => a.name.toLowerCase().includes(q) || a.cityName.toLowerCase().includes(q)); }
    if (filterCat !== 'all') list = list.filter(a => a.category === filterCat);
    return list;
  }, [activities, search, filterCat]);

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
      {loading && filtered.length === 0 && <div className="flex items-center justify-center py-10 font-mono text-sm text-ink/30 uppercase tracking-widest"><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Loading activities...</div>}
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

function UserTrendsTab({ users, cities, activities, analytics }) {
  const safeAnalytics = analytics || EMPTY_ANALYTICS;
  const totalTrips = users.reduce((sum, user) => sum + (user.totalTrips || 0), 0);
  const totalActivityUsages = activities.reduce((sum, act) => sum + (act.tripCount || 0), 0);
  const pieColors = chartPalette(Math.max(1, safeAnalytics.langPrefs.length));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"   value={users.length} accent="text-route-blue" />
        <StatCard label="Total Trips"   value={totalTrips} accent="text-ochre" />
        <StatCard label="Total Cities"  value={cities.length} accent="text-sea" />
        <StatCard label="Avg Acts/Trip" value={(totalActivityUsages / Math.max(1, totalTrips)).toFixed(1)} accent="text-ink" />
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
                <Pie data={safeAnalytics.langPrefs} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={88} paddingAngle={2}>
                  {safeAnalytics.langPrefs.map((_, i) => <Cell key={i} fill={pieColors[i]} stroke="#1F2B2E" strokeWidth={1} />)}
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
              <LineChart data={safeAnalytics.tripTrends} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
            <BarChart data={safeAnalytics.topCities} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
              {activities.slice(0, 5).map((act, idx) => {
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
      {error && (
        <div className="bg-white border-2 border-stamp-red shadow-[4px_4px_0px_0px_#1F2B2E] px-4 py-3 flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-stamp-red">Data Load Error</p>
            <p className="font-body text-sm text-ink/70">{error}</p>
          </div>
          <button onClick={() => window.location.reload()} className="px-3 py-1.5 border border-ink bg-paper font-mono text-[10px] font-bold uppercase hover:bg-ink hover:text-paper transition">Retry</button>
        </div>
      )}
      <div>
        {activeTab === 'users'      && <ManageUsersTab usersData={users} loading={loading} />}
        {activeTab === 'cities'     && <PopularCitiesTab cities={cities} loading={loading} />}
        {activeTab === 'activities' && <PopularActivitiesTab activities={activities} loading={loading} />}
        {activeTab === 'analytics'  && <UserTrendsTab users={users} cities={cities} activities={activities} analytics={analytics} />}
      </div>
    </div>
  );
}
