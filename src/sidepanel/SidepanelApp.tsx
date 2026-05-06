import {useState} from 'react';
import {useAppStore} from '@/stores/appStore';
import EmotionSelector from '@/components/EmotionSelector/EmotionSelector';
import TextInput from '@/components/TextInput/TextInput';
import ResultPanel from '@/components/ResultPanel/ResultPanel';
import HistoryPanel from '@/components/HistoryPanel/HistoryPanel';
import SettingsPanel from '@/components/SettingsPanel/SettingsPanel';

export default function SidepanelApp() {
	const [view, setView] = useState < 'input' | 'result' | 'history' | 'settings' > ('input');
	const {isAnalyzing, error} = useAppStore();

	return (
		<div className='sidepanel-container'>
			<header className='sidepanel-header'>
				<h1>OpenQuill</h1>
				<nav className='sidepanel-nav'>
					<button
						className={view === 'input' ? 'active' : ''}
						onClick={() => setView('input')}
					>
						Analyze
					</button>
					<button
						className={view === 'history' ? 'active' : ''}
						onClick={() => setView('history')}
					>
						History
					</button>
					<button
						className={view === 'settings' ? 'active' : ''}
						onClick={() => setView('settings')}
					>
						Settings
					</button>
				</nav>
			</header>

			<main className='sidepanel-main'>
				{view === 'input' && (
					<>
						<TextInput />
						<EmotionSelector />
						<button
							className='analyze-btn'
							disabled={isAnalyzing}
							onClick={() => setView('result')}
						>
							{isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
						</button>
					</>
				)}

				{view === 'result' && <ResultPanel onBack={() => setView('input')} />}

				{view === 'history' && <HistoryPanel />}

				{view === 'settings' && <SettingsPanel />}

				{error && <div className='error-message'>{error}</div>}
			</main>
		</div>
	);
}
