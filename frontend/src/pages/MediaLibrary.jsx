import React, { useEffect, useRef, useState } from 'react';

export default function MediaLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const load = () => {
    setLoading(true);
    fetch('/api/media')
      .then(r => r.json())
      .then(d => setItems(d.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/media/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      load();
    } catch (err) {
      alert('Yuklashda xato: ' + err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await fetch(`/api/media/${id}`, { method: 'DELETE' });
    load();
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">🖼️ Media Kutubxona</h2>
        <label className="btn-primary cursor-pointer">
          {uploading ? '⏳ Yuklanmoqda...' : '⬆️ Fayl Yuklash'}
          <input ref={fileRef} type="file" className="hidden" accept="image/*,video/*" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Yuklanmoqda...</div>
      ) : items.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">🖼️</p>
          <p>Media kutubxona bo'sh</p>
          <p className="text-sm mt-1">Rasm yoki video yuklang</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map(item => (
            <div key={item.id} className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
              {item.file_type === 'image' ? (
                <img src={item.url} alt={item.original_name} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-gray-900 flex items-center justify-center">
                  <span className="text-4xl">🎬</span>
                </div>
              )}
              <div className="p-2">
                <p className="text-xs font-medium truncate text-gray-700">{item.original_name}</p>
                <p className="text-xs text-gray-400">{formatSize(item.file_size)}</p>
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <a href={item.url} target="_blank" rel="noreferrer"
                  className="bg-white text-gray-800 text-xs px-2 py-1 rounded-lg font-medium">
                  Ko'rish
                </a>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500 text-white text-xs px-2 py-1 rounded-lg font-medium">
                  O'chir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
