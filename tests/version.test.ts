import { APP_VERSION } from '../src/config/version';

describe('Version Config', () => {
  it('exports a string APP_VERSION', () => {
    expect(typeof APP_VERSION).toBe('string');
  });
});