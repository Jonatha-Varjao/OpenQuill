export type EmotionType =
  | 'professional'
  | 'casual'
  | 'friendly'
  | 'formal'
  | 'academic'
  | 'creative';

export interface AnalysisResult {
  text: string;
  issues: GrammarIssue[];
  score?: number;
}

export interface GrammarIssue {
  type: 'grammar' | 'spelling' | 'punctuation' | 'style';
  severity: 'error' | 'warning' | 'suggestion';
  message: string;
  position: {
    start: number;
    end: number;
  };
  suggestion?: string;
}

export interface TransformationResult {
  original: string;
  transformed: string;
  emotion: EmotionType;
  changes?: {
    type: 'word_choice' | 'structure' | 'tone' | 'grammar';
    description: string;
  }[];
}

export interface Settings {
  provider: 'ollama' | 'openai' | 'custom';
  endpoint: string;
  apiKey: string;
  model: string;
  defaultEmotion: EmotionType;
  defaultAnalysisMode: 'grammar' | 'tone' | 'both';
  keyboardShortcut: string;
  autoAnalyze: boolean;
  showFab: boolean;
  saveHistory: boolean;
  maxHistoryItems: number;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  originalText: string;
  transformedText?: string;
  emotion?: EmotionType;
  analysis?: AnalysisResult;
  provider: string;
  model: string;
}

export interface AppState {
  selectedText: string;
  currentEmotion: EmotionType;
  isAnalyzing: boolean;
  result: TransformationResult | AnalysisResult | null;
  error: string | null;
  setSelectedText: (text: string) => void;
  setEmotion: (emotion: EmotionType) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setResult: (result: TransformationResult | AnalysisResult | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export interface SettingsState extends Settings {
  setProvider: (provider: Settings['provider']) => void;
  setEndpoint: (endpoint: string) => void;
  setApiKey: (apiKey: string) => void;
  setModel: (model: string) => void;
  setDefaultEmotion: (emotion: EmotionType) => void;
  setDefaultAnalysisMode: (mode: Settings['defaultAnalysisMode']) => void;
  setKeyboardShortcut: (shortcut: string) => void;
  setAutoAnalyze: (auto: boolean) => void;
  setShowFab: (show: boolean) => void;
  setSaveHistory: (save: boolean) => void;
  setMaxHistoryItems: (max: number) => void;
}

export interface HistoryState {
  items: HistoryItem[];
  addItem: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  removeItem: (id: string) => void;
  clearHistory: () => void;
}
