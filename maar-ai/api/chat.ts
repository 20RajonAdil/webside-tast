import type { IncomingMessage, ServerResponse } from 'node:http';

const MODEL = 'nvidia/nemotron-3-ultra-550b-a55b:free';

export default async function handler(req: IncomingMessage & { body?: { messages?: unknown } }, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'OPENROUTER_API_KEY is not configured.' }));
    return;
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'X-Title': 'MAAR AI' },
      body: JSON.stringify({ model: MODEL, messages: req.body?.messages ?? [], temperature: 0.3 }),
    });
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
    res.statusCode = response.status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response.ok ? { content: data.choices?.[0]?.message?.content ?? '' } : { error: data.error?.message ?? 'OpenRouter request failed.' }));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected server error.' }));
  }
}
