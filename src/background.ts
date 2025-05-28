import { searchToken } from './services/jupiterService';
import { CoinCreationParams } from './types';
import { logEventToFirestore } from './firebase';
// Retrieve content script loader file paths from manifest for dynamic injection
const _manifest = chrome.runtime.getManifest() as any;
const _contentScriptFiles: string[] = (_manifest.content_scripts?.[0]?.js as string[]) || [];

// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Handle content script injection
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: _contentScriptFiles
    }).catch(err => console.error('Failed to inject content script:', err));
  }
});

// Track content script status per tab
const contentScriptStatus = new Map<number, boolean>();

function isValidForCoinCreateTrigger(obj: Record<string, any>): boolean {
  return (
    obj &&
    typeof obj === 'object' &&
    (
      typeof obj.name === 'string' ||
      typeof obj.ticker === 'string' ||
      typeof obj.imageUrl === 'string' ||
      typeof obj.description === 'string'
    )
  );
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  // Determine target tab: provided in message or from sender.tab
  const targetTabId = message.tabId ?? sender.tab?.id;
  if (!targetTabId) return;
  // Handle ping to log active wallet once for metrics/airdrops
  if (message.type === 'PING_ACTIVE_WALLET') {
    // Check if we've already logged the wallet
    chrome.storage.local.get(['walletLogged'], (items) => {
      if (items.walletLogged) return;
      // Retrieve stored wallets and activeWalletId
      chrome.storage.local.get(['wallets', 'activeWalletId'], (data) => {
        const wallets = data.wallets as any[];
        const activeWalletId = data.activeWalletId as string;
        if (Array.isArray(wallets) && activeWalletId) {
          const active = wallets.find(w => w.id === activeWalletId);
          const walletAddress = active?.publicKey;
          if (walletAddress) {
            logEventToFirestore('wallet_active', { walletAddress, timestamp: new Date().toISOString() })
              .catch(err => console.error('Error logging active wallet event:', err));
            chrome.storage.local.set({ walletLogged: true });
          }
        }
      });
    });
    return;
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
        files: _contentScriptFiles
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
    // Store selected content for UI
    chrome.storage.local.set({ selectedContent: JSON.stringify(content) }, () => {
      // Only open popup when not in sidebar context - sidebar should already be open if active
      if (!isSidebarMsg) {
        chrome.action.openPopup().catch(err => console.error('Failed to open popup:', err));
      }
      // If sidebar is active, it will automatically pick up the new content from storage
    });
  }
  // Handle token buy button clicks from content script
  else if (message.type === 'TKNZ_TOKEN_CLICKED') {
    const token = message.token;

    // Handle click asynchronously: blocklist check and token validation
    (async () => {
      try {
        console.log('TKNZ_TOKEN_CLICKED', token);
        // Retrieve blocklist from storage
        const items: any = await new Promise(resolve =>
          chrome.storage.local.get(['blocklist'], resolve)
        );
        const blocklist: string[] = Array.isArray(items.blocklist) ? items.blocklist : [];
        const tokenId = token.address || token.symbol;
        if (blocklist.includes(tokenId)) {
          console.log('Token is blocklisted:', tokenId);
          sendResponse({ success: false, reason: 'blocked' });
          return;
        }

        // Validate token: if symbol provided, lookup via searchToken; skip lookup for provided contract address
        if (!token.address && token.symbol) {
          try {
            console.log('Searching for token by symbol:', token.symbol);
            const asset = await searchToken(token.symbol);
            // No matching asset
            if (!asset?.id) {
              console.error('Token validation failed (no asset found):', token.symbol);
              sendResponse({ success: false, reason: 'unsupported' });
              return;
            }
            // Set contract address
            token.address = asset.id;
            // Ensure valid price and organic score
            if (asset.usdPrice <= 0 || asset.organicScore <= 0) {
              console.error('Token validation failed (unsupported):', token.address);
              sendResponse({ success: false, reason: 'unsupported' });
              return;
            }
          } catch (err) {
            console.error('Failed to lookup token by symbol:', token.symbol, err);
            sendResponse({ success: false, reason: 'unknown' });
            return;
          }
        }
        console.log('token', token);
        
        // Store the last buy token for UI
        chrome.storage.local.set({ lastBuyToken: JSON.stringify(token) });
        
        // Use context flag from content script
        const isSidebarMsg = message.isSidebar === true;

        // If sidebar is already active, just send the message
        // Otherwise open popup - never programmatically open sidebar
        if (!isSidebarMsg) {
          try {
            await chrome.action.openPopup();
          } catch (err) {
            console.error('Failed to open popup:', err);
            sendResponse({ success: false, reason: 'popup' });
            return;
          }
        }

        // Notify UI to show swap page
        chrome.runtime.sendMessage({ type: 'SHOW_SWAP', token, isSidebar: isSidebarMsg });

        // Everything succeeded
        sendResponse({ success: true });
      } catch (err) {
        console.error('Error in token click handler:', err);
        sendResponse({ success: false, reason: 'unknown' });
      }
    })();
    return true;
  }
  // Handle SDK token create initialization from page
  else if (message.type === 'INIT_TOKEN_CREATE') {
    if (!isValidForCoinCreateTrigger(message.options)) {
      console.log('invalid coin create trigger');
      sendResponse({ success: false, reason: 'Missing or invalid required fields' });
      return false;
    }
    const options = message.options || {};
    const isSidebarMsg = message.isSidebar === true;
    (async () => {
      try {
        chrome.storage.local.set({ initCoinData: JSON.stringify(message.options) });
      } catch (e) {
        console.error('Failed to populate token:', e);
      }

      // If sidebar is already active, just send the message
      // Otherwise open popup - never programmatically open sidebar
      if (!isSidebarMsg) {
        try {
          await chrome.action.openPopup();
        } catch (err) {
          console.error('Failed to open popup:', err);
          sendResponse({ success: false, reason: 'popup' });
          return;
        }
      }

      chrome.runtime.sendMessage({ type: 'SDK_TOKEN_CREATE', options, isSidebar: isSidebarMsg });
      // Respond to sender that initialization succeeded
      sendResponse({ success: true });
    })();

    return true;
  }

  return true;
});

// Inject SDK into page context
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'INJECT_SDK' && sender.tab?.id) {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id, allFrames: true },
      world: 'MAIN',
      func: () => {
        ;(window as any).tknz = {
          initTokenCreate: (coin: any) => {
            // eslint-disable-next-line no-console
            console.log('initTokenCreate', coin);
            const data = { source: 'tknz', type: 'INIT_TOKEN_CREATE', options: coin };
            // If in an iframe, post message to parent; otherwise post to self
            if (window.parent && window.parent !== window) {
              window.parent.postMessage(data, '*');
            } else {
              window.postMessage(data, '*');
            }
          }
        };
      }
    });
  }
});

// Clean up content script status when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  contentScriptStatus.delete(tabId);
}); 