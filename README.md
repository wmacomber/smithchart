# Smith Match

Browser-only RF instrument for calculating and explaining lossless single shunt-stub impedance matches. Interactive native SVG Smith chart shows load rotation, both `g=1` junctions, required open/short stub, physical construction lengths, and residual verification.

![Smith Match instrument](tests/e2e/visual.spec.ts-snapshots/instrument-desktop-chromium-linux.png)

## Why this exists

This project was inspired by Veritasium's video [The Scariest Chart In Electrical Engineering](https://www.youtube.com/watch?v=GK2pZ_oVU1o). It made several ideas click that I had only half-learned while tinkering with RF and building antennas to receive weather satellites passing overhead.

At the time, details such as an open-ended piece of wire improving a received signal felt like RF magic: how could wire attached to nothing make the signal louder? The video showed how a Smith chart turns that intuition into transmission-line behavior you can see and calculate. Smith Match grew from wanting my own tool for working out the required stubs, their physical lengths, and how to connect them correctly.

## Features

- Two valid solutions with impedance, admittance, electrical, metric, and customary values
- Impedance, admittance, reflection-coefficient entry and direct chart manipulation
- Mouse, touch, keyboard, responsive themes, textual chart equivalent
- Shareable URL, SVG export, print worksheet, offline reload
- Pure TypeScript RF engine checked against an alternate-formulation Python verifier

## Develop

```bash
bun install --frozen-lockfile
bun run dev
bun run ci
bun run build
bun run test:e2e
```

Vite builds static `dist/`. `BASE_PATH=/repository/ bun run build` supports GitHub Pages project paths. After one successful load and service-worker activation, visited calculations reload offline. First-ever offline load and installable PWA behavior are not supported. No server runtime or runtime network API exists.

See [architecture](docs/architecture.md), [mathematics](docs/mathematics.md), [contributing](CONTRIBUTING.md), and [security](SECURITY.md).

MIT licensed.
