import React from 'react';
import { render, screen } from '@testing-library/react';
import { VersionCheck } from '../src/components/VersionCheck';

describe('VersionCheck Component', () => {
  it('displays the current and latest versions and update link', () => {
    const latest = '9.9.9';
    render(<VersionCheck updateAvailable={latest} />);
    expect(screen.getByText(/New version available/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Latest version: ${latest}`))).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Update now/i });
    expect(link).toHaveAttribute(
      'href',
      'https://chromewebstore.google.com/detail/eejballiemiamlndhkblapmlmjdgaaoi'
    );
  });
});