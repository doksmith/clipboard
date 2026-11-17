# Clipboard

A modern, self-hosted realtime code snippet and multi-file clipboard hub built with **Next.js 16 (App Router)**, **React 19**, **shadcn/ui (Base UI + Tailwind CSS v4)**, **Drizzle ORM**, and **SQLite**.

Create, share, and collaborate on multi-file snippets with instant syntax highlighting, client-side encryption, and live peer collaboration — without relying on external CDNs or cloud storage.

---

## ✨ Features

- **Multi-File Snippets**: Attach multiple files to a single paste, each with syntax highlighting powered by Shiki & CodeMirror.
- **Realtime Live Rooms**: Collaborative scratchpads using native HTTP Server-Sent Events (SSE) and HTTP POST pub-sub. Realtime peer count, active user badges, and popover peer lists.
- **Client-Side Encryption**: Optional AES-GCM-256 encryption via the browser's native Web Crypto API. The server never sees your plaintext content or encryption keys.
- **Burn After Read**: Self-destructing pastes permanently purged upon the first viewing.
- **TTL Expiry**: Auto-expire snippets after a configurable duration (10 min, 1 hr, 1 day, 1 week, etc.).
- **Password Protection**: Gate access to pastes with bcrypt-hashed passwords.
- **QR Code Handoff & Generation**: Transfer snippets instantly across devices using generated QR codes with local base64 caching via `/api/qr`.
- **Raw Endpoint**: Read paste contents in plain text via `/raw/:id` (perfect for `curl` and shell pipelines).
- **Interactive OpenAPI 3.1 & Scalar Docs**: Full interactive API documentation served directly at `/api`.
- **Public Explorer**: Filter and search public pastes with server-side pagination.
- **Decoupled View Count**: Non-blocking view increments via dedicated `/api/pastes/:id/view` endpoint.
- **Zero CDN & Self-Contained**: Favicons, web manifest, fonts, and assets bundled locally.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.4 (App Router, Turbopack, Standalone Output) |
| **Language & Runtime**| TypeScript 5, Node.js 20+ (Node 22 / 24 recommended) |
| **UI Components** | shadcn/ui (`base-vega` preset, Base UI primitives) |
| **Styling** | Tailwind CSS v4 |
| **Icons** | Remix Icon (`@remixicon/react`) |
| **Code Highlighting & Editor** | Shiki & CodeMirror (`@uiw/react-codemirror`) |
| **Database & ORM** | SQLite (`better-sqlite3`) & Drizzle ORM |
| **Realtime** | Server-Sent Events (SSE) & HTTP Pub-Sub |
| **API Docs** | OpenAPI 3.1 via `@asteasolutions/zod-to-openapi` & Scalar (`@scalar/api-reference-react`) |
| **Security** | Web Crypto API (Client-side AES-GCM) & Web Worker safe hashing |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22.19+ or Node.js 24 (recommended)
- pnpm 9 or later

### Installation

```bash
git clone https://github.com/doksmith/clipboard.git
cd clipboard
pnpm install
```

### Development

```bash
pnpm dev
```

The application starts at `http://localhost:3000`. The SQLite database will be initialized automatically under `.data/clipboard.db`.

### Type Checking & Linting

```bash
pnpm typecheck
pnpm lint
```

### Production Build

```bash
pnpm build
pnpm start
```

---

## 🗄️ Database Management (Drizzle ORM)

```bash
pnpm db:push       # Push schema directly to SQLite (development shortcut)
pnpm db:generate   # Generate migration files from schema
pnpm db:migrate    # Apply pending database migrations
pnpm db:studio     # Launch Drizzle Studio GUI in your browser
```

---

## 📡 API Endpoints

Explore the interactive API playground at `/api` or inspect the OpenAPI spec at `/api/openapi.json`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck endpoint (`200 OK`) |
| `GET` | `/api/pastes` | List public pastes (pagination & search) |
| `POST` | `/api/pastes` | Create a new snippet |
| `GET` | `/api/pastes/:id` | Fetch paste details and files |
| `POST` | `/api/pastes/:id/view` | Increment view count |
| `PUT` | `/api/pastes/:id` | Update snippet (creates new revision) |
| `GET` | `/raw/:id` | Output raw plain text of first file |
| `GET` | `/api/qr?text=...` | Return SVG / base64 QR code image |
| `GET` | `/api/live/:room` | Connect to live room SSE stream |
| `POST` | `/api/live/:room` | Broadcast realtime update to room peers |

---

## 🐳 Docker Deployment

The project provides an enterprise-standard, multi-stage `Dockerfile` with standalone Next.js compilation, native `better-sqlite3` bindings, OCI Image Annotations, and automated publishing to **GitHub Container Registry (GHCR)**.

### Pull Pre-built Image from GHCR

You can pull the official published images directly from GHCR:

```bash
# Pull latest stable release
docker pull ghcr.io/doksmith/clipboard:latest

# Or pull a specific major / minor / patch version
docker pull ghcr.io/doksmith/clipboard:1
docker pull ghcr.io/doksmith/clipboard:1.0
docker pull ghcr.io/doksmith/clipboard:1.0.0
```

### Run Container with Persistent Storage

```bash
docker run -d \
  -p 3000:3000 \
  -v clipboard-data:/app/.data \
  --name clipboard \
  ghcr.io/doksmith/clipboard:latest
```

### Build Locally

```bash
# Build local Docker image
docker build -t clipboard .

# Run local container
docker run -d \
  -p 3000:3000 \
  -v clipboard-data:/app/.data \
  --name clipboard \
  clipboard
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port for the container server |
| `NODE_ENV` | `production` | Node environment |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` | Public URL for QR codes and link sharing |

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more details.
