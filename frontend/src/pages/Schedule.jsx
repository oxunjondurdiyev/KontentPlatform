import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/AppContexts';

export default function Schedule() {
  const { t } = useLanguage();
  const [contents, setContents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const STATUS_COLORS = {
    published: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
  };

  const load = () => {
    setLoading(true);
    const url = filter === 'all' ? '/api/content' : `/api/content?status=${filter}`;
    fetch(url).then(r => r.json()).then(d => setContents(d.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleDelete = async (id) => {
    if (!confirm(t('schedule.confirmDelete'))) return;
    await fetch(`/api/content/${id}`, { method: 'DELETE' });
    load();
  };

  const handlePublish = async (id, content) => {
    await fetch(`/api/content/${id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentData: content })
    });
    load();
  };

  const filters = [
    ['all', t('schedule.all')],
    ['draft', t('schedule.draft')],
    ['scheduled', t('schedule.scheduled')],
    ['published', t('schedule.published')],
    ['failed', t('schedule.failed')]
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 dark:text-gray-100">📅 {t('schedule.title')}</h2>

      <div className="flex gap-2 mb-5 flex-wrap">
        {filters.map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              filter === val
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
      ) : contents.length === 0 ? (
        <div className="card text-center py-12 text-gray-400 dark:text-gray-500">
          <p className="text-4xl mb-3">📭</p>
          <p>{t('schedule.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contents.map(c => (
            <div key={c.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{c.title}</h3>
                    <span className={`badge ${STATUS_COLORS[c.status]}`}>
                      {t('status.' + c.status) || c.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{c.topic}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {c.platforms.map(p => (
                      <span key={p} className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">{p}</span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 flex flex-wrap gap-4">
                    <span>{t('schedule.created')}: {new Date(c.created_at).toLocaleString()}</span>
                    {c.scheduled_at && <span>{t('schedule.scheduledAt')}: {new Date(c.scheduled_at).toLocaleString()}</span>}
                    {c.published_at && <span>{t('schedule.publishedAt')}: {new Date(c.published_at).toLocaleString()}</span>}
                  </div>
                  {c.error_message && <p className="text-xs text-red-500 mt-1">{t('schedule.error')}: {c.error_message}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {c.status !== 'published' && (
                    <button onClick={() => handlePublish(c.id, c)} className="btn-primary text-xs py-1.5 px-3">
                      {t('schedule.publish')}
                    </button>
                  )}
                  <button onClick={() => handleDelete(c.id)}
                    className="btn-secondary text-xs py-1.5 px-3 text-red-600 dark:text-red-400">
                    {t('schedule.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
