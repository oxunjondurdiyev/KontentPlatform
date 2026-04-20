import React, { useEffect, useState } from 'react';

const STATUS_COLORS = {
  published: 'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700',
  draft: 'bg-gray-100 text-gray-600',
  failed: 'bg-red-100 text-red-700'
};

export default function Schedule() {
  const [contents, setContents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const url = filter === 'all' ? '/api/content' : `/api/content?status=${filter}`;
    fetch(url)
      .then(r => r.json())
      .then(d => setContents(d.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleDelete = async (id) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
    await fetch(`/api/content/${id}`, { method: 'DELETE' });
    load();
  };

  const handlePublish = async (id) => {
    await fetch(`/api/content/${id}/publish`, { method: 'POST' });
    load();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">📅 Kontent Jadvali</h2>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {[['all', 'Barchasi'], ['draft', 'Qoralama'], ['scheduled', 'Rejalashtirilgan'], ['published', 'Nashr qilindi'], ['failed', 'Xato']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              filter === val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Yuklanmoqda...</div>
      ) : contents.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>Kontent topilmadi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contents.map(c => (
            <div key={c.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">{c.title}</h3>
                    <span className={`badge ${STATUS_COLORS[c.status]}`}>
                      {c.status === 'published' ? 'Nashr' : c.status === 'scheduled' ? 'Rejalashtirilgan' : c.status === 'failed' ? 'Xato' : 'Qoralama'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{c.topic}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {c.platforms.map(p => (
                      <span key={p} className="badge bg-gray-100 text-gray-600 capitalize">{p}</span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 mt-2 flex gap-4">
                    <span>Yaratildi: {new Date(c.created_at).toLocaleString('uz-UZ')}</span>
                    {c.scheduled_at && <span>Rejalashtirilgan: {new Date(c.scheduled_at).toLocaleString('uz-UZ')}</span>}
                    {c.published_at && <span>Nashr: {new Date(c.published_at).toLocaleString('uz-UZ')}</span>}
                  </div>
                  {c.error_message && <p className="text-xs text-red-500 mt-1">Xato: {c.error_message}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {c.status !== 'published' && (
                    <button
                      onClick={() => handlePublish(c.id)}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Nashr
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="btn-secondary text-xs py-1.5 px-3 text-red-600"
                  >
                    O'chir
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
