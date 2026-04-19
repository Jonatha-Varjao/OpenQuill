# Architecture Documentation

## System Overview

```mermaid
graph TB
    subgraph "Browser Extension"
        subgraph "Background"
            BG["background.ts<br/>Service Worker (MV3)"]
        end
        subgraph "Content"
            CS["content.ts<br/>Content Script"]
            FAB["FAB Button"]
        end
        subgraph "UI"
            POPUP["popup/main.tsx<br/>PopupApp"]
            SIDE["sidepanel/main.tsx<br/>SidepanelApp"]
        end
        subgraph "Components"
            TI["TextInput"]
            ES["EmotionSelector"]
            RP["ResultPanel"]
            HP["HistoryPanel"]
        end
        subgraph "State"
            APP["appStore"]
            SET["settingsStore"]
            HIST["historyStore"]
        end
        subgraph "Services"
            LLM["services/llm.ts"]
            HOOK["hooks/useLLM.ts"]
        end
    end
    subgraph "External"
        OLLAMA["Ollama<br/>localhost:11434"]
        OPENAI["OpenAI API"]
    end

    CS --> FAB
    POPUP --> TI & ES & RP
    SIDE --> TI & ES & RP & HP
    TI & ES & RP --> APP
    HP --> HIST
    APP --> HOOK --> LLM
    LLM --> OLLAMA & OPENAI
    CS & POPUP -->|"chrome.runtime.sendMessage"| BG
```

## Component Hierarchy

```mermaid
graph TB
    POPUP["PopupApp"] --> TI1["TextInput"]
    POPUP --> ES1["EmotionSelector"]
    POPUP --> RP1["ResultPanel"]
    SIDE["SidepanelApp"] --> TI2["TextInput"]
    SIDE --> ES2["EmotionSelector"]
    SIDE --> RP2["ResultPanel"]
    SIDE --> HP["HistoryPanel"]
    TI1 & TI2 & ES1 & ES2 & RP1 & RP2 --> APP["appStore"]
    HP --> HIST["historyStore"]
    APP --> HOOK["useLLM"] --> LLM["llm.ts"]
    LLM --> OLLAMA["Ollama"]
    LLM --> OPENAI["OpenAI API"]
```

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant CS as content.ts
    participant BG as background.ts
    participant UI as Popup/Sidepanel
    participant Store as appStore
    participant Hook as useLLM
    participant LLM as services/llm.ts
    participant API as Ollama/OpenAI

    User->>CS: Select text
    CS->>CS: Show FAB
    User->>CS: Click FAB
    CS->>BG: sendMessage(ANALYZE_TEXT)
    BG-->>User: Open sidepanel

    User->>UI: Enter text
    UI->>Store: setSelectedText()
    User->>UI: Click Analyze
    UI->>Hook: analyze()
    Hook->>Store: setAnalyzing(true)
    Hook->>LLM: checkConnection()
    LLM->>API: GET /api/tags

    alt Connected
        Hook->>LLM: analyzeText()
        LLM->>API: POST /api/generate
        API-->>LLM: response
        LLM-->>Hook: AnalysisResult
        Hook->>Store: setResult()
        Hook->>Store: addItem()
    else Not Connected
        Hook->>Store: setError()
    end
    Hook->>Store: setAnalyzing(false)
```

## State Stores

```mermaid
erDiagram
    appStore {
        string selectedText
        EmotionType currentEmotion
        boolean isAnalyzing
        result null
        string error
        setSelectedText()
        setEmotion()
        setAnalyzing()
        setResult()
        setError()
        reset()
    }

    settingsStore {
        Provider provider
        string endpoint
        string apiKey
        string model
        setProvider()
        setEndpoint()
        reset()
    }

    historyStore {
        HistoryItem[] items
        addItem()
        removeItem()
        clearHistory()
        reset()
    }

    appStore --> settingsStore: getState()
    appStore --> historyStore: addItem()
```

## Message Protocol

| Action | Direction | Payload |
|--------|-----------|---------|
| ANALYZE_TEXT | content → background | `{text, emotion?}` |
| GET_SETTINGS | popup → background | `{}` |
| ANALYZE_SELECTION | background → content | `{}` |

```mermaid
graph LR
    C[content.ts] -->|"sendMessage"| B[background.ts]
    B -->|"tabs.sendMessage"| C
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun |
| Language | TypeScript strict |
| Bundler | Bun native |
| UI | React 18 |
| State | Zustand 5 |
| Extension | Manifest V3 |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │   Popup     │    │  Side Panel  │    │  Content Script │   │
│  │   (React)   │    │   (React)    │    │  (Injected)     │   │
│  └──────┬───────┘    └──────┬───────┘    └────────┬─────────┘   │
│         │                   │                      │              │
│         └───────────────────┼──────────────────────┘              │
│                             │                                     │
│                    ┌────────▼────────┐                           │
│                    │  Message Passing │                           │
│                    └────────┬────────┘                           │
│                             │                                     │
│                    ┌────────▼────────┐                           │
│                    │   Background    │                           │
│                    │  Service Worker │                           │
│                    └────────┬────────┘                           │
└─────────────────────────────┼─────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   LLM Service     │
                    │  ┌─────────────┐  │
                    │  │   Ollama    │  │
                    │  │ (localhost) │  │
                    │  └─────────────┘  │
                    │  ┌─────────────┐  │
                    │  │  OpenAI     │  │
                    │  │ (API)       │  │
                    │  └─────────────┘  │
                    └───────────────────┘
```

---

## Component Architecture

### 1. Content Script (`src/content/`)

**Responsibility**: Captures user-selected text and injects UI elements into web pages.

**Key Features**:

- Text selection detection
- Context menu integration
- Floating action button for quick access
- Message passing to background worker

**Public API**:

```typescript
// Types exposed to other modules
interface ContentScriptAPI {
  getSelectedText(): Promise<string>;
  showAnalysisResult(result: AnalysisResult): void;
  hideOverlay(): void;
}
```

### 2. Background Service Worker (`src/background/`)

**Responsibility**: Handles long-running tasks, manages LLM communication, coordinates between components.

**Key Features**:

- LLM API calls (Ollama/OpenAI)
- Message routing
- Storage management
- Keyboard shortcut handling

**Public API**:

```typescript
interface BackgroundAPI {
  analyzeText(text: string, emotion: EmotionType): Promise<AnalysisResult>;
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<Settings>): Promise<void>;
}
```

### 3. Popup UI (`src/popup/`)

**Responsibility**: Quick access UI when clicking extension icon.

**Key Features**:

- Text input area
- Emotion selector
- Quick analyze button
- Recent analyses history

### 4. Side Panel (`src/sidepanel/`)

**Responsibility**: Full-featured analysis interface.

**Key Features**:

- Detailed text analysis view
- Grammar/syntax feedback display
- Tone transformation results
- History and saved suggestions

---

## Data Flow

### Flow 1: Text Analysis

```
1. User selects text on any webpage
2. Content script captures selection
3. User clicks extension icon or uses keyboard shortcut
4. Side panel/Popup opens with selected text
5. User clicks "Analyze" or selects emotion
6. UI sends message to background worker
7. Background worker calls LLM API
8. LLM returns analysis result
9. Background sends result back to UI
10. UI displays analysis/suggestions
```

### Flow 2: Tone Transformation

```
1. User has analyzed text or enters new text
2. User selects target emotion (Professional, Casual, etc.)
3. UI sends text + emotion to background worker
4. Background constructs prompt with emotion system message
5. Background calls LLM with prompt
6. LLM returns rewritten text
7. UI displays original vs transformed
8. User can copy or replace text
```

---

## State Management (Zustand)

### Stores

| Store              | Purpose                                            | Location                      |
| ------------------ | -------------------------------------------------- | ----------------------------- |
| `useAppStore`      | UI state (selected text, current emotion, loading) | `src/stores/appStore.ts`      |
| `useSettingsStore` | User preferences (LLM endpoint, default emotion)   | `src/stores/settingsStore.ts` |
| `useHistoryStore`  | Analysis history                                   | `src/stores/historyStore.ts`  |

### Persistence

- **chrome.storage.local**: Extension data (history, caches)
- **chrome.storage.sync**: User preferences (跨 device sync if user is signed in)

---

## LLM Integration

### Supported Providers

| Provider                   | Type  | Endpoint                    | Authentication |
| -------------------------- | ----- | --------------------------- | -------------- |
| Ollama                     | Local | `http://localhost:11434`    | None           |
| LM Studio                  | Local | `http://localhost:1234/v1`  | None           |
| OpenAI                     | Cloud | `https://api.openai.com/v1` | API Key        |
| Custom (OpenAI-compatible) | Both  | Configurable                | API Key        |

### Prompt System

Each emotion has a predefined system prompt:

```typescript
const EMOTION_PROMPTS = {
  professional: `You are a professional editor. Rewrite the text to be professional, clear, and business-appropriate. Maintain all factual information.`,
  casual: `You are a friendly writer. Rewrite the text in a casual, conversational tone while preserving the meaning.`,
  friendly: `You are a warm, friendly communicator. Make the text approachable and warm while staying clear.`,
  formal: `You are a formal writing expert. Rewrite with proper grammar, complex sentences, and formal vocabulary.`,
  academic: `You are an academic writer. Use scholarly language, citations format, and impersonal voice.`,
  creative: `You are a creative writer. Add creativity and flair while maintaining the core message.`,
};
```

---

## Security Considerations

1. **No Remote Code Execution**: All extension code is bundled, no eval()
2. **Minimal Permissions**: Only request what's needed
3. **Local-First**: User data stays local by default
4. **API Key Protection**: Store in chrome.storage.local, not in code
5. **CSP Compliant**: Follow Manifest V3 CSP requirements

---

## File Structure

```
src/
├── background/
│   ├── index.ts           # Entry point
│   ├── messages.ts        # Message handlers
│   └── storage.ts         # Storage utilities
├── content/
│   ├── index.ts           # Entry point
│   ├── selection.ts       # Text selection logic
│   └── overlay.ts         # Injected UI elements
├── popup/
│   ├── index.tsx          # Entry point
│   ├── App.tsx            # Main component
│   └── components/        # UI components
├── sidepanel/
│   ├── index.tsx          # Entry point
│   ├── App.tsx            # Main component
│   └── components/        # UI components
├── components/            # Shared components
│   ├── Button/
│   ├── TextInput/
│   ├── EmotionSelector/
│   └── ResultPanel/
├── hooks/                 # Custom hooks
│   ├── useLLM.ts          # LLM communication
│   ├── useSelection.ts   # Text selection
│   └── useStorage.ts      # Storage helpers
├── stores/                # Zustand stores
│   ├── appStore.ts
│   ├── settingsStore.ts
│   └── historyStore.ts
├── services/              # External services
│   ├── ollama.ts
│   ├── openai.ts
│   └── types.ts
├── utils/                 # Utilities
│   ├── promptBuilder.ts
│   └── textParser.ts
└── types/                 # TypeScript definitions
    └── index.ts
```

---

## Future Considerations (Post v1.0)

- Multi-language support
- Grammar-specific models
- Custom prompt templates
- Browser sync
- Cloud backup
- Team/enterprise features
