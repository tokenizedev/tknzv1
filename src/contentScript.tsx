// Content script to extract article data
import html2canvas from 'html2canvas';

// Flag to track initialization
let isInitialized = false;

// Initialize content script
const initialize = () => {
  if (isInitialized) return;
  
  console.log('Content script initializing...');
  
  // Set up message listener
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_ARTICLE_DATA') {
      console.log('Received GET_ARTICLE_DATA request');
      const isXPost = window.location.hostname === 'x.com' || window.location.hostname === 'twitter.com';
      
      if (isXPost) {
        // For Twitter/X posts, we need to handle async screenshot
        extractTweetData().then(sendResponse);
        return true; // Keep the message channel open for async response
      } else {
        // For regular articles, we can respond synchronously
        sendResponse(extractArticleData());
      }
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

// Function to extract tweet data
const extractTweetData = async () => {
  try {
    // Wait for tweet container to be available
    let retries = 0;
    let tweetContainer;
    while (!tweetContainer && retries < 10) {
      tweetContainer = document.querySelector('article[data-testid="tweet"]');
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
    
    // Get tweet image if exists
    const tweetImage = tweetContainer.querySelector('img[alt="Image"]')?.getAttribute('src') || '';
    
    // Get tweet author
    const authorName = tweetContainer.querySelector('div[data-testid="User-Name"] span')?.textContent || '';

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
        const clone = clonedDoc.querySelector('article[data-testid="tweet"]');
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
            el.style.color = '#ffffff';
          });

          // Ensure images are fully visible
          const images = clone.querySelectorAll('img');
          images.forEach(img => {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.objectFit = 'contain';
          });
        }
      }
    });

    return {
      title: tweetText || 'Tweet',
      image: canvas.toDataURL('image/png'),
      description: tweetText,
      url: window.location.href,
      xUrl: window.location.href
    };
  } catch (error) {
    console.error('Error extracting tweet data:', error);
    return {
      title: document.title || 'Tweet',
      image: '',
      description: '',
      url: window.location.href,
      xUrl: window.location.href
    };
  }
};

// Function to extract article data
const extractArticleData = () => {
  try {
    let title = '';
    let image = '';
    let description = '';
    let url = window.location.href;

    // Extract title
    const titleSelectors = [
      'h1',
      'article h1',
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      'title'
    ];

    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        title = element instanceof HTMLMetaElement 
          ? element.getAttribute('content') || ''
          : element.textContent?.trim() || '';
        if (title) break;
      }
    }

    // Extract image
    const imageSelectors = [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      'link[rel="image_src"]',
      'article img',
      '.article-content img',
      '.post-content img'
    ];

    for (const selector of imageSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        let imgSrc = element instanceof HTMLMetaElement 
          ? element.getAttribute('content') || ''
          : element.getAttribute('src') || '';
        
        if (imgSrc) {
          try {
            if (!imgSrc.startsWith('http')) {
              imgSrc = new URL(imgSrc, window.location.origin).href;
            }
            image = imgSrc;
            break;
          } catch (e) {
            console.warn('Invalid image URL:', imgSrc);
            continue;
          }
        }
      }
    }

    // Extract description
    const descriptionSelectors = [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      'article p',
      '.article-content p',
      '.post-content p'
    ];

    for (const selector of descriptionSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        description = element instanceof HTMLMetaElement 
          ? element.getAttribute('content') || ''
          : element.textContent?.trim() || '';
        if (description) break;
      }
    }

    // Get canonical URL
    try {
      const canonicalUrl = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
      const ogUrl = document.querySelector('meta[property="og:url"]')?.getAttribute('content');
      
      if (canonicalUrl) {
        url = new URL(canonicalUrl, window.location.origin).href;
      } else if (ogUrl) {
        url = new URL(ogUrl, window.location.origin).href;
      }
    } catch (e) {
      console.warn('Error processing URLs:', e);
    }

    return {
      title: title || document.title || 'Untitled Article',
      image,
      description,
      url
    };
  } catch (error) {
    console.error('Error extracting article data:', error);
    return {
      title: document.title || 'Untitled Article',
      image: '',
      description: '',
      url: window.location.href
    };
  }
};

// Initialize on load
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