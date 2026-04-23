import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateContent from './pages/CreateContent';
import Schedule from './pages/Schedule';
import MediaLibrary from './pages/MediaLibrary';
import Settings from './pages/Settings';
import AutonomousSettings from './pages/AutonomousSettings';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';
import AdminDashboard from './pages/AdminDashboard';
import { useTheme, useLanguage } from './contexts/AppContexts';

export const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const token = localStorage.getItem('kb_token');
    if (!token) { setLoading(false); return; }
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.success) setUser(d.data); else localStorage.removeItem('kb_token'); })
      .catch(() => localStorage.removeItem('kb_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('kb_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('kb_token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="text-4xl mb-3">🤖</div>
          <p className="text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/*" element={user ? <MainLayout /> : <Navigate to="/login" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
}

function MainLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: t('nav.dashboard'), exact: true },
    { to: '/create', label: t('nav.create') },
    { to: '/schedule', label: t('nav.schedule') },
    { to: '/media', label: t('nav.media') },
    { to: '/autonomous', label: t('nav.autonomous') },
    { to: '/settings', label: t('nav.settings') },
    ...(user?.role === 'superadmin' ? [{ to: '/admin', label: t('nav.admin') }] : [])
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  const PLAN_COLORS = { free: 'text-gray-400', starter: 'text-blue-400', pro: 'text-purple-400', business: 'text-yellow-400' };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      <aside className="w-60 bg-gray-900 dark:bg-black text-white flex flex-col">
        <div className="p-5 border-b border-gray-700 dark:border-gray-800">
          <h1 className="text-xl font-bold text-blue-400">🤖 KontentBot Pro</h1>
          <p className="text-xs text-gray-400 mt-1">{t('nav.subtitle')}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Theme + Language toggle */}
        <div className="px-4 py-3 border-t border-gray-800 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-400">{t('theme.toggle')}</span>
            <button onClick={toggleTheme}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-800 hover:bg-gray-700 text-xs transition-colors"
              title={theme === 'dark' ? t('theme.light') : t('theme.dark')}>
              {theme === 'dark' ? '☀️' : '🌙'}
              <span className="ml-0.5">{theme === 'dark' ? t('theme.light') : t('theme.dark')}</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-400">{t('language.label')}</span>
            <div className="flex gap-1">
              {['uz', 'ru', 'en'].map(lng => (
                <button key={lng} onClick={() => setLanguage(lng)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    language === lng ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}>
                  {lng.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 dark:border-gray-800">
          <div className="text-sm text-gray-200 font-medium truncate">{user?.name || user?.email}</div>
          <div className={`text-xs mt-0.5 ${PLAN_COLORS[user?.plan] || 'text-gray-400'}`}>
            {t('plan.' + (user?.plan || 'free'))} plan
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => navigate('/pricing')}
              className="text-xs text-blue-400 hover:text-blue-300">
              ↑ {t('common.upgrade')}
            </button>
            <span className="text-gray-600">|</span>
            <button onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-red-400">
              {t('common.logout')}
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 dark:text-gray-100">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateContent />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/media" element={<MediaLibrary />} />
          <Route path="/autonomous" element={<AutonomousSettings />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  );
}
