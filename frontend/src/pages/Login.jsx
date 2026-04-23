import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useLanguage, useTheme } from '../contexts/AppContexts';

function TopBar() {
  const { mode, setMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  return (
    <div className="flex items-center justify-between mb-6">
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

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
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
        body: JSON.stringify(form)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 dark:from-black dark:via-gray-950 dark:to-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-7">
          <TopBar />

          <div className="text-center mb-7">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
              🤖
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">KontentBot Pro</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('auth.loginTitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                {t('auth.email')}
              </label>
              <input type="email" required autoComplete="email"
                className="input text-sm"
                placeholder="email@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                {t('auth.password')}
              </label>
              <input type="password" required autoComplete="current-password"
                className="input text-sm"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-2.5 rounded-lg">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm shadow">
              {loading ? t('auth.loggingIn') : t('auth.login')}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 text-center space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                {t('auth.register')}
              </Link>
            </p>
            <Link to="/pricing" className="text-xs text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors">
              {t('auth.pricesAndPlans')} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
