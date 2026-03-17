import '@/__mocks__/chrome';
import { describe, it, expect, beforeEach } from 'bun:test';
import { useSettingsStore } from './settingsStore';

describe('useSettingsStore', () => {
  beforeEach(async () => {
    // Reset chrome mock storage and reinitialize store
    const { clearMemoryStore } = await import('@/__mocks__/chrome');
    clearMemoryStore();
  });

  it('should have correct default settings', () => {
    const state = useSettingsStore.getState();
    expect(state.provider).toBe('ollama');
    expect(state.endpoint).toBe('http://localhost:11434');
    expect(state.apiKey).toBe('');
    expect(state.model).toBe('llama3.2');
    expect(state.defaultEmotion).toBe('professional');
    expect(state.defaultAnalysisMode).toBe('both');
    expect(state.autoAnalyze).toBe(false);
    expect(state.showFab).toBe(true);
    expect(state.saveHistory).toBe(true);
    expect(state.maxHistoryItems).toBe(50);
  });

  it('should update provider with setProvider', () => {
    useSettingsStore.getState().setProvider('openai');
    expect(useSettingsStore.getState().provider).toBe('openai');
  });

  it('should update endpoint with setEndpoint', () => {
    useSettingsStore.getState().setEndpoint('http://localhost:1234/v1');
    expect(useSettingsStore.getState().endpoint).toBe('http://localhost:1234/v1');
  });

  it('should update apiKey with setApiKey', () => {
    useSettingsStore.getState().setApiKey('sk-test-123');
    expect(useSettingsStore.getState().apiKey).toBe('sk-test-123');
  });

  it('should update model with setModel', () => {
    useSettingsStore.getState().setModel('mistral');
    expect(useSettingsStore.getState().model).toBe('mistral');
  });

  it('should update boolean flags', () => {
    useSettingsStore.getState().setAutoAnalyze(true);
    expect(useSettingsStore.getState().autoAnalyze).toBe(true);

    useSettingsStore.getState().setShowFab(false);
    expect(useSettingsStore.getState().showFab).toBe(false);

    useSettingsStore.getState().setSaveHistory(false);
    expect(useSettingsStore.getState().saveHistory).toBe(false);
  });

  it('should update defaultEmotion', () => {
    useSettingsStore.getState().setDefaultEmotion('casual');
    expect(useSettingsStore.getState().defaultEmotion).toBe('casual');
  });

  it('should update maxHistoryItems', () => {
    useSettingsStore.getState().setMaxHistoryItems(100);
    expect(useSettingsStore.getState().maxHistoryItems).toBe(100);
  });
});
