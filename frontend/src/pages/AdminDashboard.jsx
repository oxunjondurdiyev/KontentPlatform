import React, { useEffect, useState } from "react";
import { useAuth } from "../App";
import { useNavigate } from "react-router-dom";

const PLANS = [
  { id: "free",     label: "Bepul",  color: "bg-gray-100 text-gray-700" },
  { id: "starter",  label: "Starter", color: "bg-blue-100 text-blue-700" },
  { id: "pro",      label: "Pro",     color: "bg-purple-100 text-purple-700" },
  { id: "business", label: "Biznes",  color: "bg-yellow-100 text-yellow-700" }
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [testSteps, setTestSteps] = useState([]);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (user?.role !== "superadmin") { navigate("/"); return; }
    Promise.all([
      fetch("/api/admin/users").then(r => r.json()),
      fetch("/api/admin/stats").then(r => r.json())
    ]).then(([u, s]) => {
      if (u.success) setUsers(u.data);
      if (s.success) setStats(s.data);
    }).finally(() => setLoading(false));
  }, []);

  const updateUser = async (id, data) => {
    const res = await fetch("/api/admin/users/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const d = await res.json();
    if (d.success) setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const deleteUser = async (id) => {
    if (!confirm("Foydalanuvchini o'chirish?")) return;
    await fetch("/api/admin/users/" + id, { method: "DELETE" });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const testTelegram = async () => {
    setTesting(true); setTestResult(null); setTestSteps([]);
    const res = await fetch("/api/admin/test-platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: "telegram" })
    });
    const d = await res.json();
    setTestResult(d.results);
    setTestSteps(d.steps || []);
    setTesting(false);
  };

  if (loading) return <div className="p-6 text-gray-500">Yuklanmoqda...</div>;

  return (
    <div className="p-6 max-w-6xl">
      <h2 className="text-2xl font-bold mb-6">👑 Admin Panel</h2>

      {/* Statistika */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Jami foydalanuvchi", value: stats.total_users || 0 },
          { label: "Faol", value: stats.active_users || 0 },
          { label: "Obunachi", value: stats.paid_users || 0 },
          { label: "Jami kontent", value: stats.total_contents || 0 },
          { label: "Bu oy", value: stats.this_month || 0 }
        ].map(s => (
          <div key={s.label} className="card text-center">
            <div className="text-2xl font-bold text-blue-600">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Platform test */}
      <div className="card mb-6">
        <h3 className="font-semibold mb-3">📡 Telegram Diagnostika</h3>
        <button onClick={testTelegram} disabled={testing} className="btn-primary px-4 py-2 text-sm">
          {testing ? "⏳ Tekshirilmoqda..." : "✈️ Telegram Test"}
        </button>

        {testSteps.length > 0 && (
          <div className="mt-3 space-y-1">
            {testSteps.map((s, i) => (
              <div key={i} className="text-sm text-green-700 bg-green-50 px-3 py-1 rounded">{s}</div>
            ))}
          </div>
        )}

        {testResult && (
          <div className="mt-2 space-y-1">
            {Object.entries(testResult).map(([p, r]) => (
              <div key={p} className={"text-sm px-3 py-2 rounded " + (r.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                {r.success
                  ? "✅ Telegram muvaffaqiyatli ulandi! Kanalga test xabar yuborildi."
                  : "❌ Xato: " + r.error
                }
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 text-xs text-gray-400 space-y-0.5">
          <p>Muammo bo'lsa tekshiring:</p>
          <p>1. Railway Variables → <strong>TELEGRAM_BOT_TOKEN</strong> to'g'ri kiritilganmi?</p>
          <p>2. Railway Variables → <strong>TELEGRAM_CHANNEL_ID</strong>: <code>@username</code> yoki <code>-1001234567890</code></p>
          <p>3. Bot kanalga <strong>Administrator</strong> qilib qo'shilganmi?</p>
        </div>
      </div>

      {/* Foydalanuvchilar */}
      <div className="card">
        <h3 className="font-semibold mb-4">👥 Foydalanuvchilar ({users.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b text-xs">
                <th className="pb-2 pr-3">Ism Familya</th>
                <th className="pb-2 pr-3">Email / Telefon</th>
                <th className="pb-2 pr-3">Passport</th>
                <th className="pb-2 pr-3">Reja</th>
                <th className="pb-2 pr-3">Status</th>
                <th className="pb-2 pr-3">Obuna</th>
                <th className="pb-2">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => {
                const planObj = PLANS.find(p => p.id === u.plan) || PLANS[0];
                return (
                  <tr key={u.id}>
                    <td className="py-2 pr-3">
                      <div className="font-medium">{u.name} {u.last_name}</div>
                      <div className="text-xs text-gray-400">ID: {u.id}</div>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="text-xs">{u.email}</div>
                      <div className="text-xs text-gray-400">{u.phone}</div>
                    </td>
                    <td className="py-2 pr-3">
                      <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{u.passport || "-"}</span>
                    </td>
                    <td className="py-2 pr-3">
                      <select value={u.plan} onChange={e => updateUser(u.id, { plan: e.target.value })}
                        className={"text-xs px-2 py-1 rounded-full border-0 font-medium " + planObj.color}>
                        {PLANS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <button onClick={() => updateUser(u.id, { is_active: u.is_active ? 0 : 1 })}
                        className={"text-xs px-2 py-1 rounded-full " + (u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {u.is_active ? "✅ Faol" : "❌ Bloklangan"}
                      </button>
                    </td>
                    <td className="py-2 pr-3">
                      <input type="date" className="text-xs border rounded px-1 py-0.5"
                        value={u.subscription_expires ? u.subscription_expires.slice(0,10) : ""}
                        onChange={e => updateUser(u.id, { subscription_expires: e.target.value })} />
                    </td>
                    <td className="py-2">
                      <button onClick={() => deleteUser(u.id)} className="text-xs text-red-500 hover:text-red-700">🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
