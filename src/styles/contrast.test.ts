/// <reference types="node" />
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');

const tokensFor = (selector: string): Readonly<Record<string, string>> => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = css.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`))?.[1] ?? '';
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{3,8})\s*;/gi)].map((match) => [
      match[1]!,
      match[2]!,
    ]),
  );
};

const rgb = (hex: string): readonly [number, number, number] => {
  const value = hex.slice(1);
  const expanded = value.length === 3 ? [...value].map((item) => item + item).join('') : value;
  return [0, 2, 4].map((offset) => Number.parseInt(expanded.slice(offset, offset + 2), 16)) as [
    number,
    number,
    number,
  ];
};

const luminance = (hex: string): number => {
  const channels = rgb(hex).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
};

const ratio = (left: string, right: string): number => {
  const [lighter, darker] = [luminance(left), luminance(right)].sort((a, b) => b - a);
  return (lighter! + 0.05) / (darker! + 0.05);
};

describe('accessible color tokens', () => {
  const themes = [
    ['light', tokensFor(':root')],
    ['dark', tokensFor(":root[data-theme='dark']")],
  ] as const;

  for (const [theme, tokens] of themes) {
    it(`${theme} text tokens meet WCAG AA`, () => {
      for (const foreground of ['text', 'muted', 'error', 'warning']) {
        expect(ratio(tokens[foreground]!, tokens['panel']!), foreground).toBeGreaterThanOrEqual(
          4.5,
        );
      }
    });

    it(`${theme} information and focus tokens meet non-text contrast`, () => {
      for (const foreground of [
        'grid-strong',
        'admittance',
        'accent',
        'accent-2',
        'load',
        'focus',
      ]) {
        expect(
          ratio(tokens[foreground]!, tokens['panel-strong']!),
          foreground,
        ).toBeGreaterThanOrEqual(3);
      }
    });

    it(`${theme} selected-control text meets WCAG AA`, () => {
      expect(ratio(tokens['selected-text']!, tokens['accent']!)).toBeGreaterThanOrEqual(4.5);
    });
  }
});
