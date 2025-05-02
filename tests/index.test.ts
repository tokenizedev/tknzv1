import fs from 'fs';
import path from 'path';
import manifest from '../manifest.json';

describe('index.html', () => {
  it('title matches manifest.name', () => {
    const indexPath = path.resolve(__dirname, '../index.html');
    const indexHtml = fs.readFileSync(indexPath, 'utf8');
    const titleMatch = indexHtml.match(/<title>(.*?)<\/title>/);
    expect(titleMatch).not.toBeNull();
    const title = titleMatch![1].trim();
    expect(title).toBe(manifest.name);
  });
});