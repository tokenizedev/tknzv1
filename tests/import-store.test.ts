import { it, expect } from 'vitest';
import { useStore } from '../src/store';

it('import-store works', () => {
  expect(useStore).toBeDefined();
});