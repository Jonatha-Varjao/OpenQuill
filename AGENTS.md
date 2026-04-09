# AGENTS.md - Development Guidelines for AI Agents

This file provides instructions and guidelines for AI agents working on OpenQuill.

## Project Overview

- **Project**: OpenQuill - AI Writing Assistant Browser Extension
- **Stack**: TypeScript + Bun (bundler/runtime) + React + Zustand + Manifest V3
- **Core**: Text analysis and tone transformation using local/cloud LLMs

## Commands

This project uses Bun.

### Development & Build
| Command | Description |
|---------|-------------|
| `bun install` | Install dependencies |
| `bun run dev` | Dev server with hot reload (watch mode) |
| `bun run build` | Production build (runs build.ts) |
| `bun run clean` | Clean dist folder |

### Code Quality
| Command | Description |
|---------|-------------|
| `bun run typecheck` | TypeScript type checking (strict mode) |
| `bun run lint` | ESLint on src/**/*.{ts,tsx} |
| `bun run lint:fix` | Fix ESLint errors automatically |

### Testing
| Command | Description |
|---------|-------------|
| `bun test` | Run all tests |
| `bun test --watch` | Run tests in watch mode |
| `bun test <file>` | Run single test file (e.g., `bun test src/services/llm.test.ts`) |
| `bun test --grep "<name>"` | Run tests matching pattern |

---

## TypeScript Configuration

```jsonc
// tsconfig.json — key settings
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": { "@/*": ["src/*"] },
    "types": ["bun-types", "chrome"]
  }
}
```

- **Path alias**: `@/*` resolves to `src/*`
- **No emit**: `noEmit: true` — Bun handles bundling

---

## Code Style Guidelines

### General Principles
- **TypeScript Strict Mode**: All code must pass strict type checking
- **No `any` types**: Use `unknown` then narrow properly
- **ESLint + Prettier**: See detailed config below
- **Single Responsibility**: Small, focused components (<200 lines)

### ESLint Configuration
```js
// eslint.config.js — key rules
'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
```
- Unused vars are **warnings** (not errors)
- `_`-prefixed args are ignored
- `no-unused-vars` and `no-undef` turned off in favor of `@typescript-eslint` versions

### Prettier Configuration
```jsonc
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "jsxSingleQuote": false
}
```

### Naming Conventions
```typescript
// Variables/functions: camelCase
const selectedText = '';
function analyzeText() {}

// Constants: SCREAMING_SNAKE_CASE
const MAX_TEXT_LENGTH = 10000;

// Types/Interfaces: PascalCase
interface AnalysisResult {}
type EmotionType = 'professional' | 'casual';

// Component files: PascalCase (EmotionSelector.tsx, ResultPanel.tsx)
// Module files: camelCase (llm.ts, useLLM.ts, appStore.ts)
// Component directories: PascalCase (EmotionSelector/, ResultPanel/)
// Module directories: camelCase (services/, stores/, hooks/)
```

### Imports Order
```typescript
// 1. External libraries
import { useState } from 'react';
import { create } from 'zustand';

// 2. Internal modules (@/ resolves to src/ per tsconfig.json paths)
import { useAppStore } from '@/stores/appStore';
import { transformText } from '@/services/llm';

// 3. Types
import type { EmotionType } from '@/types';

// 4. Relative imports
import { formatText } from '../utils/formatText';
```

### React Components
```typescript
// Functional components with explicit props
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function Button({ label, onClick, disabled = false }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}

// Default exports for page components only
export default PopupApp;
```

### Error Handling
```typescript
// Always type catch blocks
try {
  await riskyOperation();
} catch (error: unknown) {
  if (error instanceof Error) {
    return { error: error.message };
  }
  return { error: 'Unknown error' };
}

// Use Result types for expected errors
type Result<T> = { success: true; data: T } | { success: false; error: string };
```

### Zustand Stores Pattern
```typescript
const useStore = create<AppState>((set) => ({
  selectedText: '',
  currentEmotion: 'professional',
  isAnalyzing: false,
  
  setSelectedText: (text) => set({ selectedText: text }),
  setEmotion: (emotion) => set({ currentEmotion: emotion }),
  setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  reset: () => set({ selectedText: '', currentEmotion: 'professional', isAnalyzing: false }),
}));
```

### Testing Patterns
```typescript
// Test file naming: *.test.ts (co-located with source)
import '@/__mocks__/chrome'; // Required side-effect when testing stores
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { transformText } from './llm';

describe('transformText', () => {
  it('transforms text with given emotion', async () => {
    const result = await transformText('Hello', 'professional');
    expect(result).toBeDefined();
    expect(result.emotion).toBe('professional');
  });

  it('throws error for empty text', async () => {
    await expect(transformText('', 'professional')).rejects.toThrow('Text cannot be empty');
  });
});
```

### Chrome Extension Specifics
```typescript
// Wrap chrome API calls in promises
function getStorage<T>(key: string): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      }
      resolve(result[key] as T);
    });
  });
}
```

## Architecture Notes

### Manifest V3 — Permissions & Structure

```jsonc
// public/manifest.json — key fields
{
  "manifest_version": 3,
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": ["<all_urls>"],
  "action": { "default_popup": "popup.html" },
  "side_panel": { "default_path": "sidepanel.html" },
  "commands": {
    "analyze-text": {
      "suggested_key": { "default": "Ctrl+Shift+G", "mac": "Command+Shift+G" },
      "description": "Analyze selected text"
    }
  },
  "background": { "service_worker": "background.js", "type": "module" }
}
```

- **Background**: ESM service worker (not background pages)
- **Side panel**: Always available via `chrome.sidePanel.open()`
- **Keyboard shortcut**: Triggers `ANALYZE_SELECTION` message to content script

### Extension Communication

```
Content Script → Background:  chrome.runtime.sendMessage({ action, payload })
Background → Content Script:  chrome.tabs.sendMessage(tabId, { action })
Message handlers return true to keep channel open (async sendResponse)
```

- **Content script** (`content.ts`): Injects FAB on text selection, sends `ANALYZE_TEXT` to background
- **Background** (`background.ts`): Routes messages, handles `analyze-text` command via `chrome.commands.onCommand`
- **FAB**: Floating action button (`position: absolute`, `z-index: 2147483647`) appears below selected text

### Core Types

```typescript
// EmotionType — 6 tone profiles
type EmotionType = 'professional' | 'casual' | 'friendly' | 'formal' | 'academic' | 'creative';

// AnalysisResult — grammar/style issues
interface AnalysisResult {
  text: string;
  issues: GrammarIssue[];  // type, severity, message, position, suggestion
  score?: number;
}

// TransformationResult — rewritten text
interface TransformationResult {
  original: string;
  transformed: string;
  emotion: EmotionType;
  changes?: { type: 'word_choice' | 'structure' | 'tone' | 'grammar'; description: string }[];
}

// Settings — user-configurable
interface Settings {
  provider: 'ollama' | 'openai' | 'custom';
  endpoint: string;          // e.g. http://localhost:11434
  apiKey: string;
  model: string;             // e.g. llama3.2
  defaultEmotion: EmotionType;
  defaultAnalysisMode: 'grammar' | 'tone' | 'both';
  saveHistory: boolean;
  maxHistoryItems: number;
  // ... autoAnalyze, showFab, keyboardShortcut
}

// HistoryItem — stored analysis/transformations
interface HistoryItem {
  id: string;
  timestamp: number;
  originalText: string;
  transformedText?: string;
  emotion?: EmotionType;
  analysis?: AnalysisResult;
  provider: string;
  model: string;
}
```

### LLM Service — Endpoints by Provider

```typescript
// Health check (Ollama-specific)
await fetch(`${endpoint}/api/tags`);

// Transform/Analyze — different endpoints per provider:
// Ollama:        POST ${endpoint}/api/generate        { model, prompt, stream: false }
// OpenAI-compat: POST ${endpoint}/chat/completions     { model, messages: [{ role, content }] }

// API Key: only sent when provider !== 'ollama'
// Authorization header: `Bearer ${apiKey}`
```

- `checkConnection()`: Pings `/api/tags` (Ollama-specific health check)
- `getModels()`: Fetches available models from `/api/tags`
- Response parsing: Ollama returns `{ response }`, OpenAI returns `{ choices[0].message.content }`

### Zustand Stores — Persistence

```typescript
// settingsStore uses persist() middleware with chrome.storage.local
import { persist, createJSONStorage } from 'zustand/middleware';

// Custom storage adapter wraps chrome.storage.local API
const useSettingsStore = create<SettingsState>()(
  persist((set) => ({ /* ... */ }), {
    name: 'openquill-settings',
    storage: createJSONStorage(() => createChromeStorage()),
  })
);
```

- **settingsStore**: Persisted to `chrome.storage.local` as `openquill-settings`
- **historyStore**: Persisted to `chrome.storage.local`, limits items to `maxHistoryItems` (default 50)
- **appStore**: In-memory only (resets on popup close)
- **Tests**: Must import `@/__mocks__/chrome` as side-effect before stores that use `persist()`

### File Organization
```
src/
├── __mocks__/        # Test mocks (chrome.ts for storage API)
├── background/       # Service worker logic
├── background.ts     # Service worker entry
├── content/          # Injected script logic
├── content.ts        # Content script entry
├── popup/            # Popup UI (main.tsx, PopupApp.tsx)
├── sidepanel/        # Side panel UI (main.tsx, SidepanelApp.tsx)
├── components/       # Shared UI (EmotionSelector/, TextInput/, etc.)
├── hooks/            # Custom React hooks (useLLM.ts)
├── stores/           # Zustand stores (appStore.ts, settingsStore.ts, historyStore.ts)
├── services/         # External APIs (llm.ts)
├── utils/            # Helper functions
└── types/            # TypeScript definitions (index.ts)
```

### Key Patterns
- **Manifest V3**: Use service workers, not background pages
- **Content Scripts**: Run at `document_idle`, use MutationObserver for dynamic content
- **Storage**: `chrome.storage.local` for extension data, handle quota errors
- **Messaging**: Use typed message passing between extension parts

## Skills Locais

Skills de referência rápida estão em `.opencode/skills/` (não versionadas).

| Skill | Descrição |
|-------|-----------|
| `openquill-testing` | Padrões de teste: bun:test, chrome mock, stores/services/hooks |
| `openquill-react-zustand` | Padrões React + Zustand: stores, components, hooks, imports, types |

Carregue via tool `skill({ name: "openquill-testing" })` ou `skill({ name: "openquill-react-zustand" })`.
