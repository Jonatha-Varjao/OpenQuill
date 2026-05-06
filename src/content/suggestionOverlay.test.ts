import '@/__mocks__/dom';
import '@/__mocks__/chrome';
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { SuggestionOverlay } from './suggestionOverlay';
import type { Suggestion } from '@/types/inline';

describe('SuggestionOverlay', () => {
  let overlay: SuggestionOverlay;

  const createMockSuggestion = (overrides: Partial<Suggestion> = {}): Suggestion => ({
    start: 0,
    end: 3,
    type: 'spelling',
    original: 'teh',
    suggestion: 'the',
    ...overrides,
  });

  beforeEach(() => {
    overlay = new SuggestionOverlay();
  });

  afterEach(() => {
    overlay.clear();
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(overlay).toBeInstanceOf(SuggestionOverlay);
    });

    it('should inject styles into document head', () => {
      const styleId = 'oq-inline-styles';
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }

      expect(document.getElementById(styleId)).toBeNull();

      const newOverlay = new SuggestionOverlay();
      expect(document.getElementById(styleId)).not.toBeNull();
    });
  });

  describe('render', () => {
    it('should create a container element', () => {
      const getText = () => 'test text';
      overlay.render([], getText);

      const container = document.getElementById('oq-suggestions-container');
      expect(container).not.toBeNull();
    });

    it('should render suggestion spans with correct data attributes', () => {
      const suggestions = [createMockSuggestion({ start: 0, end: 3, original: 'teh', suggestion: 'the' })];
      const getText = () => 'teh quick brown fox';

      overlay.render(suggestions, getText);

      const errorSpans = document.querySelectorAll('.oq-error');
      expect(errorSpans.length).toBe(1);
      expect(errorSpans[0].textContent).toBe('teh');
      expect(errorSpans[0].dataset.start).toBe('0');
      expect(errorSpans[0].dataset.end).toBe('3');
      expect(errorSpans[0].dataset.original).toBe('teh');
      expect(errorSpans[0].dataset.suggestion).toBe('the');
      expect(errorSpans[0].dataset.type).toBe('spelling');
    });

    it('should render multiple suggestions', () => {
      const suggestions = [
        createMockSuggestion({ start: 0, end: 3, original: 'teh', suggestion: 'the' }),
        createMockSuggestion({ start: 4, end: 9, original: 'quick', suggestion: 'fast' }),
      ];
      const getText = () => 'teh quick brown fox';

      overlay.render(suggestions, getText);

      const errorSpans = document.querySelectorAll('.oq-error');
      expect(errorSpans.length).toBe(2);
    });

    it('should handle different suggestion types', () => {
      const suggestions = [
        createMockSuggestion({ type: 'grammar', start: 0, end: 5, original: 'isnt', suggestion: "isnt" }),
        createMockSuggestion({ type: 'style', start: 6, end: 12, original: 'very', suggestion: '' }),
        createMockSuggestion({ type: 'tone', start: 13, end: 19, original: 'bad', suggestion: 'inappropriate' }),
      ];
      const getText = () => 'isnt very bad word';

      overlay.render(suggestions, getText);

      const grammarSpan = document.querySelector('[data-type="grammar"]');
      const styleSpan = document.querySelector('[data-type="style"]');
      const toneSpan = document.querySelector('[data-type="tone"]');

      expect(grammarSpan).not.toBeNull();
      expect(styleSpan).not.toBeNull();
      expect(toneSpan).not.toBeNull();
    });

    it('should create error spans inside the container', () => {
      const suggestions = [createMockSuggestion()];
      const getText = () => 'teh text';

      overlay.render(suggestions, getText);

      const container = document.getElementById('oq-suggestions-container');
      const errorSpan = container?.querySelector('.oq-error');
      expect(errorSpan).not.toBeNull();
    });
  });

  describe('clear', () => {
    it('should remove container element', () => {
      const suggestions = [createMockSuggestion()];
      const getText = () => 'teh text';

      overlay.render(suggestions, getText);
      expect(document.getElementById('oq-suggestions-container')).not.toBeNull();

      overlay.clear();

      expect(document.getElementById('oq-suggestions-container')).toBeNull();
    });

    it('should remove error spans from document', () => {
      const suggestions = [createMockSuggestion()];
      const getText = () => 'teh text';

      overlay.render(suggestions, getText);
      expect(document.querySelectorAll('.oq-error').length).toBeGreaterThan(0);

      overlay.clear();

      expect(document.querySelectorAll('.oq-error').length).toBe(0);
    });
  });

  describe('applySuggestion', () => {
    it('should replace error text with suggestion', () => {
      const suggestions = [createMockSuggestion({ start: 0, end: 3, original: 'teh', suggestion: 'the' })];
      const getText = () => 'teh text';

      overlay.render(suggestions, getText);

      const errorSpan = document.querySelector('.oq-error') as HTMLSpanElement;
      overlay.applySuggestion(errorSpan);

      const container = document.getElementById('oq-suggestions-container');
      expect(container?.textContent).toContain('the');
      expect(container?.textContent).not.toContain('teh');
    });
  });
});