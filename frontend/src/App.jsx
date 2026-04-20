import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateContent from './pages/CreateContent';
import Schedule from './pages/Schedule';
import MediaLibrary from './pages/MediaLibrary';
import Settings from './pages/Settings';
import AutonomousSettings from './pages/AutonomousSettings';

const navItems = [
  { to: '/', label: '\ud83c\udfe0 Bosh panel', exact: true },
  { to: '/create', label: '\u270d\ufe0f Yaratish' },
  { to: '/schedule', label: '\ud83d\udcc5 Jadval' },
  { to: '/media', label: '\ud83d\uddbc\ufe0f Media' },
  { to: '/autonomous', label: '\ud83e\udd16 Avtonom Agent' },
  { to: '/settings', label: '\u2699\ufe0f Sozlamalar' }
];

export default function App() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-xl font-bold text-blue-400">\ud83e\udd16 KontentBot Pro</h1>
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
          v1.0.0 \u00b7 O'zbek AI Platform
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateContent />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/media" element={<MediaLibrary />} />
          <Route path="/autonomous" element={<AutonomousSettings />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
