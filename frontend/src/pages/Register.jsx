import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useLanguage, useTheme } from '../contexts/AppContexts';

// ---------- TopBar ----------
function TopBar() {
  const { mode, setMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-0.5 gap-0.5">
        {[{k:'light',i:'☀️'},{k:'dark',i:'🌙'},{k:'system',i:'🖥️'}].map(({k,i}) => (
          <button key={k} onClick={() => setMode(k)}
            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all ${
              mode===k ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}>{i}</button>
        ))}
      </div>
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-0.5 gap-0.5">
        {['uz','ru','en'].map(lng => (
          <button key={lng} onClick={() => setLanguage(lng)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              language===lng ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}>{lng.toUpperCase()}</button>
        ))}
      </div>
    </div>
  );
}

// ---------- Password strength ----------
function passStrength(p) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}
const STRENGTH_LABEL = {
  uz: ['','Juda zaif','Zaif','O\'rtacha','Kuchli','Juda kuchli'],
  ru: ['','Очень слабый','Слабый','Средний','Сильный','Очень сильный'],
  en: ['','Very weak','Weak','Medium','Strong','Very strong']
};
const STRENGTH_COLOR = ['','bg-red-500','bg-orange-400','bg-yellow-400','bg-blue-500','bg-green-500'];

function generateStrongPassword() {
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const syms = '!@#$%&*';
  const all = lower + upper + digits + syms;
  let p = lower[Math.floor(Math.random()*lower.length)]
        + upper[Math.floor(Math.random()*upper.length)]
        + digits[Math.floor(Math.random()*digits.length)]
        + syms[Math.floor(Math.random()*syms.length)];
  for (let i = 0; i < 8; i++) p += all[Math.floor(Math.random()*all.length)];
  return p.split('').sort(() => Math.random()-0.5).join('');
}

// ---------- Plan Modal ----------
const PLANS = [
  { id:'free',   features:{uz:['5 kontent/oy','Telegram+Instagram','AI matn'],ru:['5 контент/мес','Telegram+Instagram','AI текст'],en:['5 content/mo','Telegram+Instagram','AI text']},
    price:{uz:'Bepul',ru:'Бесплатно',en:'Free'}, color:'border-gray-200 dark:border-gray-700', btn:'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200' },
  { id:'starter', amount:99000, features:{uz:['30 kontent/oy','Barcha platformalar','AI rasm'],ru:['30 контент/мес','Все платформы','AI изображение'],en:['30 content/mo','All platforms','AI image']},
    price:{uz:"99 000 so'm/oy",ru:'99 000 uzs/мес',en:'99,000 UZS/mo'}, color:'border-blue-400', btn:'bg-blue-600 text-white hover:bg-blue-700' },
  { id:'pro', popular:true, amount:249000, features:{uz:['100 kontent/oy','Avtonom Agent','Google Imagen'],ru:['100 контент/мес','Авт. агент','Google Imagen'],en:['100 content/mo','Auto Agent','Google Imagen']},
    price:{uz:"249 000 so'm/oy",ru:'249 000 uzs/мес',en:'249,000 UZS/mo'}, color:'border-purple-500', btn:'bg-purple-600 text-white hover:bg-purple-700' },
  { id:'business', amount:599000, features:{uz:['Cheksiz','API kirish','Maxsus yordam'],ru:['Безлимит','API доступ','Выделенная под.'],en:['Unlimited','API access','Dedicated support']},
    price:{uz:"599 000 so'm/oy",ru:'599 000 uzs/мес',en:'599,000 UZS/mo'}, color:'border-yellow-400', btn:'bg-yellow-500 text-white hover:bg-yellow-600' }
];

const PLAN_NAME = {
  uz:{free:'Bepul',starter:'Starter',pro:'Pro',business:'Biznes'},
  ru:{free:'Бесплатно',starter:'Старт',pro:'Про',business:'Бизнес'},
  en:{free:'Free',starter:'Starter',pro:'Pro',business:'Business'}
};

function PaymentModal({ plan, language, onBack, onDone }) {
  const names = PLAN_NAME[language] || PLAN_NAME.uz;
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
        ← Orqaga
      </button>
      <h3 className="text-lg font-bold dark:text-white">💳 To'lov — {names[plan.id]} ({plan.price[language]})</h3>
      <div className="space-y-3">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">📱 Payme / Click</p>
          <p className="font-mono text-sm text-gray-800 dark:text-gray-200 select-all">8600 XXXX XXXX XXXX</p>
          <p className="text-xs text-gray-400 mt-1">Miqdor: {plan.price[language]}</p>
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
      <button onClick={onDone}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl text-sm">
        ✅ Tushundim, davom etish
      </button>
    </div>
  );
}

function PlanStep({ language, onDone }) {
  const [selected, setSelected] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const names = PLAN_NAME[language] || PLAN_NAME.uz;

  if (showPayment && selected) {
    return <PaymentModal plan={selected} language={language} onBack={() => setShowPayment(false)} onDone={onDone} />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold dark:text-white">🚀 Reja tanlang</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Istalgan vaqt o'zgartirish mumkin</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {PLANS.map(plan => (
          <button key={plan.id} onClick={() => setSelected(plan)}
            className={`relative text-left p-3.5 rounded-xl border-2 transition-all ${
              selected?.id === plan.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                : `${plan.color} hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800`
            }`}>
            {plan.popular && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                ⭐ Mashhur
              </span>
            )}
            <div className="font-bold text-sm text-gray-900 dark:text-gray-100">{names[plan.id]}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{plan.price[language]}</div>
            <ul className="mt-2 space-y-0.5">
              {(plan.features[language] || plan.features.uz).map((f,i) => (
                <li key={i} className="text-[11px] text-gray-500 dark:text-gray-400 flex items-start gap-1">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            {selected?.id === plan.id && (
              <div className="absolute top-2 right-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px]">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={onDone}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
          Bepul boshlash
        </button>
        {selected && selected.id !== 'free' ? (
          <button onClick={() => setShowPayment(true)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold shadow ${selected.btn}`}>
            To'lov →
          </button>
        ) : (
          <button onClick={onDone}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow">
            Boshlash →
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- Main Register ----------
export default function Register() {
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name:'', last_name:'', phone:'', passport:'', email:'', password:'', confirm:'' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingAuth, setPendingAuth] = useState(null); // {token, user}
  const [showEmailSug, setShowEmailSug] = useState('');

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  // Email auto-suggest when last_name filled
  const handleLastNameBlur = () => {
    if (form.name && form.last_name && !form.email) {
      const sug = (form.name.trim().toLowerCase() + '.' + form.last_name.trim().toLowerCase())
        .replace(/[^a-z0-9.]/g, '') + '@gmail.com';
      setShowEmailSug(sug);
    }
  };

  const applyEmailSug = () => { setForm(f => ({ ...f, email: showEmailSug })); setShowEmailSug(''); };

  const strength = passStrength(form.password);
  const strengthLabel = (STRENGTH_LABEL[language] || STRENGTH_LABEL.uz)[strength] || '';

  const genPassword = () => {
    const p = generateStrongPassword();
    setForm(f => ({ ...f, password: p, confirm: p }));
    setShowPass(true);
  };

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
        body: JSON.stringify({ name:form.name, last_name:form.last_name, phone:form.phone, passport:form.passport, email:form.email, password:form.password })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      // Tokenni saqlaymiz, lekin hali login qilmaymiz — plan tanlash modal ko'rsatamiz
      setPendingAuth({ token: data.data.token, user: data.data.user });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const finishRegistration = () => {
    if (pendingAuth) {
      login(pendingAuth.token, pendingAuth.user);
    }
    navigate('/');
  };

  // Plan tanlash bosqichi
  if (pendingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 dark:from-black dark:via-gray-950 dark:to-black flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-7">
            <PlanStep language={language} onDone={finishRegistration} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 dark:from-black dark:via-gray-950 dark:to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-7">
          <TopBar />

          <div className="text-center mb-5">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg">🤖</div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">KontentBot Pro</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('auth.registerTitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Ism + Familya */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{t('auth.name')}</label>
                <input type="text" required className="input text-sm" value={form.name}
                  onChange={set('name')} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{t('auth.lastName')}</label>
                <input type="text" required className="input text-sm" value={form.last_name}
                  onChange={set('last_name')} onBlur={handleLastNameBlur} />
              </div>
            </div>

            {/* Telefon + Passport */}
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

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{t('auth.email')}</label>
              <input type="email" required className="input text-sm" placeholder="email@example.com"
                value={form.email} onChange={e => { setShowEmailSug(''); set('email')(e); }} />
              {showEmailSug && (
                <button type="button" onClick={applyEmailSug}
                  className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  💡 {showEmailSug} — ishlatish?
                </button>
              )}
            </div>

            {/* Parol */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('auth.password')}</label>
                <button type="button" onClick={genPassword}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium">
                  ✨ Kuchli parol yaratish
                </button>
              </div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required
                  className="input text-sm pr-10" placeholder="min 6 belgi"
                  value={form.password} onChange={set('password')} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-base">
                  {showPass ? '👁️' : '👁'}
                </button>
              </div>
              {form.password && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= strength ? STRENGTH_COLOR[strength] : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    strength<=2 ? 'text-red-500' : strength<=3 ? 'text-yellow-500' : 'text-green-500'
                  }`}>{strengthLabel}</p>
                </div>
              )}
            </div>

            {/* Parolni tasdiqlash */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{t('auth.confirmPassword')}</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} required
                  className={`input text-sm pr-10 ${
                    form.confirm && form.confirm !== form.password
                      ? 'border-red-400 focus:ring-red-500'
                      : form.confirm && form.confirm === form.password
                        ? 'border-green-400 focus:ring-green-500'
                        : ''
                  }`}
                  placeholder="••••••"
                  value={form.confirm} onChange={set('confirm')} />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-base">
                  {showConfirm ? '👁️' : '👁'}
                </button>
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs text-red-500 mt-1">{t('auth.passwordsMatch')}</p>
              )}
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
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm shadow">
              {loading ? t('auth.registering') : t('auth.register')}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">{t('auth.login')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
