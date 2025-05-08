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
  // Handle Phantom provider requests forwarded from content script
  if (message.type === 'PHANTOM_REQUEST') {
    const { id, method, serializedTransaction, params } = message as any;
    if (method === 'connect') {
      // Open extension popup for user to confirm connection
      chrome.action.openPopup().catch(err => console.error('Failed to open popup for connect:', err));
      // Retrieve active wallet publicKey from storage
      chrome.storage.local.get(['wallets', 'activeWalletId'], (result) => {
        let publicKey: string | null = null;
        const wallets = result.wallets;
        const activeId = result.activeWalletId;
        if (Array.isArray(wallets) && wallets.length > 0) {
          const w = wallets.find((w: any) => w.id === activeId) || wallets[0];
          publicKey = w?.publicKey || null;
        }
        sendResponse({ error: null, payload: { publicKey } });
      });
      return true;
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