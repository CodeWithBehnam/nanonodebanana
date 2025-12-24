import { fal } from '@fal-ai/client'

/**
 * Nano Banana Edit request parameters.
 */
interface NanoBananaEditParams {
  prompt: string
  imageUrl: string
  numImages: number
  aspectRatio: string
  outputFormat: 'jpeg' | 'png' | 'webp'
}

/**
 * Nano Banana Edit result.
 */
interface NanoBananaEditResult {
  images: string[]
  description?: string
}

/**
 * Configure Fal.ai client.
 */
function configureClient(): void {
  const apiKey = process.env.FAL_KEY

  if (!apiKey) {
    throw new Error('FAL_KEY environment variable is not set')
  }

  fal.config({
    credentials: apiKey,
  })
}

/**
 * Convert base64 image to data URI if needed.
 */
function toImageUrl(image: string): string {
  // Already a URL
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
    return image
  }

  // Raw base64 - detect format and convert to data URI
  if (image.startsWith('/9j/')) {
    return `data:image/jpeg;base64,${image}`
  } else if (image.startsWith('iVBORw')) {
    return `data:image/png;base64,${image}`
  } else if (image.startsWith('R0lGOD')) {
    return `data:image/gif;base64,${image}`
  } else if (image.startsWith('UklGR')) {
    return `data:image/webp;base64,${image}`
  }

  // Default to PNG
  return `data:image/png;base64,${image}`
}

/**
 * Edit images using Nano Banana Edit model.
 */
export async function editWithNanoBanana(
  params: NanoBananaEditParams
): Promise<NanoBananaEditResult> {
  configureClient()

  try {
    // Convert image to URL format
    const imageUrl = toImageUrl(params.imageUrl)

    // Call Fal.ai API for nano-banana/edit
    const result = await fal.subscribe('fal-ai/nano-banana/edit', {
      input: {
        prompt: params.prompt,
        image_urls: [imageUrl],
        num_images: params.numImages,
        aspect_ratio: params.aspectRatio as 'auto' | '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '21:9' | '3:2' | '5:4' | '4:5' | '2:3',
        output_format: params.outputFormat,
        sync_mode: true, // Return as data URI for easier handling
      },
      logs: true,
    })

    // Extract images from result
    const images: string[] = []
    const resultData = result.data as {
      images?: Array<{ url?: string; file_data?: string }>
      description?: string
    }

    if (resultData.images) {
      for (const image of resultData.images) {
        if (image.file_data) {
          // Extract base64 from data URI if present
          const base64Match = image.file_data.match(/^data:image\/\w+;base64,(.+)$/)
          if (base64Match && base64Match[1]) {
            images.push(base64Match[1])
          } else {
            images.push(image.file_data)
          }
        } else if (image.url) {
          // Fetch image and convert to base64
          const response = await fetch(image.url)
          const buffer = await response.arrayBuffer()
          const base64 = Buffer.from(buffer).toString('base64')
          images.push(base64)
        }
      }
    }

    if (images.length === 0) {
      throw new Error('No images generated')
    }

    return {
      images,
      description: resultData.description,
    }
  } catch (error) {
    console.error('Nano Banana Edit error:', error)
    throw new Error(
      `Failed to edit image: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
