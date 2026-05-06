import type { Suggestion } from '@/types/inline';

export class SuggestionOverlay {
  private container: HTMLDivElement | null = null;
  private activeTooltip: HTMLDivElement | null = null;

  constructor() {
    this.createStyles();
  }

  private createStyles(): void {
    if (document.getElementById('oq-inline-styles')) return;

    const style = document.createElement('style');
    style.id = 'oq-inline-styles';
    style.textContent = `
      .oq-error {
        text-decoration: wavy underline red;
        text-decoration-skip-ink: none;
        cursor: pointer;
        position: relative;
      }
      .oq-error:hover {
        background-color: rgba(255, 0, 0, 0.1);
      }
      .oq-tooltip {
        position: absolute;
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 6px;
        padding: 8px 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        max-width: 300px;
        top: 100%;
        left: 0;
        margin-top: 4px;
      }
      .oq-tooltip-header {
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
        text-transform: capitalize;
      }
      .oq-tooltip-suggestion {
        color: #007bff;
        margin-bottom: 8px;
      }
      .oq-tooltip-buttons {
        display: flex;
        gap: 8px;
      }
      .oq-tooltip-btn {
        padding: 4px 12px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        font-size: 12px;
      }
      .oq-tooltip-btn-apply {
        background: #007bff;
        color: white;
      }
      .oq-tooltip-btn-apply:hover {
        background: #0056b3;
      }
      .oq-tooltip-btn-dismiss {
        background: #e9ecef;
        color: #333;
      }
      .oq-tooltip-btn-dismiss:hover {
        background: #dee2e6;
      }
    `;
    document.head.appendChild(style);
  }

  render(suggestions: Suggestion[], getText: () => string): void {
    this.clear();
    this.createContainer();

    const text = getText();
    let offset = 0;

    for (const suggestion of suggestions) {
      const start = suggestion.start + offset;
      const end = suggestion.end + offset;

      const before = text.slice(0, start);
      const error = text.slice(start, end);
      const after = text.slice(end);

      this.insertErrorSpan(error, suggestion);
      offset += this.calculateOffset(before, error, after);
    }
  }

  private createContainer(): void {
    this.container = document.createElement('div');
    this.container.id = 'oq-suggestions-container';
    this.container.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
    document.body.appendChild(this.container);
  }

  private insertErrorSpan(errorText: string, suggestion: Suggestion): void {
    const span = document.createElement('span');
    span.className = 'oq-error';
    span.textContent = errorText;
    span.dataset.start = suggestion.start.toString();
    span.dataset.end = suggestion.end.toString();
    span.dataset.original = suggestion.original;
    span.dataset.suggestion = suggestion.suggestion;
    span.dataset.type = suggestion.type;

    span.addEventListener('mouseenter', () => this.showTooltip(span));
    span.addEventListener('mouseleave', () => this.hideTooltip());

    this.container?.appendChild(span);
  }

  private showTooltip(span: HTMLSpanElement): void {
    this.hideTooltip();

    const tooltip = document.createElement('div');
    tooltip.className = 'oq-tooltip';
    tooltip.innerHTML = `
      <div class="oq-tooltip-header">${span.dataset.type}</div>
      <div class="oq-tooltip-suggestion">${span.dataset.suggestion}</div>
      <div class="oq-tooltip-buttons">
        <button class="oq-tooltip-btn oq-tooltip-btn-apply">Apply</button>
        <button class="oq-tooltip-btn oq-tooltip-btn-dismiss">Dismiss</button>
      </div>
    `;

    const rect = span.getBoundingClientRect();
    tooltip.style.top = `${rect.bottom + window.scrollY + 4}px`;
    tooltip.style.left = `${rect.left + window.scrollX}px`;

    tooltip.querySelector('.oq-tooltip-btn-apply')?.addEventListener('click', () => {
      this.applySuggestion(span);
      this.hideTooltip();
    });

    tooltip.querySelector('.oq-tooltip-btn-dismiss')?.addEventListener('click', () => {
      this.dismissSuggestion(span);
      this.hideTooltip();
    });

    document.body.appendChild(tooltip);
    this.activeTooltip = tooltip;
  }

  private hideTooltip(): void {
    if (this.activeTooltip) {
      this.activeTooltip.remove();
      this.activeTooltip = null;
    }
  }

  applySuggestion(span: HTMLSpanElement): void {
    const suggestion = span.dataset.suggestion ?? '';
    const start = parseInt(span.dataset.start ?? '0', 10);
    const end = parseInt(span.dataset.end ?? '0', 10);

    const textNode = span.parentNode;
    if (!textNode) return;

    const text = textNode.textContent ?? '';
    const before = text.slice(0, start);
    const after = text.slice(end);

    textNode.textContent = before + suggestion + after;
  }

  dismissSuggestion(_span: HTMLSpanElement): void {
    // Future: track dismissed suggestions to avoid re-showing
  }

  private calculateOffset(_before: string, _error: string, _after: string): number {
    return 0;
  }

  clear(): void {
    this.hideTooltip();
    this.container?.remove();
    this.container = null;

    document.querySelectorAll('.oq-error').forEach(el => {
      if (el.parentNode) {
        const textNode = document.createTextNode(el.textContent ?? '');
        el.parentNode.replaceChild(textNode, el);
      }
    });
  }
}