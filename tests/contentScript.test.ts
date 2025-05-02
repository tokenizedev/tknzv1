import { extractArticleData } from '../src/contentScript';

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

  it('returns default values when no elements present', () => {
    const data = extractArticleData();
    // In absence of elements, fallback returns Untitled Article
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