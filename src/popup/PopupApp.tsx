import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import EmotionSelector from '@/components/EmotionSelector/EmotionSelector';
import TextInput from '@/components/TextInput/TextInput';
import ResultPanel from '@/components/ResultPanel/ResultPanel';
import './popup.css';

export default function PopupApp() {
  const [mode, setMode] = useState<'input' | 'result'>('input');
  const { isAnalyzing, error } = useAppStore();

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>Grammarly Clone</h1>
      </header>

      <main className="popup-main">
        {mode === 'input' ? (
          <>
            <TextInput />
            <EmotionSelector />
            <button
              className="analyze-btn"
              disabled={isAnalyzing}
              onClick={() => setMode('result')}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          </>
        ) : (
          <ResultPanel onBack={() => setMode('input')} />
        )}

        {error && <div className="error-message">{error}</div>}
      </main>
    </div>
  );
}
