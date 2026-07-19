# Verblo

An AI chat application with **conversation branching** (edit/regenerate without losing history) and **live web search** — built with Next.js, Prisma, and the Vercel AI SDK.

🔗 **Live:** [verblo.deepakverma.dev](https://verblo.deepakverma.dev)

---

## Features

- **Authentication** — Secure sign-in/sign-up via [Clerk](https://clerk.com), with resource-level auth checks (`auth.protect()`) on every protected route, and automatic user sync into the app's own database.
- **Conversations** — Create, rename, pin, archive, and delete conversations. The sidebar lists conversations sorted by most recent activity.
- **Branching (edit / regenerate)** — Every conversation has one or more **branches**. When a message is edited or a response is regenerated, a new branch is created from that point instead of overwriting history — the original path stays fully intact and switchable via the branch selector in the UI.
- **Live Web Search** — The assistant can call a `webSearch` tool (powered by [Tavily](https://tavily.com)) mid-response to pull in current, real-time information beyond its training data.
- **Streaming responses** — Chat responses stream token-by-token using the [Vercel AI SDK](https://sdk.vercel.ai), backed by DeepSeek as the underlying model.
- **Theming** — Light/dark mode via `next-themes`, fully wired through both the app UI and the Clerk auth widgets.

---

## Tech Stack

| Layer         | Technology                                               |
| ------------- | -------------------------------------------------------- |
| Framework     | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Language      | TypeScript                                               |
| Database      | PostgreSQL ([Neon](https://neon.tech))                   |
| ORM           | [Prisma](https://www.prisma.io)                          |
| Auth          | [Clerk](https://clerk.com)                               |
| AI / LLM      | [Vercel AI SDK](https://sdk.vercel.ai) + DeepSeek        |
| Web Search    | [Tavily](https://tavily.com)                             |
| UI            | Tailwind CSS + shadcn/ui (Base UI primitives)            |
| Data fetching | TanStack Query                                           |

---

## Architecture

### Data model

```
User ──< Conversation ──< Branch ──< Message >── Message
                                                (self-relation: parent/children)
```

- A **Conversation** belongs to a `User` and can have multiple **Branches**.
- Every **Branch** has a `parentMessageId` — `null` for the original "Main" branch, or the message it forked from for any branch created by editing/regenerating.
- **Messages** additionally track their own `parentId`, forming a tree that supports message-level branching independent of which UI branch is active.
- `Conversation.activeBranchId` tracks which branch is currently being viewed/streamed into.

### Folder structure

```
app/
  (auth)/          → sign-in / sign-up routes
  (root)/          → protected app routes (chat, home)
  api/chat/        → streaming chat endpoint (AI SDK route handler)
features/
  auth/            → Clerk sync (onboard) + requireUser helper
  conversation/     → conversation CRUD, branching logic, sidebar & chat UI
  messages/        → message persistence hooks/actions
  ai/              → model selection, tool definitions (web search), chat store
components/
  ui/              → shadcn/ui primitives
  ai-elements/     → chat-specific UI building blocks (message, conversation, loader)
prisma/
  schema.prisma    → User, Conversation, Branch, Message models
```

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/deepakwerma/verblo.git
cd verblo
npm install
```

### 2. Environment variables

Create a `.env` file in the root:

```env
# Database (Postgres — e.g. Neon)
DATABASE_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/

# AI
DEEPSEEK_API_KEY=

# Web search
TAVILY_API_KEY=
```

### 3. Set up the database

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Roadmap

Planned next:

- [ ] Multiple AI model selection per conversation (currently single default model)
- [ ] UI/UX refinement pass across chat, sidebar, and branch switcher
- [ ] Message editing UX polish
- [ ] Conversation search
- [ ] Additional tool integrations beyond web search

---

## License

This project is currently private/unlicensed while in early development.
