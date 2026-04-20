import React, { useEffect, useRef, useState } from 'react';

const DAYS = [
  ['monday', 'Dushanba'], ['tuesday', 'Seshanba'], ['wednesday', 'Chorshanba'],
  ['thursday', 'Payshanba'], ['friday', 'Juma'], ['saturday', 'Shanba'], ['sunday', 'Yakshanba']
];

const PLATFORMS = [
  { id: 'instagram', label: '\ud83d\udcf8 Instagram' },
  { id: 'youtube', label: '\ud83c\udfac YouTube' },
  { id: 'facebook', label: '\ud83d\udcd8 Facebook' },
  { id: 'telegram', label: '\u2708\ufe0f Telegram' }
];

export default function AutonomousSettings() {
  const [mode, setMode] = useState(false);
  const [schedule, setSchedule] = useState({});
  const [config, setConfig] = useState({ platforms: ['instagram', 'telegram'], channelDescription: '', targetAudience: '' });
  const [topics, setTopics] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newTopic, setNewTopic] = useState('');
  const [timeInputs, setTimeInputs] = useState({});
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAll = () => {
    fetch('/api/autonomous/settings').then(r => r.json()).then(d => {
      setMode(d.mode === 'true');
      setSchedule(d.schedule || {});
      setConfig(d.config || { platforms: ['instagram', 'telegram'], channelDescription: '', targetAudience: '' });
    });
    loadTopics();
    loadLogs();
  };

  const loadTopics = () =>
    fetch('/api/autonomous/queue').then(r => r.json()).then(setTopics);

  const loadLogs = () =>
    fetch('/api/autonomous/logs').then(r => r.json()).then(setLogs);

  const addSlot = (day) => {
    const val = timeInputs[day] || '09:00';
    const slots = [...(schedule[day] || []), val];
    const unique = [...new Set(slots)].sort();
    setSchedule(prev => ({ ...prev, [day]: unique }));
  };

  const removeSlot = (day, time) => {
    setSchedule(prev => ({ ...prev, [day]: (prev[day] || []).filter(t => t !== time) }));
  };

  const addTopic = async () => {
    if (!newTopic.trim()) return;
    await fetch('/api/autonomous/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTopic.trim() })
    });
    setNewTopic('');
    loadTopics();
  };

  const deleteTopic = async (id) => {
    await fetch(`/api/autonomous/queue/${id}`, { method: 'DELETE' });
    loadTopics();
  };

  const saveAll = async () => {
    const res = await fetch('/api/autonomous/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: mode ? 'true' : 'false', schedule, config })
    });
    const data = await res.json();
    if (data.success) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  };

  const testRun = async () => {
    setTesting(true);
    await fetch('/api/autonomous/test-run', { method: 'POST' });
    setTimeout(() => setTesting(false), 5000);
  };

  const togglePlatform = (id) => {
    const arr = config.platforms || [];
    setConfig(prev => ({
      ...prev,
      platforms: arr.includes(id) ? arr.filter(p => p !== id) : [...arr, id]
    }));
  };

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-2xl font-bold mb-1">🤖 Avtonom Agent Sozlamalari</h2>
      <p className="text-gray-500 text-sm mb-6">Har daqiqada jadval tekshiriladi, belgilangan vaqtda o'zi ishga tushadi.</p>

      {/* Yoqish/O'chirish */}
      <div className="card mb-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-lg">{mode ? '🟢 Avtonom rejim: Yoqiq' : '🔴 Avtonom rejim: O\'chiq'}</p>
          <p className="text-sm text-gray-500 mt-0.5">{mode ? 'Agent jadval bo\'yicha o\'zi ishlaydi' : 'Hozir qo\'lda boshqaruv rejimida'}</p>
        </div>
        <button
          onClick={() => setMode(!mode)}
          className={`relative w-14 h-7 rounded-full transition-colors ${mode ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${mode ? 'translate-x-8' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Haftalik jadval */}
      <div className="card mb-4">
        <h3 className="font-semibold mb-3">📅 Haftalik Nashr Jadvali</h3>
        <div className="space-y-2">
          {DAYS.map(([day, dayName]) => (
            <div key={day} className="flex items-center gap-3 flex-wrap">
              <span className="w-24 text-sm font-medium text-gray-600">{dayName}</span>
              <div className="flex flex-wrap gap-1.5">
                {(schedule[day] || []).map(t => (
                  <button
                    key={t}
                    onClick={() => removeSlot(day, t)}
                    className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                  >
                    {t} ✕
                  </button>
                ))}
              </div>
              <div className="flex gap-1 ml-auto">
                <input
                  type="time"
                  className="input text-xs py-1 px-2 w-28"
                  value={timeInputs[day] || '09:00'}
                  onChange={e => setTimeInputs(prev => ({ ...prev, [day]: e.target.value }))}
                />
                <button onClick={() => addSlot(day)} className="btn-primary text-xs py-1 px-2">
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanal sozlamalari */}
      <div className="card mb-4">
        <h3 className="font-semibold mb-3">📢 Kanal Sozlamalari</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Kanal yo'nalishi</label>
            <input
              className="input text-sm"
              placeholder="AI, ISO standartlar, raqamli texnologiyalar..."
              value={config.channelDescription || ''}
              onChange={e => setConfig(p => ({ ...p, channelDescription: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Maqsadli auditoriya</label>
            <input
              className="input text-sm"
              placeholder="O'zbek mutaxassislar, tadbirkorlar..."
              value={config.targetAudience || ''}
              onChange={e => setConfig(p => ({ ...p, targetAudience: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Platformalar</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    (config.platforms || []).includes(p.id)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mavzular navbati */}
      <div className="card mb-4">
        <h3 className="font-semibold mb-1">📌 Mavzular Navbati</h3>
        <p className="text-xs text-gray-500 mb-3">Bo'sh bo'lsa AI o'zi mavzu topadi. Qo'shilsa navbat bo'yicha ishlatiladi.</p>
        <div className="flex gap-2 mb-3">
          <input
            className="input flex-1 text-sm"
            placeholder="Mavzu nomi..."
            value={newTopic}
            onChange={e => setNewTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTopic()}
          />
          <button onClick={addTopic} className="btn-primary text-sm px-3">
            + Qo'shish
          </button>
        </div>
        {topics.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Navbat bo'sh — AI mavzu topadi</p>
        ) : (
          <div className="space-y-1.5">
            {topics.map(t => (
              <div key={t.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                <span className="text-sm">{t.title}</span>
                <button onClick={() => deleteTopic(t.id)} className="text-red-400 hover:text-red-600 text-xs">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tugmalar */}
      <div className="flex gap-3 mb-6">
        <button onClick={saveAll} className="btn-primary px-6">
          {saved ? '✅ Saqlandi!' : '💾 Saqlash'}
        </button>
        <button onClick={testRun} disabled={testing} className="btn-secondary">
          {testing ? '⏳ Ishga tushdi...' : '🧪 Hozir Test Qilish'}
        </button>
      </div>
      {testing && <p className="text-sm text-blue-600 mb-4">Test tsikl ishga tushdi. Telegram hisobotini kuting...</p>}

      {/* Loglar */}
      <div className="card">
        <h3 className="font-semibold mb-3">📊 Oxirgi Tsikllar</h3>
        {logs.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Hali tsikl bo'lmagan</p>
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span>{log.success ? '✅' : '❌'}</span>
                  <span className="font-medium">{log.time_slot}</span>
                  <span className="text-gray-400 text-xs">{log.started_at?.slice(0, 16)}</span>
                </div>
                {log.error_message && (
                  <span className="text-xs text-red-500 truncate max-w-xs">{log.error_message}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
