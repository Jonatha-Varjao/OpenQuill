import '@/__mocks__/chrome';
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { useAppStore } from '../stores/appStore';
import { useHistoryStore } from '../stores/historyStore';
import type { EmotionType, GrammarIssue } from '@/types';

describe('useLLM hook logic', () => {
  beforeEach(async () => {
    mock.restore();
    useAppStore.getState().reset();
    const { clearMemoryStore } = await import('@/__mocks__/chrome');
    clearMemoryStore();
    useHistoryStore.getState().clearHistory();
  });

  describe('analyze', () => {
    it('sets error if text is empty', async () => {
      useAppStore.getState().setSelectedText('');

      const analyzeFn = createAnalyzeLogic();

      await analyzeFn();

      const state = useAppStore.getState();
      expect(state.error).toBe('Please enter text to analyze');
      expect(state.isAnalyzing).toBe(false);
    });

    it('sets error if connection fails', async () => {
      useAppStore.getState().setSelectedText('hello world');

      const mockCheckConnection = mock(() => Promise.resolve(false));
      const mockAnalyzeText = mock(() => Promise.resolve({ text: 'hello', issues: [] }));

      const analyzeFn = createAnalyzeLogic(mockCheckConnection, mockAnalyzeText);

      await analyzeFn();

      const state = useAppStore.getState();
      expect(state.error).toBe('Cannot connect to LLM. Is Ollama running?');
      expect(state.isAnalyzing).toBe(false);
    });

    it('sets result and adds to history on success', async () => {
      useAppStore.getState().setSelectedText('hello world');

      const mockCheckConnection = mock(() => Promise.resolve(true));
      const mockAnalyzeText = mock(() =>
        Promise.resolve({
          text: 'hello world',
          issues: [
            {
              type: 'grammar' as const,
              severity: 'error' as const,
              message: 'Test',
              position: { start: 0, end: 5 },
            },
          ],
          score: 90,
        })
      );

      const analyzeFn = createAnalyzeLogic(mockCheckConnection, mockAnalyzeText);

      await analyzeFn();

      const state = useAppStore.getState();
      expect(state.result).toEqual({
        text: 'hello world',
        issues: [
          {
            type: 'grammar',
            severity: 'error',
            message: 'Test',
            position: { start: 0, end: 5 },
          },
        ],
        score: 90,
      });
      expect(state.error).toBeNull();
      expect(state.isAnalyzing).toBe(false);

      const historyState = useHistoryStore.getState();
      expect(historyState.items).toHaveLength(1);
      expect(historyState.items[0].originalText).toBe('hello world');
      expect(historyState.items[0].analysis).toBeDefined();
    });
  });

  describe('transform', () => {
    it('sets error if text is empty', async () => {
      useAppStore.getState().setSelectedText('');

      const transformFn = createTransformLogic();

      await transformFn();

      const state = useAppStore.getState();
      expect(state.error).toBe('Please enter text to transform');
      expect(state.isAnalyzing).toBe(false);
    });

    it('uses passed emotion parameter', async () => {
      useAppStore.getState().setSelectedText('hello');
      useAppStore.getState().setEmotion('professional');

      const mockCheckConnection = mock(() => Promise.resolve(true));
      const mockTransformText = mock(() =>
        Promise.resolve({
          original: 'hello',
          transformed: 'HELLO',
          emotion: 'casual' as EmotionType,
        })
      );

      const transformFn = createTransformLogic(mockCheckConnection, mockTransformText);

      await transformFn('casual');

      expect(mockTransformText).toHaveBeenCalledWith('hello', 'casual');
    });

    it('uses currentEmotion when no parameter passed', async () => {
      useAppStore.getState().setSelectedText('hello');
      useAppStore.getState().setEmotion('friendly');

      const mockCheckConnection = mock(() => Promise.resolve(true));
      const mockTransformText = mock(() =>
        Promise.resolve({
          original: 'hello',
          transformed: 'hi there!',
          emotion: 'friendly' as EmotionType,
        })
      );

      const transformFn = createTransformLogic(mockCheckConnection, mockTransformText);

      await transformFn();

      expect(mockTransformText).toHaveBeenCalledWith('hello', 'friendly');
    });

    it('sets error if connection fails', async () => {
      useAppStore.getState().setSelectedText('hello');

      const mockCheckConnection = mock(() => Promise.resolve(false));
      const mockTransformText = mock(() =>
        Promise.resolve({
          original: '',
          transformed: '',
          emotion: 'professional' as EmotionType,
        })
      );

      const transformFn = createTransformLogic(mockCheckConnection, mockTransformText);

      await transformFn();

      const state = useAppStore.getState();
      expect(state.error).toBe('Cannot connect to LLM. Is Ollama running?');
    });

    it('sets result on success', async () => {
      useAppStore.getState().setSelectedText('hello');
      useAppStore.getState().setEmotion('professional');

      const mockCheckConnection = mock(() => Promise.resolve(true));
      const mockTransformText = mock(() =>
        Promise.resolve({
          original: 'hello',
          transformed: 'Greetings',
          emotion: 'professional' as EmotionType,
        })
      );

      const transformFn = createTransformLogic(mockCheckConnection, mockTransformText);

      await transformFn();

      const state = useAppStore.getState();
      expect(state.result).toEqual({
        original: 'hello',
        transformed: 'Greetings',
        emotion: 'professional',
      });
      expect(state.error).toBeNull();
      expect(state.isAnalyzing).toBe(false);

      const historyState = useHistoryStore.getState();
      expect(historyState.items).toHaveLength(1);
      expect(historyState.items[0].transformedText).toBe('Greetings');
      expect(historyState.items[0].emotion).toBe('professional');
    });
  });
});

function createAnalyzeLogic(
  checkConnection = async () => true,
  analyzeText = async (_text: string) => ({ text: '', issues: [] as GrammarIssue[] })
) {
  return async function () {
    const { setAnalyzing, setResult, setError, selectedText } = useAppStore.getState();
    const { addItem } = useHistoryStore.getState();

    if (!selectedText.trim()) {
      setError('Please enter text to analyze');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const connected = await checkConnection();
      if (!connected) {
        throw new Error('Cannot connect to LLM. Is Ollama running?');
      }

      const result = await analyzeText(selectedText);
      setResult(result);

      addItem({
        originalText: selectedText,
        analysis: result,
        provider: 'ollama',
        model: 'llama3.2',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Analysis failed';
      setError(message);
    } finally {
      setAnalyzing(false);
    }
  };
}

function createTransformLogic(
  checkConnection = async () => true,
  transformText = async (_text: string, _emotion: EmotionType) =>
    ({ original: '', transformed: '', emotion: 'professional' as EmotionType })
) {
  return async function (emotion?: EmotionType) {
    const { setAnalyzing, setResult, setError, selectedText, currentEmotion } = useAppStore.getState();
    const { addItem } = useHistoryStore.getState();

    const targetEmotion = emotion || currentEmotion;

    if (!selectedText.trim()) {
      setError('Please enter text to transform');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const connected = await checkConnection();
      if (!connected) {
        throw new Error('Cannot connect to LLM. Is Ollama running?');
      }

      const result = await transformText(selectedText, targetEmotion);
      setResult(result);

      addItem({
        originalText: selectedText,
        transformedText: result.transformed,
        emotion: targetEmotion,
        provider: 'ollama',
        model: 'llama3.2',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transformation failed';
      setError(message);
    } finally {
      setAnalyzing(false);
    }
  };
}
