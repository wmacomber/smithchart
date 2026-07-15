# ADR 0001: Bun, Vite, static SPA

Status: Accepted

## Context

Project needs fast local tooling and static GitHub Pages output without production server infrastructure.

## Decision

Bun 1.3.14 installs dependencies and runs scripts. Vite builds React and TypeScript into static assets. Browser code uses no Bun runtime API.

## Consequences

Commit `bun.lock`, use frozen installs, and verify root plus Pages-subpath builds.

## Rejected

Server rendering or framework backend: violates static scope.

## Verification

`bun install --frozen-lockfile && bun run build`.
