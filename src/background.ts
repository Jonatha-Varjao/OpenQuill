console.log('Background service worker started');

chrome.runtime.onInstalled.addListener(function() {
  console.log('Extension installed');
});

chrome.runtime.onMessage.addListener(function(message, _sender, sendResponse) {
  if (message.action === 'ANALYZE_TEXT') {
    var text = message.payload.text;
    var emotion = message.payload.emotion;
    sendResponse({ success: true, data: { text: text, emotion: emotion } });
  } else if (message.action === 'GET_SETTINGS') {
    sendResponse({ success: true, data: {} });
  } else {
    sendResponse({ success: false, error: 'Unknown action' });
  }
  return true;
});

chrome.commands.onCommand.addListener(function(command) {
  if (command === 'analyze-text') {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'ANALYZE_SELECTION' });
      }
    });
  }
});
