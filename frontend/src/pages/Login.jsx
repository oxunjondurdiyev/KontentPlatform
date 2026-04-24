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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
  </svg>
);
const EyeOff = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
  </svg>
);

function TopControls() {
  const { mode, setMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { color, setColor } = useColor();

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-1.5">
        <div className="flex items-center bg-black/5 dark:bg-white/8 rounded-full p-0.5">
          {[['light','☀'],['dark','◑'],['system','⊙']].map(([k, i]) => (
            <button key={k} onClick={() => setMode(k)}
              className={`w-7 h-7 flex items-center justify-center rounded-full text-sm transition-all ${
                mode === k
                  ? 'bg-white dark:bg-gray-700 shadow text-gray-800 dark:text-white'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}>{i}</button>
          ))}
        </div>
        <div className="flex items-center bg-black/5 dark:bg-white/8 rounded-full p-0.5">
          {['uz', 'ru', 'en'].map(lng => (
            <button key={lng} onClick={() => setLanguage(lng)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all ${
                language === lng
                  ? 'bg-white dark:bg-gray-700 shadow text-gray-800 dark:text-white'
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
              color === s.id
                ? 'ring-2 ring-offset-1 dark:ring-offset-gray-900 ring-gray-500 scale-125'
                : 'scale-100 hover:scale-110 opacity-75 hover:opacity-100'
            }`} />
        ))}
      </div>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const { colors } = useColor();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      login(data.data.token, data.data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{ backgroundColor: colors.main, opacity: 0.07 }}
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl" />
        <div style={{ backgroundColor: colors.main, opacity: 0.04 }}
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Card */}
        <div className="bg-white dark:bg-gray-900/90 dark:backdrop-blur-2xl border border-gray-200/80 dark:border-white/[0.07] rounded-2xl p-7 shadow-2xl shadow-gray-200/60 dark:shadow-black/60">
          <TopControls />

          {/* Brand */}
          <div className="text-center mb-8">
            <div style={{ backgroundColor: colors.main }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">KontentBot Pro</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('auth.loginTitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-widest">
                {t('auth.email')}
              </label>
              <input type="email" required autoComplete="email"
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-transparent transition-all acc-ring"
                placeholder="email@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-widest">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required autoComplete="current-password"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-transparent transition-all acc-ring"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  {showPass ? <EyeOn /> : <EyeOff />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm px-4 py-2.5 rounded-xl">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="acc-btn w-full font-semibold py-3 rounded-xl text-sm shadow-lg mt-1">
              {loading ? t('auth.loggingIn') : t('auth.login')}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('auth.noAccount')}{' '}
                <Link to="/register" className="font-semibold hover:opacity-75 transition-opacity"
                  style={{ color: colors.main }}>
                  {t('auth.register')}
                </Link>
              </p>
              <Link to="/pricing"
                className="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
                {t('auth.pricesAndPlans')} →
              </Link>
            </div>
            {/* Admin separator */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
              <Link to="/admin-login"
                className="text-[10px] font-semibold uppercase tracking-widest text-gray-300 dark:text-gray-700 hover:text-gray-500 dark:hover:text-gray-500 transition-colors">
                SuperAdmin →
              </Link>
              <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
