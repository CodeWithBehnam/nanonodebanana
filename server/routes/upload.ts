import { Elysia, t } from 'elysia'
import { v4 as uuidv4 } from 'uuid'
import { saveFile, getFileUrl } from '../services/storage'

/**
 * File upload routes.
 */
export const uploadRoutes = new Elysia({ prefix: '/api/upload' })
  /**
   * Upload an image file.
   * Accepts multipart form data with a 'file' field.
   */
  .post(
    '/image',
    async ({ body }) => {
      const file = body.file

      if (!file) {
        throw new Error('No file provided')
      }

      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}`)
      }

      // Generate unique filename
      const ext = file.name.split('.').pop() ?? 'png'
      const filename = `${uuidv4()}.${ext}`

      // Save file
      const filePath = await saveFile(file, filename)
      const url = getFileUrl(filename)

      // Convert to base64
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')

      return {
        url,
        base64,
        filename,
        path: filePath,
      }
    },
    {
      body: t.Object({
        file: t.File(),
      }),
    }
  )

  /**
   * Upload image from base64 data.
   */
  .post(
    '/base64',
    async ({ body }) => {
      const { base64, filename: customFilename } = body

      // Determine file extension from base64 header
      let ext = 'png'
      if (base64.startsWith('/9j/')) {
        ext = 'jpg'
      } else if (base64.startsWith('UklGR')) {
        ext = 'webp'
      }

      const filename = customFilename ?? `${uuidv4()}.${ext}`

      // Convert base64 to buffer
      const buffer = Buffer.from(base64, 'base64')

      // Create a File-like object
      const blob = new Blob([buffer], { type: `image/${ext}` })
      const file = new File([blob], filename, { type: `image/${ext}` })

      // Save file
      const filePath = await saveFile(file, filename)
      const url = getFileUrl(filename)

      return {
        url,
        filename,
        path: filePath,
      }
    },
    {
      body: t.Object({
        base64: t.String(),
        filename: t.Optional(t.String()),
      }),
    }
  )
