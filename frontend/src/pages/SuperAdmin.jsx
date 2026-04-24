import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useColor, useTheme, useLanguage } from '../contexts/AppContexts';

// ─── helpers ───────────────────────────────────────────────────────────────
const PLAN_LABELS = { free:'Bepul', starter:'Starter', pro:'Pro', business:'Biznes' };
const PLAN_COLORS = {
  free:     'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  starter:  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  pro:      'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  business: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('uz-UZ', { day:'2-digit', month:'2-digit', year:'numeric' });
}

// ─── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon }) {
  return (
    <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value ?? '—'}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <span className="text-2xl opacity-60">{icon}</span>
      </div>
    </div>
  );
}

// ─── Overview Tab ───────────────────────────────────────────────────────────
function OverviewTab({ stats }) {
  if (!stats) return <div className="p-8 text-center text-gray-400">Yuklanmoqda…</div>;
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Umumiy ko'rsatkichlar</h2>
        <p className="text-sm text-gray-500 mt-0.5">Platforma statistikasi</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Jami foydalanuvchi"  value={stats.total_users}    icon="👥" />
        <StatCard label="Faol foydalanuvchi"  value={stats.active_users}   icon="✅" />
        <StatCard label="Obunachi"            value={stats.paid_users}     sub="to'lovli reja" icon="💳" />
        <StatCard label="Jami kontent"        value={stats.total_contents} sub={`Bu oy: ${stats.this_month}`} icon="📝" />
      </div>

      {/* Plan distribution */}
      <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Reja taqsimoti</h3>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(PLAN_LABELS).map(([k, v]) => (
            <div key={k} className="text-center">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold mb-1 ${PLAN_COLORS[k]}`}>
                {v[0]}
              </div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Users Tab ──────────────────────────────────────────────────────────────
function UsersTab({ colors }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/users');
      const d = await r.json();
      if (d.success) setUsers(d.data.map(u => { const { password_hash, ...rest } = u; return rest; }));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || (u.name||'').toLowerCase().includes(q)
      || (u.last_name||'').toLowerCase().includes(q)
      || (u.email||'').toLowerCase().includes(q)
      || (u.phone||'').includes(q);
    const matchPlan = filterPlan === 'all' || u.plan === filterPlan;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? u.is_active : !u.is_active);
    return matchSearch && matchPlan && matchStatus;
  });

  const save = async (id) => {
    await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    });
    setEditId(null);
    load();
  };

  const toggleActive = async (u) => {
    await fetch(`/api/admin/users/${u.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: u.is_active ? 0 : 1 }),
    });
    load();
  };

  const del = async (id) => {
    if (!confirm('Foydalanuvchini o\'chirish?')) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Foydalanuvchilar</h2>
          <p className="text-sm text-gray-500">{users.length} ta foydalanuvchi</p>
        </div>
        <button onClick={load} className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg transition-colors">
          Yangilash
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input type="text" placeholder="Qidirish…" value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none">
          <option value="all">Barcha rejalar</option>
          {Object.entries(PLAN_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none">
          <option value="all">Barcha status</option>
          <option value="active">Faol</option>
          <option value="blocked">Bloklangan</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">Yuklanmoqda…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700/50">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/80">
              <tr>
                {['#','Ism Familya','Email / Tel','Passport','Reja','Status','Oxirgi kirish','Sana','Amal'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Foydalanuvchi topilmadi</td></tr>
              )}
              {filtered.map(u => (
                <tr key={u.id} className="bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs">{u.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {[u.name, u.last_name].filter(Boolean).join(' ') || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-700 dark:text-gray-300">{u.email}</div>
                    <div className="text-xs text-gray-400">{u.phone || '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{u.passport || '—'}</td>
                  <td className="px-4 py-3">
                    {editId === u.id ? (
                      <select value={editData.plan || u.plan}
                        onChange={e => setEditData(d => ({ ...d, plan: e.target.value }))}
                        className="text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 focus:outline-none">
                        {Object.entries(PLAN_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    ) : (
                      <span className={`badge text-[11px] px-2 py-0.5 ${PLAN_COLORS[u.plan]}`}>
                        {PLAN_LABELS[u.plan] || u.plan}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(u)}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors ${
                        u.is_active
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200'
                          : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200'
                      }`}>
                      {u.is_active ? 'Faol' : 'Blok'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(u.last_login)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {editId === u.id ? (
                        <>
                          <button onClick={() => save(u.id)}
                            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                            Saqlash
                          </button>
                          <button onClick={() => setEditId(null)}
                            className="text-xs text-gray-400 hover:underline">
                            Bekor
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditId(u.id); setEditData({ plan: u.plan }); }}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                            Tahrir
                          </button>
                          {u.role !== 'superadmin' && (
                            <button onClick={() => del(u.id)}
                              className="text-xs text-red-500 dark:text-red-400 hover:underline">
                              O'chir
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Plans Tab ──────────────────────────────────────────────────────────────
const DEFAULT_PLANS = {
  starter:  { amount: 99000,  limit: 30,  features_uz: ['30 kontent/oy', 'Barcha platformalar', 'AI rasm'], features_ru: ['30 контент/мес', 'Все платформы', 'AI изображение'], features_en: ['30 content/mo', 'All platforms', 'AI image'] },
  pro:      { amount: 249000, limit: 100, features_uz: ['100 kontent/oy', 'Avtonom Agent', 'Google Imagen'], features_ru: ['100 контент/мес', 'Авт. агент', 'Google Imagen'], features_en: ['100 content/mo', 'Auto Agent', 'Google Imagen'] },
  business: { amount: 599000, limit: -1,  features_uz: ['Cheksiz kontent', 'API kirish', 'Maxsus yordam'], features_ru: ['Безлимит', 'API доступ', 'Выделенная под.'], features_en: ['Unlimited', 'API access', 'Dedicated support'] },
};

const PLAN_BORDER = { starter: 'border-blue-400', pro: 'border-purple-500', business: 'border-amber-400' };

function PlansTab({ colors }) {
  const [plans, setPlans] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/plans')
      .then(r => r.json())
      .then(d => setPlans(d.success ? d.data : DEFAULT_PLANS));
  }, []);

  const update = (planKey, field, value) => {
    setPlans(prev => ({ ...prev, [planKey]: { ...prev[planKey], [field]: value } }));
  };

  const updateFeature = (planKey, lang, idx, value) => {
    setPlans(prev => {
      const features = [...(prev[planKey][`features_${lang}`] || [])];
      features[idx] = value;
      return { ...prev, [planKey]: { ...prev[planKey], [`features_${lang}`]: features } };
    });
  };

  const addFeature = (planKey, lang) => {
    setPlans(prev => {
      const features = [...(prev[planKey][`features_${lang}`] || []), ''];
      return { ...prev, [planKey]: { ...prev[planKey], [`features_${lang}`]: features } };
    });
  };

  const removeFeature = (planKey, lang, idx) => {
    setPlans(prev => {
      const features = (prev[planKey][`features_${lang}`] || []).filter((_, i) => i !== idx);
      return { ...prev, [planKey]: { ...prev[planKey], [`features_${lang}`]: features } };
    });
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plans),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  if (!plans) return <div className="p-8 text-center text-gray-400">Yuklanmoqda…</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tariflar sozlamalari</h2>
          <p className="text-sm text-gray-500">Narx va xususiyatlarni tahrirlang</p>
        </div>
        <button onClick={saveAll} disabled={saving}
          className="acc-btn px-5 py-2 rounded-xl text-sm font-semibold shadow">
          {saving ? 'Saqlanmoqda…' : saved ? '✓ Saqlandi' : 'Saqlash'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {Object.entries(plans).map(([key, plan]) => (
          <div key={key} className={`bg-white dark:bg-gray-800/60 border-2 ${PLAN_BORDER[key] || 'border-gray-200'} rounded-xl p-5 space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white capitalize">{key}</h3>
              <span className={`badge text-xs ${PLAN_COLORS[key]}`}>{PLAN_LABELS[key]}</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Narx (UZS/oy)
              </label>
              <input type="number" value={plan.amount}
                onChange={e => update(key, 'amount', Number(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Kontent limiti/oy (-1 = cheksiz)
              </label>
              <input type="number" value={plan.limit}
                onChange={e => update(key, 'limit', Number(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>

            {['uz', 'ru', 'en'].map(lang => (
              <div key={lang}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Xususiyatlar ({lang.toUpperCase()})
                  </label>
                  <button onClick={() => addFeature(key, lang)}
                    className="text-[10px] acc-text font-semibold hover:opacity-75">+ qo'shish</button>
                </div>
                <div className="space-y-1">
                  {(plan[`features_${lang}`] || []).map((f, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <input value={f} onChange={e => updateFeature(key, lang, i, e.target.value)}
                        className="flex-1 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/30" />
                      <button onClick={() => removeFeature(key, lang, i)}
                        className="text-gray-400 hover:text-red-500 transition-colors text-sm w-5 flex-shrink-0">×</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Telegram Tab ────────────────────────────────────────────────────────────
function TelegramTab() {
  const [testing, setTesting] = useState(false);
  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState(null);

  const runTest = async () => {
    setTesting(true); setResult(null); setSteps([]);
    try {
      const r = await fetch('/api/admin/test-platform', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'telegram' }),
      });
      const d = await r.json();
      setSteps(d.steps || []); setResult(d.results);
    } finally { setTesting(false); }
  };

  return (
    <div className="p-6 space-y-5 max-w-lg">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Telegram Diagnostika</h2>
        <p className="text-sm text-gray-500 mt-0.5">Bot ulanishini tekshirish</p>
      </div>
      <button onClick={runTest} disabled={testing}
        className="acc-btn px-5 py-2.5 rounded-xl text-sm font-semibold shadow">
        {testing ? '⏳ Tekshirilmoqda…' : '✈️ Telegram Test'}
      </button>
      {steps.length > 0 && (
        <div className="space-y-1">
          {steps.map((s, i) => (
            <div key={i} className="text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 px-3 py-2 rounded-lg">{s}</div>
          ))}
        </div>
      )}
      {result && Object.entries(result).map(([p, r]) => (
        <div key={p} className={`text-sm px-4 py-3 rounded-xl border ${
          r.success
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
        }`}>
          {r.success ? '✅ Telegram muvaffaqiyatli ulandi!' : '❌ ' + r.error}
        </div>
      ))}
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-1">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Muammo bo'lsa tekshiring</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">1. Railway Variables → TELEGRAM_BOT_TOKEN to'g'ri kiritilganmi?</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">2. TELEGRAM_CHANNEL_ID: @username yoki -1001234567890</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">3. Bot kanalga Administrator qilib qo'shilganmi?</p>
      </div>
    </div>
  );
}

// ─── Main SuperAdmin ─────────────────────────────────────────────────────────
const NAV = [
  { id:'overview', label:"Ko'rsatkichlar", icon:(
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
  )},
  { id:'users', label:'Foydalanuvchilar', icon:(
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
  )},
  { id:'plans', label:'Tariflar', icon:(
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
  )},
  { id:'telegram', label:'Telegram', icon:(
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
  )},
];

export default function SuperAdmin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { color, setColor, colors } = useColor();
  const { mode, setMode } = useTheme();
  const { language, setLanguage } = useLanguage();

  const SWATCHES = [
    { id:'blue',    hex:'#2563eb' },
    { id:'violet',  hex:'#7c3aed' },
    { id:'emerald', hex:'#059669' },
    { id:'rose',    hex:'#e11d48' },
    { id:'amber',   hex:'#d97706' },
  ];
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => { if (d.success) setStats(d.data); });
  }, []);

  if (user && user.role !== 'superadmin') return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div style={{ backgroundColor: colors.main }}
              className="w-8 h-8 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">KontentBot</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">SuperAdmin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === item.id
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
              style={tab === item.id ? { backgroundColor: colors.main } : {}}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
          {/* Theme + Lang mini controls */}
          <div className="flex items-center gap-1 px-1">
            {[['light','☀'],['dark','◑'],['system','⊙']].map(([k,i]) => (
              <button key={k} onClick={() => setMode(k)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-all ${
                  mode===k ? 'text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
                style={mode===k ? { backgroundColor: colors.main } : {}}>
                {i}
              </button>
            ))}
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5" />
            {['uz','ru','en'].map(lng => (
              <button key={lng} onClick={() => setLanguage(lng)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                  language===lng ? 'text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
                style={language===lng ? { backgroundColor: colors.main } : {}}>
                {lng.toUpperCase()}
              </button>
            ))}
          </div>
          {/* Color swatches — Mavzular */}
          <div className="flex items-center gap-1.5 px-1">
            {SWATCHES.map(s => (
              <button key={s.id} onClick={() => setColor(s.id)} title={s.id}
                style={{ backgroundColor: s.hex }}
                className={`w-4 h-4 rounded-full transition-all flex-shrink-0 ${
                  color===s.id ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 ring-gray-500 scale-125'
                               : 'scale-100 opacity-60 hover:opacity-100 hover:scale-110'
                }`} />
            ))}
            <span className="text-[10px] text-gray-400 dark:text-gray-600 ml-0.5">Mavzu</span>
          </div>
          <div className="px-1">
            <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            <button onClick={() => { logout(); navigate('/login'); }}
              className="text-[10px] text-red-400 hover:text-red-500 transition-colors mt-0.5">
              Chiqish
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {tab === 'overview'  && <OverviewTab stats={stats} />}
        {tab === 'users'     && <UsersTab colors={colors} />}
        {tab === 'plans'     && <PlansTab colors={colors} />}
        {tab === 'telegram'  && <TelegramTab />}
      </main>
    </div>
  );
}
