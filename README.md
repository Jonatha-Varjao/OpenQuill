# OpenQuill - AI Writing Assistant Extension

A privacy-first browser extension that analyzes text using local or cloud LLMs, providing grammar corrections, style improvements, and tone transformations.

## Features

- **Text Analysis**: Grammar, syntax, and semantic checking (English only)
- **Tone Transformation**: Rewrite text with different emotions (Professional, Casual, Friendly, Formal, Academic, Creative)
- **Local LLM Support**: Works with Ollama, LM Studio, llama.cpp
- **Cloud Fallback**: OpenAI-compatible API support
- **Privacy-First**: All processing can happen locally on your machine
- **Language**: English only

## Prerequisites

- **Bun** - JavaScript runtime, package manager, and bundler
- **llama.cpp** (optional) - For local LLM inference with GGUF models

### Installing Bun

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Verify installation
bun --version
```

## Quick Start

```bash
bun install
bun run dev
```

- Open `chrome://extensions/`, enable **Developer mode**, and load the `dist/` folder

## Commands

| Command             | Description                             |
| ------------------- | --------------------------------------- |
| `bun run dev`       | Dev server with hot reload (watch mode) |
| `bun run build`     | Production build                        |
| `bun run typecheck` | Run TypeScript type checker             |
| `bun run lint`      | Run ESLint                              |
| `bun run lint:fix`  | Fix ESLint errors automatically         |
| `bun test`          | Run all tests                           |
| `bun test --watch`  | Run tests in watch mode                 |
| `bun test <file>`   | Run single test file                    |
| `bun run clean`     | Clean `dist/` folder                    |

## Loading the Extension

### Chrome / Edge / Brave

1. Run `bun run build`
2. Open `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the `dist/` folder

### Firefox

1. Run `bun run build`
2. Open `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Select the `manifest.json` file inside `dist/`

## Project Structure

```
├── src/
│   ├── background.ts           # Service worker entry (MV3)
│   ├── content.ts              # Content script (FAB injection)
│   ├── popup/
│   │   ├── main.tsx            # Popup React entry
│   │   ├── PopupApp.tsx
│   │   └── popup.css
│   ├── sidepanel/
│   │   ├── main.tsx            # Side panel React entry
│   │   ├── SidepanelApp.tsx
│   │   └── sidepanel.css
│   ├── components/
│   │   ├── EmotionSelector/    # Tone selection UI
│   │   ├── TextInput/          # Text area with counter
│   │   ├── ResultPanel/        # Analysis/transformation output
│   │   └── HistoryPanel/       # History list UI
│   ├── hooks/
│   │   ├── useLLM.ts           # LLM analysis/transform logic
│   │   └── useLLM.test.ts
│   ├── stores/                 # Zustand state (persisted to chrome.storage)
│   │   ├── appStore.ts         # UI state (text, emotion, result)
│   │   ├── settingsStore.ts    # User settings (provider, model, endpoint)
│   │   ├── historyStore.ts     # Analysis history
│   │   └── index.ts            # Re-exports
│   ├── services/
│   │   ├── llm.ts              # LLM API calls (Ollama + OpenAI-compat)
│   │   └── llm.test.ts
│   ├── types/
│   │   └── index.ts            # All TypeScript interfaces
│   └── __mocks__/
│       └── chrome.ts           # Chrome API mock for tests
├── public/
│   ├── manifest.json           # Extension manifest (MV3)
│   ├── popup.html
│   ├── sidepanel.html
│   └── icons/
├── build.ts                    # Bun-based build script
├── tsconfig.json
├── eslint.config.js
├── .prettierrc
└── package.json
```

## Tech Stack

| Technology          | Version     |
| ------------------- | ----------- |
| **Runtime**         | Bun         |
| **Language**        | TypeScript `^5.6.0` (strict mode) |
| **Bundler**         | Bun (native `Bun.build()`) |
| **UI Framework**    | React `^18.3.1` |
| **State Management**| Zustand `^5.0.0` + persist middleware |
| **Extension**       | Manifest V3 |
| **Types**           | `@types/chrome` `^0.0.280`, `bun-types` `^1.3.10` |

## Code Quality

- **ESLint** `>=10` with `@typescript-eslint` `^8.57.0` — unused vars as warnings, `_`-prefixed args ignored
- **Prettier** — single quotes, semicolons, trailing commas (es5), 100 char width
- **TypeScript strict** — `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- **Path alias** — `@/*` maps to `src/*`

## LLM Configuration

### Local (Ollama)

1. Install [Ollama](https://ollama.ai)
2. Pull a model: `ollama pull llama3.2`
3. Start Ollama: `ollama serve`
4. Configure the extension to use `http://localhost:11434`

### Local (llama.cpp)

1. Download a GGUF model (e.g., Qwen3.5-9B-Q4_K_M from Unsloth/HuggingFace)
2. Run llama-server:
   ```bash
   llama-server -m path/to/model.gguf -ngl 32 -c 8192 -fa --mlock
   ```
   Default endpoint: `http://localhost:8080`
3. In extension settings, set **Provider** to `Custom` and **Endpoint** to `http://localhost:8080`
4. Set **Model** to match your GGUF filename (e.g., `Qwen3.5-9B-Q4_K_M`)

**Recommended model for 8GB VRAM:** Qwen3.5-9B-Q4_K_M (~5.5GB, ~40 tok/s on RTX 3070)

### Cloud (OpenAI-compatible)

1. Get an API key from OpenAI, Anthropic, or any OpenAI-compatible provider
2. Configure the endpoint URL and API key in extension settings

### Emotions (Tone Transformation)

| Emotion        | Description                      |
| -------------- | -------------------------------- |
| `professional` | Business and corporate writing   |
| `casual`       | Friendly, conversational tone    |
| `friendly`     | Warm and approachable            |
| `formal`       | Structured and objective         |
| `academic`     | Scholarly and research-focused   |
| `creative`     | Imaginative and expressive       |

## Keyboard Shortcut

`Ctrl+Shift+G` (or `Cmd+Shift+G` on Mac) — Analyze selected text on any page.

## License

MIT
