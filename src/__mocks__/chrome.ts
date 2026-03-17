/**
 * Shared mock for chrome.storage.local API.
 * Import as side-effect BEFORE importing stores that use persist middleware.
 */

type StorageCallback = (items: Record<string, unknown>) => void;
type SetCallback = () => void;

const memoryStore: Record<string, unknown> = {};

function clearMemoryStore() {
  for (const key of Object.keys(memoryStore)) {
    delete memoryStore[key];
  }
}

function getMemoryStore(): Record<string, unknown> {
  return { ...memoryStore };
}

const chromeMock = {
  storage: {
    local: {
      get: (_keys: string[] | null | undefined, callback: StorageCallback) => {
        callback(getMemoryStore());
      },
      set: (items: Record<string, unknown>, callback?: SetCallback) => {
        Object.assign(memoryStore, items);
        callback?.();
      },
      clear: (callback?: SetCallback) => {
        clearMemoryStore();
        callback?.();
      },
    },
  },
  runtime: {
    lastError: null as { message: string } | null,
  },
};

// Inject into global scope only if not already present
if (typeof globalThis.chrome === 'undefined') {
  (globalThis as Record<string, unknown>).chrome = chromeMock;
}

export { clearMemoryStore, getMemoryStore };
