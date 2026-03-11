import { useCallback } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useHistoryStore } from '@/stores/historyStore';
import { transformText, analyzeText, checkConnection } from '@/services/llm';
import type { EmotionType } from '@/types';

export function useLLM() {
  const { setAnalyzing, setResult, setError, selectedText, currentEmotion } = useAppStore();
  const { addItem } = useHistoryStore();

  const analyze = useCallback(async () => {
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
  }, [selectedText, setAnalyzing, setResult, setError, addItem]);

  const transform = useCallback(
    async (emotion?: EmotionType) => {
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
    },
    [selectedText, currentEmotion, setAnalyzing, setResult, setError, addItem]
  );

  return { analyze, transform };
}
