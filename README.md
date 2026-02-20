# UIGen

AI-powered React component generator with live preview. Describe a component in the chat, and Claude generates the code — instantly previewed in a sandboxed iframe.

## Features

- **AI-powered generation** — uses Claude to write React components from natural language
- **Live preview** — components render in real time as code is generated
- **Virtual file system** — no files written to disk; everything runs in-memory
- **Import aliases & Tailwind** — generated code uses `@/` aliases and Tailwind CSS out of the box
- **Code editor** — view and edit generated files with syntax highlighting
- **Auth + persistence** — registered users have projects saved; anonymous users can generate without signing in
- **Mock mode** — works without an API key by returning static example components

## Prerequisites

- Node.js 18+
- npm

## Setup

1. Copy `.env.example` to `.env` and add your Anthropic API key (optional — see Mock mode below):

```bash
ANTHROPIC_API_KEY=your-api-key-here
JWT_SECRET=your-jwt-secret
```

2. Install dependencies and initialize the database:

```bash
npm run setup
```

This installs dependencies, generates the Prisma client, and runs database migrations.

## Running

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Mock mode

If `ANTHROPIC_API_KEY` is not set, UIGen uses a built-in mock provider that returns static counter/form/card components. Useful for UI development without API costs.

## Usage

1. Sign up or continue as an anonymous user
2. Describe the React component you want in the chat (e.g. *"a pricing card with a buy button"*)
3. Watch the live preview update as Claude writes the code
4. Switch to the **Code** tab to view and edit the generated files
5. Keep chatting to iterate and refine

## Commands

```bash
npm run setup      # Install deps + Prisma generate + DB migrations
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build
npm test           # Run all tests (Vitest)
npm run lint       # ESLint
npm run db:reset   # Reset the database
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Language | TypeScript |
| AI | Anthropic Claude via Vercel AI SDK |
| Database | Prisma + SQLite |
| Auth | JWT (jose), HTTP-only cookies |
| Preview | Babel standalone, ES module import maps |
| Testing | Vitest, Testing Library |

## Project Structure

```
src/
├── app/                  # Next.js routes & API
│   └── api/chat/         # AI streaming endpoint
├── components/
│   ├── chat/             # Chat UI (MessageList, ToolCallBadge, …)
│   ├── editor/           # Code editor & file tree
│   └── preview/          # Sandboxed iframe preview
└── lib/
    ├── contexts/         # FileSystem + Chat React contexts
    ├── prompts/          # System prompt sent to Claude
    ├── tools/            # str_replace_editor & file_manager tools
    └── transform/        # Client-side JSX → blob URL pipeline
```
