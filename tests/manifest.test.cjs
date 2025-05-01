const assert = require('assert');
const pkg = require('../package.json');
const manifest = require('../manifest.json');

// Test that manifest.json version matches package.json version
assert.strictEqual(
  manifest.version,
  pkg.version,
  `Manifest version (${manifest.version}) does not match package.json version (${pkg.version})`
);

// Test that manifest_version is 3
assert.strictEqual(
  manifest.manifest_version,
  3,
  `Expected manifest_version to be 3, but got ${manifest.manifest_version}`
);

// Test that the default popup in action is index.html
assert.strictEqual(
  manifest.action.default_popup,
  'index.html',
  `Expected default_popup to be 'index.html', but got ${manifest.action.default_popup}`
);

console.log('✓ Manifest tests passed');