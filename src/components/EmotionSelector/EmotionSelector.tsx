import { useAppStore } from '@/stores/appStore';
import type { EmotionType } from '@/types';
import './EmotionSelector.css';

const EMOTIONS: { value: EmotionType; label: string; description: string }[] = [
  { value: 'professional', label: 'Professional', description: 'Clear, business-appropriate' },
  { value: 'casual', label: 'Casual', description: 'Relaxed, conversational' },
  { value: 'friendly', label: 'Friendly', description: 'Warm, approachable' },
  { value: 'formal', label: 'Formal', description: 'Proper, structured' },
  { value: 'academic', label: 'Academic', description: 'Scholarly, objective' },
  { value: 'creative', label: 'Creative', description: 'Imaginative, expressive' },
];

export default function EmotionSelector() {
  const { currentEmotion, setEmotion } = useAppStore();

  return (
    <div className="emotion-selector">
      <label className="emotion-label">Transform to:</label>
      <div className="emotion-grid">
        {EMOTIONS.map((emotion) => (
          <button
            key={emotion.value}
            className={`emotion-btn ${currentEmotion === emotion.value ? 'active' : ''}`}
            onClick={() => setEmotion(emotion.value)}
            title={emotion.description}
          >
            <span className="emotion-name">{emotion.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
