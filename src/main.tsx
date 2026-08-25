import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CreateMLCEngine, type MLCEngine } from '@mlc-ai/web-llm';
import './styles.css';

const MODEL = 'Llama-3.2-3B-Instruct-q4f16_1-MLC';
type Message = { role: 'user' | 'assistant'; content: string };

function App() {
  const engine = useRef<MLCEngine | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Ready to load Llama 3.2');
  const [progress, setProgress] = useState(0);

  useEffect(() => () => { engine.current?.unload(); }, []);

  async function loadModel() {
    if (engine.current) return engine.current;
    setStatus('Downloading Llama 3.2 to this device…');
    const loaded = await CreateMLCEngine(MODEL, {
      initProgressCallback: (p) => setProgress(Math.round(p.progress * 100)),
    });
    engine.current = loaded;
    setProgress(100);
    setStatus('Llama 3.2 is ready — running locally');
    return loaded;
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next); setInput(''); setLoading(true);
    try {
      const ai = await loadModel();
      const response = await ai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are MAAR AI, a helpful, clear and friendly study assistant.' },
          ...next,
        ],
        temperature: 0.4,
        max_tokens: 1024,
      });
      setMessages([...next, { role: 'assistant', content: response.choices[0]?.message?.content || 'No response.' }]);
    } catch (error) {
      setMessages([...next, { role: 'assistant', content: `MAAR AI could not start: ${error instanceof Error ? error.message : 'WebGPU or model loading failed.'}` }]);
      setStatus('Model could not load — this device/browser may not support WebGPU');
    } finally { setLoading(false); }
  }

  return <div className="app"><header><div className="logo">M</div><div><h1>MAAR AI</h1><p>Private AI running on your device</p></div><span className="status">● {status}</span></header><main><section className="hero"><div className="orb">M</div><h2>What can I help you learn?</h2><p>Llama 3.2 runs directly in your browser using WebGPU.</p>{progress > 0 && progress < 100 && <div className="progress"><div style={{width:`${progress}%`}}/></div>}</section><div className="messages">{messages.map((m,i)=><div key={i} className={`message ${m.role}`}><div className="bubble">{m.content}</div></div>)}{loading&&<div className="message assistant"><div className="bubble">MAAR AI is thinking…</div></div>}</div><div className="composer"><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void send()}}} placeholder="Ask MAAR AI anything…" rows={1}/><button onClick={()=>void send()} disabled={loading||!input.trim()}>↑</button></div><p className="model">WebLLM · Llama 3.2 · No OpenRouter API</p></main></div>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
