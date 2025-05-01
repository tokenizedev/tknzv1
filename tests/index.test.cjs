const fs = require('fs');
const path = require('path');
const assert = require('assert');
const manifest = require('../manifest.json');

// Read index.html
const indexPath = path.join(__dirname, '../index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

// Extract the <title> content
const titleMatch = indexHtml.match(/<title>(.*?)<\/title>/);
assert(
  titleMatch,
  'No <title> tag found in index.html'
);
const title = titleMatch[1].trim();

// Test that the title matches manifest.name
assert.strictEqual(
  title,
  manifest.name,
  `index.html title (${title}) does not match manifest.name (${manifest.name})`
);

console.log('✓ index.html title test passed');