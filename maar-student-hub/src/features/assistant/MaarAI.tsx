import { FormEvent, useState } from 'react';

const MODEL = 'nvidia/nemotron-3-ultra-550b-a55b:free';

type Message = { role: 'user' | 'assistant'; content: string };

export function MaarAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'MAAR AI could not respond.');

      setMessages((current) => [...current, { role: 'assistant', content: data.content }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      setMessages((current) => [...current, { role: 'assistant', content: `Sorry — ${message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-5">
        <p className="text-sm font-medium text-slate-500">MAAR Study Hub</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">MAAR AI</h1>
        <p className="mt-1 text-sm text-slate-500">A simple student AI powered by OpenRouter.</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
        {messages.length === 0 && <div className="py-16 text-center text-slate-500">Ask MAAR AI a question about your studies.</div>}
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-4 py-3 text-sm ${message.role === 'user' ? 'ml-auto bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-white text-slate-800 shadow-sm dark:bg-slate-800 dark:text-slate-100'}`}>
            {message.content}
          </div>
        ))}
        {loading && <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm dark:bg-slate-800">MAAR AI is thinking…</div>}
      </div>

      <form onSubmit={sendMessage} className="mt-4 flex gap-2">
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask MAAR AI…" disabled={loading} className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm outline-none focus:border-slate-500 dark:border-slate-700" />
        <button type="submit" disabled={loading || !input.trim()} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-900">Send</button>
      </form>
      <p className="mt-2 text-xs text-slate-400">Model: {MODEL}</p>
    </section>
  );
}
