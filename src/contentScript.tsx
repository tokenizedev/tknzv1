// Content script to extract article data
import html2canvas from 'html2canvas';

const getIsXPost = () => window.location.hostname === 'x.com' || window.location.hostname === 'twitter.com';

// Function to extract multiple images from an element or page
export const extractImages = (baseElement: HTMLElement = document.body): string[] => {
  const images: Set<string> = new Set(); // Use a Set to avoid duplicates
  // Base URL for resolving relative image URLs; use full href for accurate origin and path
  const baseUrl = window.location.href;
  
  // Helper function to add image URL
  const addImageUrl = (url: string | null, source: string = '') => {
    if (!url) return;
    try {
      const absoluteUrl = new URL(url, baseUrl).href;
      // Skip tracking pixels and tiny images
      if (url.includes('1x1') || url.includes('pixel') || url.includes('spacer')) {
        return;
      }
      images.add(absoluteUrl);
    } catch (e) {
      console.warn(`Invalid ${source} image URL:`, url);
    }
  };
  
  // Check if baseElement itself is an image
  if (baseElement instanceof HTMLImageElement) {
    addImageUrl(baseElement.src, 'base element');
  }
  
  // 1. Meta image selectors (usually highest quality/most relevant)
  const metaSelectors = [
    'meta[property="og:image"]',
    'meta[property="og:image:url"]',
    'meta[property="og:image:secure_url"]',
    'meta[name="twitter:image"]',
    'meta[name="twitter:image:src"]',
    'meta[itemprop="image"]',
    'link[rel="image_src"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="icon"]',
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
      
      addImageUrl(imgSrc, 'meta');
    }
  }
  
  // 2. ALL img elements (including data URIs with size limit)
  const imgElements = baseElement.querySelectorAll('img');
  imgElements.forEach(img => {
    if (!(img instanceof HTMLImageElement)) return;
    
    // Regular src
    if (img.src) {
      // For data URIs, only include if reasonably sized
      if (img.src.startsWith('data:')) {
        if (img.src.length < 50000) { // ~37KB base64
          addImageUrl(img.src, 'img data-uri');
        }
      } else {
        addImageUrl(img.src, 'img src');
      }
    }
    
    // Srcset for responsive images
    if (img.srcset) {
      const srcsetParts = img.srcset.split(',');
      srcsetParts.forEach(part => {
        const urlMatch = part.trim().split(/\s+/)[0];
        if (urlMatch) {
          addImageUrl(urlMatch, 'img srcset');
        }
      });
    }
    
    // Lazy loading attributes
    const lazyAttrs = ['data-src', 'data-lazy', 'data-original', 'data-lazy-src', 'data-srcset'];
    lazyAttrs.forEach(attr => {
      const value = img.getAttribute(attr);
      if (value) {
        if (attr.includes('srcset')) {
          // Handle srcset format
          const srcsetParts = value.split(',');
          srcsetParts.forEach(part => {
            const urlMatch = part.trim().split(/\s+/)[0];
            if (urlMatch) {
              addImageUrl(urlMatch, `img ${attr}`);
            }
          });
        } else {
          addImageUrl(value, `img ${attr}`);
        }
      }
    });
  });
  
  // 3. Picture elements with source tags
  const pictureElements = baseElement.querySelectorAll('picture');
  pictureElements.forEach(picture => {
    // Check source elements
    const sources = picture.querySelectorAll('source');
    sources.forEach(source => {
      if (source.srcset) {
        const srcsetParts = source.srcset.split(',');
        srcsetParts.forEach(part => {
          const urlMatch = part.trim().split(/\s+/)[0];
          if (urlMatch) {
            addImageUrl(urlMatch, 'picture source');
          }
        });
      }
    });
    
    // Also check the img inside picture
    const img = picture.querySelector('img');
    if (img instanceof HTMLImageElement && img.src) {
      addImageUrl(img.src, 'picture img');
    }
  });
  
  // 4. CSS Background images
  const elementsToCheck = baseElement.querySelectorAll('*');
  elementsToCheck.forEach(el => {
    if (!(el instanceof HTMLElement)) return;
    
    const style = window.getComputedStyle(el);
    const backgroundImage = style.backgroundImage;
    
    if (backgroundImage && backgroundImage !== 'none') {
      // Extract URLs from background-image (can have multiple with gradients)
      const urlRegex = /url\(['"]?([^'")]+)['"]?\)/g;
      let match;
      while ((match = urlRegex.exec(backgroundImage)) !== null) {
        addImageUrl(match[1], 'css background');
      }
    }
    
    // Also check inline styles
    const inlineStyle = el.getAttribute('style');
    if (inlineStyle && inlineStyle.includes('url(')) {
      const urlRegex = /url\(['"]?([^'")]+)['"]?\)/g;
      let match;
      while ((match = urlRegex.exec(inlineStyle)) !== null) {
        addImageUrl(match[1], 'inline style');
      }
    }
  });
  
  // 5. Video poster images
  const videos = baseElement.querySelectorAll('video[poster]');
  videos.forEach(video => {
    const poster = video.getAttribute('poster');
    if (poster) {
      addImageUrl(poster, 'video poster');
    }
  });
  
  // 6. SVG images (as img src or object)
  const svgImages = baseElement.querySelectorAll('img[src$=".svg"], object[data$=".svg"], embed[src$=".svg"]');
  svgImages.forEach(svg => {
    if (svg instanceof HTMLImageElement) {
      addImageUrl(svg.src, 'svg img');
    } else if (svg instanceof HTMLObjectElement) {
      addImageUrl(svg.data, 'svg object');
    } else if (svg instanceof HTMLEmbedElement) {
      addImageUrl(svg.src, 'svg embed');
    }
  });
  
  // 7. Canvas elements (convert to data URL if reasonable size)
  const canvases = baseElement.querySelectorAll('canvas');
  canvases.forEach(canvas => {
    if (!(canvas instanceof HTMLCanvasElement)) return;
    try {
      // Only for reasonably sized canvases
      if (canvas.width > 50 && canvas.height > 50 && canvas.width < 2000 && canvas.height < 2000) {
        const dataUrl = canvas.toDataURL('image/png', 0.8);
        if (dataUrl && dataUrl.length < 100000) { // ~75KB limit
          images.add(dataUrl);
        }
      }
    } catch (e) {
      // Might fail due to CORS
      console.warn('Failed to extract canvas image:', e);
    }
  });
  
  // 8. Image inputs
  const imageInputs = baseElement.querySelectorAll('input[type="image"][src]');
  imageInputs.forEach(input => {
    if (input instanceof HTMLInputElement && input.src) {
      addImageUrl(input.src, 'input image');
    }
  });
  
  // 9. Special attributes used by various frameworks/libraries
  const specialAttrs = [
    'data-image', 
    'data-background-image',
    'data-bg',
    'data-img-url',
    'data-thumb',
    'data-preview'
  ];
  
  specialAttrs.forEach(attr => {
    const elements = baseElement.querySelectorAll(`[${attr}]`);
    elements.forEach(el => {
      const value = el.getAttribute(attr);
      if (value && (value.includes('.') || value.startsWith('data:') || value.startsWith('http'))) {
        addImageUrl(value, `special attr ${attr}`);
      }
    });
  });
  
  // 10. JSON-LD structured data
  try {
    const jsonLdScripts = baseElement.querySelectorAll('script[type="application/ld+json"]');
    jsonLdScripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        // Recursively find image URLs in JSON
        const findImages = (obj: any): void => {
          if (!obj) return;
          if (typeof obj === 'string' && (obj.includes('.jpg') || obj.includes('.png') || obj.includes('.webp') || obj.includes('.gif'))) {
            addImageUrl(obj, 'json-ld');
          } else if (typeof obj === 'object') {
            Object.values(obj).forEach(val => findImages(val));
          }
        };
        findImages(data);
      } catch (e) {
        // Invalid JSON
      }
    });
  } catch (e) {
    console.warn('Failed to parse JSON-LD:', e);
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
    /* Hide injected buy buttons during selection mode */
    .tknz-buy-button {
      display: none !important;
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
    // Remove selection UI elements and styles
    cleanup();
    // Temporarily hide any injected buy buttons to avoid capture during extraction
    const hideStyle = document.createElement('style');
    hideStyle.id = 'tknz-hide-buy-buttons';
    hideStyle.textContent = `.tknz-buy-button { display: none !important; }`;
    document.head.appendChild(hideStyle);
    // Restore buy buttons after a brief delay
    setTimeout(() => {
      const s = document.getElementById('tknz-hide-buy-buttons');
      if (s) s.remove();
    }, 1000);
    // Extract the content and notify background
    extractContent(el).then(async content => {
      chrome.runtime.sendMessage({ type: 'CONTENT_SELECTED', content, isSidebar });
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

window.addEventListener('message', (event) => {
  if (event.data?.source !== 'tknz' || event.data?.type !== 'INIT_TOKEN_CREATE') return;

  chrome.storage.local.get(['isSidebarMode'], ({ isSidebarMode }) => {
    chrome.runtime.sendMessage({
      type: 'INIT_TOKEN_CREATE',
      options: event.data.options,
      isSidebar: !!isSidebarMode
    }).then((response) => {
      if (chrome.runtime.lastError) {
        console.error('Messaging error:', chrome.runtime.lastError.message);
        return;
      }

      if (!response?.success) {
        console.error('Failed: ', response.error);
      }
    });
  });
});

chrome.runtime.sendMessage({ type: 'INJECT_SDK' });

// Flag to track initialization
let isInitialized = false;

// Initialize content script
const initialize = () => {
  if (isInitialized) return;
  
  //console.log('Content script initializing...');
  
  // Set up message listener
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'START_SELECT_MODE') {
      startSelectionMode(request.isSidebar);
      return true;
    }
    if (request.type === 'SIDE_PANEL_CLOSED') {
      // Clean up any selection mode UI if active
      document.querySelectorAll('#tknz-selection-style, .tknz-overlay, .tknz-instructions, .tknz-highlight').forEach(el => el.remove());
      document.querySelectorAll('.tknz-select-btn').forEach(el => el.remove());
      chrome.runtime.sendMessage({ type: 'SIDE_PANEL_CLOSED' });
    }
    if (request.type === 'GET_ARTICLE_DATA') {
      extractContent().then(sendResponse);
    }
    return true;
  });

  // Mark as initialized
  isInitialized = true;
  //console.log('Content script initialized');

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
        if (!clone) return;
        // Remove buy buttons injected by extension
        clonedDoc.querySelectorAll('.tknz-buy-button').forEach(el => el.remove());
        // Remove other interactive elements from screenshot
        clone.querySelectorAll('[role="button"], [data-testid="caret"]').forEach(el => el.remove());
        // Style the tweet for better visibility
        clone.style.backgroundColor = '#1a1a1a';
        clone.style.color = '#ffffff';
        clone.style.padding = '20px';
        clone.style.borderRadius = '12px';
        clone.style.maxWidth = 'none';
        clone.style.width = 'auto';
        // Style all text elements
        clone.querySelectorAll('div, span, p').forEach(el => {
          (el as HTMLElement).style.color = '#ffffff';
        });
        // Ensure images are fully visible
        clone.querySelectorAll('img').forEach(img => {
          (img as HTMLImageElement).style.maxWidth = '100%';
          (img as HTMLImageElement).style.height = 'auto';
          (img as HTMLImageElement).style.objectFit = 'contain';
        });
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

// Token Buy Feature: observe dynamic content and inject buy buttons (toggleable)
// Note: live toggling requires a page reload to apply changes
(() => {
  // Ensure chrome.storage API is available before proceeding
  if (typeof chrome === 'undefined' || !chrome.storage?.local?.get) {
    return;
  }
  // Check user setting for buy buttons and domain blocklist
  chrome.storage.local.get(['buyModeEnabled', 'floatingScanButtonEnabled', 'blockedDomains'], ({ buyModeEnabled, floatingScanButtonEnabled = true, blockedDomains = [] }) => {
    // Default to enabled
    if (buyModeEnabled === false) return;
    
    // Check if current domain is blocked
    const currentDomain = window.location.hostname;
    const isDomainBlocked = blockedDomains.includes(currentDomain);
  type TokenMsg = { cashtag?: string; symbol?: string; address?: string };
  const STATE = {
    buttonsAdded: new Set<string>(),
  };
  // Listen for manual scan trigger from extension UI
  chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg?.type === 'MANUAL_SCAN') {
      // Clear existing buttons and state, then re-scan
      STATE.buttonsAdded.clear();
      document.querySelectorAll('.tknz-buy-button').forEach(btn => btn.remove());
      scanElement(document.body);
    }
  });
  
  // Create a floating scan button if enabled in settings
  if (floatingScanButtonEnabled !== false) {
    // Check if there's already a floating button
    if (!document.querySelector('#tknz-floating-scan-btn')) {
      createFloatingScanButton();
    }
  }

  function createFloatingScanButton() {
    // Create the floating button
    const button = document.createElement('div');
    button.id = 'tknz-floating-scan-btn';
    button.setAttribute('title', 'TKNZ Actions');
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    `;
    
    // Create menu container
    const menuContainer = document.createElement('div');
    menuContainer.id = 'tknz-menu-container';
    Object.assign(menuContainer.style, {
      position: 'fixed',
      bottom: '100px',
      right: '20px',
      width: '40px',
      height: '40px',
      pointerEvents: 'none',
      zIndex: '9998'
    });

    // Create menu items
    const menuItems = [
      {
        id: 'scan',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 4v6h-6"></path>
          <path d="M1 20v-6h6"></path>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
          <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
        </svg>`,
        tooltip: 'Scan for tokens',
        action: () => {
          STATE.buttonsAdded.clear();
          document.querySelectorAll('.tknz-buy-button').forEach(btn => btn.remove());
          scanElement(document.body);
          toggleMenu();
        }
      },
      {
        id: 'block',
        icon: isDomainBlocked 
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9 9l6 6"></path>
              <path d="M15 9l-6 6"></path>
            </svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>`,
        tooltip: isDomainBlocked ? 'Enable buy buttons on this site' : 'Disable buy buttons on this site',
        action: () => {
          const domain = window.location.hostname;
          chrome.storage.local.get(['blockedDomains'], (result) => {
            const blockedDomains = result.blockedDomains || [];
            if (!blockedDomains.includes(domain)) {
              // Block domain
              blockedDomains.push(domain);
              chrome.storage.local.set({ blockedDomains }, () => {
                // Remove all buy buttons immediately
                document.querySelectorAll('.tknz-buy-button').forEach(btn => btn.remove());
                STATE.buttonsAdded.clear();
                createNotification(`Buy buttons disabled on ${domain}`, 'success');
                // Update button icon and tooltip
                const blockBtn = document.getElementById('tknz-menu-block');
                if (blockBtn) {
                  blockBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9 9l6 6"></path>
                    <path d="M15 9l-6 6"></path>
                  </svg>`;
                  const tooltip = blockBtn.querySelector('.tknz-menu-tooltip') as HTMLElement;
                  if (tooltip) tooltip.innerText = 'Enable buy buttons on this site';
                }
              });
            } else {
              // Unblock domain
              const index = blockedDomains.indexOf(domain);
              blockedDomains.splice(index, 1);
              chrome.storage.local.set({ blockedDomains }, () => {
                createNotification(`Buy buttons enabled on ${domain}`, 'success');
                // Re-scan after unblocking
                scanElement(document.body);
                // Update button icon and tooltip
                const blockBtn = document.getElementById('tknz-menu-block');
                if (blockBtn) {
                  blockBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                  </svg>`;
                  const tooltip = blockBtn.querySelector('.tknz-menu-tooltip') as HTMLElement;
                  if (tooltip) tooltip.innerText = 'Disable buy buttons on this site';
                }
              });
            }
          });
          toggleMenu();
        }
      },
      {
        id: 'select',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>`,
        tooltip: 'Select content to tokenize',
        action: () => {
          chrome.storage.local.get(['isSidebarMode'], ({ isSidebarMode }) => {
            startSelectionMode(!!isSidebarMode);
          });
          toggleMenu();
        }
      }
    ];

    let menuOpen = false;

    menuItems.forEach((item, index) => {
      const menuBtn = document.createElement('div');
      menuBtn.className = 'tknz-menu-item';
      menuBtn.id = `tknz-menu-${item.id}`;
      menuBtn.innerHTML = item.icon;
      
      // Create tooltip for menu item
      const itemTooltip = document.createElement('div');
      itemTooltip.className = 'tknz-menu-tooltip';
      itemTooltip.innerText = item.tooltip;
      Object.assign(itemTooltip.style, {
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: '#00ff9d',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '11px',
        whiteSpace: 'nowrap',
        opacity: '0',
        transition: 'opacity 0.2s',
        pointerEvents: 'none',
        right: '40px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: '10001'
      });
      menuBtn.appendChild(itemTooltip);
      
      Object.assign(menuBtn.style, {
        position: 'absolute',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: '#00ff9d',
        border: '1px solid #00ff9d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        opacity: '0',
        transform: 'scale(0.3)',
        transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        pointerEvents: 'none',
        boxShadow: '0 2px 8px rgba(0, 255, 157, 0.3)'
      });

      menuBtn.onmouseenter = () => {
        itemTooltip.style.opacity = '1';
        menuBtn.style.backgroundColor = 'rgba(0, 255, 157, 0.2)';
      };
      menuBtn.onmouseleave = () => {
        itemTooltip.style.opacity = '0';
        menuBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
      };

      menuBtn.onclick = (e) => {
        e.stopPropagation();
        item.action();
      };

      menuContainer.appendChild(menuBtn);
    });

    const toggleMenu = () => {
      menuOpen = !menuOpen;
      button.style.transform = menuOpen ? 'scale(1.1) rotate(180deg)' : 'scale(1) rotate(0deg)';
      
      menuItems.forEach((item, index) => {
        const menuBtn = document.getElementById(`tknz-menu-${item.id}`);
        if (menuBtn) {
          if (menuOpen) {
            const angle = (index * 45) + 180; // Spread items in an arc
            const radius = 50;
            const x = radius * Math.cos(angle * Math.PI / 180);
            const y = radius * Math.sin(angle * Math.PI / 180);
            
            menuBtn.style.opacity = '1';
            menuBtn.style.transform = `translate(${x}px, ${y}px) scale(1)`;
            menuBtn.style.pointerEvents = 'auto';
          } else {
            menuBtn.style.opacity = '0';
            menuBtn.style.transform = 'scale(0.3)';
            menuBtn.style.pointerEvents = 'none';
          }
        }
      });
      
      menuContainer.style.pointerEvents = menuOpen ? 'auto' : 'none';
    };

    // Style the button
    Object.assign(button.style, {
      position: 'fixed',
      bottom: '100px',
      right: '20px',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#00ff9d',
      color: 'black',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      zIndex: '9999',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 255, 157, 0.4)',
      transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      userSelect: 'none',
      touchAction: 'none'
    });

    // Add hover effects
    button.onmouseover = () => {
      if (!menuOpen) {
        button.style.transform = 'scale(1.1)';
        button.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 255, 157, 0.6)';
      }
    };
    button.onmouseout = () => {
      if (!menuOpen) {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 255, 157, 0.4)';
      }
    };

    // Add click handler to toggle menu
    button.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    };

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (menuOpen && !button.contains(e.target as Node) && !menuContainer.contains(e.target as Node)) {
        toggleMenu();
      }
    });

    // Make the button draggable with smooth gliding and inertia
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    // Track recent positions for inertia
    let lastPositions: { x: number; y: number; time: number }[] = [];
    let inertiaAnimationFrame: number | null = null;
    
    function saveScanButtonPosition() {
      chrome.storage.local.set({
        tknzScanButtonPosition: {
          left: button.style.left || null,
          top: button.style.top || null
        }
      });
      ensureButtonVisible();
    }

    function animateInertia(initialVx: number, initialVy: number) {
      let vx = initialVx;
      let vy = initialVy;
      function frame() {
        vx *= 0.9;
        vy *= 0.9;
        const currX = parseFloat(button.style.left || '0');
        const currY = parseFloat(button.style.top || '0');
        const deltaTime = 1 / 60;
        let newX = currX + vx * deltaTime;
        let newY = currY + vy * deltaTime;
        const maxX = window.innerWidth - button.offsetWidth;
        const maxY = window.innerHeight - button.offsetHeight;
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        button.style.left = `${newX}px`;
        button.style.top = `${newY}px`;
        // Move menu container with button during inertia
        menuContainer.style.left = `${newX}px`;
        menuContainer.style.top = `${newY}px`;
        if (Math.abs(vx) > 20 || Math.abs(vy) > 20) {
          inertiaAnimationFrame = requestAnimationFrame(frame);
        } else {
          if (inertiaAnimationFrame) {
            cancelAnimationFrame(inertiaAnimationFrame);
            inertiaAnimationFrame = null;
          }
          saveScanButtonPosition();
        }
      }
      inertiaAnimationFrame = requestAnimationFrame(frame);
    }

    button.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - button.getBoundingClientRect().left;
      offsetY = e.clientY - button.getBoundingClientRect().top;
      // Initialize position tracking
      lastPositions = [{ x: e.clientX - offsetX, y: e.clientY - offsetY, time: Date.now() }];
      if (inertiaAnimationFrame) {
        cancelAnimationFrame(inertiaAnimationFrame);
        inertiaAnimationFrame = null;
      }
      button.style.cursor = 'grabbing';
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      const maxX = window.innerWidth - button.offsetWidth;
      const maxY = window.innerHeight - button.offsetHeight;
      const boundedX = Math.max(0, Math.min(x, maxX));
      const boundedY = Math.max(0, Math.min(y, maxY));
      button.style.right = 'auto';
      button.style.bottom = 'auto';
      button.style.left = `${boundedX}px`;
      button.style.top = `${boundedY}px`;
      // Move menu container with button
      menuContainer.style.left = `${boundedX}px`;
      menuContainer.style.top = `${boundedY}px`;
      // Track for inertia
      lastPositions.push({ x: boundedX, y: boundedY, time: Date.now() });
      if (lastPositions.length > 5) lastPositions.shift();
    });
    
    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      button.style.cursor = 'pointer';
      // Compute velocity for inertia
      const now = Date.now();
      const recent = lastPositions.filter(p => now - p.time < 100);
      let usedInertia = false;
      if (recent.length >= 2) {
        const first = recent[0];
        const last = recent[recent.length - 1];
        const dt = (last.time - first.time) / 1000;
        if (dt > 0) {
          const vx = (last.x - first.x) / dt;
          const vy = (last.y - first.y) / dt;
          const speed = Math.sqrt(vx * vx + vy * vy);
          if (speed > 200) {
            usedInertia = true;
            animateInertia(vx, vy);
          }
        }
      }
      if (!usedInertia) {
        saveScanButtonPosition();
      }
    });
    
    // Restore previous position or default if unavailable
    chrome.storage.local.get(['tknzScanButtonPosition'], (result) => {
      const pos = result.tknzScanButtonPosition;
      if (
        pos &&
        ((pos.left && pos.left !== 'auto') ||
          (pos.right && pos.right !== 'auto') ||
          (pos.top && pos.top !== 'auto') ||
          (pos.bottom && pos.bottom !== 'auto'))
      ) {
        // Horizontal positioning
        if (pos.left && pos.left !== 'auto') {
          button.style.left = pos.left;
          button.style.right = 'auto';
          menuContainer.style.left = pos.left;
        } else if (pos.right && pos.right !== 'auto') {
          button.style.right = pos.right;
          button.style.left = 'auto';
          // Calculate left position for menu container
          const leftPos = window.innerWidth - 40 - parseInt(pos.right);
          menuContainer.style.left = `${leftPos}px`;
        }
        // Vertical positioning
        if (pos.top && pos.top !== 'auto') {
          button.style.top = pos.top;
          button.style.bottom = 'auto';
          menuContainer.style.top = pos.top;
        } else if (pos.bottom && pos.bottom !== 'auto') {
          button.style.bottom = pos.bottom;
          button.style.top = 'auto';
          // Calculate top position for menu container
          const topPos = window.innerHeight - 40 - parseInt(pos.bottom);
          menuContainer.style.top = `${topPos}px`;
        }
      } else {
        // Default fallback
        button.style.right = '20px';
        button.style.left = 'auto';
        button.style.bottom = '100px';
        button.style.top = 'auto';
        // Set menu container default position
        menuContainer.style.left = `${window.innerWidth - 60}px`;
        menuContainer.style.top = `${window.innerHeight - 140}px`;
      }
      setTimeout(ensureButtonVisible, 100);
    });

    // Position intelligently to avoid the Grok button and other elements
    function positionButton() {
      // Check for Grok button
      const grokButton = document.querySelector('[aria-label="Ask Grok"]');
      if (grokButton) {
        const grokRect = grokButton.getBoundingClientRect();
        // If our button would overlap with Grok, move it up
        if (
          parseInt(button.style.right || '20px') < window.innerWidth - grokRect.left &&
          parseInt(button.style.bottom || '100px') < window.innerHeight - grokRect.top
        ) {
          button.style.bottom = `${window.innerHeight - grokRect.top + 20}px`;
        }
      }
    }
    
    // Function to check if button is offscreen and reposition it if needed
    function ensureButtonVisible() {
      // Get button's position
      const rect = button.getBoundingClientRect();
      
      // Check if button is offscreen horizontally
      if (rect.right > window.innerWidth || rect.left < 0) {
        // Keep the same y-coordinate but move to right edge
        const currentTop = rect.top;
        
        // Reset position to right edge
        button.style.left = 'auto';
        button.style.right = '20px';
        
        // Maintain vertical position if it was set
        if (currentTop > 0 && currentTop < window.innerHeight - rect.height) {
          button.style.top = `${currentTop}px`;
          button.style.bottom = 'auto';
        } else {
          // Default vertical position if y-coordinate was invalid
          button.style.top = 'auto';
          button.style.bottom = '100px';
        }
        
        // Save new position to storage
        chrome.storage.local.set({
          tknzScanButtonPosition: {
            right: button.style.right,
            top: button.style.top,
            bottom: button.style.bottom
          }
        });
      }
    }
    
    // Check for visibility periodically and on viewport changes
    const checkVisibilityInterval = setInterval(ensureButtonVisible, 2000);
    
    // Listen for window resize events
    window.addEventListener('resize', ensureButtonVisible);
    
    // Create a resize observer to detect size changes that might not trigger resize events
    const resizeObserver = new ResizeObserver(() => {
      ensureButtonVisible();
    });
    resizeObserver.observe(document.body);
    
    // Position after a short delay to ensure page is loaded
    setTimeout(() => {
      positionButton();
      ensureButtonVisible();
    }, 1000);

    // Add to document
    document.body.appendChild(button);
    document.body.appendChild(menuContainer);
    
    // Observe DOM changes to reposition if needed
    const observer = new MutationObserver(() => {
      if (!document.body.contains(button)) {
        document.body.appendChild(button);
        ensureButtonVisible();
      }
    });
    
    observer.observe(document.body, { childList: true });
    
    // Clean up event listeners and observers when necessary
    function cleanupFloatingButton() {
      clearInterval(checkVisibilityInterval);
      window.removeEventListener('resize', ensureButtonVisible);
      resizeObserver.disconnect();
      observer.disconnect();
      button.remove();
    }
    
    // Add cleanup handler to window unload event
    window.addEventListener('beforeunload', cleanupFloatingButton);
  }
  
  // Network idle detection to wait for content load
  let activeRequests = 0;
  let idleTimer: number | undefined;
  const scheduleNetworkIdleScan = () => {
    if (activeRequests === 0) {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        STATE.buttonsAdded.clear();
        document.querySelectorAll('.tknz-buy-button').forEach(btn => btn.remove());
        scanElement(document.body);
      }, 500);
    }
  };
  // Wrap fetch to track network requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    activeRequests++;
    return originalFetch.apply(window, args as Parameters<typeof fetch>).finally(() => {
      activeRequests--;
      scheduleNetworkIdleScan();
    });
  } as typeof fetch;
  // Wrap XMLHttpRequest to track network requests
  const originalXhrSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (...args: any[]) {
    activeRequests++;
    this.addEventListener('readystatechange', function() {
      if (this.readyState === 4) {
        activeRequests--;
        scheduleNetworkIdleScan();
      }
    });
    return originalXhrSend.apply(this, args as any);
  };
  // Schedule initial network idle scan
  scheduleNetworkIdleScan();

  // Create a notification system for the content script
  function createNotification(message: string, type: 'error' | 'info' | 'success' = 'info', duration: number = 5000) {
    // Remove any existing notifications
    document.querySelectorAll('.tknz-notification').forEach(el => el.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'tknz-notification';
    
    // Set styling based on notification type
    const bgColor = type === 'error' ? 'rgba(30, 0, 0, 0.9)' : type === 'success' ? 'rgba(0, 30, 0, 0.9)' : 'rgba(0, 10, 20, 0.9)';
    const borderColor = type === 'error' ? '#ff3d3d' : type === 'success' ? '#00ff9d' : '#3d9eff';
    const textColor = type === 'error' ? '#ff9d9d' : type === 'success' ? '#00ff9d' : '#9dcfff';
    
    // Apply cyberpunk-style CSS
    Object.assign(notification.style, {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      backgroundColor: bgColor,
      color: textColor,
      padding: '15px 20px',
      borderRadius: '4px',
      boxShadow: `0 0 20px rgba(0, 0, 0, 0.5), 0 0 10px ${borderColor}40`,
      zIndex: '2147483647',
      fontFamily: 'monospace, "Courier New"',
      fontSize: '14px',
      maxWidth: '400px',
      border: `1px solid ${borderColor}`,
      backdropFilter: 'blur(4px)',
      transform: 'translateY(100px)',
      opacity: '0',
      transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
      lineHeight: '1.5',
      display: 'flex',
      alignItems: 'flex-start',
      overflow: 'hidden'
    });
    
    // Add a glowing line at the top
    const glowLine = document.createElement('div');
    Object.assign(glowLine.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      height: '1px',
      background: borderColor,
      boxShadow: `0 0 10px ${borderColor}, 0 0 5px ${borderColor}`,
      opacity: '0.8'
    });
    
    // Create icon element based on type
    const icon = document.createElement('div');
    Object.assign(icon.style, {
      marginRight: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      flexShrink: '0'
    });
    
    if (type === 'error') {
      icon.innerHTML = '⚠️';
    } else if (type === 'success') {
      icon.innerHTML = '✓';
    } else {
      icon.innerHTML = 'ℹ️';
    }
    
    // Create content container
    const content = document.createElement('div');
    content.textContent = message;
    
    // Create close button
    const close = document.createElement('button');
    Object.assign(close.style, {
      position: 'absolute',
      top: '8px',
      right: '8px',
      background: 'transparent',
      border: 'none',
      color: textColor,
      fontSize: '16px',
      cursor: 'pointer',
      opacity: '0.7',
      transition: 'opacity 0.2s'
    });
    close.innerHTML = '×';
    close.onmouseover = () => close.style.opacity = '1';
    close.onmouseout = () => close.style.opacity = '0.7';
    close.onclick = () => {
      notification.style.transform = 'translateY(100px)';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    };
    
    // Assemble notification
    notification.appendChild(glowLine);
    notification.appendChild(icon);
    notification.appendChild(content);
    notification.appendChild(close);
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateY(0)';
      notification.style.opacity = '1';
    }, 10);
    
    // Auto dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.style.transform = 'translateY(100px)';
          notification.style.opacity = '0';
          setTimeout(() => notification.remove(), 300);
        }
      }, duration);
    }
    
    return notification;
  }

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
      marginRight: '5px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: 'bold',
      cursor: 'pointer',
      verticalAlign: 'middle',
      opacity: '0',
      transform: 'translateY(-5px)',
      transition: 'opacity 0.3s ease-out, transform 0.3s ease-out'
    } as Partial<CSSStyleDeclaration>);
    btn.textContent = 'Buy with TKNZ';
    btn.onmouseover = () => (btn.style.opacity = '0.8');
    btn.onmouseout = () => (btn.style.opacity = '1');
    btn.onclick = e => {
      e.preventDefault();
      e.stopPropagation();
      
      // Change button state to indicate processing
      const originalText = btn.textContent;
      btn.textContent = 'Processing...';
      btn.style.opacity = '0.7';
      
      // Determine UI context (sidebar vs popup) persisted by extension UI
      chrome.storage.local.get(['isSidebarMode'], ({ isSidebarMode }) => {
        // Send message to background script and handle response
        chrome.runtime.sendMessage(
          { type: 'TKNZ_TOKEN_CLICKED', token, isSidebar: !!isSidebarMode }, 
          (response) => {
            //console.log('TKNZ_TOKEN_CLICKED --> response', response);
            const error = chrome.runtime.lastError;
            
            // Handle error case (validation failed or token not supported)
            if (error || !response || !response.success) {
              //console.error('Token click error:', error || 'No success response');
              // Determine appropriate error message based on background response or runtime error
              let errorMsg = 'This token is not supported for trading. It may be unverified or restricted.';
              if (error) {
                errorMsg = `Error: ${error.message}`;
              } else if (response && response.reason) {
                switch (response.reason) {
                  case 'blocked':
                    errorMsg = 'This token is blocked and cannot be traded.';
                    break;
                  case 'sidePanel':
                    errorMsg = 'Failed to open side panel. Please try again.';
                    break;
                  case 'popup':
                    errorMsg = 'Failed to open popup. Please try again.';
                    break;
                  case 'storage':
                    errorMsg = 'Failed to store token info for trading.';
                    break;
                  case 'unknown':
                    errorMsg = 'An unknown error occurred while processing your request.';
                    break;
                  case 'unsupported':
                    errorMsg = 'This token is not supported for trading. It may be unverified or restricted.';
                    break;
                  default:
                    errorMsg = `Error: ${response.reason}`;
                }
              }
              createNotification(errorMsg, 'error');
              btn.textContent = originalText;
              btn.style.opacity = '1';
              return;
            }
            
            // Success case - button will update as extension UI opens
            btn.textContent = 'Opening...';
            setTimeout(() => {
              btn.textContent = originalText;
              btn.style.opacity = '1';
            }, 2000);
          }
        );
      });
    };
    el.appendChild(btn);
    // Animate in smoothly
    requestAnimationFrame(() => {
      btn.style.opacity = '1';
      btn.style.transform = 'translateY(0)';
    });
  }

  // Process a single text node for token mentions
  function handleTextNode(node: Node) {
    const text = node.textContent;
    //console.log('handleTextNode', text);
    if (!text || !text.trim()) return;
    const parent = (node as Node & { parentElement?: HTMLElement }).parentElement;
    if (!parent || parent.querySelector('.tknz-buy-button')) return;
    
    // Check if the text is inside an input, textarea, or contenteditable element
    let currentElement: HTMLElement | null = parent;
    while (currentElement) {
      const tagName = currentElement.tagName?.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || currentElement.getAttribute('contenteditable') === 'true') {
        return; // Skip injection in input fields
      }
      currentElement = currentElement.parentElement;
    }
    
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
    // Check if domain is blocked before scanning
    chrome.storage.local.get(['blockedDomains'], (result) => {
      const blockedDomains = result.blockedDomains || [];
      const currentDomain = window.location.hostname;
      if (blockedDomains.includes(currentDomain)) {
        console.log(`Buy buttons blocked on domain: ${currentDomain}`);
        return;
      }
      
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
            
            // Check if node is inside an input field, textarea, or contenteditable
            let currentElement: HTMLElement | null = parent;
            while (currentElement) {
              const tagName = currentElement.tagName?.toLowerCase();
              if (tagName === 'input' || tagName === 'textarea' || currentElement.getAttribute('contenteditable') === 'true') {
                return NodeFilter.FILTER_REJECT; // Skip text in input fields
              }
              currentElement = currentElement.parentElement;
            }
            
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );
      let node: Node | null;
      while ((node = walker.nextNode())) {
        handleTextNode(node);
      }
    });
  }

  // Initial scan of the whole document (skip if domain is blocked)
  if (!isDomainBlocked) {
    scanElement(document.body);
  }

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

  // Handle SPA navigation: clear previous state and re-scan tokens
  const handleRouteChange = () => {
    STATE.buttonsAdded.clear();
    document.querySelectorAll('.tknz-buy-button').forEach(btn => btn.remove());
    scanElement(document.body);
  };
  window.addEventListener('popstate', handleRouteChange);
  window.addEventListener('hashchange', handleRouteChange);
  const origPush = history.pushState;
  history.pushState = function (...args) {
    const ret = origPush.apply(this, args as any);
    handleRouteChange();
    return ret;
  };
  const origReplace = history.replaceState;
  history.replaceState = function (...args) {
    const ret = origReplace.apply(this, args as any);
    handleRouteChange();
    return ret;
  };
  // Periodic full DOM scan for Buy buttons (every 5s)
  setInterval(() => scanElement(document.body), 5000);
  });
})();