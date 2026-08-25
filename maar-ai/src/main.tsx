import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const MODEL = 'nvidia/nemotron-3-ultra-550b-a55b:free';
type Message = { role: 'user' | 'assistant'; content: string };

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}` },
        body: JSON.stringify({ model: MODEL, messages: next, temperature: 0.3 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || 'OpenRouter request failed.');
      setMessages([...next, { role: 'assistant', content: data.choices?.[0]?.message?.content || 'No response.' }]);
    } catch (error) {
      setMessages([...next, { role: 'assistant', content: `Sorry — ${error instanceof Error ? error.message : 'Something went wrong.'}` }]);
    } finally { setLoading(false); }
  }

  return <div className="app">
    <header><div className="logo">M</div><div><h1>MAAR AI</h1><p>Simple AI for students</p></div><span className="status">● Online</span></header>
    <main>
      <section className="hero"><div className="orb">M</div><h2>What can I help you learn?</h2><p>Ask a question and MAAR AI will help you understand it.</p></section>
      <div className="messages">
        {messages.map((m, i) => <div key={i} className={`message ${m.role}`}><div className="bubble">{m.content}</div></div>)}
        {loading && <div className="message assistant"><div className="bubble">MAAR AI is thinking…</div></div>}
      </div>
      <div className="composer"><textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }} placeholder="Ask MAAR AI anything…" rows={1} /><button onClick={() => void send()} disabled={loading || !input.trim()}>↑</button></div>
      <p className="model">Powered by OpenRouter · {MODEL}</p>
    </main>
  </div>;
}

import { useState } from 'react';
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
