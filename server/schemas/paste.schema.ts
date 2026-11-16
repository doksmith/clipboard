import { z } from 'zod'
import { registry } from '../openapi/registry'

export const PasteFileInputSchema = registry.register(
  'PasteFileInput',
  z.object({
    filename: z.string().optional().default('snippet.txt').openapi({ example: 'main.ts' }),
    content: z.string().openapi({ example: 'console.log("Hello, World!");' }),
    syntax: z.string().optional().default('text').openapi({ example: 'typescript' }),
  })
)

export const CreatePasteSchema = registry.register(
  'CreatePasteInput',
  z.object({
    title: z.string().max(100).optional().openapi({ example: 'Example Snippet' }),
    slug: z.string().max(50).regex(/^[a-z0-9_-]*$/, 'Slug can only contain lowercase letters, numbers, hyphens, and underscores').optional().openapi({ example: 'custom-slug' }),
    description: z.string().max(500).optional().openapi({ example: 'A brief description of this snippet' }),
    visibility: z.enum(['public', 'unlisted', 'private']).default('unlisted').openapi({ example: 'public' }),
    expiresIn: z.union([
      z.enum(['10m', '1h', '1d', '7d', '30d', 'never']),
      z.number(),
    ]).optional().openapi({ example: '1d' }),
    burnAfterRead: z.boolean().default(false).openapi({ example: false }),
    isEncrypted: z.boolean().default(false).openapi({ example: false }),
    password: z.string().min(4).optional().openapi({ example: 'secret123' }),
    files: z.array(PasteFileInputSchema).optional().openapi({ description: 'Array of files in the snippet' }),
    content: z.string().optional().openapi({ description: 'Shortcut for single file content', example: 'console.log("Hello");' }),
    filename: z.string().optional().openapi({ example: 'index.js' }),
    syntax: z.string().optional().openapi({ example: 'javascript' }),
  })
)

export const UpdatePasteSchema = registry.register(
  'UpdatePasteInput',
  z.object({
    title: z.string().max(100).optional(),
    description: z.string().max(500).optional(),
    files: z.array(PasteFileInputSchema).min(1),
  })
)

export const PasteQuerySchema = registry.register(
  'PasteQuery',
  z.object({
    page: z.coerce.number().min(1).default(1).openapi({ example: 1 }),
    limit: z.coerce.number().min(1).max(50).default(20).openapi({ example: 20 }),
    q: z.string().optional().openapi({ example: 'typescript' }),
  })
)

export const PasteFileItemSchema = registry.register(
  'PasteFileItem',
  z.object({
    id: z.string().openapi({ example: 'fl_9a8b7c6d' }),
    filename: z.string().openapi({ example: 'main.ts' }),
    syntax: z.string().openapi({ example: 'typescript' }),
    content: z.string().optional().openapi({ example: 'console.log("Hello");' }),
    sizeBytes: z.number().openapi({ example: 24 }),
    position: z.number().optional().openapi({ example: 0 }),
    createdAt: z.string().or(z.date()).optional(),
  })
)

export const PasteDetailResponseSchema = registry.register(
  'PasteDetailResponse',
  z.object({
    id: z.string().openapi({ example: 'pst_12345678' }),
    title: z.string().nullable().openapi({ example: 'Example Snippet' }),
    slug: z.string().openapi({ example: 'custom-slug' }),
    description: z.string().nullable().openapi({ example: 'Description here' }),
    visibility: z.string().openapi({ example: 'public' }),
    isEncrypted: z.boolean().openapi({ example: false }),
    burnAfterRead: z.boolean().openapi({ example: false }),
    hasPassword: z.boolean().openapi({ example: false }),
    viewCount: z.number().openapi({ example: 5 }),
    expiresAt: z.string().or(z.date()).nullable().openapi({ example: null }),
    createdAt: z.string().or(z.date()).openapi({ example: '2026-11-17T02:00:00.000Z' }),
    updatedAt: z.string().or(z.date()).openapi({ example: '2026-11-17T02:00:00.000Z' }),
    files: z.array(PasteFileItemSchema),
    requiresPassword: z.literal(false).optional(),
  })
)

export const PasswordRequiredResponseSchema = registry.register(
  'PasswordRequiredResponse',
  z.object({
    requiresPassword: z.literal(true).openapi({ example: true }),
    id: z.string().openapi({ example: 'pst_12345678' }),
    slug: z.string().openapi({ example: 'custom-slug' }),
    title: z.string().nullable().openapi({ example: 'Protected Snippet' }),
    isEncrypted: z.boolean().openapi({ example: false }),
    createdAt: z.string().or(z.date()).openapi({ example: '2026-11-17T02:00:00.000Z' }),
  })
)

export const CreatePasteResponseSchema = registry.register(
  'CreatePasteResponse',
  z.object({
    success: z.boolean().openapi({ example: true }),
    paste: z.object({
      id: z.string().openapi({ example: 'pst_12345678' }),
      slug: z.string().openapi({ example: 'custom-slug' }),
      title: z.string().nullable().openapi({ example: 'Example Snippet' }),
      visibility: z.string().openapi({ example: 'public' }),
      isEncrypted: z.boolean().openapi({ example: false }),
      hasPassword: z.boolean().openapi({ example: false }),
      burnAfterRead: z.boolean().openapi({ example: false }),
      expiresAt: z.string().or(z.date()).nullable().openapi({ example: null }),
      filesCount: z.number().openapi({ example: 1 }),
      files: z.array(
        z.object({
          id: z.string(),
          filename: z.string(),
          syntax: z.string(),
          sizeBytes: z.number(),
        })
      ),
      url: z.string().openapi({ example: '/custom-slug' }),
      rawUrl: z.string().openapi({ example: '/raw/custom-slug' }),
    }),
  })
)

export const ListPastesResponseSchema = registry.register(
  'ListPastesResponse',
  z.object({
    page: z.number().openapi({ example: 1 }),
    limit: z.number().openapi({ example: 20 }),
    items: z.array(
      z.object({
        id: z.string(),
        title: z.string().nullable(),
        slug: z.string(),
        description: z.string().nullable(),
        isEncrypted: z.boolean(),
        hasPassword: z.boolean(),
        viewCount: z.number(),
        createdAt: z.string().or(z.date()),
        updatedAt: z.string().or(z.date()),
        filesCount: z.number(),
        files: z.array(
          z.object({
            id: z.string(),
            filename: z.string(),
            syntax: z.string(),
            sizeBytes: z.number(),
          })
        ),
      })
    ),
  })
)

export type CreatePasteInput = z.infer<typeof CreatePasteSchema>
export type UpdatePasteInput = z.infer<typeof UpdatePasteSchema>
export type PasteQuery = z.infer<typeof PasteQuerySchema>
export type PasteDetailResponse = z.infer<typeof PasteDetailResponseSchema>
export type PasswordRequiredResponse = z.infer<typeof PasswordRequiredResponseSchema>
export type CreatePasteResponse = z.infer<typeof CreatePasteResponseSchema>
export type ListPastesResponse = z.infer<typeof ListPastesResponseSchema>
