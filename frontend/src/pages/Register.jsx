import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", last_name: "", phone: "", passport: "",
    email: "", password: "", confirm: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Parollar mos emas"); return; }
    if (form.password.length < 6) { setError("Parol kamida 6 belgi"); return; }
    if (!form.phone.match(/^[+]?[0-9]{9,13}$/)) { setError("Telefon raqam noto'g'ri"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🤖</div>
          <h1 className="text-2xl font-bold text-gray-800">KontentBot Pro</h1>
          <p className="text-gray-500 text-sm mt-1">Yangi hisob yaratish</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ism *</label>
              <input type="text" required className="input text-sm" placeholder="Ismingiz"
                value={form.name} onChange={set("name")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Familya *</label>
              <input type="text" required className="input text-sm" placeholder="Familyangiz"
                value={form.last_name} onChange={set("last_name")} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Telefon raqam *</label>
            <input type="tel" required className="input text-sm" placeholder="+998901234567"
              value={form.phone} onChange={set("phone")} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Passport seriya va raqam *</label>
            <input type="text" required className="input text-sm" placeholder="AA1234567"
              value={form.passport} onChange={set("passport")} />
            <p className="text-xs text-gray-400 mt-0.5">Masalan: AA1234567</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
            <input type="email" required className="input text-sm" placeholder="email@example.com"
              value={form.email} onChange={set("email")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Parol *</label>
              <input type="password" required className="input text-sm" placeholder="Kamida 6 belgi"
                value={form.password} onChange={set("password")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tasdiqlash *</label>
              <input type="password" required className="input text-sm" placeholder="Qaytaring"
                value={form.confirm} onChange={set("confirm")} />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded">{error}</p>}

          <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700">
            🔒 Ma'lumotlaringiz xavfsiz saqlanadi va uchinchi shaxslarga berilmaydi.
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm">
            {loading ? "⏳ Ro'yxatdan o'tilmoqda..." : "✅ Ro'yxatdan o'tish"}
          </button>
        </form>

        <div className="text-center mt-4 space-y-1">
          <p className="text-sm text-gray-500">
            Hisob bormi?{" "}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">Kirish</Link>
          </p>
          <Link to="/pricing" className="text-xs text-gray-400 hover:text-gray-600">
            Bepul plan bilan boshlang →
          </Link>
        </div>
      </div>
    </div>
  );
}
