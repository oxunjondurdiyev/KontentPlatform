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
import SuperAdmin from './pages/SuperAdmin';
import AdminLogin from './pages/AdminLogin';
import { useTheme, useLanguage, useColor } from './contexts/AppContexts';

export const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
  const logout = () => { localStorage.removeItem('kb_token'); setUser(null); };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
      <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 rounded-full animate-spin"
        style={{ borderTopColor: 'var(--acc-main)' }} />
    </div>
  );

  // SuperAdmin gets their own isolated panel — never goes to the main content app
  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Routes>
        {/* Login/Register — har doim ochiq. Faqat kirgan oddiy foydalanuvchi redirect qilinadi */}
        <Route path="/login"
          element={user && !isSuperAdmin ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register"
          element={user && !isSuperAdmin ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* Admin login — faqat login qilmagan foydalanuvchilarga */}
        <Route path="/admin-login"
          element={isSuperAdmin ? <Navigate to="/superadmin" replace /> : <AdminLogin />} />

        {/* SuperAdmin panel — completely separate, no main layout */}
        <Route path="/superadmin"
          element={isSuperAdmin ? <SuperAdmin /> : user ? <Navigate to="/" replace /> : <Navigate to="/admin-login" replace />} />

        {/* Regular content app — superadmin is redirected away */}
        <Route path="/*"
          element={
            !user ? <Navigate to="/login" replace /> :
            isSuperAdmin ? <Navigate to="/superadmin" replace /> :
            <MainLayout />
          } />
      </Routes>
    </AuthContext.Provider>
  );
}

// ─── Sidebar theme+lang controls ────────────────────────────────────────────
function ThemeLangBar() {
  const { mode, setMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { color, setColor, colors } = useColor();

  const SWATCHES = [
    { id:'blue',    hex:'#2563eb' },
    { id:'violet',  hex:'#7c3aed' },
    { id:'emerald', hex:'#059669' },
    { id:'rose',    hex:'#e11d48' },
    { id:'amber',   hex:'#d97706' },
  ];

  return (
    <div className="px-3 py-2 border-b border-gray-800 space-y-2">
      <div className="flex items-center justify-between">
        {/* Theme */}
        <div className="flex items-center bg-gray-800 rounded-full p-0.5 gap-0">
          {[['light','☀'],['dark','◑'],['system','⊙']].map(([k, i]) => (
            <button key={k} onClick={() => setMode(k)}
              className={`w-7 h-7 flex items-center justify-center rounded-full text-sm transition-all ${
                mode === k ? 'text-white shadow' : 'text-gray-500 hover:text-white'
              }`}
              style={mode === k ? { backgroundColor: colors.main } : {}}>
              {i}
            </button>
          ))}
        </div>
        {/* Language */}
        <div className="flex items-center bg-gray-800 rounded-full p-0.5 gap-0">
          {['uz', 'ru', 'en'].map(lng => (
            <button key={lng} onClick={() => setLanguage(lng)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all ${
                language === lng ? 'text-white shadow' : 'text-gray-500 hover:text-white'
              }`}
              style={language === lng ? { backgroundColor: colors.main } : {}}>
              {lng.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      {/* Color swatches */}
      <div className="flex items-center gap-1.5 px-0.5">
        {SWATCHES.map(s => (
          <button key={s.id} onClick={() => setColor(s.id)} title={s.id}
            style={{ backgroundColor: s.hex }}
            className={`w-4 h-4 rounded-full transition-all flex-shrink-0 ${
              color === s.id ? 'ring-2 ring-offset-1 ring-offset-gray-900 ring-white scale-125' : 'scale-100 opacity-60 hover:opacity-100 hover:scale-110'
            }`} />
        ))}
        <span className="text-[10px] text-gray-600 ml-1">Mavzu</span>
      </div>
    </div>
  );
}

export { ThemeLangBar };

// ─── Main layout (regular users only) ───────────────────────────────────────
const PLAN_COLORS = {
  free:     'text-gray-400',
  starter:  'text-blue-400',
  pro:      'text-purple-400',
  business: 'text-yellow-400',
};

function MainLayout() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { colors } = useColor();
  const navigate = useNavigate();

  const navItems = [
    { to: '/',          label: t('nav.dashboard'),  exact: true },
    { to: '/create',    label: t('nav.create') },
    { to: '/schedule',  label: t('nav.schedule') },
    { to: '/media',     label: t('nav.media') },
    { to: '/autonomous',label: t('nav.autonomous') },
    { to: '/settings',  label: t('nav.settings') },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      <aside className="w-56 bg-gray-900 dark:bg-black text-white flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
          <div style={{ backgroundColor: colors.main }}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-2"/>
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">KontentBot Pro</h1>
            <p className="text-[10px] text-gray-500">{t('nav.subtitle')}</p>
          </div>
        </div>

        <ThemeLangBar />

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              style={({ isActive }) => isActive ? { backgroundColor: colors.main } : {}}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-gray-800">
          <div className="text-sm text-gray-200 font-semibold truncate">{user?.name || user?.email}</div>
          <div className={`text-xs mt-0.5 ${PLAN_COLORS[user?.plan] || 'text-gray-400'}`}>
            {t('plan.' + (user?.plan || 'free'))} plan
          </div>
          <div className="flex gap-3 mt-2">
            <button onClick={() => navigate('/pricing')}
              className="text-xs font-medium hover:opacity-75 transition-opacity"
              style={{ color: colors.light }}>
              ↑ {t('common.upgrade')}
            </button>
            <button onClick={() => { logout(); navigate('/login'); }}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors">
              {t('common.logout')}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 dark:text-gray-100">
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/create"    element={<CreateContent />} />
          <Route path="/schedule"  element={<Schedule />} />
          <Route path="/media"     element={<MediaLibrary />} />
          <Route path="/autonomous"element={<AutonomousSettings />} />
          <Route path="/settings"  element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
