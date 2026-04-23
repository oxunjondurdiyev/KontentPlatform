import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useLanguage, useTheme } from '../contexts/AppContexts';

export default function Register() {
  const { login } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', last_name: '', phone: '', passport: '',
    email: '', password: '', confirm: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({
          name: form.name,
          last_name: form.last_name,
          phone: form.phone,
          passport: form.passport,
          email: form.email,
          password: form.password
        })
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
          className="bg-white/10 backdrop-blur hover:bg-white/20 text-white text-base px-3 py-1.5 rounded-full transition">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-8 transition-colors">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🤖</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">KontentBot Pro</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('auth.registerTitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{t('auth.name')} *</label>
              <input type="text" required className="input text-sm" value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{t('auth.lastName')} *</label>
              <input type="text" required className="input text-sm" value={form.last_name} onChange={set('last_name')} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{t('auth.phone')} *</label>
            <input type="tel" required className="input text-sm" placeholder="+998901234567"
              value={form.phone} onChange={set('phone')} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{t('auth.passport')} *</label>
            <input type="text" required className="input text-sm" placeholder="AA1234567"
              value={form.passport} onChange={set('passport')} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{t('auth.email')} *</label>
            <input type="email" required className="input text-sm" placeholder="email@example.com"
              value={form.email} onChange={set('email')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{t('auth.password')} *</label>
              <input type="password" required className="input text-sm"
                value={form.password} onChange={set('password')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{t('auth.confirmPassword')} *</label>
              <input type="password" required className="input text-sm"
                value={form.confirm} onChange={set('confirm')} />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 dark:bg-red-900/30 dark:text-red-300 px-3 py-2 rounded">{error}</p>}

          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg px-3 py-2 text-xs text-blue-700 dark:text-blue-300">
            🔒 {t('auth.privacyNotice')}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm">
            {loading ? '⏳ ' + t('auth.registering') : '✅ ' + t('auth.register')}
          </button>
        </form>

        <div className="text-center mt-4 space-y-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">{t('auth.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
