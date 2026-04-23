import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { useLanguage, useTheme } from '../contexts/AppContexts';

export default function Pricing() {
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const PLANS = [
    {
      id: 'free', price: 0,
      features: {
        uz: ['5 ta kontent/oy', 'Instagram + Telegram', 'AI matn yaratish', 'Pollinations rasmlar'],
        ru: ['5 контентов/мес', 'Instagram + Telegram', 'AI генерация текста', 'Изображения Pollinations'],
        en: ['5 content/month', 'Instagram + Telegram', 'AI text generation', 'Pollinations images']
      },
      color: 'border-gray-200', btnClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    },
    {
      id: 'starter', price: 99000,
      features: {
        uz: ['30 ta kontent/oy', 'Barcha platformalar', 'AI matn + rasm', 'Jadval rejasi'],
        ru: ['30 контентов/мес', 'Все платформы', 'AI текст + изображение', 'Планировщик'],
        en: ['30 content/month', 'All platforms', 'AI text + image', 'Scheduler']
      },
      color: 'border-blue-400', btnClass: 'bg-blue-600 text-white hover:bg-blue-700'
    },
    {
      id: 'pro', price: 249000,
      features: {
        uz: ['100 ta kontent/oy', 'Barcha platformalar', 'Avtonom Agent', 'Google Imagen rasmlar', 'Prioritet yordam'],
        ru: ['100 контентов/мес', 'Все платформы', 'Авт. агент', 'Google Imagen', 'Приоритетная поддержка'],
        en: ['100 content/month', 'All platforms', 'Auto Agent', 'Google Imagen images', 'Priority support']
      },
      color: 'border-purple-500', btnClass: 'bg-purple-600 text-white hover:bg-purple-700', popular: true
    },
    {
      id: 'business', price: 599000,
      features: {
        uz: ['Cheksiz kontent', 'Barcha platformalar', 'Avtonom Agent', 'API kirish', 'Maxsus yordam'],
        ru: ['Безлимитный контент', 'Все платформы', 'Авт. агент', 'API доступ', 'Выделенная поддержка'],
        en: ['Unlimited content', 'All platforms', 'Auto Agent', 'API access', 'Dedicated support']
      },
      color: 'border-yellow-400', btnClass: 'bg-yellow-500 text-white hover:bg-yellow-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 dark:from-black dark:to-gray-900 py-16 px-4">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="flex gap-1 bg-white/10 backdrop-blur rounded-full p-1">
          {['uz', 'ru', 'en'].map(lng => (
            <button key={lng} onClick={() => setLanguage(lng)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                language === lng ? 'bg-white text-gray-900' : 'text-white hover:bg-white/10'
              }`}>
              {lng.toUpperCase()}
            </button>
          ))}
        </div>
        <button onClick={toggleTheme}
          className="bg-white/10 backdrop-blur hover:bg-white/20 text-white px-3 py-1.5 rounded-full transition">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">🤖 {t('pricing.title')}</h1>
          <p className="text-blue-200 text-lg">{t('pricing.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {PLANS.map(plan => (
            <div key={plan.id} className={`bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 ${plan.color} relative flex flex-col`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {t('pricing.popular')}
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">{t('plan.' + plan.id)}</h3>
              <div className="mb-4">
                {plan.price === 0
                  ? <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('pricing.free')}</span>
                  : <><span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{plan.price.toLocaleString()}</span>
                     <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">{t('pricing.perMonth')}</span></>
                }
              </div>
              <ul className="space-y-2 flex-1 mb-6">
                {(plan.features[language] || plan.features.uz).map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="text-green-500 mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              {user?.plan === plan.id
                ? <div className="w-full py-2 text-center text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-lg">{t('pricing.current')}</div>
                : plan.id === 'free'
                  ? <Link to="/register" className={`block w-full py-2 text-center text-sm font-medium rounded-lg ${plan.btnClass}`}>{t('pricing.start')}</Link>
                  : <a href="#payment" className={`block w-full py-2 text-center text-sm font-medium rounded-lg ${plan.btnClass}`}>{t('pricing.pay')}</a>
              }
            </div>
          ))}
        </div>

        <div id="payment" className="bg-white/10 backdrop-blur rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">{t('pricing.paymentTitle')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-xl p-5">
              <h3 className="font-bold mb-3">📱 Payme</h3>
              <p className="font-mono mt-2 text-sm bg-white/10 px-3 py-2 rounded">8600 XXXX XXXX XXXX</p>
            </div>
            <div className="bg-white/10 rounded-xl p-5">
              <h3 className="font-bold mb-3">💳 Click</h3>
              <p className="font-mono mt-2 text-sm bg-white/10 px-3 py-2 rounded">9860 XXXX XXXX XXXX</p>
            </div>
            <div className="bg-white/10 rounded-xl p-5">
              <h3 className="font-bold mb-3">📩 Telegram</h3>
              <a href="https://t.me/kontentbot_admin" target="_blank" rel="noreferrer"
                className="inline-block mt-2 bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg">
                @kontentbot_admin
              </a>
            </div>
          </div>
          <p className="text-center text-blue-300 text-sm mt-6">{t('pricing.activationNote')}</p>
        </div>

        <div className="text-center mt-8">
          {user
            ? <Link to="/" className="text-blue-300 hover:text-white">{t('pricing.backHome')}</Link>
            : <Link to="/login" className="text-blue-300 hover:text-white">{t('pricing.backLogin')}</Link>
          }
        </div>
      </div>
    </div>
  );
}
