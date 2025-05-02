import pkg from '../package.json';
import manifest from '../manifest.json';

// Test that manifest.json version matches package.json version
describe('manifest.json', () => {
  it('version matches package.json version', () => {
    expect(manifest.version).toBe(pkg.version);
  });

  it('manifest_version is 3', () => {
    expect(manifest.manifest_version).toBe(3);
  });

  it("default_popup is 'index.html'", () => {
    expect(manifest.action.default_popup).toBe('index.html');
  });
});