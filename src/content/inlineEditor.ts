import { TextTracker } from './textTracker';
import { SuggestionOverlay } from './suggestionOverlay';
import { analyzeInline } from '@/hooks/useInlineAnalysis';
import { useSettingsStore } from '@/stores';

export class InlineEditor {
  private textTracker: TextTracker | null = null;
  private suggestionOverlay: SuggestionOverlay;
  private isActive: boolean = false;

  constructor() {
    this.suggestionOverlay = new SuggestionOverlay();
  }

  async start(): Promise<void> {
    const settings = useSettingsStore.getState();

    if (!settings.enableInlineEditing) {
      return;
    }

    if (this.isActive) return;

    this.textTracker = new TextTracker(
      async (text) => {
        await this.analyzeText(text);
      },
      {
        debounceMs: settings.inlineDebounceMs ?? 500,
        minTextLength: 20,
      }
    );

    this.textTracker.start();
    this.isActive = true;
  }

  stop(): void {
    this.textTracker?.stop();
    this.textTracker = null;
    this.suggestionOverlay.clear();
    this.isActive = false;
  }

  updateDebounce(debounceMs: number): void {
    this.textTracker?.updateDebounce(debounceMs);
  }

  private async analyzeText(text: string): Promise<void> {
    try {
      const suggestions = await analyzeInline(text);
      this.suggestionOverlay.render(suggestions, () => text);
    } catch {
      // Silently fail - inline mode shouldn't interrupt typing
    }
  }
}

let inlineEditor: InlineEditor | null = null;

export async function initInlineEditor(): Promise<void> {
  if (inlineEditor) {
    inlineEditor.start();
    return;
  }

  inlineEditor = new InlineEditor();
  await inlineEditor.start();
}

export function stopInlineEditor(): void {
  inlineEditor?.stop();
  inlineEditor = null;
}