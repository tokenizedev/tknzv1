// src/setupTests.ts
// Global setup for Vitest + Testing Library + MSW
import { vi } from 'vitest'
import createFetchMock from 'vitest-fetch-mock'
import '@testing-library/jest-dom';
import { server } from './mocks/server';

const fetchMocker = createFetchMock(vi)

fetchMocker.enableMocks()
// Establish API mocking before all tests.
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
// Reset any request handlers that are declared as a part of our tests
// so they don't affect other tests.
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished.

