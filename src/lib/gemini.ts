const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = 'gemini-2.5-flash';

interface GeminiRequest {
  contents: { parts: { text: string }[] }[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
  };
}

function buildRequest(prompt: string, json?: boolean): GeminiRequest {
  return {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
      ...(json ? { responseMimeType: 'application/json' } : {}),
    },
  };
}

export async function streamGemini(
  apiKey: string,
  prompt: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const url = `${BASE_URL}/${MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildRequest(prompt)),
    signal,
  });

  if (!res.ok) {
    const status = res.status;
    if (status === 400) throw new Error('Invalid API key. Please check your Gemini key.');
    if (status === 403) throw new Error('API key does not have access. Please enable the Gemini API.');
    if (status === 429) throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    throw new Error(`Gemini API error (${status}). Please try again.`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          full += text;
          onChunk(full);
        }
      } catch {
        // skip malformed chunks
      }
    }
  }

  return full;
}

export async function callGeminiJSON<T>(
  apiKey: string,
  prompt: string,
  signal?: AbortSignal
): Promise<T> {
  const url = `${BASE_URL}/${MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildRequest(prompt, true)),
    signal,
  });

  if (!res.ok) {
    const status = res.status;
    if (status === 400) throw new Error('Invalid API key. Please check your Gemini key.');
    if (status === 403) throw new Error('API key does not have access. Please enable the Gemini API.');
    if (status === 429) throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    throw new Error(`Gemini API error (${status}). Please try again.`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Try direct JSON parse first
  try {
    return JSON.parse(text) as T;
  } catch {
    // Fallback: extract from code fences
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      return JSON.parse(match[1].trim()) as T;
    }
    throw new Error('Failed to parse AI response. Please try again.');
  }
}
