console.log('Background service worker started');

chrome.runtime.onInstalled.addListener(() => {
	console.log('Extension installed');
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (message.action === 'ANALYZE_TEXT') {
		const {text} = message.payload;
		const {emotion} = message.payload;
		sendResponse({success: true, data: {text, emotion}});
	} else if (message.action === 'GET_SETTINGS') {
		sendResponse({success: true, data: {}});
	} else {
		sendResponse({success: false, error: 'Unknown action'});
	}

	return true;
});

chrome.commands.onCommand.addListener(command => {
	if (command === 'analyze-text') {
		chrome.tabs.query({active: true, currentWindow: true}, tabs => {
			if (tabs[0] && tabs[0].id) {
				chrome.tabs.sendMessage(tabs[0].id, {action: 'ANALYZE_SELECTION'});
			}
		});
	}
});
