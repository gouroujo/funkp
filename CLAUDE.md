# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Overview

This is a functional programming library monorepo managed with Nx. The codebase provides framework-agnostic functional programming primitives and utilities in TypeScript, emphasizing type safety, purity, and composability.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->

## Common Commands

### Building

- Build a specific project: `nx build <project-name>` (e.g., `nx build core`)
- Build all projects: `nx run-many -t build`
- Build with production configuration: `nx build demo --configuration=production`

### Testing

- Run tests for a project: `nx test <project-name>` (e.g., `nx test core`)
- Run all tests: `nx run-many -t test`

### Linting & Type Checking

- Lint a project: `nx lint <project-name>`
- Type check: `nx typecheck <project-name>`

## Architecture

### Project Structure

```
libs/
  core/          - Core functional programming library with FP primitives
  vitest/        - Shared Vitest testing utilities and extensions
  ddd/           - Domain-driven design utilities (in progress)
apps/
  demo/          - Demo application showcasing library usage
```

### Core Library (`@funkp/core`)

The main functional programming library is organized by data type/abstraction:

- **Either**: Error handling with `Left<L> | Right<R>` for railway-oriented programming
- **Option**: Optional values with `Some<A> | None` for handling absence
- **Effect**: Composable effectful computations with runtime execution
- **Fiber**: Lightweight concurrent computation primitives
- **Brand**: Type-level branded types for additional type safety
- **functions**: Utility functions (`pipe`, `flow`, `identity`, `absurd`)
- **Runtime modules**: `RuntimeFiber`, `RuntimeOp`, etc. for effect execution

Each module follows a consistent structure:

- `constructors/` - Factory functions for creating values
- `operators/` - Transformation and composition functions
- `combinators/` - Higher-order functions for combining values
- `index.ts` - Re-exports and type definitions

### Multi-Entry Point System

The core library uses a multi-entry point architecture via `package.json` exports:

- `@funkp/core` - Main entry (imports everything)
- `@funkp/core/Either` - Just Either utilities
- `@funkp/core/Option` - Just Option utilities
- `@funkp/core/Effect` - Just Effect utilities
- `@funkp/core/functions` - Just utility functions
- Additional entry points for Brand, Fiber, etc.

## Code Conventions

### Documentation

- All public APIs must have TSDoc comments with `@typeParam`, `@param`, `@returns` tags
- Every function must include an `@example` block showing usage
- Import from public API (`@funkp/core`) in documentation examples, not relative paths
- See `libs/core/src/Either/operators/bimap.ts` for the standard documentation pattern

### Function Style

- Functions are curried by default to enable partial application and composition
- Prefer pure functions without side effects
- Use discriminated unions with `_tag` for variant types (e.g., `{ _tag: 'Left', left: ... }`)
- Functions return new values rather than mutating inputs

### Testing

- Tests are colocated in the same file at the end, guarded by `if (import.meta.vitest)` blocks
- Use Vitest's `it` and `expect` and `expectTypeOf` from `import.meta.vitest`
- Test both happy path and edge cases. Target 100% test coverage.
- Test type inference with `expectTypeOf`
- Example pattern from `libs/core/src/Either/operators/bimap.ts:50-75`

### Module Exports

- Export all functions from module's `index.ts` file for easy imports
- Export each module as a named export in `main.ts`
- Keep code framework-agnostic; no framework-specific or external lib dependencies in core libraries

### Type Safety

- Use TypeScript throughout with strict mode enabled
- Leverage type inference where possible
- Use type parameters to maintain type relationships through transformations
- Extract types with utility types like `RightType<E>`, `LeftType<E>`

## Typical Workflows

### Adding a New Function to an Existing Module

1. Create new file in appropriate subdirectory (e.g., `libs/core/src/Either/operators/newFunc.ts`)
2. Implement function with full TSDoc and examples
3. Add colocated tests in `if (import.meta.vitest)` block
4. Export from parent `index.ts` (e.g., `libs/core/src/Either/operators/index.ts`)
5. Run `nx test core --testFile=src/Either/operators/newFunc.ts` to verify tests pass

### Creating a New Module

1. Create directory under `libs/core/src/` with subdirectories: `constructors/`, `operators/`, `combinators/`
2. Create `index.ts` with type definitions and re-exports
3. Add named export to `libs/core/src/main.ts`
4. Add entry point to `libs/core/package.json` exports section
5. Add entry to `libs/core/vite.config.ts` build.lib.entry
6. Implement functions following existing patterns
7. Run `nx build core` to verify build succeeds

### Running a Single Test

Tests are embedded in source files. To run tests for a specific module, use Vitest's filtering:

```bash
nx test core --testFile=src/Either/operators/bimap.ts
```

This will run tests in file matching "src/Either/operators/bimap.ts".
