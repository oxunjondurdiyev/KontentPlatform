import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  published: 'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700',
  draft: 'bg-gray-100 text-gray-600',
  failed: 'bg-red-100 text-red-700'
};

const STATUS_LABELS = {
  published: 'Nashr qilindi',
  scheduled: 'Rejalashtirilgan',
  draft: 'Qoralama',
  failed: 'Xato'
};

export default function Dashboard() {
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
          <p className="mt-2 text-gray-500">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🏠 Bosh Panel</h2>
          <p className="text-gray-500 text-sm mt-1">KontentBot Pro — O'zbek AI Kontent Platformasi</p>
        </div>
        <Link to="/create" className="btn-primary flex items-center gap-2">
          ✍️ Yangi Kontent
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Jami', value: stats.total, icon: '📊', color: 'bg-blue-50 border-blue-200' },
            { label: 'Nashr qilindi', value: stats.published, icon: '✅', color: 'bg-green-50 border-green-200' },
            { label: 'Rejalashtirilgan', value: stats.scheduled, icon: '📅', color: 'bg-yellow-50 border-yellow-200' },
            { label: 'Qoralama', value: stats.draft, icon: '📝', color: 'bg-gray-50 border-gray-200' }
          ].map(s => (
            <div key={s.label} className={`card ${s.color} border`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                </div>
                <span className="text-3xl">{s.icon}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent contents */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">So'nggi Kontentlar</h3>
          <Link to="/schedule" className="text-blue-600 text-sm hover:underline">Barchasini ko'rish →</Link>
        </div>
        {contents.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p>Hali kontent yo'q.</p>
            <Link to="/create" className="text-blue-600 hover:underline text-sm mt-2 inline-block">Birinchi kontentni yarating →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {contents.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{c.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {c.platforms.join(' · ')} · {new Date(c.created_at).toLocaleDateString('uz-UZ')}
                  </p>
                </div>
                <span className={`badge ml-3 ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABELS[c.status] || c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
