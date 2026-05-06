import { useSettingsStore } from '@/stores';
import './SettingsPanel.css';

export default function SettingsPanel() {
  const {
    enableInlineEditing,
    setEnableInlineEditing,
    inlineDebounceMs,
    setInlineDebounceMs,
  } = useSettingsStore();

  return (
    <div className="settings-panel">
      <h3 className="settings-title">Inline Editing</h3>

      <div className="settings-row">
        <label className="settings-label" htmlFor="inline-editing-toggle">
          Enable Inline Editing
        </label>
        <button
          id="inline-editing-toggle"
          className={`toggle-switch ${enableInlineEditing ? 'active' : ''}`}
          onClick={() => setEnableInlineEditing(!enableInlineEditing)}
          type="button"
          aria-pressed={enableInlineEditing}
        >
          <span className="toggle-slider" />
        </button>
      </div>

      <div className="settings-row">
        <label className="settings-label" htmlFor="inline-debounce">
          Inline Debounce (ms)
        </label>
        <input
          id="inline-debounce"
          type="number"
          className="settings-input"
          value={inlineDebounceMs}
          onChange={(e) => setInlineDebounceMs(Number(e.target.value))}
          min={100}
          max={5000}
          step={100}
        />
      </div>
    </div>
  );
}