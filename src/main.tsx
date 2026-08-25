import { StrictMode, useEffect, useRef, useState } from 'react';
import { CreateMLCEngine, type MLCEngine } from '@mlc-ai/web-llm';
import { createRoot } from 'react-dom/client';
import './styles.css';

const MODEL = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';
const MAX_HISTORY = 6;
const MAX_TOKENS = 192;
const THINK_TIME_MS = 3000;
type Message = { role: 'user' | 'assistant'; content: string };

const QUICK_ANSWERS: Array<[RegExp, string]> = [
  [/^(hi|hello|hey)\b/i, 'Hi! I’m MAAR AI. What would you like to learn?'],
  [/what is (photosynthesis)/i, 'Photosynthesis is the process plants use to turn light energy, water and carbon dioxide into glucose, releasing oxygen.'],
  [/what is (mitosis)/i, 'Mitosis is cell division that produces two genetically similar daughter cells.'],
  [/what is (osmosis)/i, 'Osmosis is the movement of water through a partially permeable membrane from a more dilute solution to a more concentrated solution.'],
  [/what is (profit)/i, 'Profit is the money left after costs are subtracted from revenue: profit = revenue − costs.'],
  [/what is (revenue)/i, 'Revenue is the total income a business receives from selling goods or services before costs are deducted.'],
  [/what is a (noun)/i, 'A noun is a word used to name a person, place, thing or idea.'],
  [/what is a (verb)/i, 'A verb is a word that describes an action, event or state.'],
  [/how do i (study|revise)/i, 'Try active recall: study a small topic, close your notes, explain it from memory, then check what you missed.'],
];
function quickAnswer(text: string) { for (const [pattern, answer] of QUICK_ANSWERS) if (pattern.test(text)) return answer; return null; }

function App() {
  const engine = useRef<MLCEngine | null>(null);
  const [messages, setMessages] = useState<Message[]>([]), [input, setInput] = useState(''), [loading, setLoading] = useState(false), [status, setStatus] = useState('Ready — low-GPU mode'), [progress, setProgress] = useState(0);
  useEffect(() => () => { void engine.current?.unload(); }, []);
  async function loadModel() {
    if (engine.current) return engine.current;
    setStatus('Loading lightweight Llama 3.2…');
    const loaded = await CreateMLCEngine(MODEL, { initProgressCallback: p => setProgress(Math.round(p.progress * 100)) });
    engine.current = loaded; setStatus('Ready — Llama 3.2 1B running locally'); return loaded;
  }
  async function send() {
    const text = input.trim(); if (!text || loading) return;
    const next = [...messages, { role: 'user' as const, content: text }]; setMessages(next); setInput('');
    const instant = quickAnswer(text); if (instant) { setMessages([...next, { role: 'assistant', content: instant }]); return; }
    setLoading(true);
    try {
      const ai = await loadModel();
      const response = await ai.chat.completions.create({ messages: [{ role: 'system', content: 'You are MAAR AI, a fast student study assistant. Answer clearly and briefly. Give the key answer first. Do not over-explain unless asked.' }, ...next.slice(-MAX_HISTORY)], temperature: 0.2, max_tokens: MAX_TOKENS });
      setMessages([...next, { role: 'assistant', content: response.choices[0]?.message?.content || 'No response.' }]);
    } catch (error) {
      setMessages([...next, { role: 'assistant', content: `MAAR AI could not respond: ${error instanceof Error ? error.message : 'WebGPU/model loading failed.'}` }]);
      setStatus('WebGPU/model loading problem');
    } finally { setLoading(false); }
  }
  return <div className="app"><header><div className="logo">M</div><div><h1>MAAR AI</h1><p>Fast private AI for students</p></div><span className="status">● {status}</span></header><main><section className="hero"><div className="orb">M</div><h2>What can I help you learn?</h2><p>Lightweight Llama 3.2 runs locally on your device.</p>{progress > 0 && progress < 100 && <div className="progress"><div style={{ width: `${progress}%` }}/></div>}</section><div className="messages">{messages.map((m,i)=><div key={i} className={`message ${m.role}`}><div className="bubble">{m.content}</div></div>)}{loading&&<div className="message assistant"><div className="bubble">Thinking…</div></div>}</div><div className="composer"><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void send()}}} placeholder="Ask MAAR AI anything…" rows={1}/><button onClick={()=>void send()} disabled={loading||!input.trim()}>↑</button></div><p className="model">WebLLM · Llama 3.2 1B · local · lightweight mode</p></main></div>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
