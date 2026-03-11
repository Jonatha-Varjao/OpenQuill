import { create } from 'zustand';
import type { AppState, EmotionType, TransformationResult, AnalysisResult } from '@/types';

const initialState = {
  selectedText: '',
  currentEmotion: 'professional' as EmotionType,
  isAnalyzing: false,
  result: null as TransformationResult | AnalysisResult | null,
  error: null as string | null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setSelectedText: (text) => set({ selectedText: text, error: null }),
  setEmotion: (emotion) => set({ currentEmotion: emotion }),
  setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  setResult: (result) => set({ result, error: null }),
  setError: (error) => set({ error, result: null }),
  reset: () => set(initialState),
}));
