export const MAAR_AI_MODEL = 'nvidia/nemotron-3-ultra-550b-a55b:free';

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function askMaarAI(messages: ChatMessage[]): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'MAAR AI request failed.');
  return data.content;
}
