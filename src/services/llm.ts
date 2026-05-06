import type { EmotionType, TransformationResult, AnalysisResult } from '@/types';
import { useSettingsStore } from '@/stores/settingsStore';

export async function checkConnection(): Promise<boolean> {
  const settings = useSettingsStore.getState();
  
  try {
    const response = await fetch(`${settings.endpoint}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function getModels(): Promise<string[]> {
  const settings = useSettingsStore.getState();
  
  try {
    const response = await fetch(`${settings.endpoint}/api/tags`);
    const data = await response.json();
    return data.models?.map((m: { name: string }) => m.name) || [];
  } catch {
    return [];
  }
}

export async function transformText(
  text: string,
  emotion: EmotionType
): Promise<TransformationResult> {
  const settings = useSettingsStore.getState();

  const isOllama = settings.provider === 'ollama';
  const endpoint = isOllama 
    ? `${settings.endpoint}/api/generate`
    : `${settings.endpoint}/chat/completions`;

  const body = isOllama
    ? {
        model: settings.model,
        prompt: text,
        stream: false,
      }
    : {
        model: settings.model,
        messages: [
          { role: 'user', content: text },
        ],
      };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (settings.apiKey && settings.provider !== 'ollama') {
    headers['Authorization'] = `Bearer ${settings.apiKey}`;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    let transformed: string;
    if (isOllama) {
      transformed = data.response;
    } else {
      transformed = data.choices?.[0]?.message?.content || '';
    }

    return {
      original: text,
      transformed: transformed.trim(),
      emotion,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to transform text: ${message}`);
  }
}

export async function analyzeText(text: string, customPrompt?: string): Promise<AnalysisResult> {
  const settings = useSettingsStore.getState();

  const isOllama = settings.provider === 'ollama';
  const endpoint = isOllama
    ? `${settings.endpoint}/api/generate`
    : `${settings.endpoint}/chat/completions`;

  const defaultPrompt = `Analyze this text for grammar, spelling, and style issues.
Return a JSON object with this structure:
{"issues": [{"type": "grammar"|"spelling"|"punctuation"|"style", "severity": "error"|"warning"|"suggestion", "message": "...", "position": {"start": N, "end": N}, "suggestion": "..."}]}

Text: ${text}`;

  const body = isOllama
    ? {
        model: settings.model,
        prompt: customPrompt ?? defaultPrompt,
        stream: false,
      }
    : {
        model: settings.model,
        messages: [
          { role: 'user', content: customPrompt ?? defaultPrompt },
        ],
      };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (settings.apiKey && settings.provider !== 'ollama') {
    headers['Authorization'] = `Bearer ${settings.apiKey}`;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    let content: string;
    if (isOllama) {
      content = data.response;
    } else {
      content = data.choices?.[0]?.message?.content || '';
    }

    try {
      const parsed = JSON.parse(content);
      return {
        text,
        issues: parsed.issues || [],
        score: parsed.score,
      };
    } catch {
      return {
        text,
        issues: [],
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to analyze text: ${message}`);
  }
}
