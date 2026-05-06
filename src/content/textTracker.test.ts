import '@/__mocks__/dom';
import { describe, it, expect, beforeEach, afterEach, vi } from 'bun:test';
import { TextTracker } from './textTracker';

// Mock the chrome global
vi.mock('@/stores/settingsStore', () => ({
  useSettingsStore: {
    getState: () => ({
      provider: 'ollama',
      endpoint: 'http://localhost:11434',
      model: 'llama3.2',
    }),
  },
}));

describe('TextTracker', () => {
  let mockElement: HTMLTextAreaElement;
  let textChangeCallback: (text: string, element: Element) => void;

  beforeEach(() => {
    vi.useFakeTimers();
    textChangeCallback = vi.fn();
    mockElement = document.createElement('textarea');
    document.body.appendChild(mockElement);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should use default options when none provided', () => {
      const tracker = new TextTracker(textChangeCallback);
      expect(tracker).toBeDefined();
    });

    it('should merge provided options with defaults', () => {
      const tracker = new TextTracker(textChangeCallback, { debounceMs: 1000 });
      expect(tracker).toBeDefined();
    });
  });

  describe('debounce logic', () => {
    it('should not call callback immediately on input', () => {
      const tracker = new TextTracker(textChangeCallback, { debounceMs: 500 });
      tracker.start();

      mockElement.value = 'some text content here';
      mockElement.dispatchEvent(new Event('input'));

      expect(textChangeCallback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(400);
      expect(textChangeCallback).not.toHaveBeenCalled();
    });

    it('should call callback after debounce delay', () => {
      const tracker = new TextTracker(textChangeCallback, { debounceMs: 500 });
      tracker.start();

      mockElement.value = 'some text content here';
      mockElement.dispatchEvent(new Event('input'));

      vi.advanceTimersByTime(500);

      expect(textChangeCallback).toHaveBeenCalledWith('some text content here', mockElement);
    });

    it('should not trigger callback for text shorter than minTextLength', () => {
      const tracker = new TextTracker(textChangeCallback, { debounceMs: 500, minTextLength: 50 });
      tracker.start();

      mockElement.value = 'short';
      mockElement.dispatchEvent(new Event('input'));

      vi.advanceTimersByTime(500);

      expect(textChangeCallback).not.toHaveBeenCalled();
    });

    it('should trigger callback for text meeting minTextLength', () => {
      const tracker = new TextTracker(textChangeCallback, { debounceMs: 500, minTextLength: 10 });
      tracker.start();

      mockElement.value = 'exactly ten';
      mockElement.dispatchEvent(new Event('input'));

      vi.advanceTimersByTime(500);

      expect(textChangeCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('stop', () => {
    it('should clear debounce timer on stop', () => {
      const tracker = new TextTracker(textChangeCallback, { debounceMs: 500 });
      tracker.start();

      mockElement.value = 'test content that is long enough';
      mockElement.dispatchEvent(new Event('input'));

      tracker.stop();

      vi.advanceTimersByTime(500);

      expect(textChangeCallback).not.toHaveBeenCalled();
    });
  });

  describe('updateDebounce', () => {
    it('should allow updating debounce delay', () => {
      const tracker = new TextTracker(textChangeCallback, { debounceMs: 500 });
      tracker.start();

      tracker.updateDebounce(1000);

      mockElement.value = 'some long text here for testing';
      mockElement.dispatchEvent(new Event('input'));

      vi.advanceTimersByTime(500);
      expect(textChangeCallback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      expect(textChangeCallback).toHaveBeenCalled();
    });
  });
});