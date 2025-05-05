// Fallback storage using window.localStorage for non-extension contexts
// Note: availability of chrome.storage.local is checked dynamically in get/set
const fallbackStorage = {
  get: async (key: string) => {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return { [key]: undefined };
    }
    try {
      return { [key]: JSON.parse(item) };
    } catch {
      return { [key]: item };
    }
  },
  set: async (data: Record<string, any>) => {
    Object.entries(data).forEach(([key, value]) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        window.localStorage.setItem(key, String(value));
      }
    });
  }
};

/**
 * Unified storage interface for Chrome extension and development mode.
 */
export const storage = {
  /**
   * Retrieve data by key.
   */
  get: async (key: string): Promise<Record<string, any>> => {
    try {
      if (!window.chrome?.storage?.local) {
        return fallbackStorage.get(key);
      }
      return new Promise<Record<string, any>>((resolve) => {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            console.error('Storage error:', chrome.runtime.lastError);
            resolve({});
          } else {
            resolve(result);
          }
        });
      });
    } catch (error) {
      console.error('Storage get error:', error);
      return {};
    }
  },
  /**
   * Persist data record.
   */
  set: async (data: Record<string, any>): Promise<void> => {
    try {
      if (!window.chrome?.storage?.local) {
        return fallbackStorage.set(data);
      }
      return new Promise<void>((resolve, reject) => {
        chrome.storage.local.set(data, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Storage set error:', error);
      throw error;
    }
  }
};