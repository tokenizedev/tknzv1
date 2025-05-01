const DEV_MODE = process.env.NODE_ENV === 'development' && !window.chrome?.storage;

const devStorage = {
  data: new Map<string, any>(),
  get: async (key: string) => ({ [key]: devStorage.data.get(key) }),
  set: async (data: Record<string, any>) => {
    Object.entries(data).forEach(([key, value]) => {
      devStorage.data.set(key, value);
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
      if (DEV_MODE || !window.chrome?.storage?.local) {
        return devStorage.get(key);
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
      if (DEV_MODE || !window.chrome?.storage?.local) {
        return devStorage.set(data);
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