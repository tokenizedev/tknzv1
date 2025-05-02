import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createConnection } from '../src/utils/connection';

describe('connection util', () => {
  let conn: ReturnType<typeof createConnection>;

  beforeEach(() => {
    // Stub global fetch
    (global as any).fetch = vi.fn();
    conn = createConnection();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getBalance returns numeric balance on successful RPC response', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ result: { value: 1000 } })
    } as any;
    (fetch as any).mockResolvedValue(mockResponse);
    const balance = await conn.getBalance('publicKey');
    expect(balance).toBe(1000);
  });

  it('getBalance throws on non-ok HTTP status', async () => {
    const mockResponse = { ok: false, status: 500 } as any;
    (fetch as any).mockResolvedValue(mockResponse);
    await expect(conn.getBalance('pk')).rejects.toThrow(/HTTP error/);
  });

  it('getTokenBalance returns 0 when no accounts are found', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ result: { value: [] } })
    } as any;
    (fetch as any).mockResolvedValue(mockResponse);
    const balance = await conn.getTokenBalance('token', 'owner');
    expect(balance).toBe(0);
  });

  it('getTokenBalance returns numeric balance from first account', async () => {
    const account = { account: { data: { parsed: { info: { tokenAmount: { uiAmount: 42 } } } } } };
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ result: { value: [account] } })
    } as any;
    (fetch as any).mockResolvedValue(mockResponse);
    const balance = await conn.getTokenBalance('token', 'owner');
    expect(balance).toBe(42);
  });

  it('getTokenBalance returns 0 on RPC error in response', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ error: { message: 'RPC failure' } })
    } as any;
    (fetch as any).mockResolvedValue(mockResponse);
    const balance = await conn.getTokenBalance('token', 'owner');
    expect(balance).toBe(0);
  });
});