import '@/__mocks__/chrome';
import { describe, it, expect, beforeEach } from 'bun:test';
import { useHistoryStore } from './historyStore';
import type { EmotionType } from '@/types';

describe('useHistoryStore', () => {
  beforeEach(async () => {
    const { clearMemoryStore } = await import('@/__mocks__/chrome');
    clearMemoryStore();
    useHistoryStore.getState().clearHistory();
  });

  it('should have empty initial state', () => {
    const state = useHistoryStore.getState();
    expect(state.items).toEqual([]);
  });

  it('should add item with generated id and timestamp', () => {
    const item = {
      originalText: 'hello world',
      transformedText: 'HELLO WORLD',
      emotion: 'professional' as EmotionType,
      provider: 'ollama',
      model: 'llama3.2',
    };

    useHistoryStore.getState().addItem(item);
    const state = useHistoryStore.getState();

    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBeDefined();
    expect(state.items[0].timestamp).toBeDefined();
    expect(state.items[0].originalText).toBe('hello world');
    expect(state.items[0].transformedText).toBe('HELLO WORLD');
    expect(state.items[0].emotion).toBe('professional');
  });

  it('should add most recent item first', () => {
    useHistoryStore.getState().addItem({
      originalText: 'first',
      provider: 'ollama',
      model: 'llama3.2',
    });
    useHistoryStore.getState().addItem({
      originalText: 'second',
      provider: 'ollama',
      model: 'llama3.2',
    });

    const state = useHistoryStore.getState();
    expect(state.items[0].originalText).toBe('second');
    expect(state.items[1].originalText).toBe('first');
  });

  it('should limit items to 50', () => {
    for (let i = 0; i < 60; i++) {
      useHistoryStore.getState().addItem({
        originalText: `item ${i}`,
        provider: 'ollama',
        model: 'llama3.2',
      });
    }

    const state = useHistoryStore.getState();
    expect(state.items).toHaveLength(50);
    expect(state.items[0].originalText).toBe('item 59');
    expect(state.items[49].originalText).toBe('item 10');
  });

  it('should remove item by id', () => {
    useHistoryStore.getState().addItem({
      originalText: 'first',
      provider: 'ollama',
      model: 'llama3.2',
    });
    useHistoryStore.getState().addItem({
      originalText: 'second',
      provider: 'ollama',
      model: 'llama3.2',
    });

    const state = useHistoryStore.getState();
    expect(state.items[0].originalText).toBe('second');
    
    const idToRemove = state.items[0].id;

    useHistoryStore.getState().removeItem(idToRemove);

    const newState = useHistoryStore.getState();
    expect(newState.items).toHaveLength(1);
    expect(newState.items[0].originalText).toBe('first');
  });

  it('should clear all items', () => {
    useHistoryStore.getState().addItem({
      originalText: 'item 1',
      provider: 'ollama',
      model: 'llama3.2',
    });
    useHistoryStore.getState().addItem({
      originalText: 'item 2',
      provider: 'ollama',
      model: 'llama3.2',
    });

    useHistoryStore.getState().clearHistory();

    const state = useHistoryStore.getState();
    expect(state.items).toEqual([]);
  });
});
