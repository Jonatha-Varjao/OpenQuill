import { useHistoryStore } from '@/stores/historyStore';
import './HistoryPanel.css';

export default function HistoryPanel() {
  const { items, removeItem, clearHistory } = useHistoryStore();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      console.error('Failed to copy');
    }
  };

  if (items.length === 0) {
    return (
      <div className="history-panel">
        <p className="no-history">No analysis history yet.</p>
      </div>
    );
  }

  return (
    <div className="history-panel">
      <div className="history-header">
        <h3>History ({items.length})</h3>
        <button className="clear-btn" onClick={clearHistory}>
          Clear All
        </button>
      </div>

      <div className="history-list">
        {items.map((item) => (
          <div key={item.id} className="history-item">
            <div className="history-meta">
              <span className="history-date">{formatDate(item.timestamp)}</span>
              {item.emotion && <span className="history-emotion">{item.emotion}</span>}
            </div>
            <div className="history-text">{item.originalText.slice(0, 100)}...</div>
            {item.transformedText && (
              <div className="history-actions">
                <button onClick={() => handleCopy(item.originalText)}>Copy Original</button>
                <button onClick={() => handleCopy(item.transformedText!)}>Copy Result</button>
                <button onClick={() => removeItem(item.id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
