import { useAppStore } from '@/stores/appStore';
import './TextInput.css';

const MAX_TEXT_LENGTH = 10000;

export default function TextInput() {
  const { selectedText, setSelectedText, setError } = useAppStore();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length > MAX_TEXT_LENGTH) {
      setError(`Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters`);
      return;
    }
    setSelectedText(text);
  };

  return (
    <div className="text-input-container">
      <label className="text-label" htmlFor="text-input">
        Text to analyze:
      </label>
      <textarea
        id="text-input"
        className="text-input"
        value={selectedText}
        onChange={handleChange}
        placeholder="Enter or select text to analyze..."
        rows={6}
      />
      <div className="text-counter">
        {selectedText.length} / {MAX_TEXT_LENGTH}
      </div>
    </div>
  );
}
