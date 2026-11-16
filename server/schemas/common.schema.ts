import { z } from 'zod'
import { registry } from '../openapi/registry'

export const ErrorResponseSchema = registry.register(
  'ErrorResponse',
  z.object({
    success: z.literal(false).openapi({ example: false }),
    error: z.string().openapi({ example: 'Paste not found or has expired' }),
    statusCode: z.number().openapi({ example: 404 }),
    details: z.unknown().optional(),
  })
)

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
