import type { Suggestion } from '@/types/inline';
import { useSettingsStore } from '@/stores';

const INLINE_PROMPT = `Analyze this text for grammar, spelling, and style issues.
Return ONLY a valid JSON array of issues with this exact structure:
[{"start": 0, "end": 5, "type": "spelling", "original": "teh", "suggestion": "the"}]

Rules:
- "start" and "end" are character positions in the original text
- "type" must be one of: "grammar", "spelling", "style", "tone"
- "original" is the text to be replaced
- "suggestion" is the recommended replacement
- Only return issues that are definite errors
- Keep suggestions concise and direct
- For style issues, be conservative (prefer clarity over rewrites)
- If no issues found, return exactly: []

Text: "{text}"`;

export async function analyzeInline(text: string): Promise<Suggestion[]> {
  const settings = useSettingsStore.getState();

  const isOllama = settings.provider === 'ollama';

  const endpoint = isOllama
    ? `${settings.endpoint}/api/generate`
    : `${settings.endpoint}/chat/completions`;

  const prompt = INLINE_PROMPT.replace('{text}', text);

  const body = isOllama
    ? { model: settings.model, prompt, stream: false }
    : { model: settings.model, messages: [{ role: 'user', content: prompt }] };

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (settings.apiKey && settings.provider !== 'ollama') {
    headers['Authorization'] = `Bearer ${settings.apiKey}`;
  }

  try {
    const response = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
    const data = await response.json();
    const content = isOllama ? data.response : data.choices?.[0]?.message?.content ?? '';
    return parseSuggestions(content);
  } catch {
    return [];
  }
}

export function parseSuggestions(response: string): Suggestion[] {
  try {
    const cleaned = response.trim();
    let jsonStr = cleaned;

    if (cleaned.startsWith('```json')) {
      jsonStr = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      jsonStr = cleaned.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }

    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is Suggestion =>
      typeof item.start === 'number' &&
      typeof item.end === 'number' &&
      typeof item.type === 'string' &&
      ['grammar', 'spelling', 'style', 'tone'].includes(item.type) &&
      typeof item.original === 'string' &&
      typeof item.suggestion === 'string'
    );
  } catch {
    return [];
  }
}