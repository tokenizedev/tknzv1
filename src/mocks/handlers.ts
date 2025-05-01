// src/mocks/handlers.ts
// Define request handlers for Mock Service Worker (MSW).
import { rest } from 'msw';

export const handlers = [
  // Example: Mock GET /api/user endpoint
  // rest.get('/api/user', (req, res, ctx) => {
  //   return res(
  //     ctx.status(200),
  //     ctx.json({ id: '123', name: 'Test User' })
  //   );
  // }),
];