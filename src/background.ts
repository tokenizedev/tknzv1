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
const contentScriptStatus = new Map<number, boolean>();
// Track side panel status per tab
const sidePanelStatus = new Map<number, boolean>();

let lastMessage: any = null;
// Handle messages from content script
chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  // Determine target tab: provided in message or from sender.tab
  const targetTabId = message.tabId ?? sender.tab?.id;
  // Handle side panel ready notification
  if (message.type === 'SIDEBAR_READY' && typeof message.tabId === 'number') {
    sidePanelStatus.set(message.tabId, true);
    return;
  }
  if (!targetTabId) return;

  // Messages from content script to background
  if (message.type === 'CONTENT_SCRIPT_READY') {
    contentScriptStatus.set(targetTabId, true);
  }
  // Trigger injection and start selection mode (e.g., from popup)
  else if (message.type === 'INJECT_CONTENT_SCRIPT') {
    if (!contentScriptStatus.get(targetTabId)) {
      chrome.scripting.executeScript({
        target: { tabId: targetTabId },
        files: ['src/contentScript.tsx']
      })
      .then(() => {
        console.log('Re-injecting content script and starting selection mode');
        chrome.tabs.sendMessage(targetTabId, { type: 'START_SELECT_MODE' });
      })
      .catch(err => console.error('Failed to re-inject content script:', err));
    } else {
      console.log('Already injected: directly start selection mode');
      chrome.tabs.sendMessage(targetTabId, { type: 'START_SELECT_MODE' });
    }
  }
  // Handle user content selection from page
  else if (message.type === 'CONTENT_SELECTED') {
    const content = message.content; 
    console.log('sidePanelStatus', sidePanelStatus);
    console.trace();
    chrome.storage.local.set({ selectedContent: JSON.stringify(content) }, () => {
      if (!sidePanelStatus.get(targetTabId)) {
        chrome.action.openPopup().catch(err => console.error('Failed to open popup:', err));
      }
    });
  }
  // Handle token buy button clicks from content script
  else if (message.type === 'TKNZ_TOKEN_CLICKED') {
    const token = message.token;
    // Store the last buy token for UI
    try {
      chrome.storage.local.set({ lastBuyToken: JSON.stringify(token) });
    } catch (e) {
      console.error('Failed to store buy token:', e);
    }
    // Notify UI to show swap page
    chrome.runtime.sendMessage({ type: 'SHOW_SWAP', token });
    // Open popup or side panel based on current state
    if (sidePanelStatus.get(targetTabId)) {
      // Sidebar is open, ensure swap UI is shown there
      (chrome as any).sidePanel?.open({ tabId: targetTabId }).catch((err: any) => console.error('Failed to open side panel:', err));
      (chrome as any).sidePanel?.setOptions({ tabId: targetTabId, path: 'sidebar.html', enabled: true });
    } else {
      // Open extension popup
      chrome.action.openPopup().catch((err: any) => console.error('Failed to open popup:', err));
    }
    sendResponse({ success: true });
    return;
  }
  
  if (message.type === 'SIDE_PANEL_CLOSED') {
    console.log('SIDE_PANEL_CLOSED', targetTabId);
    sidePanelStatus.delete(targetTabId);
  }
  return true;
});

// Clean up when tabs are closed
// Clean up status when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  contentScriptStatus.delete(tabId);
  sidePanelStatus.delete(tabId);
});