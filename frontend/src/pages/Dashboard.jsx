import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/AppContexts';

export default function Dashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/content/stats').then(r => r.json()),
      fetch('/api/content?limit=10').then(r => r.json())
    ]).then(([s, c]) => {
      setStats(s.data);
      setContents(c.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <div className="text-center">
          <div className="text-4xl animate-spin">⏳</div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const STATUS_COLORS = {
    published: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🏠 {t('dashboard.title')}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <Link to="/create" className="btn-primary flex items-center gap-2">
          ✍️ {t('dashboard.newContent')}
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: t('dashboard.total'), value: stats.total, icon: '📊', color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' },
            { label: t('dashboard.published'), value: stats.published, icon: '✅', color: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' },
            { label: t('dashboard.scheduled'), value: stats.scheduled, icon: '📅', color: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' },
            { label: t('dashboard.draft'), value: stats.draft, icon: '📝', color: 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700' }
          ].map(s => (
            <div key={s.label} className={`card border ${s.color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{s.label}</p>
                  <p className="text-3xl font-bold mt-1 dark:text-gray-100">{s.value}</p>
                </div>
                <span className="text-3xl">{s.icon}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold dark:text-gray-100">{t('dashboard.recent')}</h3>
          <Link to="/schedule" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">{t('dashboard.viewAll')}</Link>
        </div>
        {contents.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <p className="text-4xl mb-3">📭</p>
            <p>{t('dashboard.empty')}</p>
            <Link to="/create" className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2 inline-block">{t('dashboard.firstContent')}</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {contents.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate dark:text-gray-200">{c.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {c.platforms.join(' · ')} · {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`badge ml-3 ${STATUS_COLORS[c.status] || STATUS_COLORS.draft}`}>
                  {t('status.' + c.status) || c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
