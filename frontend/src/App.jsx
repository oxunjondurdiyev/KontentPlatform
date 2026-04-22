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

  const logout = () => {
    localStorage.removeItem('kb_token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-3">🤖</div>
          <p className="text-gray-500">Yuklanmoqda...</p>
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
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: '🏠 Bosh panel', exact: true },
    { to: '/create', label: '✍️ Yaratish' },
    { to: '/schedule', label: '📅 Jadval' },
    { to: '/media', label: '🖼️ Media' },
    { to: '/autonomous', label: '🤖 Avtonom Agent' },
    { to: '/settings', label: '⚙️ Sozlamalar' },
    ...(user?.role === 'superadmin' ? [{ to: '/admin', label: '👑 Admin Panel' }] : [])
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  const PLAN_COLORS = { free: 'text-gray-400', starter: 'text-blue-400', pro: 'text-purple-400', business: 'text-yellow-400' };
  const PLAN_LABELS = { free: 'Bepul', starter: 'Starter', pro: 'Pro', business: 'Biznes' };

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-gray-900 text-white flex flex-col">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-xl font-bold text-blue-400">🤖 KontentBot Pro</h1>
          <p className="text-xs text-gray-400 mt-1">AI Kontent Platformasi</p>
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
        <div className="p-4 border-t border-gray-700">
          <div className="text-sm text-gray-200 font-medium truncate">{user?.name || user?.email}</div>
          <div className={`text-xs mt-0.5 ${PLAN_COLORS[user?.plan] || 'text-gray-400'}`}>
            {PLAN_LABELS[user?.plan] || 'Bepul'} plan
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => navigate('/pricing')}
              className="text-xs text-blue-400 hover:text-blue-300">
              ↑ Yangilash
            </button>
            <span className="text-gray-600">|</span>
            <button onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-red-400">
              Chiqish
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50">
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
