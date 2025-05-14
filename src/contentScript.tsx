// Content script to extract article data
import html2canvas from 'html2canvas';

const getIsXPost = () => window.location.hostname === 'x.com' || window.location.hostname === 'twitter.com';

// Function to extract multiple images from an element or page
export const extractImages = (baseElement: HTMLElement = document.body): string[] => {
  const images: Set<string> = new Set(); // Use a Set to avoid duplicates
  // Base URL for resolving relative image URLs; use full href for accurate origin and path
  const baseUrl = window.location.href;
  // Check if baseElement itself is an image
  if (baseElement instanceof HTMLImageElement) {
    const srcAttr = baseElement.getAttribute('src');
    if (srcAttr) {
      try {
        const absoluteUrl = new URL(srcAttr, baseUrl).href;
        images.add(absoluteUrl);
      } catch (e) {
        console.warn('Invalid base element image URL:', srcAttr);
      }
    }
  }
  
  // Meta image selectors (usually highest quality/most relevant)
  const metaSelectors = [
    'meta[property="og:image"]',
    'meta[name="twitter:image"]',
    'link[rel="image_src"]',
  ];
  
  // Check meta images in document head and base element
  for (const selector of metaSelectors) {
    const elements = [...(document.head.querySelectorAll(selector) || []), 
                     ...(baseElement.querySelectorAll(selector) || [])];
    
    for (const element of elements) {
      const imgSrc = element instanceof HTMLMetaElement 
        ? element.getAttribute('content') 
        : element instanceof HTMLLinkElement 
          ? element.getAttribute('href')
          : null;
      
      if (imgSrc) {
        try {
          const absoluteUrl = new URL(imgSrc, baseUrl).href;
          images.add(absoluteUrl);
        } catch (e) {
          console.warn('Invalid meta image URL:', imgSrc);
        }
      }
    }
  }
  
  // Content image selectors (find actual <img> elements)
  const imgSelectors = [
    'article img',
    '.article-content img',
    '.post-content img',
    'img[src]:not([src^="data:"])', // Get all images with src attribute that aren't data URIs
  ];
  
  // Extract images from content
  for (const selector of imgSelectors) {
    const elements = baseElement.querySelectorAll(selector);
    elements.forEach(element => {
      if (element instanceof HTMLImageElement) {
        const srcAttr = element.getAttribute('src');
        if (!srcAttr) return;
        // Ignore tiny images (icons, spacers, etc.)
        const isLargeEnough = (
          element.naturalWidth > 80 ||
          element.naturalHeight > 80 ||
          element.width > 80 ||
          element.height > 80 ||
          // If dimensions aren't available yet, check CSS
          parseInt(getComputedStyle(element).width) > 80 ||
          parseInt(getComputedStyle(element).height) > 80
        );

        if (isLargeEnough || selector.includes('article')) { // Always include article images
          try {
            const absoluteUrl = new URL(srcAttr, baseUrl).href;
            images.add(absoluteUrl);
          } catch (e) {
            console.warn('Invalid content image URL:', srcAttr);
          }
        }
      }
    });
  }
  
  return Array.from(images);
}

// Selection mode: highlight divs and allow user to select content
function startSelectionMode(isSidebar: boolean) {
  const highlightMap = new WeakMap();
  const buttonMap = new WeakMap();
  const isXPost = getIsXPost();
  const selectors = (isXPost ? ['article[data-testid="tweet"]'] : ['div, p']).join(',');

  // Add stylesheet for better styling
  const styleEl = document.createElement('style');
  styleEl.id = 'tknz-selection-style';
  styleEl.textContent = `
    .tknz-highlight {
      outline: 2px solid rgba(0, 255, 144, 0.7) !important;
      outline-offset: 2px !important;
      box-shadow: 0 0 15px rgba(0, 255, 144, 0.3), inset 0 0 8px rgba(0, 255, 144, 0.2) !important;
      transition: all 0.2s ease-out !important;
      position: relative !important;
      z-index: 999 !important;
    }
    .tknz-select-btn {
      position: absolute !important;
      z-index: 2147483647 !important;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(20, 20, 20, 0.9) 100%) !important;
      color: rgb(0, 255, 144) !important;
      border: 1px solid rgba(0, 255, 144, 0.7) !important;
      border-radius: 4px !important;
      padding: 4px 8px !important;
      font-family: 'Courier New', monospace !important;
      font-size: 12px !important;
      font-weight: bold !important;
      letter-spacing: 0.5px !important;
      text-transform: uppercase !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      text-shadow: 0 0 5px rgba(0, 255, 144, 0.7) !important;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5), 0 0 5px rgba(0, 255, 144, 0.3) !important;
      backdrop-filter: blur(4px) !important;
      display: flex !important;
      align-items: center !important;
      gap: 4px !important;
    }
    .tknz-select-btn:hover {
      background: rgba(0, 255, 144, 0.2) !important;
      box-shadow: 0 0 15px rgba(0, 255, 144, 0.5) !important;
      transform: translateY(-1px) !important;
    }
    .tknz-select-btn::before {
      content: "" !important;
      display: inline-block !important;
      width: 8px !important;
      height: 8px !important;
      background: rgb(0, 255, 144) !important;
      border-radius: 50% !important;
      animation: tknz-pulse 1.5s infinite !important;
    }
    .tknz-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0, 0, 0, 0.3) !important;
      z-index: 2147483646 !important;
      pointer-events: none !important;
      backdrop-filter: blur(1px) !important;
    }
    .tknz-instructions {
      position: fixed !important;
      top: 20px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      background: rgba(0, 0, 0, 0.8) !important;
      color: rgb(0, 255, 144) !important;
      border: 1px solid rgba(0, 255, 144, 0.7) !important;
      border-radius: 4px !important;
      padding: 10px 20px !important;
      font-family: 'Courier New', monospace !important;
      font-size: 14px !important;
      z-index: 2147483647 !important;
      text-align: center !important;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.6), 0 0 10px rgba(0, 255, 144, 0.3) !important;
      pointer-events: none !important;
      max-width: 80% !important;
    }
    @keyframes tknz-pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
  `;
  document.head.appendChild(styleEl);
  
  // Add overlay
  const overlay = document.createElement('div');
  overlay.className = 'tknz-overlay';
  document.body.appendChild(overlay);
  
  // Add instructions
  const instructions = document.createElement('div');
  instructions.className = 'tknz-instructions';
  instructions.textContent = 'Hover over content to select for tokenization. Press ESC to cancel.';
  document.body.appendChild(instructions);

  const onMouseEnter = (e: Event) => {
    const el = e.currentTarget as HTMLElement;
    // if already showing select button for this element, skip to prevent duplicates
    if (buttonMap.has(el)) {
      return;
    }
    // store original outline
    highlightMap.set(el, el.style.outline);
    
    // Add highlight class instead of direct style manipulation
    el.classList.add('tknz-highlight');
    
    // create select button
    const btn = document.createElement('button');
    btn.className = 'tknz-select-btn';
    btn.textContent = 'Tokenize';
    
    // Position button at the top right corner of the element
    const rect = el.getBoundingClientRect();
    Object.assign(btn.style, {
      top: `${rect.top + window.scrollY}px`,
      right: `${window.innerWidth - rect.right - window.scrollX}px`,
    });
    
    document.body.appendChild(btn);
    buttonMap.set(el, btn);
    
    // Ensure click event is properly attached
    btn.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent event bubbling
      selectElement(el, isSidebar);
    });
  }

  const onMouseLeave = (e: Event) => {
    const el = e.currentTarget as HTMLElement;
    // if moving into our select button, ignore and keep highlight
    const btn = buttonMap.get(el);
    // relatedTarget is the element the pointer entered
    const related = (e as MouseEvent).relatedTarget as Node | null;
    if (btn && related && (btn === related || btn.contains(related))) {
      return;
    }
    // restore outline and remove highlight class
    el.classList.remove('tknz-highlight');
    // remove button
    if (btn) {
      btn.remove();
      buttonMap.delete(el);
    }
  }

  const selectElement = (el: HTMLElement, isSidebar: boolean) => {
    cleanup();
    
    extractContent(el).then(async content => {
      if (!isSidebar) {
        chrome.runtime.sendMessage({ type: 'SIDE_PANEL_CLOSED' });
      }
      chrome.runtime.sendMessage({ type: 'CONTENT_SELECTED', content });
    });    
  };

  const cleanup = () => {
    // Remove style and overlay elements
    document.querySelectorAll('#tknz-selection-style, .tknz-overlay, .tknz-instructions').forEach(el => el.remove());
    
    // Remove event listeners and classes
    document.querySelectorAll(selectors).forEach(el => {
      el.removeEventListener('mouseenter', onMouseEnter);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.classList.remove('tknz-highlight');
      const btn = buttonMap.get(el as HTMLElement);
      if (btn) btn.remove();
    });
    
    // WeakMap doesn't have a clear method, but we can set references to null
    // which will allow garbage collection when no longer referenced
  };

  // Add escape key handler
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      cleanup();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Attach listeners to all divs with sufficient text
  document.querySelectorAll(selectors).forEach(el => {
    if ((el.textContent || '').trim().length > 20) {
      el.addEventListener('mouseenter', onMouseEnter);
      el.addEventListener('mouseleave', onMouseLeave);
    }
  });
}

// Flag to track initialization
let isInitialized = false;

// Initialize content script
const initialize = () => {
  if (isInitialized) return;
  
  console.log('Content script initializing...');
  
  // Set up message listener
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'START_SELECT_MODE') {
      startSelectionMode(request.isSidebar);
      return true;
    }
    if (request.type === 'SIDE_PANEL_CLOSED') {
      cleanup();
      chrome.runtime.sendMessage({ type: 'SIDE_PANEL_CLOSED' });
    }
    if (request.type === 'GET_ARTICLE_DATA') {
      extractContent().then(sendResponse);
    }
    return true;
  });

  // Mark as initialized
  isInitialized = true;
  console.log('Content script initialized');

  // Notify that content script is ready
  try {
    chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_READY' });
  } catch (error) {
    console.warn('Failed to send ready message:', error);
  }
};

const extractContent = async (baseElement: HTMLElement = document.body) => {
  const isXPost = getIsXPost();
  if (isXPost) {
    return extractTweetData(baseElement, baseElement);
  } else {
    return extractArticleData(baseElement);
  }
}

// Function to extract tweet data
export const extractTweetData = async (
  tweetContainer: HTMLElement | null = null,
  baseElement: HTMLElement = document.body
) => {
  try {
    // Wait for tweet container to be available
    let retries = 0;
    
    while (!tweetContainer && retries < 10) {
      tweetContainer = baseElement.querySelector('article[data-testid="tweet"]') as HTMLElement;
      if (!tweetContainer) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }
    }

    if (!tweetContainer) {
      throw new Error('Tweet container not found after retries');
    }

    // Get tweet text
    const tweetText = tweetContainer.querySelector('div[lang]')?.textContent || '';
    
    // Get tweet images
    const contentImages = extractImages(tweetContainer);
    
    // Get tweet author
    const authorName = tweetContainer.querySelector('div[data-testid="User-Name"] span')?.textContent || '';

    // Get tweet specific URL from the timestamp link
    let tweetUrl = window.location.href; // Default to page URL
    // Find the timestamp link which usually contains "/status/" in its href
    const timeElements = tweetContainer.querySelectorAll('time');
    let tweetLinkElement: HTMLAnchorElement | null = null;

    timeElements.forEach(timeEl => {
      const anchor = timeEl.closest('a[role="link"][href*="/status/"]') as HTMLAnchorElement | null;
      if (anchor) {
        tweetLinkElement = anchor;
        return; // Found the likely correct link
      }
    });

    // Fallback if the time element structure isn't found
    if (!tweetLinkElement) {
       tweetLinkElement = tweetContainer.querySelector('a[role="link"][href*="/status/"]');
    }

    if (tweetLinkElement && tweetLinkElement.hasAttribute('href')) {
      const href = tweetLinkElement.getAttribute('href');
      if (href) {
        // Ensure it's an absolute URL
        tweetUrl = href.startsWith('http') ? href : new URL(href, window.location.origin).href;
      }
    }

    // Take screenshot of the tweet
    const canvas = await html2canvas(tweetContainer, {
      backgroundColor: '#1a1a1a', // Dark background
      scale: 2,
      logging: false,
      useCORS: true,
      width: tweetContainer.offsetWidth,
      height: tweetContainer.offsetHeight,
      windowWidth: tweetContainer.offsetWidth,
      windowHeight: tweetContainer.offsetHeight,
      onclone: (clonedDoc) => {
        const clone = clonedDoc.querySelector('article[data-testid="tweet"]') as HTMLElement;
        if (clone) {
          // Remove interactive elements from screenshot
          const unwantedElements = clone.querySelectorAll('[role="button"], [data-testid="caret"]');
          unwantedElements.forEach(el => el.remove());
          
          // Style the tweet for better visibility
          clone.style.backgroundColor = '#1a1a1a';
          clone.style.color = '#ffffff';
          clone.style.padding = '20px';
          clone.style.borderRadius = '12px';
          clone.style.maxWidth = 'none';
          clone.style.width = 'auto';
          
          // Style all text elements
          const textElements = clone.querySelectorAll('div, span, p');
          textElements.forEach(el => {
            (el as HTMLElement).style.color = '#ffffff';
          });

          // Ensure images are fully visible
          const images = clone.querySelectorAll('img');
          images.forEach(img => {
            (img as HTMLImageElement).style.maxWidth = '100%';
            (img as HTMLImageElement).style.height = 'auto';
            (img as HTMLImageElement).style.objectFit = 'contain';
          });
        }
      }
    });

    const screenshotUrl = canvas.toDataURL('image/png');
    
    // Combine and deduplicate all images, with screenshot first
    const allImages = [screenshotUrl, ...contentImages.filter(url => url !== screenshotUrl)];
    // The first content image (excluding screenshot) is the tweet image
    const tweetImage = contentImages[0] || '';
    return {
      title: tweetText || 'Tweet',
      description: tweetText,
      image: screenshotUrl,
      tweetImage: tweetImage,
      authorName,
      url: tweetUrl,
      xUrl: tweetUrl,
      isXPost: true,
      images: allImages
    };
  } catch (error) {
    console.error('Error extracting tweet data:', error);
    return {
      title: document.title || 'Tweet',
      description: '',
      image: '',
      tweetImage: '',
      authorName: '',
      url: window.location.href,
      xUrl: window.location.href,
      isXPost: true,
      images: []
    };
  }
};

// Function to extract article data
export const extractArticleData = (baseElement: HTMLElement = document.body) => {
  // Title: <h1> > og:title > twitter:title > document.title > default
  const h1 = baseElement.querySelector('h1');
  let title = h1?.textContent?.trim() || '';
  if (!title) {
    const ogTitle = document.head.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const twTitle = document.head.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
    title = ogTitle || twTitle || document.title || '';
  }

  // Description: <p> > meta description > empty
  let description = '';
  const p = baseElement.querySelector('p,div,section,article');
  if (baseElement.tagName.toLowerCase() === 'body') {
    description = document.head.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  } else if (p?.textContent?.trim()) {
    description = p.textContent.trim();
  } else {
    description = baseElement.textContent?.trim() || '';
  }

  const contentImages = extractImages(baseElement)
  const featuredImage = contentImages[0] || ''
  

  const url = window.location.href;
  return {
    title: title || 'Untitled Article',
    image: featuredImage || '',
    description: description || '',
    url,
    isXPost: false,
    images: contentImages
  };
};

// Auto-initialize in a Chrome extension environment
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  initialize();
  // Re-initialize on dynamic navigation (for SPAs)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      initialize();
    }
  }).observe(document, { subtree: true, childList: true });
}



// Token Buy Feature: observe dynamic content and inject buy buttons
(() => {
  type TokenMsg = { cashtag?: string; symbol?: string; address?: string };
  const STATE = {
    buttonsAdded: new Set<string>(),
  };

  // Create and append the Buy button
  function addBuyButton(el: HTMLElement, token: TokenMsg) {
    const btn = document.createElement('span');
    btn.className = 'tknz-buy-button';
    Object.assign(btn.style, {
      display: 'inline-block',
      background: '#00ff9d',
      color: 'black',
      padding: '3px 8px',
      marginLeft: '5px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: 'bold',
      cursor: 'pointer',
      verticalAlign: 'middle',
      transition: 'opacity 0.2s',
    } as Partial<CSSStyleDeclaration>);
    btn.textContent = 'Buy with TKNZ';
    btn.onmouseover = () => (btn.style.opacity = '0.8');
    btn.onmouseout = () => (btn.style.opacity = '1');
    btn.onclick = e => {
      e.preventDefault();
      e.stopPropagation();
      chrome.runtime.sendMessage({ type: 'TKNZ_TOKEN_CLICKED', token });
      btn.textContent = 'Opening...';
      setTimeout(() => (btn.textContent = 'Buy with TKNZ'), 2000);
    };
    el.appendChild(btn);
  }

  // Process a single text node for token mentions
  function handleTextNode(node: Node) {
    const text = node.textContent;
    console.log('handleTextNode', text);
    if (!text || !text.trim()) return;
    const parent = (node as Node & { parentElement?: HTMLElement }).parentElement;
    if (!parent || parent.querySelector('.tknz-buy-button')) return;
    
    // Cashtags like $ABC
    const cashtags = text.match(/\$[A-Za-z][A-Za-z0-9]{1,9}\b/g) || [];
    cashtags.forEach(tag => {
      const symbol = tag.slice(1);
      const key = parent.innerText.slice(0, 50) + '-' + tag;
      if (!STATE.buttonsAdded.has(key)) {
        addBuyButton(parent, { cashtag: tag, symbol });
        STATE.buttonsAdded.add(key);
      }
    });

    // Potential token addresses
    const words = text.split(/\s+/);
    words.forEach(word => {
      if (
        word.length >= 32 && word.length <= 44 && /^[A-Za-z0-9]+$/.test(word) &&
        /[A-Z]/.test(word) && /[a-z]/.test(word) && /[0-9]/.test(word)
      ) {
        const key = parent.innerText.slice(0, 50) + '-' + word;
        if (!STATE.buttonsAdded.has(key)) {
          addBuyButton(parent, { address: word });
          STATE.buttonsAdded.add(key);
        }
      }
    });
  }

  // Scan a subtree for text nodes
  function scanElement(root: Node) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const text = node.textContent;
          if (!text || !text.trim()) return NodeFilter.FILTER_REJECT;
          const parent = (node as Node & { parentElement?: HTMLElement }).parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (tag === 'script' || tag === 'style') return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      },
      false
    );
    let node: Node | null;
    while ((node = walker.nextNode())) {
      handleTextNode(node);
    }
  }

  // Initial scan of the whole document
  scanElement(document.body);

  // Observe dynamic content changes
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(n => {
          if (n.nodeType === Node.TEXT_NODE) {
            handleTextNode(n);
          } else if (n.nodeType === Node.ELEMENT_NODE) {
            scanElement(n);
          }
        });
      } else if (mutation.type === 'characterData') {
        handleTextNode(mutation.target);
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });

  // Handle SPA navigation (pushState/replaceState/popstate)
  window.addEventListener('popstate', () => scanElement(document.body));
  const origPush = history.pushState;
  history.pushState = function (...args) {
    const ret = origPush.apply(this, args as any);
    scanElement(document.body);
    return ret;
  };
  const origReplace = history.replaceState;
  history.replaceState = function (...args) {
    const ret = origReplace.apply(this, args as any);
    scanElement(document.body);
    return ret;
  };
  // Periodic full DOM scan for Buy buttons (every 5s)
  setInterval(() => scanElement(document.body), 5000);
})();