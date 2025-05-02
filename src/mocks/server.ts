// src/mocks/server.ts
// Setup a request mocking server with the given request handlers.
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Configure requests interception.
export const server = setupServer(...handlers);