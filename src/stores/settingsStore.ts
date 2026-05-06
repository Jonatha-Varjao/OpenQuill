import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SettingsState } from '@/types';

const DEFAULT_SETTINGS: SettingsState = {
  provider: 'ollama',
  endpoint: 'http://localhost:11434',
  apiKey: '',
  model: 'llama3.2',
  defaultEmotion: 'professional',
  defaultAnalysisMode: 'both',
  keyboardShortcut: 'Ctrl+Shift+G',
  autoAnalyze: false,
  showFab: true,
  saveHistory: true,
  maxHistoryItems: 50,
  enableInlineEditing: false,
  inlineDebounceMs: 500,
  setProvider: () => {},
  setEndpoint: () => {},
  setApiKey: () => {},
  setModel: () => {},
  setDefaultEmotion: () => {},
  setDefaultAnalysisMode: () => {},
  setKeyboardShortcut: () => {},
  setAutoAnalyze: () => {},
  setShowFab: () => {},
  setSaveHistory: () => {},
  setMaxHistoryItems: () => {},
  setEnableInlineEditing: () => {},
  setInlineDebounceMs: () => {},
  reset: () => {},
};

function createChromeStorage() {
  return {
    getItem: async (_name: string): Promise<string | null> => {
      return new Promise((resolve) => {
        chrome.storage.local.get(null, (items) => {
          resolve(JSON.stringify(items) || null);
        });
      });
    },
    setItem: async (_name: string, value: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        chrome.storage.local.set(JSON.parse(value), () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    },
    removeItem: async (_name: string): Promise<void> => {
      return new Promise((resolve) => {
        chrome.storage.local.clear(() => resolve());
      });
    },
  };
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setProvider: (provider) => set({ provider }),
      setEndpoint: (endpoint) => set({ endpoint }),
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      setDefaultEmotion: (defaultEmotion) => set({ defaultEmotion }),
      setDefaultAnalysisMode: (defaultAnalysisMode) => set({ defaultAnalysisMode }),
      setKeyboardShortcut: (keyboardShortcut) => set({ keyboardShortcut }),
      setAutoAnalyze: (autoAnalyze) => set({ autoAnalyze }),
      setShowFab: (showFab) => set({ showFab }),
      setSaveHistory: (saveHistory) => set({ saveHistory }),
      setMaxHistoryItems: (maxHistoryItems) => set({ maxHistoryItems }),
      setEnableInlineEditing: (enableInlineEditing) => set({ enableInlineEditing }),
      setInlineDebounceMs: (inlineDebounceMs) => set({ inlineDebounceMs }),
      reset: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'openquill-settings',
      storage: createJSONStorage(() => createChromeStorage()),
    }
  )
);
