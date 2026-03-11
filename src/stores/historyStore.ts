import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { HistoryState, HistoryItem } from '@/types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

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

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item) => {
        const newItem: HistoryItem = {
          ...item,
          id: generateId(),
          timestamp: Date.now(),
        };
        set((state) => ({
          items: [newItem, ...state.items].slice(0, 50),
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      clearHistory: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'grammarly-clone-history',
      storage: createJSONStorage(() => createChromeStorage()),
    }
  )
);
