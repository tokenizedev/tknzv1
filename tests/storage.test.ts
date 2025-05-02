import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { storage } from '../src/utils/storage';

describe('storage util', () => {
  const originalChrome = (window as any).chrome;

  beforeEach(() => {
    // Ensure Chrome storage is undefined by default
    delete (window as any).chrome;
  });

  afterEach(() => {
    // Restore any original window.chrome
    (window as any).chrome = originalChrome;
    vi.resetAllMocks();
  });

  it('falls back to in-memory storage when chrome.storage.local is unavailable', async () => {
    const key = 'testKey';
    const value = { foo: 'bar' };
    await storage.set({ [key]: value });
    const result = await storage.get(key);
    expect(result).toEqual({ [key]: value });
  });

  it('uses chrome.storage.local.set when available', async () => {
    const setMock = vi.fn((data: Record<string, any>, cb: () => void) => cb());
    (window as any).chrome = {
      storage: { local: { set: setMock } },
      runtime: { lastError: null }
    };
    const data = { alpha: 123 };
    await storage.set(data);
    expect(setMock).toHaveBeenCalledWith(data, expect.any(Function));
  });

  it('uses chrome.storage.local.get when available', async () => {
    const getMock = vi.fn((keys: string[], cb: (result: Record<string, any>) => void) => cb({ beta: 456 }));
    (window as any).chrome = {
      storage: { local: { get: getMock } },
      runtime: { lastError: null }
    };
    const result = await storage.get('beta');
    expect(getMock).toHaveBeenCalledWith(['beta'], expect.any(Function));
    expect(result).toEqual({ beta: 456 });
  });
});