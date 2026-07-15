# Testing

- Vitest: complex arithmetic, conversions, solver, URL, chart geometry.
- fast-check: conversion round trips, reciprocal identity, lossless magnitude invariant.
- Python: independent checked-in RF cases and equation coverage.
- Playwright: workflows, keyboard, touch, browser matrix, export, offline, accessibility, visuals.
- Architecture script plus DOM-free TypeScript config enforce RF isolation.

Run `bun run ci`, then three Playwright browser projects. Any RF equation change must update mathematics, fixtures, Python verification, and TypeScript tests together.
