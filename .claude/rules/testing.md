---
name: testing
description: "Testing practices and coverage requirements for audiocontrol.org"
---

# Testing Rules

## Test Categories

| Category | Tool | Command | Location |
|----------|------|---------|----------|
| Unit | Vitest | `npm test` | Co-located or `test/` |
| Integration | Vitest | `npm run test:integration` | `test/integration/` |
| E2E | Playwright | `npm run test:e2e` | `test/e2e/` |

## Principles

- Write tests alongside implementation, not after
- Use fixture data, never mock data outside test code
- Test edge cases, not just the golden path
- Prefer integration tests over unit tests for component behavior
- E2E tests verify user-visible behavior in a browser

## Before Shipping

- All existing tests must pass: `npm test && npm run test:integration`
- New features should include tests
- Build must succeed: `npm run build`

## What NOT to Test

- Third-party library internals
- Astro framework behavior
- CSS styling (use visual review instead)
