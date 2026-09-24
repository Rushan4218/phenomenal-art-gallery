# Phenomenal Art Gallery — AI Development Guidelines

## Project

Phenomenal Art Gallery is a production e-commerce platform for a
Thangka art business based in Bhaktapur, Nepal.

## Repository

This is a pnpm monorepo.

Applications live under `apps/`.
Shared packages live under `packages/`.

## Architecture

The backend is a modular monolith.

Backend request flow:

Controller → Service → Repository → Database

Controllers handle HTTP concerns.

Services contain business logic.

Repositories own database access.

Controllers and services must not access Prisma directly.

## General Principles

- Prefer simple solutions over unnecessary abstractions.
- Do not introduce dependencies without a reason.
- Do not introduce infrastructure before it is needed.
- Preserve clear module boundaries.
- Keep business logic out of UI components.
- Validate external input at system boundaries.
- Never trust client-side payment state.
- Changes must be understood and reviewed before being committed.

## AI Coding Rules

Before making substantial changes:

1. Understand the existing architecture.
2. Explain the intended approach when requested.
3. Keep changes focused.
4. Do not rewrite unrelated code.
5. Do not introduce architectural changes without discussion.
6. Do not remove existing functionality without explicit reason.
7. Run appropriate tests, type checks, and linting after changes.

Generated code is not considered complete until it has been reviewed.
