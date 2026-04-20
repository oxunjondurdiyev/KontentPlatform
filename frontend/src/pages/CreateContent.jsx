import React, { useState } from 'react';
import PreviewPanel from '../components/PreviewPanel';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'youtube', label: 'YouTube', icon: '🎬' },
  { id: 'facebook', label: 'Facebook', icon: '📘' },
  { id: 'telegram', label: 'Telegram', icon: '✈️' }
];

const CONTENT_TYPES = [
  { id: 'article', label: 'Maqola' },
  { id: 'video', label: 'Video' },
  { id: 'image_post', label: 'Rasm+Izoh' },
  { id: 'story', label: 'Story' }
];

const IMAGE_STYLES = [
  'Professional', 'Minimalist', 'Colorful', 'Vintage', 'Modern', 'Traditional Uzbek'
];

const VIDEO_PROVIDERS = [
  { id: 'kling', label: 'Kling AI' },
  { id: 'runway', label: 'Runway ML' },
  { id: 'higgsfield', label: 'Higgsfield' }
];

export default function CreateContent() {
  const [topic, setTopic] = useState('');
  const [platforms, setPlatforms] = useState(['instagram']);
  const [contentType, setContentType] = useState('article');
  const [imageStyle, setImageStyle] = useState('Professional');
  const [generateVideo, setGenerateVideo] = useState(false);
  const [scheduleMode, setScheduleMode] = useState('now');
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const togglePlatform = (id) => {
    setPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!topic.trim()) { setError('Mavzu kiriting'); return; }
    if (platforms.length === 0) { setError('Kamida bitta platforma tanlang'); return; }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const body = {
        topic,
        platforms,
        contentType,
        imageStyle,
        generateVideo,
        scheduledAt: scheduleMode === 'later' && scheduledAt ? scheduledAt : null
      };
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!result) return;
    try {
      const res = await fetch(`/api/content/${result.id}/publish`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      alert('Muvaffaqiyatli nashr qilindi!');
      setResult(data.data);
    } catch (err) {
      alert('Xato: ' + err.message);
    }
  };

  return (
    <div className="p-6 max-w-5xl">
      <h2 className="text-2xl font-bold mb-6">✍️ Yangi Kontent Yaratish</h2>

      {!result ? (
        <div className="card space-y-5">
          {/* Mavzu */}
          <div>
            <label className="block text-sm font-medium mb-1">Mavzu *</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Masalan: O'zbekistonda elektr avtomobillar rivoji..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
            />
          </div>

          {/* Platformalar */}
          <div>
            <label className="block text-sm font-medium mb-2">Platformalar *</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`px-4 py-2 rounded-lg border font-medium text-sm transition-colors ${
                    platforms.includes(p.id)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Kontent turi */}
          <div>
            <label className="block text-sm font-medium mb-2">Kontent turi</label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setContentType(t.id)}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    contentType === t.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rasm uslubi */}
          <div>
            <label className="block text-sm font-medium mb-1">Rasm uslubi</label>
            <select className="input" value={imageStyle} onChange={e => setImageStyle(e.target.value)}>
              {IMAGE_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Video */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="genVideo"
              checked={generateVideo}
              onChange={e => setGenerateVideo(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="genVideo" className="text-sm font-medium">Video ham yaratish (YouTube uchun)</label>
          </div>

          {/* Vaqt */}
          <div>
            <label className="block text-sm font-medium mb-2">Nashr vaqti</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="now" checked={scheduleMode === 'now'} onChange={() => setScheduleMode('now')} />
                Hozir
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="later" checked={scheduleMode === 'later'} onChange={() => setScheduleMode('later')} />
                Keyinroq
              </label>
            </div>
            {scheduleMode === 'later' && (
              <input
                type="datetime-local"
                className="input mt-2 max-w-xs"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
              />
            )}
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary w-full text-center py-3 text-base"
          >
            {loading ? '⏳ AI kontent yaratmoqda...' : '🤖 AI bilan Yaratish'}
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-700">✅ Kontent yaratildi!</h3>
            <button onClick={() => setResult(null)} className="btn-secondary text-sm">← Qaytish</button>
          </div>
          <PreviewPanel content={result} />
          <div className="flex gap-3 mt-6">
            {result.status !== 'published' && (
              <button onClick={handlePublish} className="btn-primary flex-1 py-3">
                ✅ Tasdiqlash va Nashr
              </button>
            )}
            {result.status === 'published' && (
              <div className="flex-1 text-center py-3 bg-green-100 text-green-700 rounded-lg font-medium">
                ✅ Nashr qilindi
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
