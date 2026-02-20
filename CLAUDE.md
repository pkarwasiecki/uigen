# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface, Claude generates the code using tools, and the result is immediately previewed in a sandboxed iframe.

## Commands

```bash
# Initial setup (install deps + Prisma generate + DB migrations)
npm run setup

# Development server (uses turbopack)
npm run dev

# Build for production
npm run build

# Run all tests (vitest with jsdom)
npm test

# Run a single test file
npx vitest src/lib/__tests__/file-system.test.ts

# Lint
npm run lint

# Reset the database
npm run db:reset

# After schema changes, run migrations
npx prisma migrate dev
```

## Architecture

### Request Flow

1. User types in `ChatInterface` → `ChatProvider` (via `useAIChat` from Vercel AI SDK) → `POST /api/chat`
2. The API route calls `streamText` with two tools: `str_replace_editor` and `file_manager`
3. As Claude streams tool calls, the client's `onToolCall` callback fires `handleToolCall` in `FileSystemContext`
4. `FileSystemContext` mutates the in-memory `VirtualFileSystem` and increments `refreshTrigger`
5. `PreviewFrame` watches `refreshTrigger`, re-runs `createImportMap` + `createPreviewHTML`, and sets `iframe.srcdoc`

### Virtual File System

`src/lib/file-system.ts` — `VirtualFileSystem` class holds all generated files in memory (never written to disk). Serialized as `Record<string, FileNode>` for:
- Sending to `/api/chat` with each request (so Claude has current file state)
- Persisting to `Project.data` (SQLite JSON column) for authenticated users

### Preview Pipeline

`src/lib/transform/jsx-transformer.ts` runs entirely client-side:
- Transforms JSX/TSX via `@babel/standalone`
- Creates blob URLs for each transformed file
- Builds an ES module import map (maps `@/` aliases, handles third-party packages via `esm.sh`)
- Injects everything into a self-contained HTML string set as `iframe.srcdoc`
- Tailwind CSS is loaded from CDN inside the preview iframe

### AI Provider

`src/lib/provider.ts` — `getLanguageModel()` checks `ANTHROPIC_API_KEY`:
- With key: uses `claude-haiku-4-5` via `@ai-sdk/anthropic`
- Without key: returns `MockLanguageModel` that streams static counter/form/card components

The system prompt (`src/lib/prompts/generation.tsx`) instructs Claude to always create `/App.jsx` as the entry point, use `@/` import aliases, and style with Tailwind.

### Auth

JWT-based session auth (`src/lib/auth.ts`) using `jose`. Sessions stored as HTTP-only cookies (7-day expiry). Anonymous users can generate without signing in — their work is tracked in `sessionStorage` via `src/lib/anon-work-tracker.ts` and can be saved on sign-up.

### Data Persistence

Prisma + SQLite (`prisma/dev.db`). The `Project` model stores:
- `messages`: JSON array of the full chat history
- `data`: JSON object of the serialized `VirtualFileSystem`

Projects are only saved after each AI response if the user is authenticated.

### Context Providers

`MainContent` wraps the entire UI in two nested providers:
- `FileSystemProvider` — manages `VirtualFileSystem` instance and exposes file operations
- `ChatProvider` — wraps Vercel AI SDK's `useChat`, wires `onToolCall` to `FileSystemContext.handleToolCall`

### Key Paths

| Path | Purpose |
|------|---------|
| `src/app/api/chat/route.ts` | AI streaming endpoint |
| `src/lib/file-system.ts` | `VirtualFileSystem` class |
| `src/lib/transform/jsx-transformer.ts` | Client-side JSX → blob URL pipeline |
| `src/lib/provider.ts` | Real vs. mock AI model selection |
| `src/lib/prompts/generation.tsx` | System prompt sent to Claude |
| `src/lib/contexts/file-system-context.tsx` | File system React context + tool call handler |
| `src/lib/contexts/chat-context.tsx` | Chat React context (wraps Vercel AI SDK) |
| `src/components/preview/PreviewFrame.tsx` | Iframe-based live preview |
| `prisma/schema.prisma` | DB schema (User, Project) |

## Environment Variables

- `ANTHROPIC_API_KEY` — required for real AI generation; omit to use the mock provider
- `JWT_SECRET` — JWT signing key; defaults to `"development-secret-key"` if unset
