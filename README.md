# Grammarly Clone - AI Writing Assistant Extension

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
- **Ollama** (optional) - For local LLM inference

### Installing Bun

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Verify installation
bun --version
```

## Quick Start

Choose your preferred runtime:

### Bun (Recommended)

```bash
bun install
bun run dev
```

### npm

```bash
npm install
npm run dev
```

### yarn

```bash
yarn
yarn dev
```

---

## Development

### Development Mode

```bash
bun run dev   # or npm run dev / yarn dev
```

- Hot reload enabled
- Auto-build on file save
- Open `chrome://extensions/`, enable Developer mode, and load the `dist/` folder

### Debugging

#### VS Code

1. Install "Chrome Debugger" or "Edge Tools" extension
2. Press `F5` or go to Run > Start Debugging
3. Select "Chrome: Debug Extension"
4. Configure `launch.json` as shown below:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Extension",
      "type": "chrome",
      "request": "launch",
      "url": "chrome://extensions/",
      "webRoot": "${workspaceFolder}",
      "preLaunchTask": "dev"
    }
  ]
}
```

#### In Browser

1. Open `chrome://extensions/`
2. Click "Service Worker" (link in background) to debug the service worker
3. Right-click the popup > Inspect to debug the UI

### Build

```bash
# Production
bun run build   # or npm run build

# Clean previous build
bun run clean
```

## Installation

```bash
# Clone the repository
git clone https://github.com/Jonatha-Varjao/grammarly-clone.git
cd grammarly-clone

# Install dependencies
bun install
```

## Development

```bash
# Build for production
bun run build

# Build output will be in dist/ folder
```

## Loading the Extension

### Chrome/Edge/Brave

1. Build the extension: `bun run build`
2. Open `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the `dist` folder

### Firefox

1. Build the extension
2. Open `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Select the `manifest.json` file in the `dist` folder

## Project Structure

```
.
├── src/
│   ├── background.ts       # Service worker (MV3)
│   ├── content.ts          # Content script (injected into pages)
│   ├── popup/              # Extension popup UI
│   │   ├── main.tsx
│   │   ├── PopupApp.tsx
│   │   └── popup.css
│   ├── sidepanel/          # Side panel UI
│   │   ├── main.tsx
│   │   ├── SidepanelApp.tsx
│   │   └── sidepanel.css
│   ├── components/          # Shared React components
│   │   ├── EmotionSelector/
│   │   ├── TextInput/
│   │   ├── ResultPanel/
│   │   └── HistoryPanel/
│   ├── hooks/              # Custom React hooks
│   ├── stores/              # Zustand state stores
│   ├── services/            # LLM API services
│   ├── types/               # TypeScript type definitions
│   └── utils/
├── public/                  # Static assets
│   └── manifest.json
├── dist/                    # Build output
├── docs/                    # Documentation
├── build.ts                 # Bun build script
├── tsconfig.json
└── package.json
```

## Loading the Extension

### Chrome/Edge/Brave

1. Run `bun run dev` to start the development server
2. Open `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the `dist` or `output` folder

### Firefox

1. Run `bun run dev`
2. Open `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Select the `manifest.json` file

## LLM Configuration

> **Important**: This extension only supports **English** text analysis and transformation.

### Local (Ollama)

1. Install [Ollama](https://ollama.ai)
2. Pull a model: `ollama pull llama3.2`
3. Start Ollama: `ollama serve`
4. Configure the extension to use `http://localhost:11434`

### Cloud (OpenAI-compatible)

1. Get an API key from OpenAI, Anthropic, or any OpenAI-compatible provider
2. Configure the endpoint URL and API key in extension settings

### Emotions (Tone Transformation)

The extension supports these emotion types for text transformation:

| Emotion | Description |
|---------|-------------|
| `professional` | Business and corporate writing |
| `casual` | Friendly, conversational tone |
| `friendly` | Warm and approachable |
| `formal` | Structured and objective |
| `academic` | Scholarly and research-focused |
| `creative` | Imaginative and expressive |

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript (strict mode)
- **Bundler**: Bun (native bundler)
- **UI Framework**: React 18
- **State Management**: Zustand 5
- **Extension Manifest**: MV3

## License

MIT
