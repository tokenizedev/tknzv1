import { vi } from 'vitest';
// Mock html2canvas for tweet screenshot
vi.mock('html2canvas', () => ({
  __esModule: true,
  default: (element: any, options: any) =>
    Promise.resolve({ toDataURL: () => 'data:image/png;base64,TEST' }),
}));
import { extractArticleData, extractTweetData } from '../src/contentScript';

describe('extractArticleData', () => {
  const originalLocation = window.location;
  beforeEach(() => {
    // Reset document body
    document.body.innerHTML = '';
    // Mock window.location
    delete (window as any).location;
    (window as any).location = { href: 'https://example.com/page' };
  });
  afterAll(() => {
    window.location = originalLocation;
  });

  describe('extractTweetData', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
      // Ensure URL is set
      (window as any).location = { href: 'https://tweet.com/post', origin: 'https://tweet.com' };
    });

    it('extracts tweet data and screenshot', async () => {
      document.body.innerHTML = `
        <article data-testid="tweet">
          <div lang="en">Hello Tweet</div>
          <img alt="Image" src="https://img.com/t.png" />
          <div data-testid="User-Name"><span>AuthorX</span></div>
        </article>
      `;
      const data = await extractTweetData();
      expect(data.title).toBe('Hello Tweet');
      expect(data.description).toBe('Hello Tweet');
      expect(data.image).toBe('data:image/png;base64,TEST');
      expect(data.tweetImage).toBe('https://img.com/t.png');
      expect(data.authorName).toBe('AuthorX');
      expect(data.url).toBe('https://tweet.com/post');
      expect(data.xUrl).toBe('https://tweet.com/post');
    });

    it('falls back when tweet container missing', async () => {
      document.body.innerHTML = '';
      const data = await extractTweetData();
      // Fallback returns 'Tweet' as title when not found
      expect(data.title).toBe('Tweet');
      expect(data.image).toBe('');
      expect(data.description).toBe('');
    });
  });

  it('returns default values when no elements present', () => {
    const data = extractArticleData();
    // With no matching elements, default title falls back
    expect(data.title).toBe('Untitled Article');
    expect(data.image).toBe('');
    expect(data.description).toBe('');
    expect(data.url).toBe('https://example.com/page');
  });

  it('extracts title from <h1>', () => {
    document.body.innerHTML = '<h1>My Title</h1>';
    const data = extractArticleData();
    expect(data.title).toBe('My Title');
  });

  it('extracts title from meta og:title', () => {
    document.head.innerHTML = '<meta property="og:title" content="OG Title">';
    const data = extractArticleData();
    expect(data.title).toBe('OG Title');
  });

  it('extracts image from meta og:image', () => {
    document.head.innerHTML = '<meta property="og:image" content="https://img.com/pic.png">';
    const data = extractArticleData();
    expect(data.image).toBe('https://img.com/pic.png');
  });

  it('extracts description from meta description', () => {
    document.head.innerHTML = '<meta name="description" content="Desc here">';
    const data = extractArticleData();
    expect(data.description).toBe('Desc here');
  });

  it('resolves relative image URLs via window.location.origin', () => {
    // Wrap img inside an article to match selector
    document.body.innerHTML = '<article><img src="/img.png"></article>';
    (window as any).location = { href: 'https://site.com/page', origin: 'https://site.com' };
    const data = extractArticleData();
    expect(data.image).toBe('https://site.com/img.png');
  });
});