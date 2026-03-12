import React from 'react';
import {createRoot} from 'react-dom/client';
import SidepanelApp from './SidepanelApp';
import './sidepanel.css';

const container = document.getElementById('root');
if (container) {
	const root = createRoot(container);
	root.render(<React.StrictMode>
		<SidepanelApp />
	</React.StrictMode>);
}
