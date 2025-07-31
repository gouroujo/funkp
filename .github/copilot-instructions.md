# Copilot Instructions for funkp Nx Workspace

## Overview

- This is a monorepo managed with [Nx](https://nx.dev), using npm as the package manager.
- The workspace contains multiple apps and libraries under `apps/` and `libs/`.
- Core domain logic is in `libs/core`, with functional programming primitives.
- Nx orchestrates builds, tests, and code generation. Use Nx CLI for all project tasks.

## Key Workflows

- **Run tasks:** Use `npx nx <target> <project>` (e.g., `npx nx build core`, `npx nx test demo`).
- **List available targets:** `npx nx show project <project>`
- **Visualize project graph:** `npx nx graph`

## Project Structure & Patterns

- **Apps** live in `apps/`, e.g., `apps/demo`.
- **Libraries** live in `libs/`, e.g., `libs/core`.
- Prefer pure functions and type safety; see `libs/core/src/Either/` for examples.
- Each module is documented with TSDoc and usage examples.
- Tests are colocated in the same file, guarded by `if (import.meta.vitest)` blocks.

## Conventions

- Use TypeScript throughout.
- Document all public APIs with TSDoc and examples. Import `@funkp/core` in the documentation examples to access public API.
- Stay as simple as possible; avoid unnecessary complexity.

## Integration & External Dependencies

- No framework-specific code in core libraries; keep them framework-agnostic.

## Examples

- See `libs/core/src/Either/bimap.ts` for a fully documented, tested functional utility.

---

For more, see the Nx docs: https://nx.dev
