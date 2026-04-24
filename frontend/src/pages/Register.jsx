import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useLanguage, useTheme, useColor } from '../contexts/AppContexts';

const SWATCHES = [
  { id: 'blue',    hex: '#2563eb' },
  { id: 'violet',  hex: '#7c3aed' },
  { id: 'emerald', hex: '#059669' },
  { id: 'rose',    hex: '#e11d48' },
  { id: 'amber',   hex: '#d97706' },
];

const EyeOn = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
  </svg>
);
const EyeOff = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
  </svg>
);

function TopControls() {
  const { mode, setMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { color, setColor } = useColor();
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-1.5">
        <div className="flex items-center bg-black/5 dark:bg-white/8 rounded-full p-0.5">
          {[['light','☀'],['dark','◑'],['system','⊙']].map(([k, i]) => (
            <button key={k} onClick={() => setMode(k)}
              className={`w-7 h-7 flex items-center justify-center rounded-full text-sm transition-all ${
                mode === k ? 'bg-white dark:bg-gray-700 shadow text-gray-800 dark:text-white'
                           : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}>{i}</button>
          ))}
        </div>
        <div className="flex items-center bg-black/5 dark:bg-white/8 rounded-full p-0.5">
          {['uz', 'ru', 'en'].map(lng => (
            <button key={lng} onClick={() => setLanguage(lng)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all ${
                language === lng ? 'bg-white dark:bg-gray-700 shadow text-gray-800 dark:text-white'
                                 : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}>{lng.toUpperCase()}</button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {SWATCHES.map(s => (
          <button key={s.id} onClick={() => setColor(s.id)} title={s.id}
            style={{ backgroundColor: s.hex }}
            className={`w-4 h-4 rounded-full transition-all ${
              color === s.id ? 'ring-2 ring-offset-1 dark:ring-offset-gray-900 ring-gray-500 scale-125'
                             : 'scale-100 hover:scale-110 opacity-75 hover:opacity-100'
            }`} />
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
  en: ['','Very weak','Weak','Medium','Strong','Very strong'],
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
  { id:'free', features:{uz:['5 kontent/oy','Telegram+Instagram','AI matn'],ru:['5 контент/мес','Telegram+Instagram','AI текст'],en:['5 content/mo','Telegram+Instagram','AI text']},
    price:{uz:'Bepul',ru:'Бесплатно',en:'Free'}, colorClass:'border-gray-200 dark:border-gray-700' },
  { id:'starter', amount:99000, features:{uz:['30 kontent/oy','Barcha platformalar','AI rasm'],ru:['30 контент/мес','Все платформы','AI изображение'],en:['30 content/mo','All platforms','AI image']},
    price:{uz:"99 000 so'm/oy",ru:'99 000 uzs/мес',en:'99,000 UZS/mo'}, colorClass:'border-blue-400' },
  { id:'pro', popular:true, amount:249000, features:{uz:['100 kontent/oy','Avtonom Agent','Google Imagen'],ru:['100 контент/мес','Авт. агент','Google Imagen'],en:['100 content/mo','Auto Agent','Google Imagen']},
    price:{uz:"249 000 so'm/oy",ru:'249 000 uzs/мес',en:'249,000 UZS/mo'}, colorClass:'border-purple-500' },
  { id:'business', amount:599000, features:{uz:['Cheksiz','API kirish','Maxsus yordam'],ru:['Безлимит','API доступ','Выделенная под.'],en:['Unlimited','API access','Dedicated support']},
    price:{uz:"599 000 so'm/oy",ru:'599 000 uzs/мес',en:'599,000 UZS/mo'}, colorClass:'border-yellow-400' },
];

const PLAN_NAME = {
  uz:{free:'Bepul',starter:'Starter',pro:'Pro',business:'Biznes'},
  ru:{free:'Бесплатно',starter:'Старт',pro:'Про',business:'Бизнес'},
  en:{free:'Free',starter:'Starter',pro:'Pro',business:'Business'},
};

function PaymentModal({ plan, language, colors, onBack, onDone }) {
  const names = PLAN_NAME[language] || PLAN_NAME.uz;
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
        ← Orqaga
      </button>
      <h3 className="text-lg font-semibold dark:text-white">To'lov — {names[plan.id]} ({plan.price[language]})</h3>
      <div className="space-y-3">
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 p-4">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">Payme / Click</p>
          <p className="font-mono text-sm text-gray-800 dark:text-gray-200 select-all">8600 XXXX XXXX XXXX</p>
          <p className="text-xs text-gray-400 mt-1">Miqdor: {plan.price[language]}</p>
        </div>
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 p-4">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider">Telegram orqali tasdiqlash</p>
          <a href="https://t.me/kontentbot_admin" target="_blank" rel="noreferrer"
            style={{ backgroundColor: colors.main }}
            className="inline-block text-white text-sm px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
            @kontentbot_admin
          </a>
          <p className="text-xs text-gray-400 mt-2">To'lov cheki + emailingizni yuboring. 1 soat ichida faollashtiriladi.</p>
        </div>
      </div>
      <button onClick={onDone}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
        Tushundim, davom etish
      </button>
    </div>
  );
}

function PlanStep({ language, colors, onDone }) {
  const [selected, setSelected] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const names = PLAN_NAME[language] || PLAN_NAME.uz;

  if (showPayment && selected) {
    return <PaymentModal plan={selected} language={language} colors={colors} onBack={() => setShowPayment(false)} onDone={onDone} />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold dark:text-white">Reja tanlang</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Istalgan vaqt o'zgartirish mumkin</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {PLANS.map(plan => (
          <button key={plan.id} onClick={() => setSelected(plan)}
            className={`relative text-left p-3.5 rounded-xl border-2 transition-all ${
              selected?.id === plan.id
                ? 'bg-gray-50 dark:bg-white/5'
                : `${plan.colorClass} hover:bg-gray-50 dark:hover:bg-white/5 bg-white dark:bg-gray-800/60`
            }`}
            style={selected?.id === plan.id ? { borderColor: colors.main } : {}}>
            {plan.popular && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap uppercase tracking-wider">
                Mashhur
              </span>
            )}
            <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">{names[plan.id]}</div>
            <div className="text-xs font-semibold mt-0.5" style={{ color: colors.main }}>{plan.price[language]}</div>
            <ul className="mt-2 space-y-0.5">
              {(plan.features[language] || plan.features.uz).map((f, i) => (
                <li key={i} className="text-[11px] text-gray-500 dark:text-gray-400 flex items-start gap-1">
                  <span className="text-emerald-500 flex-shrink-0">✓</span> {f}
                </li>
              ))}
            </ul>
            {selected?.id === plan.id && (
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: colors.main }}>
                <span className="text-white text-[9px]">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={onDone}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Bepul boshlash
        </button>
        {selected && selected.id !== 'free' ? (
          <button onClick={() => setShowPayment(true)}
            className="acc-btn flex-1 py-2.5 rounded-xl text-sm font-semibold shadow">
            To'lov →
          </button>
        ) : (
          <button onClick={onDone}
            className="acc-btn flex-1 py-2.5 rounded-xl text-sm font-semibold shadow">
            Boshlash →
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- Field component ----------
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-transparent transition-all acc-ring";

// ---------- Main Register ----------
export default function Register() {
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const { colors } = useColor();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name:'', last_name:'', phone:'', email:'', password:'', confirm:'' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingAuth, setPendingAuth] = useState(null);
  const [emailSug, setEmailSug] = useState('');

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));
  const strength = passStrength(form.password);
  const strengthLabel = (STRENGTH_LABEL[language] || STRENGTH_LABEL.uz)[strength] || '';

  const handleLastNameBlur = () => {
    if (form.name && form.last_name && !form.email) {
      const sug = (form.name.trim().toLowerCase() + '.' + form.last_name.trim().toLowerCase())
        .replace(/[^a-z0-9.]/g, '') + '@gmail.com';
      setEmailSug(sug);
    }
  };

  const genPassword = () => {
    const p = generateStrongPassword();
    setForm(f => ({ ...f, password: p, confirm: p }));
    setShowPass(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError(t('auth.passwordsMatch')); return; }
    if (form.password.length < 6) { setError(t('auth.passwordTooShort')); return; }
    // Telefon: faqat raqamlarni olib, 9-13 ta bo'lishini tekshir
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (form.phone && (phoneDigits.length < 9 || phoneDigits.length > 13)) {
      setError(t('auth.invalidPhone')); return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name:form.name, last_name:form.last_name, phone:form.phone, email:form.email, password:form.password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setPendingAuth({ token: data.data.token, user: data.data.user });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const finishRegistration = () => {
    if (pendingAuth) login(pendingAuth.token, pendingAuth.user);
    navigate('/');
  };

  if (pendingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{ backgroundColor: colors.main, opacity: 0.07 }}
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl" />
        </div>
        <div className="w-full max-w-lg relative">
          <div className="bg-white dark:bg-gray-900/90 dark:backdrop-blur-2xl border border-gray-200/80 dark:border-white/[0.07] rounded-2xl p-7 shadow-2xl">
            <PlanStep language={language} colors={colors} onDone={finishRegistration} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{ backgroundColor: colors.main, opacity: 0.07 }}
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl" />
        <div style={{ backgroundColor: colors.main, opacity: 0.04 }}
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-white dark:bg-gray-900/90 dark:backdrop-blur-2xl border border-gray-200/80 dark:border-white/[0.07] rounded-2xl p-7 shadow-2xl">
          <TopControls />

          <div className="text-center mb-6">
            <div style={{ backgroundColor: colors.main }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">KontentBot Pro</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{t('auth.registerTitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('auth.name')}>
                <input type="text" required className={inputCls} value={form.name} onChange={set('name')} />
              </Field>
              <Field label={t('auth.lastName')}>
                <input type="text" required className={inputCls} value={form.last_name}
                  onChange={set('last_name')} onBlur={handleLastNameBlur} />
              </Field>
            </div>

            <Field label={t('auth.phone')}>
              <input type="tel" required className={inputCls} placeholder="+998 90 123 45 67"
                value={form.phone} onChange={set('phone')} />
            </Field>

            <Field label={t('auth.email')}>
              <input type="email" required className={inputCls} placeholder="email@example.com"
                value={form.email} onChange={e => { setEmailSug(''); set('email')(e); }} />
              {emailSug && (
                <button type="button" onClick={() => { setForm(f => ({ ...f, email: emailSug })); setEmailSug(''); }}
                  className="mt-1 text-xs acc-text font-medium hover:opacity-75 transition-opacity">
                  → {emailSug}
                </button>
              )}
            </Field>

            <Field label={t('auth.password')}>
              <div className="flex items-center justify-between mb-1.5">
                <span />
                <button type="button" onClick={genPassword}
                  className="text-[10px] font-semibold acc-text uppercase tracking-wider hover:opacity-75 transition-opacity">
                  Kuchli parol yaratish
                </button>
              </div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required className={inputCls + ' pr-10'}
                  placeholder="min 6 belgi" value={form.password} onChange={set('password')} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  {showPass ? <EyeOn /> : <EyeOff />}
                </button>
              </div>
              {form.password && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                        i <= strength ? STRENGTH_COLOR[strength] : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    ))}
                  </div>
                  <p className={`text-[11px] font-medium ${
                    strength<=2 ? 'text-red-500' : strength<=3 ? 'text-yellow-500' : 'text-emerald-500'
                  }`}>{strengthLabel}</p>
                </div>
              )}
            </Field>

            <Field label={t('auth.confirmPassword')}>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} required
                  className={inputCls + ` pr-10 ${
                    form.confirm && form.confirm !== form.password
                      ? 'border-red-400 dark:border-red-500/50'
                      : form.confirm && form.confirm === form.password
                        ? 'border-emerald-400 dark:border-emerald-500/50'
                        : ''
                  }`}
                  placeholder="••••••" value={form.confirm} onChange={set('confirm')} />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  {showConfirm ? <EyeOn /> : <EyeOff />}
                </button>
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs text-red-500 mt-1">{t('auth.passwordsMatch')}</p>
              )}
            </Field>

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm px-4 py-2.5 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex items-start gap-2 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-xl px-3 py-2.5">
              <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('auth.privacyNotice')}</p>
            </div>

            <button type="submit" disabled={loading}
              className="acc-btn w-full font-semibold py-3 rounded-xl text-sm shadow-lg">
              {loading ? t('auth.registering') : t('auth.register')}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06] text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" className="font-semibold hover:opacity-75 transition-opacity"
                style={{ color: colors.main }}>
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
