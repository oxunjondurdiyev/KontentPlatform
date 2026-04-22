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

const IMAGE_STYLES = ['Professional', 'Minimalist', 'Colorful', 'Vintage', 'Modern', 'Traditional Uzbek'];

export default function CreateContent() {
  const [topic, setTopic] = useState('');
  const [platforms, setPlatforms] = useState(['telegram']);
  const [contentType, setContentType] = useState('article');
  const [imageStyle, setImageStyle] = useState('Professional');
  const [generateVideo, setGenerateVideo] = useState(false);
  const [scheduleMode, setScheduleMode] = useState('now');
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState(null);

  const togglePlatform = (id) => {
    setPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) { setError('Mavzu kiriting'); return; }
    if (platforms.length === 0) { setError('Kamida bitta platforma tanlang'); return; }
    setError('');
    setLoading(true);
    setResult(null);
    setPublishResults(null);
    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platforms, contentType, imageStyle, generateVideo,
          scheduledAt: scheduleMode === 'later' && scheduledAt ? scheduledAt : null })
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
    setPublishing(true);
    setPublishResults(null);
    try {
      // contentData ni ham yuborish — DB o'chirilgan bo'lsa qayta tiklanadi
      const res = await fetch(`/api/content/${result.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentData: result })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setResult(prev => ({ ...prev, status: 'published' }));
      setPublishResults(data.publishResults || {});
    } catch (err) {
      setPublishResults({ _error: err.message });
    } finally {
      setPublishing(false);
    }
  };

  const PLATFORM_ICONS = { instagram: '📸', youtube: '🎬', facebook: '📘', telegram: '✈️' };

  return (
    <div className="p-6 max-w-5xl">
      <h2 className="text-2xl font-bold mb-6">✍️ Yangi Kontent Yaratish</h2>

      {!result ? (
        <div className="card space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Mavzu *</label>
            <textarea className="input resize-none" rows={3}
              placeholder="Masalan: O'zbekistonda elektr avtomobillar rivoji..."
              value={topic} onChange={e => setTopic(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Platformalar *</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button key={p.id} onClick={() => togglePlatform(p.id)}
                  className={`px-4 py-2 rounded-lg border font-medium text-sm transition-colors ${
                    platforms.includes(p.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Kontent turi</label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map(t => (
                <button key={t.id} onClick={() => setContentType(t.id)}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    contentType === t.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Rasm uslubi</label>
            <select className="input" value={imageStyle} onChange={e => setImageStyle(e.target.value)}>
              {IMAGE_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="genVideo" checked={generateVideo}
              onChange={e => setGenerateVideo(e.target.checked)} className="w-4 h-4" />
            <label htmlFor="genVideo" className="text-sm font-medium">Video skript ham yaratish</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nashr vaqti</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="now" checked={scheduleMode === 'now'} onChange={() => setScheduleMode('now')} /> Hozir
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="later" checked={scheduleMode === 'later'} onChange={() => setScheduleMode('later')} /> Keyinroq
              </label>
            </div>
            {scheduleMode === 'later' && (
              <input type="datetime-local" className="input mt-2 max-w-xs"
                value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
            )}
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded">{error}</p>}

          <button onClick={handleGenerate} disabled={loading}
            className="btn-primary w-full text-center py-3 text-base">
            {loading ? '⏳ AI kontent yaratmoqda...' : '🤖 AI bilan Yaratish'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-green-700">✅ Kontent yaratildi!</h3>
            <button onClick={() => { setResult(null); setPublishResults(null); }} className="btn-secondary text-sm">← Qaytish</button>
          </div>

          {result.image_url && (
            <div className="card">
              <h4 className="font-semibold mb-2">🖼️ AI Rasm <span className="text-xs text-gray-400 font-normal ml-1">
                {result.imageProvider === 'google' ? '(Google Gemini)' : '(Pollinations.ai)'}
              </span></h4>
              <img src={result.image_url} alt="AI rasm" className="w-full max-w-sm rounded-lg border"
                onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
              <p className="hidden text-sm text-gray-400 mt-1">Rasm yuklanmoqda yoki xato...</p>
            </div>
          )}

          {result.video_prompt && (
            <div className="card">
              <h4 className="font-semibold mb-2">🎬 Video {result.videoPromptOnly ? 'Skript/Prompt' : 'URL'}</h4>
              {result.video_url
                ? <video src={result.video_url} controls className="w-full rounded-lg" />
                : (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Video AI prompti:</p>
                    <p className="text-sm font-mono text-gray-700">{result.video_prompt}</p>
                  </div>
                )}
            </div>
          )}

          <PreviewPanel content={result} />

          <div className="card">
            <h4 className="font-semibold mb-3">📤 Nashr qilish</h4>

            {!publishResults ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  Kontent tanlangan platformalarga nashr qilinadi: {result.platforms?.map(p => PLATFORM_ICONS[p] + ' ' + p).join(', ')}
                </p>
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded">
                  ⚠️ Nashr qilish uchun Sozlamalar sahifasida tegishli API kalitlarni kiriting (Telegram, Instagram va h.k.)
                </p>
                <button onClick={handlePublish} disabled={publishing || result.status === 'published'}
                  className="btn-primary px-6 py-2.5">
                  {publishing ? '⏳ Nashr qilinmoqda...' : result.status === 'published' ? '✅ Nashr qilindi' : '📤 Nashr Qilish'}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium mb-2">Nashr natijalari:</p>
                {publishResults._error && (
                  <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded">❌ {publishResults._error}</p>
                )}
                {Object.entries(publishResults).filter(([k]) => k !== '_error').map(([platform, r]) => (
                  <div key={platform} className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
                    r.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    <span>{PLATFORM_ICONS[platform] || '📌'}</span>
                    <span className="font-medium capitalize">{platform}</span>
                    <span>{r.success ? '✅ Muvaffaqiyatli' : `❌ ${r.error}`}</span>
                  </div>
                ))}
                <button onClick={handlePublish} disabled={publishing} className="btn-secondary text-sm mt-2">
                  🔄 Qayta urinish
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
