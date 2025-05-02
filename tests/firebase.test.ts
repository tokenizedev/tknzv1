import { vi, describe, it, expect } from 'vitest';
import * as firestore from 'firebase/firestore';
import { logEventToFirestore } from '../src/firebase';

vi.mock('firebase/firestore', async () => {
  const actual: any = await vi.importActual('firebase/firestore');
  return {
    __esModule: true,
    ...actual,
    collection: vi.fn(),
    addDoc: vi.fn()
  };
});

describe('logEventToFirestore', () => {
  it('calls addDoc with correct parameters', async () => {
    const mockCollection = firestore.collection as unknown as ReturnType<typeof vi.fn>;
    const mockAddDoc = firestore.addDoc as unknown as ReturnType<typeof vi.fn>;
    const fakeCollection = {};
    mockCollection.mockReturnValue(fakeCollection);
    await logEventToFirestore('testEvent', { foo: 'bar' });
    expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'events');
    expect(mockAddDoc).toHaveBeenCalledWith(
      fakeCollection,
      expect.objectContaining({
        eventName: 'testEvent',
        foo: 'bar',
        timestamp: expect.any(Date)
      })
    );
  });

  it('suppresses errors and does not throw when addDoc rejects', async () => {
    const mockAddDoc = firestore.addDoc as unknown as ReturnType<typeof vi.fn>;
    mockAddDoc.mockRejectedValue(new Error('fail'));
    await expect(logEventToFirestore('errorEvent', {})).resolves.toBeUndefined();
  });
});