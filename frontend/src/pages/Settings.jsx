import React, { useEffect, useState } from 'react';

const FIELDS = [
  { key: 'GROQ_API_KEY', label: 'Groq API Key (AI matn yaratish)', section: 'AI', hint: 'console.groq.com — bepul' },
  { key: 'GOOGLE_AI_KEY', label: 'Google AI Key (Imagen rasm)', section: 'AI', hint: 'aistudio.google.com/api-keys' },
  { key: 'VIDEO_PROVIDER', label: 'Video provayder (kling/runway)', section: 'Video', type: 'text' },
  { key: 'KLING_API_KEY', label: 'Kling AI API Key', section: 'Video' },
  { key: 'RUNWAY_API_KEY', label: 'Runway ML API Key', section: 'Video' },
  { key: 'INSTAGRAM_USER_ID', label: 'Instagram User ID', section: 'Instagram', type: 'text' },
  { key: 'INSTAGRAM_ACCESS_TOKEN', label: 'Instagram Access Token', section: 'Instagram' },
  { key: 'YOUTUBE_API_KEY', label: 'YouTube API Key', section: 'YouTube' },
  { key: 'YOUTUBE_CLIENT_ID', label: 'YouTube Client ID', section: 'YouTube', type: 'text' },
  { key: 'YOUTUBE_CLIENT_SECRET', label: 'YouTube Client Secret', section: 'YouTube' },
  { key: 'YOUTUBE_REFRESH_TOKEN', label: 'YouTube Refresh Token', section: 'YouTube' },
  { key: 'FACEBOOK_PAGE_ID', label: 'Facebook Page ID', section: 'Facebook', type: 'text' },
  { key: 'FACEBOOK_PAGE_ACCESS_TOKEN', label: 'Facebook Page Access Token', section: 'Facebook' },
  { key: 'TELEGRAM_BOT_TOKEN', label: 'Telegram Bot Token', section: 'Telegram' },
  { key: 'TELEGRAM_CHANNEL_ID', label: 'Telegram Channel ID', section: 'Telegram', type: 'text' },
  { key: 'ADMIN_TELEGRAM_CHAT_ID', label: 'Admin Telegram Chat ID (hisobot)', section: 'Telegram', type: 'text' }
];

const sections = [...new Set(FIELDS.map(f => f.section))];

export default function Settings() {
  const [values, setValues] = useState({});
  const [editing, setEditing] = useState({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = () => fetch('/api/settings').then(r => r.json()).then(d => setValues(d.data || {}));
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const payload = {};
    for (const [k, v] of Object.entries(editing)) {
      if (v !== undefined && v !== '') payload[k] = v;
    }
    if (Object.keys(payload).length === 0) return;
    setLoading(true);
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setSaved(true);
      setEditing({});
      setTimeout(() => setSaved(false), 3000);
      load();
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-2">⚙️ Sozlamalar</h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-5 text-sm">
        <p className="font-semibold text-blue-800 mb-1">💡 Kalitlarni doimiy saqlash</p>
        <p className="text-blue-700">
          Quyida kiritilgan kalitlar DB da saqlanadi. Deploy bo'lganda yo'qolmasligi uchun —
          Railway dashboard → <strong>Variables</strong> → <strong>+ New Variable</strong> orqali ham qo'shing.
          Ikki joyda bo'lsa, Railway Variable ustunlik qiladi.
        </p>
      </div>

      {sections.map(section => (
        <div key={section} className="card mb-4">
          <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">{section}</h3>
          <div className="space-y-3">
            {FIELDS.filter(f => f.section === section).map(field => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {field.label}
                  {field.hint && <span className="ml-2 text-blue-400 font-normal">({field.hint})</span>}
                </label>
                <input
                  type={field.type === 'text' ? 'text' : 'password'}
                  className="input text-sm font-mono"
                  placeholder={values[field.key] ? '•••••••• (saqlangan)' : 'Kiritilmagan...'}
                  value={editing[field.key] ?? ''}
                  onChange={e => setEditing(prev => ({ ...prev, [field.key]: e.target.value }))}
                />
                {values[field.key] && (
                  <p className="text-xs text-green-600 mt-0.5">✅ Saqlangan</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={loading} className="btn-primary px-6 py-2">
          {loading ? '⏳ Saqlanmoqda...' : '💾 Saqlash'}
        </button>
        {saved && <span className="text-green-600 text-sm font-medium">✅ Saqlandi!</span>}
      </div>
    </div>
  );
}
