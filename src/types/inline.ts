export type SuggestionType = 'grammar' | 'spelling' | 'style' | 'tone';

export interface Suggestion {
  start: number;
  end: number;
  type: SuggestionType;
  original: string;
  suggestion: string;
}

export interface InlineEditorState {
  isEnabled: boolean;
  isAnalyzing: boolean;
  suggestions: Suggestion[];
  activeSuggestion: Suggestion | null;
}

export interface TextTrackerOptions {
  debounceMs: number;
  minTextLength: number;
  targetSelectors: string[];
}