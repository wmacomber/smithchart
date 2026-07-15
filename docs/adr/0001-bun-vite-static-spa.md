# ADR 0001: Bun, Vite, static SPA

Status: Accepted

## Decision

Bun installs/runs scripts. Vite builds React TypeScript into static assets. No Bun runtime API or server exists in deployment.

## Consequences

Commit `bun.lock`; verify frozen install and Pages subpath build.

## Rejected

Server rendering and framework backend: violate static scope.

## Verification

`bun install --frozen-lockfile && bun run build`.
