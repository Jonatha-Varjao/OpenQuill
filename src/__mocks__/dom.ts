/**
 * JSDOM setup for tests that need browser APIs (document, window, etc.)
 * Import this at the top of test files that need DOM mocking.
 */

import { Window } from 'happy-dom';

export function setupDOM(): void {
  const window = new Window();
  const document = window.document;

  // Set up global properties
  (globalThis as Record<string, unknown>).window = window;
  (globalThis as Record<string, unknown>).document = document;
  (globalThis as Record<string, unknown>).navigator = window.navigator;
  (globalThis as Record<string, unknown>).MutationObserver = window.MutationObserver;
  (globalThis as Record<string, unknown>).HTMLElement = window.HTMLElement;
  (globalThis as Record<string, unknown>).HTMLTextAreaElement = window.HTMLTextAreaElement;
  (globalThis as Record<string, unknown>).HTMLInputElement = window.HTMLInputElement;
  (globalThis as Record<string, unknown>).Node = window.Node;
  (globalThis as Record<string, unknown>).MouseEvent = window.MouseEvent;
  (globalThis as Record<string, unknown>).Event = window.Event;

  // Polyfill getBoundingClientRect
  const originalGetBoundingClientRect = window.HTMLElement.prototype.getBoundingClientRect;
  if (!originalGetBoundingClientRect) {
    window.HTMLElement.prototype.getBoundingClientRect = () => ({
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
    });
  }

  // Ensure SyntaxError is available on window
  if (!window.SyntaxError) {
    (window as Record<string, unknown>).SyntaxError = SyntaxError;
  }
}

setupDOM();