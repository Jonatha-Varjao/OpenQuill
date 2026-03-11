import type { EmotionType, TransformationResult, AnalysisResult } from '@/types';
import { useSettingsStore } from '@/stores/settingsStore';

const EMOTION_PROMPTS: Record<EmotionType, string> = {
  professional: `You are a professional editor specializing in business and corporate writing. 
Rewrite the text to be:
- Clear and concise
- Professional and business-appropriate
- Free of contractions and slang
- Properly structured

Preserve all factual information and the original meaning. Return only the rewritten text.`,

  casual: `You are a friendly, conversational writer.
Rewrite the text to be:
- Casual and relaxed
- Natural and conversational
- Using contractions where appropriate
- Easy to read

Preserve all factual information and the original meaning. Return only the rewritten text.`,

  friendly: `You are a warm, approachable communicator.
Rewrite the text to be:
- Friendly and welcoming
- Personable and empathetic
- Using positive language
- Warm in tone

Preserve all factual information and the original meaning. Return only the rewritten text.`,

  formal: `You are a formal writing expert.
Rewrite the text to be:
- Structured and organized
- Using formal vocabulary
- Complex but clear sentences
- Objective and impartial

Preserve all factual information and the original meaning. Return only the rewritten text.`,

  academic: `You are an academic writer and researcher.
Rewrite the text to be:
- Scholarly and objective
- Using academic vocabulary
- Properly cited format (where applicable)
- Impersonal voice

Preserve all factual information and the original meaning. Return only the rewritten text.`,

  creative: `You are a creative writer.
Rewrite the text to be:
- Imaginative and expressive
- Engaging and memorable
- Using vivid language
- Creative but clear

Preserve all factual information and the original meaning. Return only the rewritten text.`,
};

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
  const systemPrompt = EMOTION_PROMPTS[emotion];

  const isOllama = settings.provider === 'ollama';
  const endpoint = isOllama 
    ? `${settings.endpoint}/api/generate`
    : `${settings.endpoint}/chat/completions`;

  const body = isOllama
    ? {
        model: settings.model,
        prompt: `${systemPrompt}\n\nText:\n${text}`,
        stream: false,
      }
    : {
        model: settings.model,
        messages: [
          { role: 'system', content: systemPrompt },
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

export async function analyzeText(text: string): Promise<AnalysisResult> {
  const settings = useSettingsStore.getState();
  
  const prompt = `You are a professional grammar and style editor. Analyze the given text for:
1. Grammar errors
2. Spelling mistakes
3. Punctuation issues
4. Awkward phrasing
5. Readability improvements

Provide specific corrections with explanations. Format your response as JSON with an "issues" array.`;

  const isOllama = settings.provider === 'ollama';
  const endpoint = isOllama 
    ? `${settings.endpoint}/api/generate`
    : `${settings.endpoint}/chat/completions`;

  const body = isOllama
    ? {
        model: settings.model,
        prompt: `${prompt}\n\nText to analyze:\n${text}`,
        stream: false,
      }
    : {
        model: settings.model,
        messages: [
          { role: 'system', content: prompt },
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
