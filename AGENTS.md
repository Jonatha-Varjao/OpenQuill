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

## Code Style Guidelines

### General Principles
- **TypeScript Strict Mode**: All code must pass strict type checking
- **No `any` types**: Use `unknown` then narrow properly
- **ESLint + Prettier**: Configured with single quotes, 2-space tabs
- **Single Responsibility**: Small, focused components (<200 lines)

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

// Files: kebab-case (TextInput.tsx, llm.ts)
// Directories: kebab-case (src/components/, src/services/)
```

### Imports Order
```typescript
// 1. External libraries
import { useState } from 'react';
import { create } from 'zustand';

// 2. Internal modules (use @/ alias)
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
// Test file naming: *.test.ts
import { describe, it, expect } from 'bun:test';
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

### File Organization
```
src/
├── background/        # Service worker
├── content/          # Injected scripts  
├── popup/            # Popup UI (PopupApp.tsx)
├── sidepanel/        # Side panel UI (SidepanelApp.tsx)
├── components/       # Shared UI components
├── hooks/           # Custom React hooks (useLLM.ts)
├── stores/          # Zustand stores (appStore.ts)
├── services/        # External APIs (llm.ts)
├── utils/           # Helper functions
└── types/           # TypeScript definitions
```

### Key Patterns
- **Manifest V3**: Use service workers, not background pages
- **Content Scripts**: Run at `document_idle`, use MutationObserver for dynamic content
- **Storage**: `chrome.storage.local` for extension data, handle quota errors
- **Messaging**: Use typed message passing between extension parts
