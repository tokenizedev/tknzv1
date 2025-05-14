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
// Track side panel visibility per window (requires Chrome 117+ sidePanel API)
const sidePanelOpenWindows = new Set<number>();

// Listen for side panel visibility changes (available in Chrome 117+)
if ((chrome as any).sidePanel?.onVisibilityChanged) {
  (chrome as any).sidePanel.onVisibilityChanged.addListener((info: any) => {
    const { windowId, visible } = info;
    if (visible) {
      sidePanelOpenWindows.add(windowId);
    } else {
      sidePanelOpenWindows.delete(windowId);
    }
  });
}

// Clean up when windows are closed
chrome.windows.onRemoved.addListener(windowId => {
  sidePanelOpenWindows.delete(windowId);
});

let lastMessage: any = null;
// Handle messages from content script
chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  // Determine target tab: provided in message or from sender.tab
  const targetTabId = message.tabId ?? sender.tab?.id;
  // (Legacy) ignore SIDEBAR_READY messages; using onVisibilityChanged for robust tracking
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
    const isSidebarMsg = message.isSidebar === true;
    console.trace('CONTENT_SELECTED, isSidebar:', isSidebarMsg);
    chrome.storage.local.set({ selectedContent: JSON.stringify(content) }, () => {
      // Only open popup when not in sidebar context
      if (!isSidebarMsg) {
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
    // Use mode flag from content script to decide where to open
    const isSidebarMsg = message.isSidebar === true;
    // Notify UI to show swap page in correct context
    chrome.runtime.sendMessage({ type: 'SHOW_SWAP', token, isSidebar: isSidebarMsg });
    // Open side panel or popup exclusively
    if (isSidebarMsg) {
      (chrome as any).sidePanel?.open({ tabId: targetTabId }).catch((err: any) => console.error('Failed to open side panel:', err));
      (chrome as any).sidePanel?.setOptions({ tabId: targetTabId, path: 'sidebar.html', enabled: true });
    } else {
      chrome.action.openPopup().catch((err: any) => console.error('Failed to open popup:', err));
    }
    sendResponse({ success: true });
    return;
  }
  
  return true;
});

// Clean up when tabs are closed
// Clean up status when tabs are closed
// Clean up content script status when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  contentScriptStatus.delete(tabId);
});