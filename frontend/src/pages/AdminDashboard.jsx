import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/AppContexts';

const PLAN_IDS = ['free', 'starter', 'pro', 'business'];
const PLAN_COLORS = {
  free: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  starter: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  pro: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  business: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
};

function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('uz-UZ', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [tab, setTab] = useState('users'); // 'users' | 'activity'
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [testSteps, setTestSteps] = useState([]);
  const [testing, setTesting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?.role !== 'superadmin') { navigate('/'); return; }
    Promise.all([
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/stats').then(r => r.json())
    ]).then(([u, s]) => {
      if (u.success) setUsers(u.data);
      if (s.success) setStats(s.data);
    }).finally(() => setLoading(false));
  }, []);

  const updateUser = async (id, data) => {
    const res = await fetch('/api/admin/users/' + id, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const d = await res.json();
    if (d.success) setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const deleteUser = async (id) => {
    if (!confirm(t('admin.confirmDelete'))) return;
    await fetch('/api/admin/users/' + id, { method: 'DELETE' });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const testTelegram = async () => {
    setTesting(true); setTestResult(null); setTestSteps([]);
    const res = await fetch('/api/admin/test-platform', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: 'telegram' })
    });
    const d = await res.json();
    setTestResult(d.results); setTestSteps(d.steps || []);
    setTesting(false);
  };

  const filtered = users.filter(u =>
    !search || [u.name, u.last_name, u.email, u.phone, u.passport]
      .some(v => v && v.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="p-6 text-gray-500 dark:text-gray-400">{t('common.loading')}</div>;

  return (
    <div className="p-6 max-w-7xl">
      <h2 className="text-2xl font-bold mb-6 dark:text-gray-100">{t('admin.title')}</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: t('admin.totalUsers'), value: stats.total_users||0, icon:'👥' },
          { label: t('admin.activeUsers'), value: stats.active_users||0, icon:'✅' },
          { label: t('admin.paidUsers'), value: stats.paid_users||0, icon:'💰' },
          { label: t('admin.totalContents'), value: stats.total_contents||0, icon:'📝' },
          { label: t('admin.thisMonth'), value: stats.this_month||0, icon:'📅' }
        ].map(s => (
          <div key={s.label} className="card text-center py-4">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[['users','👥 Foydalanuvchilar'],['activity','📊 Faollik'],['telegram','📡 Telegram']].map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab===key ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-400'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Users tab */}
      {tab === 'users' && (
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Qidirish..." className="input text-sm max-w-xs" />
            <span className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} ta</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                  <th className="pb-2 pr-3">{t('admin.nameSurname')}</th>
                  <th className="pb-2 pr-3">{t('admin.emailPhone')}</th>
                  <th className="pb-2 pr-3">{t('admin.passport')}</th>
                  <th className="pb-2 pr-3">{t('admin.plan')}</th>
                  <th className="pb-2 pr-3">{t('admin.status')}</th>
                  <th className="pb-2 pr-3">{t('admin.subscription')}</th>
                  <th className="pb-2">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td className="py-2 pr-3">
                      <div className="font-medium dark:text-gray-200">{u.name} {u.last_name}</div>
                      <div className="text-xs text-gray-400">#{u.id}</div>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="text-xs dark:text-gray-300">{u.email}</div>
                      <div className="text-xs text-gray-400">{u.phone}</div>
                    </td>
                    <td className="py-2 pr-3">
                      <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded">{u.passport||'—'}</span>
                    </td>
                    <td className="py-2 pr-3">
                      <select value={u.plan} onChange={e => updateUser(u.id, { plan: e.target.value })}
                        className={'text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer ' + (PLAN_COLORS[u.plan]||PLAN_COLORS.free)}>
                        {PLAN_IDS.map(p => <option key={p} value={p}>{t('plan.'+p)}</option>)}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <button onClick={() => updateUser(u.id, { is_active: u.is_active ? 0 : 1 })}
                        className={'text-xs px-2 py-1 rounded-full font-medium ' + (u.is_active ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400')}>
                        {u.is_active ? t('admin.activeStatus') : t('admin.blockedStatus')}
                      </button>
                    </td>
                    <td className="py-2 pr-3">
                      <input type="date" className="text-xs border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded px-1 py-0.5"
                        value={u.subscription_expires ? u.subscription_expires.slice(0,10) : ''}
                        onChange={e => updateUser(u.id, { subscription_expires: e.target.value })} />
                    </td>
                    <td className="py-2">
                      <button onClick={() => deleteUser(u.id)} className="text-gray-400 hover:text-red-500 text-base">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity tab */}
      {tab === 'activity' && (
        <div className="card">
          <h3 className="font-semibold mb-4 dark:text-gray-100">📊 Foydalanuvchilar faolligi</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                  <th className="pb-2 pr-4">Foydalanuvchi</th>
                  <th className="pb-2 pr-4">Reja</th>
                  <th className="pb-2 pr-4">🗓 Ro'yxatdan o'tgan</th>
                  <th className="pb-2 pr-4">🕒 Oxirgi kirish</th>
                  <th className="pb-2">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="py-2.5 pr-4">
                      <div className="font-medium dark:text-gray-200">{u.name} {u.last_name}</div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (PLAN_COLORS[u.plan]||PLAN_COLORS.free)}>
                        {t('plan.'+u.plan)}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-gray-600 dark:text-gray-300">
                      {fmt(u.created_at)}
                    </td>
                    <td className="py-2.5 pr-4">
                      {u.last_login ? (
                        <span className="text-xs text-green-600 dark:text-green-400">{fmt(u.last_login)}</span>
                      ) : (
                        <span className="text-xs text-gray-400">Hali kirmagan</span>
                      )}
                    </td>
                    <td className="py-2.5">
                      <span className={'text-xs px-2 py-0.5 rounded-full ' + (u.is_active ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400')}>
                        {u.is_active ? '● Faol' : '● Bloklangan'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Telegram tab */}
      {tab === 'telegram' && (
        <div className="card max-w-lg">
          <h3 className="font-semibold mb-3 dark:text-gray-100">{t('admin.diagnostics')}</h3>
          <button onClick={testTelegram} disabled={testing} className="btn-primary px-4 py-2 text-sm">
            {testing ? t('admin.testing') : t('admin.testBtn')}
          </button>
          {testSteps.length > 0 && (
            <div className="mt-3 space-y-1">
              {testSteps.map((s,i) => (
                <div key={i} className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded">{s}</div>
              ))}
            </div>
          )}
          {testResult && (
            <div className="mt-2">
              {Object.entries(testResult).map(([p,r]) => (
                <div key={p} className={'text-sm px-3 py-2 rounded ' + (r.success ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400')}>
                  {r.success ? t('admin.telegramOk') : '❌ ' + r.error}
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 text-xs text-gray-400 dark:text-gray-500 space-y-1">
            <p className="font-medium">{t('admin.telegramHints')}:</p>
            <p>1. {t('admin.hint1')}</p>
            <p>2. {t('admin.hint2')}</p>
            <p>3. {t('admin.hint3')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
