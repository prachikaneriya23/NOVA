# NOVA - AI Chatbot Platform

Foundational architecture and project structure for NOVA, an AI chatbot web application.

---

## Project Structure

```text
NOVA/
├── client/                     # Frontend Application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── lib/
│   │   │   └── utils.ts        # Tailwind class merging utility (clsx + tailwind-merge)
│   │   ├── App.tsx             # Root React component
│   │   ├── index.css           # Tailwind CSS directives & NOVA design system tokens
│   │   ├── main.tsx            # React DOM root entry
│   │   └── vite-env.d.ts       # Vite TypeScript type declarations
│   ├── index.html              # HTML shell with Google Font "Inter"
│   ├── package.json            # Client dependencies & scripts
│   ├── postcss.config.js       # PostCSS configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration with NOVA theme
│   ├── tsconfig.json           # TypeScript configuration
│   ├── tsconfig.app.json       # App-specific TS compiler options
│   ├── tsconfig.node.json      # Vite Node environment TS config
│   └── vite.config.ts          # Vite configuration with /api reverse proxy
│
├── server/                     # Backend API Server
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma schema (Conversation & Message models)
│   │   └── dev.db              # Local SQLite database
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts          # Dotenv loader and configuration validator
│   │   ├── controllers/
│   │   │   ├── chat.controller.ts        # SSE streaming controller
│   │   │   └── conversation.controller.ts# Conversation & Message CRUD controller
│   │   ├── lib/
│   │   │   └── prisma.ts       # Prisma Client singleton
│   │   ├── routes/
│   │   │   ├── chat.routes.ts            # POST /api/chat streaming route
│   │   │   ├── conversation.routes.ts    # /api/conversations CRUD routes
│   │   │   └── health.routes.ts          # GET /api/health endpoint
│   │   ├── services/
│   │   │   └── ai.service.ts   # Modular OpenAI service adapter
│   │   └── index.ts            # Express application entry point & CORS configuration
│   ├── .env.example            # Environment variables template
│   ├── .env                    # Local environment variables (gitignored)
│   ├── package.json            # Server dependencies & scripts (db:push, db:generate)
│   └── tsconfig.json           # Node / CommonJS TypeScript configuration
│
├── .gitignore                  # Root gitignore
├── package.json                # Monorepo script runner
└── README.md                   # Project documentation
```

---

## Getting Started

### 1. Server Setup

```bash
cd server
npm install
npm run db:push    # Push schema and initialize SQLite database
npm run dev
```

Server runs by default on `http://localhost:5000`.
- Health Check: `GET http://localhost:5000/api/health`
- Conversations API: `GET /api/conversations`, `POST /api/conversations`, `DELETE /api/conversations/:id`
- Streaming Chat: `POST /api/chat`

### 2. Client Setup

```bash
cd client
npm install
npm run dev
```

Client runs by default on `http://localhost:5173`.

---

## Design System Tokens

The client implements the NOVA design system variables in `client/src/index.css`:

| Token | Light Mode | Dark Mode |
| --- | --- | --- |
| `--bg-primary` | `#F7F7F5` | `#111111` |
| `--bg-surface` | `#FFFFFF` | `#181818` |
| `--text-primary` | `#171717` | `#F5F5F5` |
| `--text-secondary` | `#6B6B6B` | `#A1A1A1` |
| `--border-color` | `#E5E5E2` | `#2A2A2A` |
| `--accent-color` | `#4F46E5` | `#818CF8` |
