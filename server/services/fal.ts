import { fal } from '@fal-ai/client'

/**
 * Fal.ai generation request parameters.
 */
interface FalGenerateParams {
  prompt: string
  model: 'flux-pro' | 'flux-dev' | 'flux-schnell'
  imageSize: { width: number; height: number }
  guidanceScale: number
  steps: number
  seed?: number
  referenceImage?: string
}

/**
 * Fal.ai generation result.
 */
interface FalGenerateResult {
  images: string[]
  seed: number
}

/**
 * Model IDs for Fal.ai Flux models.
 */
const MODEL_IDS: Record<string, string> = {
  'flux-pro': 'fal-ai/flux-pro',
  'flux-dev': 'fal-ai/flux/dev',
  'flux-schnell': 'fal-ai/flux/schnell',
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
 * Generate images using Fal.ai Flux models.
 */
export async function generateWithFal(
  params: FalGenerateParams
): Promise<FalGenerateResult> {
  configureClient()

  const modelId = MODEL_IDS[params.model]
  if (!modelId) {
    throw new Error(`Unknown model: ${params.model}`)
  }

  try {
    // Build input parameters
    const input: Record<string, unknown> = {
      prompt: params.prompt,
      image_size: {
        width: params.imageSize.width,
        height: params.imageSize.height,
      },
      num_inference_steps: params.steps,
      guidance_scale: params.guidanceScale,
    }

    // Add seed if provided
    if (params.seed !== undefined) {
      input.seed = params.seed
    }

    // Add reference image if provided
    if (params.referenceImage) {
      input.image = `data:image/png;base64,${params.referenceImage}`
    }

    // Call Fal.ai API
    const result = await fal.subscribe(modelId, {
      input,
      logs: true,
    })

    // Extract images from result
    const images: string[] = []
    const resultData = result.data as {
      images?: Array<{ url?: string; base64?: string }>
      seed?: number
    }

    if (resultData.images) {
      for (const image of resultData.images) {
        if (image.base64) {
          images.push(image.base64)
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
      seed: resultData.seed ?? params.seed ?? Math.floor(Math.random() * 2147483647),
    }
  } catch (error) {
    console.error('Fal.ai generation error:', error)
    throw new Error(
      `Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
