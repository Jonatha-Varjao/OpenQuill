# Roadmap v1.0

## Overview

Version 1.0 focuses on the core functionality: text selection, LLM integration, and tone transformation. The goal is a working extension that users can install and use to analyze and rewrite text with different emotional tones.

## Milestones

### Phase 1: Foundation (Week 1-2)

**Goal**: Set up the project structure and basic extension functionality

#### Tasks

- [x] Initialize project with Bun and TypeScript
- [x] Set up Bun build system (build.ts)
- [x] Set up Zustand stores (app, settings, history)
- [ ] Create basic extension popup UI
- [ ] Implement chrome.storage persistence
- [ ] Set up manifest.json with basic permissions

#### Deliverables

- Working development server (`bun run dev`)
- Extension loads in Chrome without errors
- Basic popup opens on icon click

---

### Phase 1.5: Inline Editing (Week 2.5)

**Goal**: Grammarly-style real-time writing assistance

#### Tasks

- [x] Implement text tracker with debounce
- [x] Create suggestion overlay system
- [x] Build inline LLM analysis hook
- [x] Add hover tooltips with Apply/Dismiss
- [x] Integrate with existing FAB workflow
- [x] Add settings toggle for inline mode

#### Deliverables

- [x] Inline underlines appear under grammar errors
- [x] Tooltip shows suggestion on hover
- [x] Apply button replaces text in-place
- [x] Seamless editing without manual copy-paste

---

### Phase 2: Text Selection (Week 3-4)

**Goal**: Capture selected text from any webpage

#### Tasks

- [ ] Add keyboard shortcut for quick analysis (e.g., Ctrl+Shift+G)
- [ ] Create floating action button (FAB) that appears on text selection
- [ ] Implement message passing between content script and background
- [ ] Add context menu option "Analyze with OpenQuill"

#### Deliverables

- User can select text on any webpage
- Keyboard shortcut triggers analysis flow
- Context menu shows extension option

---

### Phase 3: LLM Integration (Week 3-4)

**Goal**: Connect to Ollama and transform text

#### Tasks

- [ ] Create Ollama service with proper typing
- [ ] Implement OpenAI-compatible API fallback
- [ ] Add settings page for LLM configuration
- [ ] Handle connection errors (Ollama not running, wrong endpoint)
- [ ] Add loading states and progress indicators
- [ ] Implement timeout handling (local LLMs can be slow)

#### Deliverables

- Extension connects to local Ollama instance
- Settings page allows configuring endpoint and model
- User sees clear error if LLM is unreachable

---

### Phase 4: Tone Transformation (Week 4-5)

**Goal**: Core feature - rewrite text with different emotions

#### Tasks

- [ ] Define emotion prompts (Professional, Casual, Friendly, Formal, Academic, Creative)
- [ ] Create emotion selector UI component
- [ ] Implement text rewriting with LLM
- [ ] Display original vs transformed text side-by-side
- [ ] Add "Copy" and "Replace" buttons
- [ ] Add basic grammar/syntax feedback display

#### Deliverables

- User can select target emotion
- Text is rewritten according to selected tone
- User can copy or replace original text

---

### Phase 5: Side Panel (Week 5-6)

**Goal**: Full-featured analysis interface

#### Tasks

- [ ] Implement side panel UI (alternative to popup)
- [ ] Add detailed analysis view
- [ ] Show grammar suggestions
- [ ] Add analysis history
- [ ] Implement text input area for manual entry
- [ ] Add "Save to history" functionality

#### Deliverables

- Side panel opens with keyboard shortcut
- Full analysis view with multiple sections
- History of past analyses

---

### Phase 6: Polish & Release (Week 6-7)

**Goal**: Prepare for production release

#### Tasks

- [ ] Write comprehensive error messages
- [ ] Add user onboarding/tips
- [ ] Create extension icons (16, 48, 128px)
- [ ] Write extension description and metadata
- [ ] Test across browsers (Chrome, Edge, Firefox)
- [ ] Build production bundle
- [ ] Create store listing screenshots

#### Deliverables

- Extension ready for Chrome Web Store submission
- Clean, polished user experience
- Clear error messages and help text

---

## Timeline Summary

| Phase               | Duration | Key Deliverable                |
| ------------------- | -------- | ------------------------------ |
| Foundation          | 2 weeks  | Extension loads, basic UI      |
| Inline Editing      | 1.5 week | Real-time grammar assistance   |
| Text Selection      | 1 week   | Text capture works             |
| LLM Integration     | 1 week   | Ollama/llama.cpp connection    |
| Tone Transformation | 1 week   | Core feature works             |
| Side Panel          | 2 weeks  | Full UI complete               |
| Polish              | 1 week   | Release-ready                  |

**Total**: ~9.5 weeks to v1.0

---

## Post-v1.0 Ideas

These are not in scope for v1.0 but planned for future versions:

- [ ] Grammar-only analysis (without tone transformation)
- [ ] Multiple LLM provider support (Anthropic, Google AI)
- [ ] Language detection and translation
- [ ] Custom prompt templates
- [ ] Team/enterprise features
- [ ] Browser sync for settings
- [ ] Mobile companion app

---

## Success Criteria

v1.0 will be considered successful when:

1. ✅ Extension installs and loads without errors
2. ✅ User can select text and trigger analysis
3. ✅ Ollama connection works (or fallback to API)
4. ✅ At least 4 emotion transformations work correctly
5. ✅ User can copy or replace transformed text
6. ✅ Settings persist across browser sessions
7. ✅ No critical errors in console during normal use
