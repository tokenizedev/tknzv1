import { vi } from 'vitest';
// Mock firebase module to prevent real Firestore interactions
vi.mock('../src/firebase', () => ({
  __esModule: true,
  logEventToFirestore: vi.fn(),
  getCreatedCoins: vi.fn().mockResolvedValue([]),
  addCreatedCoinToFirestore: vi.fn(),
  getLaunchedTokenEvents: vi.fn()
}));
// Sanity check to ensure test file loads
it('store test file loads', () => {
  expect(true).toBe(true);
});

// Mock storage before importing the store
const mockSet = vi.fn();
const mockGet = vi.fn();
vi.mock('../src/utils/storage', () => ({
  storage: {
    get: mockGet,
    set: mockSet
  }
}));

// Mock connection before importing the store
const mockConnection = {
  getBalance: vi.fn(),
  getTokenBalance: vi.fn()
};
vi.mock('../src/utils/connection', () => ({
  createConnection: () => mockConnection,
  web3Connection: {
    sendTransaction: vi.fn(),
    confirmTransaction: vi.fn()
  }
}));

import { useStore } from '../src/store';

describe('Store actions', () => {
  beforeEach(() => {
    // Reset store state to defaults
    useStore.setState({
      wallet: null,
      balance: 0,
      error: null,
      createdCoins: [],
      isRefreshing: false,
      investmentAmount: 0,
      isLatestVersion: true,
      updateAvailable: null
    });
    mockSet.mockClear();
    mockGet.mockClear();
    mockConnection.getBalance.mockClear();
    mockConnection.getTokenBalance.mockClear();
  });

  it('setInvestmentAmount sets amount and calls storage.set', async () => {
    await useStore.getState().setInvestmentAmount(3.5);
    expect(useStore.getState().investmentAmount).toBe(3.5);
    expect(mockSet).toHaveBeenCalledWith({ investmentAmount: 3.5 });
  });

  it('addCreatedCoin adds a coin and calls storage.set', async () => {
    const coin = { address: 'addr1', name: 'Coin1', ticker: 'C1', pumpUrl: 'url', balance: 10 };
    await useStore.getState().addCreatedCoin(coin);
    expect(useStore.getState().createdCoins).toContainEqual(coin);
    expect(mockSet).toHaveBeenCalledWith({ createdCoins: [coin] });
  });

  it('updateCoinBalance updates balance and calls storage.set', async () => {
    useStore.setState({ createdCoins: [{ address: 'addr1', name: '', ticker: '', pumpUrl: '', balance: 0 }] });
    await useStore.getState().updateCoinBalance('addr1', 20);
    expect(useStore.getState().createdCoins[0].balance).toBe(20);
    expect(mockSet).toHaveBeenCalledWith({
      createdCoins: [{ address: 'addr1', name: '', ticker: '', pumpUrl: '', balance: 20 }]
    });
  });

  it('refreshTokenBalances updates balances and calls storage.set', async () => {
    useStore.setState({
      wallet: { publicKey: { toString: () => 'owner' } } as any,
      createdCoins: [
        { address: 'addr1', name: '', ticker: '', pumpUrl: '', balance: 0 },
        { address: 'addr2', name: '', ticker: '', pumpUrl: '', balance: 0 }
      ]
    });
    mockConnection.getTokenBalance
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(200);
    await useStore.getState().refreshTokenBalances();
    expect(mockConnection.getTokenBalance).toHaveBeenCalledTimes(2);
    const updated = useStore.getState().createdCoins;
    expect(updated.find(c => c.address === 'addr1')?.balance).toBe(100);
    expect(updated.find(c => c.address === 'addr2')?.balance).toBe(200);
    expect(mockSet).toHaveBeenCalledWith({ createdCoins: updated });
  });

  it('getBalance sets balance and handles success', async () => {
    mockConnection.getBalance.mockResolvedValue(5000000000);
    useStore.setState({ wallet: { publicKey: { toString: () => 'owner' } } as any });
    await useStore.getState().getBalance();
    expect(useStore.getState().balance).toBe(5);
    expect(useStore.getState().error).toBeNull();
  });

  it('getBalance handles errors gracefully', async () => {
    mockConnection.getBalance.mockRejectedValue(new Error('fail'));
    useStore.setState({ wallet: { publicKey: { toString: () => 'owner' } } as any });
    await useStore.getState().getBalance();
    expect(useStore.getState().error).toContain('Failed to fetch wallet balance:');
  });

  it('checkVersion sets updateAvailable and isLatestVersion', async () => {
    (global as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ latest: '1.0.1' })
    });
    await useStore.getState().checkVersion();
    expect(useStore.getState().updateAvailable).toBe('1.0.1');
    expect(useStore.getState().isLatestVersion).toBe(false);
  });

  it('getTokenCreationData throws on non-ok response', async () => {
    (global as any).fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Not Found'
    });
    await expect(useStore.getState().getTokenCreationData({}, 1)).rejects.toThrow('Failed to fetch token creation data: Not Found');
  });
});