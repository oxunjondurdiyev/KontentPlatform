import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useLanguage, useTheme } from '../contexts/AppContexts';

function TopBar() {
  const { mode, setMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-0.5 gap-0.5">
        {[{ k: 'light', i: '☀️' }, { k: 'dark', i: '🌙' }, { k: 'system', i: '🖥️' }].map(({ k, i }) => (
          <button key={k} onClick={() => setMode(k)}
            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all ${
              mode === k ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}>
            {i}
          </button>
        ))}
      </div>
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-0.5 gap-0.5">
        {['uz', 'ru', 'en'].map(lng => (
          <button key={lng} onClick={() => setLanguage(lng)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              language === lng ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}>
            {lng.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

const PLANS = [
  {
    id: 'free',
    price: { uz: 'Bepul', ru: 'Бесплатно', en: 'Free' },
    features: { uz: ['5 kontent/oy', 'Telegram + Instagram', 'AI matn'], ru: ['5 контент/мес', 'Telegram + Instagram', 'AI текст'], en: ['5 content/mo', 'Telegram + Instagram', 'AI text'] },
    color: 'border-gray-200 dark:border-gray-700', badge: '', btnColor: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
  },
  {
    id: 'starter', amount: 99000,
    price: { uz: "99 000 so'm/oy", ru: '99 000 узс/мес', en: '99,000 UZS/mo' },
    features: { uz: ['30 kontent/oy', 'Barcha platformalar', 'AI rasm'], ru: ['30 контент/мес', 'Все платформы', 'AI изобр.'], en: ['30 content/mo', 'All platforms', 'AI images'] },
    color: 'border-blue-400', badge: '', btnColor: 'bg-blue-600 text-white hover:bg-blue-700'
  },
  {
    id: 'pro', amount: 249000,
    price: { uz: "249 000 so'm/oy", ru: '249 000 узс/мес', en: '249,000 UZS/mo' },
    features: { uz: ['100 kontent/oy', 'Avtonom Agent', 'Google Imagen'], ru: ['100 контент/мес', 'Авт. агент', 'Google Imagen'], en: ['100 content/mo', 'Auto Agent', 'Google Imagen'] },
    color: 'border-purple-500', badge: '⭐', btnColor: 'bg-purple-600 text-white hover:bg-purple-700'
  },
  {
    id: 'business', amount: 599000,
    price: { uz: "599 000 so'm/oy", ru: '599 000 узс/мес', en: '599,000 UZS/mo' },
    features: { uz: ['Cheksiz kontent', 'API kirish', 'Maxsus yordam'], ru: ['Безлимитно', 'API доступ', 'Дедикатная подд.'], en: ['Unlimited', 'API access', 'Dedicated support'] },
    color: 'border-yellow-400', badge: '', btnColor: 'bg-yellow-500 text-white hover:bg-yellow-600'
  }
];

function PlanModal({ onClose, language }) {
  const [selected, setSelected] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const planLabel = { uz: { free: 'Bepul', starter: 'Starter', pro: 'Pro', business: 'Biznes' }, ru: { free: 'Бесплатно', starter: 'Старт', pro: 'Про', business: 'Бизнес' }, en: { free: 'Free', starter: 'Starter', pro: 'Pro', business: 'Business' } };
  const labels = planLabel[language] || planLabel.uz;

  if (showPayment && selected) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-7">
          <h2 className="text-lg font-bold mb-1 dark:text-white">💳 To'lov</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            {labels[selected.id]} — {selected.price[language]}
          </p>
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">📱 Payme / Click</p>
              <p className="font-mono text-sm text-gray-800 dark:text-gray-200">8600 XXXX XXXX XXXX</p>
              <p className="text-xs text-gray-400 mt-0.5">Alisher N.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">📩 Telegram orqali tasdiqlash</p>
              <a href="https://t.me/kontentbot_admin" target="_blank" rel="noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium">
                @kontentbot_admin
              </a>
              <p className="text-xs text-gray-400 mt-2">To'lov cheki + emailingizni yuboring. 1 soat ichida faollashtiriladi.</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowPayment(false)}
              className="flex-1 btn-secondary text-sm py-2">
              ← Orqaga
            </button>
            <button onClick={() => navigate('/')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-lg">
              ✅ Davom etish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl p-7">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold dark:text-white">🚀 Reja tanlang</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Istalgan vaqt o'zgartirish mumkin</p>
          </div>
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm">
            O'tkazib yuborish →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {PLANS.map(plan => (
            <button key={plan.id} onClick={() => setSelected(plan)}
              className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                selected?.id === plan.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
              }`}>
              {plan.badge && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {plan.badge} Mashhur
                </span>
              )}
              <div className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1">{labels[plan.id]}</div>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-2">{plan.price[language]}</div>
              <ul className="space-y-1">
                {(plan.features[language] || plan.features.uz).map((f, i) => (
                  <li key={i} className="text-[11px] text-gray-500 dark:text-gray-400 flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              {selected?.id === plan.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px]">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate('/')}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
            Bepul boshlash
          </button>
          {selected && selected.id !== 'free' ? (
            <button onClick={() => setShowPayment(true)}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow">
              To'lovga o'tish →
            </button>
          ) : (
            <button onClick={() => navigate('/')}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow">
              Boshlash →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', last_name: '', phone: '', passport: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError(t('auth.passwordsMatch')); return; }
    if (form.password.length < 6) { setError(t('auth.passwordTooShort')); return; }
    if (!form.phone.match(/^[+]?[0-9]{9,13}$/)) { setError(t('auth.invalidPhone')); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, last_name: form.last_name, phone: form.phone, passport: form.passport, email: form.email, password: form.password })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      login(data.data.token, data.data.user);
      setShowPlanModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 dark:from-black dark:via-gray-950 dark:to-black flex items-center justify-center p-4">
      {showPlanModal && <PlanModal language={language} onClose={() => navigate('/')} />}

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-7">
          <TopBar />

          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg">
              🤖
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">KontentBot Pro</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('auth.registerTitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{t('auth.name')}</label>
                <input type="text" required className="input text-sm" value={form.name} onChange={set('name')} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{t('auth.lastName')}</label>
                <input type="text" required className="input text-sm" value={form.last_name} onChange={set('last_name')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{t('auth.phone')}</label>
                <input type="tel" required className="input text-sm" placeholder="+998..." value={form.phone} onChange={set('phone')} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{t('auth.passport')}</label>
                <input type="text" required className="input text-sm" placeholder="AA1234567" value={form.passport} onChange={set('passport')} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{t('auth.email')}</label>
              <input type="email" required className="input text-sm" placeholder="email@example.com" value={form.email} onChange={set('email')} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{t('auth.password')}</label>
                <input type="password" required className="input text-sm" placeholder="min 6" value={form.password} onChange={set('password')} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{t('auth.confirmPassword')}</label>
                <input type="password" required className="input text-sm" placeholder="••••••" value={form.confirm} onChange={set('confirm')} />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-2.5 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-lg px-3 py-2">
              <span className="text-base mt-0.5">🔒</span>
              <p className="text-xs text-blue-700 dark:text-blue-400">{t('auth.privacyNotice')}</p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm shadow">
              {loading ? t('auth.registering') : t('auth.register')}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
