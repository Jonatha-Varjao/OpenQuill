import { useAppStore } from '@/stores/appStore';
import type { TransformationResult, AnalysisResult } from '@/types';
import './ResultPanel.css';

interface ResultPanelProps {
  onBack: () => void;
}

export default function ResultPanel({ onBack }: ResultPanelProps) {
  const { result, selectedText, currentEmotion, isAnalyzing, setSelectedText, setResult } =
    useAppStore();

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      console.error('Failed to copy');
    }
  };

  const handleReplace = () => {
    if (result && 'transformed' in result) {
      setSelectedText(result.transformed);
      setResult(null);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="result-panel">
        <div className="loading">
          <div className="spinner"></div>
          <p>Analyzing text...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="result-panel">
        <p className="no-result">No results yet. Enter text and click Analyze.</p>
        <button className="back-btn" onClick={onBack}>
          Back
        </button>
      </div>
    );
  }

  const isTransformation = 'transformed' in result;

  return (
    <div className="result-panel">
      <div className="result-section">
        <h3>Original ({currentEmotion})</h3>
        <div className="result-content">{selectedText}</div>
        <button className="copy-btn" onClick={() => handleCopy(selectedText)}>
          Copy
        </button>
      </div>

      {isTransformation && (
        <div className="result-section">
          <h3>Transformed</h3>
          <div className="result-content transformed">
            {(result as TransformationResult).transformed}
          </div>
          <div className="result-actions">
            <button
              className="copy-btn"
              onClick={() => handleCopy((result as TransformationResult).transformed)}
            >
              Copy
            </button>
            <button className="replace-btn" onClick={handleReplace}>
              Replace
            </button>
          </div>
        </div>
      )}

      {!isTransformation && (
        <div className="result-section">
          <h3>Grammar Issues</h3>
          <div className="issues-list">
            {(result as AnalysisResult).issues.map((issue) => (
              <div key={`${issue.type}-${issue.position.start}`} className={`issue issue-${issue.severity}`}>
                <span className="issue-type">{issue.type}</span>
                <span className="issue-message">{issue.message}</span>
                {issue.suggestion && <span className="issue-suggestion">→ {issue.suggestion}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="back-btn" onClick={onBack}>
        Analyze More
      </button>
    </div>
  );
}
