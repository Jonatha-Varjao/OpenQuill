console.log('OpenQuill content script loaded');

import { initInlineEditor } from './content/inlineEditor';

interface ChromeSidePanel {
  open: () => void;
}

let fab: HTMLButtonElement | null = null;

function createFAB(): HTMLButtonElement {
  if (fab) return fab;

  fab = document.createElement('button');
  fab.className = 'openquill-fab';
  fab.title = 'Analyze with OpenQuill';
  fab.innerHTML = '✨';
  fab.style.cssText = 'position: absolute; z-index: 2147483647; width: 36px; height: 36px; border-radius: 50%; border: none; background: #10b981; color: white; cursor: pointer; font-size: 18px; display: none; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2); transition: transform 0.2s, opacity 0.2s;';

  fab.addEventListener('click', function() {
    const selection = window.getSelection();
    const text = selection ? selection.toString() : '';
    if (text) {
      chrome.runtime.sendMessage({
        action: 'ANALYZE_TEXT',
        payload: { text: text }
      });
      (chrome.sidePanel as unknown as ChromeSidePanel).open();
    }
  });

  document.body.appendChild(fab);
  return fab;
}

function showFAB(x: number, y: number): void {
  const fabElement = createFAB();
  fabElement.style.display = 'flex';
  fabElement.style.left = x + 'px';
  fabElement.style.top = y + 'px';
}

function hideFAB(): void {
  if (fab) {
    fab.style.display = 'none';
  }
}

document.addEventListener('mouseup', function() {
  const selection = window.getSelection();
  const text = selection ? selection.toString() : '';

  if (text && text.trim().length > 0 && selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect) {
      showFAB(rect.left + window.scrollX, rect.bottom + window.scrollY + 8);
    }
  } else {
    hideFAB();
  }
});

document.addEventListener('mousedown', function(e: Event) {
  const target = e.target as HTMLElement;
  if (fab && !fab.contains(target)) {
    hideFAB();
  }
});

chrome.runtime.onMessage.addListener(function(message) {
  if (message.action === 'ANALYZE_SELECTION') {
    const selection = window.getSelection();
    const text = selection ? selection.toString() : '';
    if (text) {
      (chrome.sidePanel as unknown as ChromeSidePanel).open();
    }
  }
});

initInlineEditor();
