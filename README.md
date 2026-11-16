# Clipboard

A self-hosted realtime clipboard and code snippet hub. Create, share, and sync multi-file snippets with syntax highlighting, client-side encryption, and live collaborative scratchpads -- all without relying on any third-party CDN or external service.

---

## Features

- **Multi-file snippets** -- attach multiple named files to a single paste, each with independent language detection and syntax highlighting via Shiki.
- **Realtime scratchpads** -- open a live room and collaborate in real time over Nitro WebSockets (crossws). Changes propagate instantly to all connected clients.
- **Client-side encryption** -- optional AES-GCM-256 encryption performed entirely in the browser using the Web Crypto API. The server never sees plaintext content.
- **Burn after read** -- mark a snippet so it is permanently deleted the moment it is viewed once.
- **Time-to-live expiry** -- set a TTL on any snippet; expired entries are purged automatically on access.
- **Password protection** -- gate access to a snippet behind a password without encrypting the underlying content.
- **Revision history** -- every edit creates a new revision, preserving the full history of changes.
- **QR code handoff** -- generate a QR code for any snippet URL to transfer it quickly between devices.
- **Raw endpoint** -- fetch snippet content as plain text at `/raw/:id`, suitable for `curl` and shell pipelines.
- **Public explorer** -- browse and search all public snippets with server-side pagination.
- **Dark, light, and system themes** -- toggle between color schemes or follow the operating system preference.
- **Responsive layout** -- adapts from mobile to ultra-wide displays.
- **Zero CDN** -- fonts, icons, and all static assets are bundled and served locally. No requests leave the host at runtime.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Nuxt 4 (Nitro server engine) |
| UI primitives | shadcn-vue (Reka UI) with all 477 components installed |
| Styling | Tailwind CSS v4 |
| Icons | Tabler Icons (`@tabler/icons-vue`) |
| Database | SQLite via better-sqlite3 |
| ORM | Drizzle ORM |
| Realtime | Nitro WebSockets (crossws) |
| Syntax highlighting | Shiki |
| Encryption | Web Crypto API (AES-GCM-256) |
| QR generation | qrcode |

### Typography

All fonts are self-hosted through Fontsource packages. No external font requests are made.

| Role | Font |
|---|---|
| Body | Geist Sans |
| Headings | Instrument Sans |
| Code / monospace | JetBrains Mono |

## Getting Started

### Prerequisites

- Node.js 20 or later
- pnpm 9 or later

### Install

```bash
git clone https://github.com/dyzulk/clipboard.git
cd clipboard
pnpm install
```

### Development

```bash
pnpm dev
```

The dev server starts at `http://localhost:3000` with hot module replacement enabled. The SQLite database is created automatically at `.data/clipboard.db` on first request.

### Type Check

```bash
pnpm typecheck
```

Runs `nuxt typecheck` (vue-tsc) against the full project.

### Production Build

```bash
pnpm build
pnpm preview
```

`pnpm build` compiles the application into `.output/`. `pnpm preview` starts the production server locally.

### Database Commands

```bash
pnpm db:generate   # Generate migration files from schema changes
pnpm db:migrate    # Apply pending migrations
pnpm db:push       # Push schema directly (development shortcut)
pnpm db:studio     # Open Drizzle Studio in the browser
```

## API

### Create a snippet

```
POST /api/pastes
Content-Type: application/json

{
  "title": "example",
  "files": [
    { "name": "main.ts", "content": "console.log('hello')", "language": "typescript" }
  ],
  "visibility": "public",
  "ttl": 3600,
  "burnAfterRead": false,
  "password": null
}
```

### List public snippets

```
GET /api/pastes?page=1&search=keyword
```

### Retrieve a snippet

```
GET /api/pastes/:id
```

If the snippet is password-protected, include the password as a query parameter or in the request body.

### Update a snippet

```
PUT /api/pastes/:id
Content-Type: application/json

{
  "title": "updated title",
  "files": [ ... ]
}
```

A new revision is created automatically.

### Raw content

```
GET /raw/:id
```

Returns the content of the first file as plain text. Useful for piping into other tools:

```bash
curl http://localhost:3000/raw/abc123
```

## Project Structure

```
clipboard/
  app/
    assets/css/         Tailwind CSS entry point and design tokens
    components/         Vue components (ThemeToggle, QrModal, ShareModal, ...)
    composables/        useShiki, useWebCrypto, useRealtimeClip
    layouts/            Default layout with navbar and footer
    pages/              index, [id], explore, live/[room]
  server/
    api/pastes/         REST endpoints
    database/           Drizzle schema and migrations
    routes/             Raw endpoint, WebSocket handler
    utils/              Database connection, security helpers
  public/               Static assets
  drizzle.config.ts     Drizzle ORM configuration
  nuxt.config.ts        Nuxt configuration
```

## Docker

Build and run the container image:

```bash
docker build -t clipboard .
docker run -d -p 3000:3000 -v clipboard-data:/app/.data clipboard
```

The `-v` flag mounts a named volume so the SQLite database survives container restarts. The image uses a multi-stage build with `node:20-slim`, runs as a non-root user, and produces a minimal layer containing only the Nitro server bundle.

## Self-Hosting

The application is designed to run as a single process with no external dependencies beyond Node.js. SQLite stores all data in a single file at `.data/clipboard.db`. Back up this file to preserve all snippets.

For production deployments behind a reverse proxy, ensure WebSocket upgrade headers are forwarded correctly so realtime scratchpads function as expected.

Environment variables:

| Variable | Default | Description |
|---|---|---|
| `NUXT_PUBLIC_BASE_URL` | `http://localhost:3000` | Public-facing URL used for share links and QR codes |
| `NITRO_PORT` | `3000` | Port the server listens on |

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for the full text.
