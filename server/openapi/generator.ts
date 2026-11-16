import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi'
import { registry } from './registry'
import { z } from 'zod'
import {
  CreatePasteSchema,
  CreatePasteResponseSchema,
  PasteQuerySchema,
  ListPastesResponseSchema,
  PasteDetailResponseSchema,
  PasswordRequiredResponseSchema,
  UpdatePasteSchema,
} from '../schemas/paste.schema'
import { ErrorResponseSchema } from '../schemas/common.schema'

// Register API Routes for OpenAPI docs
registry.registerPath({
  method: 'get',
  path: '/api/health',
  tags: ['Health'],
  summary: 'Health check and database ping',
  description:
    'Returns operational status of the service, uptime, and confirms active SQLite database connectivity.',
  responses: {
    200: {
      description: 'System is healthy and database is connected',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string().openapi({ example: 'OK' }),
            timestamp: z.string().openapi({ example: '2026-11-17T02:00:00.000Z' }),
            database: z.string().openapi({ example: 'connected' }),
          }),
        },
      },
    },
    500: {
      description: 'System unhealthy or database unreachable',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/pastes',
  tags: ['Pastes'],
  summary: 'List and search public snippets',
  description:
    'Retrieve a paginated list of public, active snippets. Automatically excludes expired pastes and burn-after-read pastes.',
  request: {
    query: PasteQuerySchema,
  },
  responses: {
    200: {
      description: 'List of snippets retrieved successfully',
      content: {
        'application/json': {
          schema: ListPastesResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid query parameters (page, limit, or query string)',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/pastes',
  tags: ['Pastes'],
  summary: 'Create a new code snippet',
  description:
    'Creates a single-file or multi-file snippet with configurable visibility, optional client-side AES-GCM encryption, password hashing via scrypt, custom slug, and time-to-live (TTL).',
  request: {
    body: {
      description: 'Paste payload with files, optional security configurations, and metadata',
      content: {
        'application/json': {
          schema: CreatePasteSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Paste created successfully',
      content: {
        'application/json': {
          schema: CreatePasteResponseSchema,
        },
      },
    },
    400: {
      description: 'Validation Error in request body',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    409: {
      description: 'Custom slug or ID already in use',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/pastes/{id}',
  tags: ['Pastes'],
  summary: 'Retrieve snippet by ID or custom Slug',
  description:
    'Fetches all files and metadata of a snippet. If password protected, requires the password via `x-paste-password` header or `?password=` query param. If configured as burn-after-read, the snippet is permanently deleted immediately following a successful read.',
  request: {
    params: z.object({
      id: z.string().openapi({
        description: 'Unique paste ID or custom slug',
        example: 'custom-slug',
      }),
    }),
    headers: z.object({
      'x-paste-password': z.string().optional().openapi({
        description: 'Plaintext password for password-protected snippets',
        example: 'mysecretpass',
      }),
    }),
  },
  responses: {
    200: {
      description: 'Snippet details with decrypted content or Password Required prompt',
      content: {
        'application/json': {
          schema: z.union([PasteDetailResponseSchema, PasswordRequiredResponseSchema]),
        },
      },
    },
    401: {
      description: 'Incorrect password provided',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'Paste not found or has expired',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'put',
  path: '/api/pastes/{id}',
  tags: ['Pastes'],
  summary: 'Update snippet (Creates a new revision)',
  description:
    'Replaces the file contents of an existing paste and automatically snapshots the previous state as a new entry in `paste_revisions`.',
  request: {
    params: z.object({
      id: z.string().openapi({
        description: 'Unique paste ID or custom slug',
        example: 'custom-slug',
      }),
    }),
    body: {
      description: 'Updated file list and optional title/description updates',
      content: {
        'application/json': {
          schema: UpdatePasteSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Paste updated successfully and new revision created',
      content: {
        'application/json': {
          schema: PasteDetailResponseSchema,
        },
      },
    },
    400: {
      description: 'Validation Error in updated files list',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'Paste not found to update',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/raw/{id}',
  tags: ['Raw'],
  summary: 'Fetch snippet raw plaintext (cURL / CLI friendly)',
  description:
    'Returns clean plaintext without HTML/JSON formatting, suitable for piping into bash/curl pipelines. Use `?file=<filename>` to target a single file in a multi-file snippet.',
  request: {
    params: z.object({
      id: z.string().openapi({
        description: 'Unique paste ID or custom slug',
        example: 'custom-slug',
      }),
    }),
    query: z.object({
      file: z.string().optional().openapi({
        description: 'Target specific filename or file ID from multi-file snippet',
        example: 'main.ts',
      }),
      password: z.string().optional().openapi({
        description: 'Password query parameter if header cannot be sent',
        example: 'secret123',
      }),
    }),
  },
  responses: {
    200: {
      description: 'Plaintext file content',
      content: {
        'text/plain': {
          schema: z.string().openapi({
            example: 'console.log("Hello from CLI");',
          }),
        },
      },
    },
    401: {
      description: 'Password required',
      content: {
        'text/plain': {
          schema: z.string().openapi({ example: 'Password required' }),
        },
      },
    },
    404: {
      description: 'Paste not found or expired',
      content: {
        'text/plain': {
          schema: z.string().openapi({ example: 'Paste not found' }),
        },
      },
    },
  },
})

export function generateOpenAPIDocument() {
  const generator = new OpenApiGeneratorV31(registry.definitions)
  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'Clipboard API',
      version: '1.0.0',
      description: `
### Overview
Welcome to the **Clipboard API** — a self-hosted, realtime code snippet hub and collaborative clipboard platform.

### Key Capabilities
- **Multi-File Pastes**: Attach multiple named files to a single snippet with individual syntax highlighting and positions.
- **Client-Side Zero-Knowledge Encryption**: Optional AES-GCM-256 encryption handled in browser with URL fragment keys.
- **Burn-After-Read & TTL**: Ephemeral pastes with automated purging and single-read destruction.
- **Revision History**: Track file changes and revisions across snippet updates.
- **CLI & cURL Integration**: Dedicated \`/raw/:id\` endpoint formatted for shell pipelines.
      `.trim(),
      contact: {
        name: 'Clipboard API Support',
        url: 'https://github.com/doksmith/clipboard',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: '/',
        description: 'Current Next.js Origin Server',
      },
    ],
    tags: [
      {
        name: 'Pastes',
        description: 'Core snippet creation, retrieval, updates, and public exploration',
      },
      {
        name: 'Raw',
        description: 'Plaintext endpoints designed for direct terminal and cURL consumption',
      },
      {
        name: 'Health',
        description: 'Application diagnostics and SQLite database connectivity monitoring',
      },
    ],
  })
}
