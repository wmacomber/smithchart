import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the accessible project foundation shell', () => {
    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain('<h1>Smith Match</h1>');
    expect(markup).toContain('<main>');
    expect(markup).toContain('Project foundation ready');
  });
});
