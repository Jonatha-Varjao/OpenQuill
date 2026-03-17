import '@/__mocks__/chrome';
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { checkConnection, getModels, transformText, analyzeText } from './llm';
import { useSettingsStore } from '../stores/settingsStore';

describe('llm service', () => {
  beforeEach(() => {
    mock.restore();
    useSettingsStore.getState().setProvider('ollama');
    useSettingsStore.getState().setEndpoint('http://localhost:11434');
    useSettingsStore.getState().setApiKey('');
    useSettingsStore.getState().setModel('llama3.2');
  });

  describe('checkConnection', () => {
    it('returns true when fetch responds ok', async () => {
      const mockFetch = mock(() =>
        Promise.resolve({
          ok: true,
        })
      );
      globalThis.fetch = mockFetch as unknown as typeof fetch;

      const result = await checkConnection();
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalled();
    });

    it('returns false when fetch fails (network error)', async () => {
      const mockFetch = mock(() => Promise.reject(new Error('Network error')));
      globalThis.fetch = mockFetch as unknown as typeof fetch;

      const result = await checkConnection();
      expect(result).toBe(false);
    });

    it('returns false when response is not ok', async () => {
      const mockFetch = mock(() =>
        Promise.resolve({
          ok: false,
          status: 500,
        })
      );
      globalThis.fetch = mockFetch as unknown as typeof fetch;

      const result = await checkConnection();
      expect(result).toBe(false);
    });
  });

  describe('getModels', () => {
    it('returns array of model names', async () => {
      const mockFetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              models: [
                { name: 'llama3.2' },
                { name: 'mistral' },
                { name: 'codellama' },
              ],
            }),
        })
      );
      globalThis.fetch = mockFetch as unknown as typeof fetch;

      const result = await getModels();
      expect(result).toEqual(['llama3.2', 'mistral', 'codellama']);
    });

    it('returns empty array when fetch fails', async () => {
      const mockFetch = mock(() => Promise.reject(new Error('Network error')));
      globalThis.fetch = mockFetch as unknown as typeof fetch;

      const result = await getModels();
      expect(result).toEqual([]);
    });

    it('returns empty array when response has no models', async () => {
      const mockFetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      );
      globalThis.fetch = mockFetch as unknown as typeof fetch;

      const result = await getModels();
      expect(result).toEqual([]);
    });
  });

  describe('transformText', () => {
    it('uses /api/generate endpoint for ollama', async () => {
      const mockFetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ response: 'Transformed text' }),
        })
      );
      globalThis.fetch = mockFetch as unknown as typeof fetch;

      await transformText('hello', 'professional');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/generate',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('uses /chat/completions endpoint for openai', async () => {
      useSettingsStore.getState().setProvider('openai');

      const mockFetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              choices: [{ message: { content: 'Transformed text' } }],
            }),
        })
      );
      globalThis.fetch = mockFetch as unknown as typeof fetch;

      await transformText('hello', 'professional');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:11434/chat/completions',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('includes Authorization header when provider is not ollama and apiKey exists', async () => {
      useSettingsStore.getState().setProvider('custom');
      useSettingsStore.getState().setApiKey('sk-test-key');

      const mockFetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              choices: [{ message: { content: 'Transformed text' } }],
            }),
        })
      );
      globalThis.fetch = mockFetch as unknown as typeof fetch;

      await transformText('hello', 'casual');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer sk-test-key',
          }),
        })
      );
    });

    it('throws error when response is not ok', async () => {
      const mockFetch = mock(() =>
        Promise.resolve({
          ok: false,
          status: 400,
        })
      );
      globalThis.fetch = mockFetch as unknown as typeof fetch;

      await expect(transformText('hello', 'professional')).rejects.toThrow(
        'API error: 400'
      );
    });

    it('returns TransformationResult with correct structure', async () => {
      const mockFetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ response: 'Transformed text' }),
        })
      );
      globalThis.fetch = mockFetch as unknown as typeof fetch;

      const result = await transformText('original text', 'friendly');

      expect(result).toEqual({
        original: 'original text',
        transformed: 'Transformed text',
        emotion: 'friendly',
      });
    });
  });

  describe('analyzeText', () => {
    it('parses JSON response correctly with issues and score', async () => {
      const mockFetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              response: JSON.stringify({
                issues: [
                  {
                    type: 'grammar',
                    severity: 'error',
                    message: 'Subject-verb agreement',
                    position: { start: 0, end: 5 },
                    suggestion: 'He goes',
                  },
                ],
                score: 85,
              }),
            }),
        })
      );
      globalThis.fetch = mockFetch as unknown as typeof fetch;

      const result = await analyzeText('He go to school');

      expect(result).toEqual({
        text: 'He go to school',
        issues: [
          {
            type: 'grammar',
            severity: 'error',
            message: 'Subject-verb agreement',
            position: { start: 0, end: 5 },
            suggestion: 'He goes',
          },
        ],
        score: 85,
      });
    });

    it('falls back to empty issues when JSON is invalid', async () => {
      const mockFetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ response: 'not valid json' }),
        })
      );
      globalThis.fetch = mockFetch as unknown as typeof fetch;

      const result = await analyzeText('some text');

      expect(result).toEqual({
        text: 'some text',
        issues: [],
      });
    });

    it('throws error when fetch fails', async () => {
      const mockFetch = mock(() => Promise.reject(new Error('Network error')));
      globalThis.fetch = mockFetch as unknown as typeof fetch;

      await expect(analyzeText('hello')).rejects.toThrow(
        'Failed to analyze text: Network error'
      );
    });
  });
});
