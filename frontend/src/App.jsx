import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateContent from './pages/CreateContent';
import Schedule from './pages/Schedule';
import MediaLibrary from './pages/MediaLibrary';
import Settings from './pages/Settings';

const navItems = [
  { to: '/', label: '🏠 Bosh panel', exact: true },
  { to: '/create', label: '✍️ Yaratish' },
  { to: '/schedule', label: '📅 Jadval' },
  { to: '/media', label: '🖼️ Media' },
  { to: '/settings', label: '⚙️ Sozlamalar' }
];

export default function App() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-xl font-bold text-blue-400">🤖 KontentBot Pro</h1>
          <p className="text-xs text-gray-400 mt-1">AI Kontent Platformasi</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
          v1.0.0 · O'zbek AI Platform
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateContent />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/media" element={<MediaLibrary />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
