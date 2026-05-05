# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenQuill is a privacy-first browser extension (Manifest V3) that provides grammar checking and tone transformation using local LLMs (Ollama) or OpenAI-compatible APIs.

## Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Build with watch mode |
| `bun run build` | Production build |
| `bun run typecheck` | TypeScript type checking |
| `bun run lint` / `bun run lint:fix` | ESLint |
| `bun test` / `bun test <file>` | Run tests |
| `bun run clean` | Remove dist/ folder |

## Architecture

**Entry Points:**
- `src/background.ts` — Service worker (MV3) handling message passing
- `src/content.ts` — Content script injected into pages
- `src/popup/main.tsx` / `src/sidepanel/main.tsx` — React UI entry points

**Build System:** Custom `build.ts` using `Bun.build()` — outputs to `dist/` with separate bundles for background/content vs popup/sidepanel. HTML files in `public/` are post-processed to reference bundled assets.

**State Management:** Zustand stores in `src/stores/` use `createJSONStorage(() => chrome.storage.local)` for persistence. Never assume sync access to chrome.storage — always use callbacks/promises.

**LLM Services:** `src/services/llm.ts` supports multiple providers (Ollama, custom OpenAI-compatible). Provider is configured via `useSettingsStore`. For llama.cpp, set provider to `custom` and endpoint to `http://localhost:8080`.

**Key Pattern — Message Passing:** Content scripts communicate with the background service worker via `chrome.runtime.sendMessage`. Listeners must return `true` to keep the channel open for async responses.

```typescript
// Background listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'ANALYZE_TEXT') {
    handleAnalyze(message.payload).then(sendResponse);
    return true;
  }
});
```

## Development Notes

- llama.cpp default port: 8080 (OpenAI-compatible API at /v1/chat/completions)
- Ollama runs on `http://localhost:11434` by default
- The extension uses `@/*` path alias for `src/*`
- Service workers are stateless — use `chrome.storage` for persistence, not module-level variables
- Content scripts are isolated from the page — no direct `window` access, use message passing

**Provider Settings:**
- `ollama` → uses `/api/generate` endpoint
- `openai` | `custom` → uses `/v1/chat/completions` with Bearer token auth