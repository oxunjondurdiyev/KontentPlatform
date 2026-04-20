import React, { useEffect, useRef, useState } from 'react';

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Salom! Men KontentBot Pro AI yordamchisiman. Kontent yaratishda yordam bera olaman. Nima haqida yozmoqchisiz?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch('/api/content/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.data?.reply || 'Xato yuz berdi' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Ulanishda xato yuz berdi' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
              m.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-gray-100 text-gray-800 rounded-tl-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 rounded-2xl rounded-tl-sm px-4 py-2 text-sm">
              ⏳ Yozmoqda...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-gray-200 flex gap-2">
        <input
          className="input flex-1 text-sm"
          placeholder="Xabar yozing..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={loading}
        />
        <button onClick={send} disabled={loading || !input.trim()} className="btn-primary px-4">
          Yuborish
        </button>
      </div>
    </div>
  );
}
