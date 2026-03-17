import { describe, it, expect, beforeEach } from 'bun:test';
import { useAppStore } from './appStore';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.getState().reset();
  });

  it('should have correct initial state', () => {
    const state = useAppStore.getState();
    expect(state.selectedText).toBe('');
    expect(state.currentEmotion).toBe('professional');
    expect(state.isAnalyzing).toBe(false);
    expect(state.result).toBeNull();
    expect(state.error).toBeNull();
  });

  it('should update selectedText with setSelectedText', () => {
    useAppStore.getState().setSelectedText('hello world');
    expect(useAppStore.getState().selectedText).toBe('hello world');
  });

  it('should clear error when setSelectedText is called', () => {
    useAppStore.getState().setError('some error');
    useAppStore.getState().setSelectedText('new text');
    expect(useAppStore.getState().error).toBeNull();
  });

  it('should update currentEmotion with setEmotion', () => {
    useAppStore.getState().setEmotion('casual');
    expect(useAppStore.getState().currentEmotion).toBe('casual');
  });

  it('should update isAnalyzing with setAnalyzing', () => {
    useAppStore.getState().setAnalyzing(true);
    expect(useAppStore.getState().isAnalyzing).toBe(true);
    useAppStore.getState().setAnalyzing(false);
    expect(useAppStore.getState().isAnalyzing).toBe(false);
  });

  it('should update result and clear error with setResult', () => {
    useAppStore.getState().setError('previous error');
    useAppStore.getState().setResult({
      original: 'hello',
      transformed: 'HELLO',
      emotion: 'professional',
    });
    const state = useAppStore.getState();
    expect(state.result).toEqual({
      original: 'hello',
      transformed: 'HELLO',
      emotion: 'professional',
    });
    expect(state.error).toBeNull();
  });

  it('should update error and clear result with setError', () => {
    useAppStore.getState().setResult({
      original: 'hello',
      transformed: 'HELLO',
      emotion: 'professional',
    });
    useAppStore.getState().setError('something broke');
    const state = useAppStore.getState();
    expect(state.error).toBe('something broke');
    expect(state.result).toBeNull();
  });

  it('should reset to initial state', () => {
    useAppStore.getState().setSelectedText('text');
    useAppStore.getState().setEmotion('casual');
    useAppStore.getState().setAnalyzing(true);
    useAppStore.getState().setError('err');
    useAppStore.getState().reset();
    const state = useAppStore.getState();
    expect(state.selectedText).toBe('');
    expect(state.currentEmotion).toBe('professional');
    expect(state.isAnalyzing).toBe(false);
    expect(state.result).toBeNull();
    expect(state.error).toBeNull();
  });
});
