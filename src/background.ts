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

// Pending wallet connect requests (to resolve async via sendResponse)
type PendingRequest = { tabId: number; requestId: string; sendResponse: (response: any) => void };
const pendingConnectRequests: PendingRequest[] = [];

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  // Determine target tab: provided in message or from sender.tab
  const targetTabId = message.tabId ?? sender.tab?.id;
  // Handle side panel ready notification
  if (message.type === 'SIDEBAR_READY' && typeof message.tabId === 'number') {
    sidePanelStatus.set(message.tabId, true);
    return;
  }
  if (!targetTabId) return;
  // Handle Phantom provider requests forwarded from content script
  // Handle wallet connect or sign requests from page
  if (message.type === 'PHANTOM_REQUEST') {
    const { id: requestId, method, serializedTransaction, params } = message as any;
    const tabId = sender.tab?.id;
    if (!tabId) {
      sendResponse({ error: 'No tabId for connect request', payload: null });
      return;
    }
    if (method === 'connect') {
      // Store pending connect to resolve later
      pendingConnectRequests.push({ tabId, requestId, sendResponse });
      // Save for popup UI to detect pending connect
      chrome.storage.local.set({ pendingConnect: { tabId, requestId } });
      // Open extension popup for user to unlock/approve
      chrome.action.openPopup().catch(err => console.error('Failed to open popup for connect:', err));
      return true; // Will respond asynchronously
    } else if (method === 'signTransaction') {
      // Signing not implemented yet
      sendResponse({ error: 'signTransaction not implemented', payload: null });
      return true;
    } else {
      sendResponse({ error: `Unknown method ${method}`, payload: null });
      return true;
    }
  }

  // Messages from content script to background
  if (message.type === 'CONTENT_SCRIPT_READY') {
    contentScriptStatus.set(targetTabId, true);
  }
  // Popup has fulfilled a pending connect request
  else if (message.type === 'FULFILL_CONNECT') {
    const { tabId, id: requestId, publicKey } = message as any;
    // Find matching pending request
    const idx = pendingConnectRequests.findIndex(r => r.tabId === tabId && r.requestId === requestId);
    if (idx !== -1) {
      // Resolve the original connect promise
      pendingConnectRequests[idx].sendResponse({ error: null, payload: { publicKey } });
      pendingConnectRequests.splice(idx, 1);
      // Clean up stored pending connect
      chrome.storage.local.remove(['pendingConnect']);
    }
    // Acknowledge fulfillment
    sendResponse({ success: true });
    return true;
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