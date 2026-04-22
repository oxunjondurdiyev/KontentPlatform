import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';

const PLANS = [
  {
    id: 'free', name: 'Bepul', price: 0, currency: '',
    features: ['5 ta kontent/oy', 'Instagram + Telegram', 'AI matn yaratish', 'Pollinations rasmlar'],
    color: 'border-gray-200', btnClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  },
  {
    id: 'starter', name: 'Starter', price: 99000, currency: "so'm/oy",
    features: ['30 ta kontent/oy', 'Barcha platformalar', 'AI matn + rasm', 'Jadval rejasi'],
    color: 'border-blue-400', btnClass: 'bg-blue-600 text-white hover:bg-blue-700', popular: false
  },
  {
    id: 'pro', name: 'Pro', price: 249000, currency: "so'm/oy",
    features: ['100 ta kontent/oy', 'Barcha platformalar', 'Avtonom Agent', 'Google Imagen rasmlar', 'Prioritet yordam'],
    color: 'border-purple-500', btnClass: 'bg-purple-600 text-white hover:bg-purple-700', popular: true
  },
  {
    id: 'business', name: 'Biznes', price: 599000, currency: "so'm/oy",
    features: ['Cheksiz kontent', 'Barcha platformalar', 'Avtonom Agent', 'API kirish', 'Maxsus yordam'],
    color: 'border-yellow-400', btnClass: 'bg-yellow-500 text-white hover:bg-yellow-600'
  }
];

export default function Pricing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">🤖 KontentBot Pro</h1>
          <p className="text-blue-200 text-lg">O'zbekiston uchun AI kontent platformasi</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {PLANS.map(plan => (
            <div key={plan.id}
              className={`bg-white rounded-2xl p-6 border-2 ${plan.color} relative flex flex-col`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  ⭐ Mashhur
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-800 mb-1">{plan.name}</h3>
              <div className="mb-4">
                {plan.price === 0
                  ? <span className="text-3xl font-bold text-gray-800">Bepul</span>
                  : <><span className="text-2xl font-bold text-gray-800">{plan.price.toLocaleString()}</span>
                     <span className="text-gray-500 text-sm ml-1">{plan.currency}</span></>
                }
              </div>
              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              {user?.plan === plan.id
                ? <div className="w-full py-2 text-center text-sm font-medium text-green-700 bg-green-50 rounded-lg">✅ Joriy rejangiz</div>
                : plan.id === 'free'
                  ? <Link to="/register" className={`block w-full py-2 text-center text-sm font-medium rounded-lg ${plan.btnClass}`}>Boshlash</Link>
                  : <a href="#payment" className={`block w-full py-2 text-center text-sm font-medium rounded-lg ${plan.btnClass}`}>To'lash</a>
              }
            </div>
          ))}
        </div>

        {/* To'lov ma'lumotlari */}
        <div id="payment" className="bg-white/10 backdrop-blur rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">💳 To'lov usullari</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-xl p-5">
              <h3 className="font-bold mb-3">📱 Payme</h3>
              <p className="text-sm text-blue-200">Payme orqali to'lash uchun quyidagi kartaga o'tkazing:</p>
              <p className="font-mono mt-2 text-sm bg-white/10 px-3 py-2 rounded">8600 XXXX XXXX XXXX</p>
              <p className="text-xs text-blue-300 mt-1">Alisher N.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-5">
              <h3 className="font-bold mb-3">💳 Click</h3>
              <p className="text-sm text-blue-200">Click orqali to'lash uchun:</p>
              <p className="font-mono mt-2 text-sm bg-white/10 px-3 py-2 rounded">9860 XXXX XXXX XXXX</p>
              <p className="text-xs text-blue-300 mt-1">Alisher N.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-5">
              <h3 className="font-bold mb-3">📩 Telegram orqali xabar</h3>
              <p className="text-sm text-blue-200">To'lovdan keyin chek + emailingizni yuboring:</p>
              <a href="https://t.me/kontentbot_admin" target="_blank" rel="noreferrer"
                className="inline-block mt-2 bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg">
                @kontentbot_admin
              </a>
            </div>
          </div>
          <p className="text-center text-blue-300 text-sm mt-6">
            To'lov tasdiqlangandan so'ng 1 soat ichida hisobingiz faollashtiriladi.
          </p>
        </div>

        <div className="text-center mt-8">
          {user
            ? <Link to="/" className="text-blue-300 hover:text-white">← Bosh sahifaga qaytish</Link>
            : <Link to="/login" className="text-blue-300 hover:text-white">← Kirish</Link>
          }
        </div>
      </div>
    </div>
  );
}
