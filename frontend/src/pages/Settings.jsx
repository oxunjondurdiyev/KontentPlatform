import React, { useEffect, useState } from 'react';

const FIELDS = [
  { key: 'ANTHROPIC_API_KEY', label: 'Anthropic (Claude) API Key', section: 'AI' },
  { key: 'NANO_BANANA_API_KEY', label: 'Nano Banana API Key (rasm)', section: 'AI' },
  { key: 'VIDEO_PROVIDER', label: 'Video provayder (kling/runway/higgsfield)', section: 'Video', type: 'text' },
  { key: 'KLING_API_KEY', label: 'Kling AI API Key', section: 'Video' },
  { key: 'RUNWAY_API_KEY', label: 'Runway ML API Key', section: 'Video' },
  { key: 'INSTAGRAM_USER_ID', label: 'Instagram User ID', section: 'Instagram' },
  { key: 'INSTAGRAM_ACCESS_TOKEN', label: 'Instagram Access Token', section: 'Instagram' },
  { key: 'YOUTUBE_API_KEY', label: 'YouTube API Key', section: 'YouTube' },
  { key: 'YOUTUBE_CLIENT_ID', label: 'YouTube Client ID', section: 'YouTube' },
  { key: 'YOUTUBE_CLIENT_SECRET', label: 'YouTube Client Secret', section: 'YouTube' },
  { key: 'YOUTUBE_REFRESH_TOKEN', label: 'YouTube Refresh Token', section: 'YouTube' },
  { key: 'FACEBOOK_PAGE_ID', label: 'Facebook Page ID', section: 'Facebook' },
  { key: 'FACEBOOK_PAGE_ACCESS_TOKEN', label: 'Facebook Page Access Token', section: 'Facebook' },
  { key: 'TELEGRAM_BOT_TOKEN', label: 'Telegram Bot Token', section: 'Telegram' },
  { key: 'TELEGRAM_CHANNEL_ID', label: 'Telegram Channel ID', section: 'Telegram' },
  { key: 'ADMIN_TELEGRAM_CHAT_ID', label: 'Admin Telegram Chat ID (hisobot uchun)', section: 'Telegram' }
];

const sections = [...new Set(FIELDS.map(f => f.section))];

export default function Settings() {
  const [values, setValues] = useState({});
  const [editing, setEditing] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => setValues(d.data || {}));
  }, []);

  const handleSave = async () => {
    const payload = {};
    for (const [k, v] of Object.entries(editing)) {
      if (v !== undefined && v !== '') payload[k] = v;
    }
    if (Object.keys(payload).length === 0) return;
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      setSaved(true);
      setEditing({});
      setTimeout(() => setSaved(false), 3000);
      fetch('/api/settings').then(r => r.json()).then(d => setValues(d.data || {}));
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-2">⚙️ Sozlamalar</h2>
      <p className="text-gray-500 text-sm mb-6">API kalitlar va integratsiya sozlamalari. Qiymatlar xavfsiz saqlanadi.</p>

      {sections.map(section => (
        <div key={section} className="card mb-4">
          <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">{section}</h3>
          <div className="space-y-3">
            {FIELDS.filter(f => f.section === section).map(field => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                <input
                  type={field.type === 'text' ? 'text' : 'password'}
                  className="input text-sm font-mono"
                  placeholder={values[field.key] || 'Kiritilmagan...'}
                  value={editing[field.key] ?? ''}
                  onChange={e => setEditing(prev => ({ ...prev, [field.key]: e.target.value }))}
                />
                {values[field.key] && (
                  <p className="text-xs text-green-600 mt-0.5">✅ Saqlangan: {values[field.key]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button onClick={handleSave} className="btn-primary px-6 py-2">
          💾 Saqlash
        </button>
        {saved && <span className="text-green-600 text-sm font-medium">✅ Saqlandi!</span>}
      </div>
    </div>
  );
}
