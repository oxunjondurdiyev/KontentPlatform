import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useLanguage, useTheme } from '../contexts/AppContexts';

export default function Login() {
  const { login } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 dark:from-black dark:to-gray-900 flex items-center justify-center p-4">
      {/* Top-right controls */}
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
          className="bg-white/10 backdrop-blur hover:bg-white/20 text-white text-base px-3 py-1.5 rounded-full transition"
          title={t('theme.toggle')}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-8 transition-colors">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🤖</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">KontentBot Pro</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('auth.loginTitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.email')}</label>
            <input type="email" required
              className="input"
              placeholder="email@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.password')}</label>
            <input type="password" required
              className="input"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 dark:bg-red-900/30 dark:text-red-300 px-3 py-2 rounded">{error}</p>}

          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3 text-base">
            {loading ? '⏳ ' + t('auth.loggingIn') : '🔐 ' + t('auth.login')}
          </button>
        </form>

        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">{t('auth.register')}</Link>
          </p>
          <Link to="/pricing" className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">{t('auth.pricesAndPlans')} →</Link>
        </div>
      </div>
    </div>
  );
}
