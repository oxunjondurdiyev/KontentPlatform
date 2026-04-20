import React from 'react';

const PLATFORM_ICONS = {
  instagram: { icon: '📸', label: 'Instagram', color: 'text-pink-600' },
  youtube: { icon: '🎬', label: 'YouTube', color: 'text-red-600' },
  facebook: { icon: '📘', label: 'Facebook', color: 'text-blue-600' },
  telegram: { icon: '✈️', label: 'Telegram', color: 'text-sky-500' }
};

export default function PreviewPanel({ content }) {
  if (!content) return null;

  const platforms = content.platforms || [];

  const renderInstagram = (c) => (
    <div className="space-y-2">
      {content.image_url && <img src={content.image_url} alt="rasm" className="w-full rounded-lg" />}
      {c.title && <p className="font-bold text-sm">{c.title}</p>}
      {c.caption && <p className="text-sm whitespace-pre-wrap">{c.caption}</p>}
      {c.hashtags && <p className="text-xs text-blue-500">{c.hashtags.join(' ')}</p>}
      {c.cta && <p className="text-xs text-gray-500 italic">{c.cta}</p>}
    </div>
  );

  const renderYouTube = (c) => (
    <div className="space-y-2">
      {content.video_url
        ? <video src={content.video_url} controls className="w-full rounded-lg" />
        : content.image_url && <img src={content.image_url} alt="thumbnail" className="w-full rounded-lg" />}
      {c.title && <p className="font-bold text-sm">{c.title}</p>}
      {c.description && <p className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-4">{c.description}</p>}
      {c.tags && (
        <div className="flex flex-wrap gap-1">
          {(Array.isArray(c.tags) ? c.tags : c.tags.split(',')).slice(0, 8).map((t, i) => (
            <span key={i} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{t.trim()}</span>
          ))}
        </div>
      )}
    </div>
  );

  const renderFacebook = (c) => (
    <div className="space-y-2">
      {content.image_url && <img src={content.image_url} alt="rasm" className="w-full rounded-lg" />}
      {c.headline && <p className="font-bold text-sm">{c.headline}</p>}
      {c.body && <p className="text-sm whitespace-pre-wrap line-clamp-5">{c.body}</p>}
      {c.questions && c.questions.length > 0 && (
        <div className="bg-blue-50 rounded p-2">
          {c.questions.map((q, i) => <p key={i} className="text-xs text-blue-700">{q}</p>)}
        </div>
      )}
    </div>
  );

  const renderTelegram = (c) => (
    <div className="space-y-2">
      {content.image_url && <img src={content.image_url} alt="rasm" className="w-full rounded-lg" />}
      {c.message && <p className="text-sm whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded">{c.message}</p>}
      {c.buttons && c.buttons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {c.buttons.map((btn, i) => (
            <span key={i} className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs">{btn.text || btn}</span>
          ))}
        </div>
      )}
    </div>
  );

  const renderers = {
    instagram: renderInstagram,
    youtube: renderYouTube,
    facebook: renderFacebook,
    telegram: renderTelegram
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {platforms.map(platform => {
        const meta = PLATFORM_ICONS[platform] || { icon: '📌', label: platform, color: 'text-gray-600' };
        const platformContent = content[`${platform}_content`];
        const render = renderers[platform];
        return (
          <div key={platform} className="card border">
            <div className={`flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 font-semibold ${meta.color}`}>
              <span className="text-lg">{meta.icon}</span>
              <span>{meta.label}</span>
            </div>
            {platformContent && render ? render(platformContent) : (
              <p className="text-gray-400 text-sm">Kontent mavjud emas</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
