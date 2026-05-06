import type { TextTrackerOptions } from '@/types/inline';

const DEFAULT_OPTIONS: TextTrackerOptions = {
  debounceMs: 500,
  minTextLength: 20,
  targetSelectors: ['[contenteditable]', 'textarea', 'input[type="text"]', 'input[type="search"]'],
};

export class TextTracker {
  private options: TextTrackerOptions;
  private listeners: Map<Element, () => void> = new Map();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private onTextChange: (text: string, element: Element) => void;
  private observer: MutationObserver | null = null;

  constructor(onTextChange: (text: string, element: Element) => void, options: Partial<TextTrackerOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.onTextChange = onTextChange;
  }

  start(): void {
    this.attachToExistingElements();
    this.setupMutationObserver();
  }

  stop(): void {
    this.detachAllListeners();
    this.observer?.disconnect();
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  updateDebounce(debounceMs: number): void {
    this.options.debounceMs = debounceMs;
  }

  private attachToExistingElements(): void {
    const elements = document.querySelectorAll(this.options.targetSelectors.join(', '));
    elements.forEach(el => this.attachListener(el as HTMLElement));
  }

  private setupMutationObserver(): void {
    this.observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node instanceof HTMLElement) {
              if (this.isTargetElement(node)) {
                this.attachListener(node);
              }
              node.querySelectorAll(this.options.targetSelectors.join(', ')).forEach(el => {
                this.attachListener(el as HTMLElement);
              });
            }
          }
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private isTargetElement(element: HTMLElement): boolean {
    return element.matches?.(this.options.targetSelectors.join(', ')) ?? false;
  }

  private attachListener(element: HTMLElement): void {
    if (this.listeners.has(element)) return;

    const handler = () => this.handleInput(element);
    element.addEventListener('input', handler);
    this.listeners.set(element, () => element.removeEventListener('input', handler));
  }

  private detachAllListeners(): void {
    this.listeners.forEach(unmount => unmount());
    this.listeners.clear();
  }

  private handleInput(element: HTMLElement): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      const text = this.getTextContent(element);
      if (text.length >= this.options.minTextLength) {
        this.onTextChange(text, element);
      }
    }, this.options.debounceMs);
  }

  private getTextContent(element: HTMLElement): string {
    if (element.isContentEditable) {
      return element.textContent ?? '';
    }
    if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
      return element.value;
    }
    return element.textContent ?? '';
  }
}