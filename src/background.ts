// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Handle content script injection
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['src/contentScript.tsx']
    }).catch(err => console.error('Failed to inject content script:', err));
  }
});

// Track content script status per tab
const contentScriptStatus = new Map();

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;
  
  if (!tabId) return;

  if (message.type === 'CONTENT_SCRIPT_READY') {
    contentScriptStatus.set(tabId, true);
  } else if (message.type === 'INJECT_CONTENT_SCRIPT') {
    if (!contentScriptStatus.get(tabId)) {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['src/contentScript.tsx']
      }).catch(err => console.error('Failed to re-inject content script:', err));
    }
  }
  
  return true;
});

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  contentScriptStatus.delete(tabId);
});