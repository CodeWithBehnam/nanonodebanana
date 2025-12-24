import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Gemini generation request parameters.
 */
interface GeminiGenerateParams {
  prompt: string
  negativePrompt?: string
  referenceImage?: string
  model: 'imagen-3' | 'gemini-2.0-flash'
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
  numberOfImages: number
  seed?: number
}

/**
 * Initialise Google Generative AI client.
 */
function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set')
  }

  return new GoogleGenerativeAI(apiKey)
}

/**
 * Generate images using Google Gemini.
 *
 * Note: This implementation uses the Gemini API for image generation.
 * The actual image generation capabilities depend on the model and API version.
 */
export async function generateWithGemini(
  params: GeminiGenerateParams
): Promise<string[]> {
  const client = getClient()

  // Build the prompt with negative prompt if provided
  let fullPrompt = params.prompt
  if (params.negativePrompt) {
    fullPrompt += `\n\nAvoid: ${params.negativePrompt}`
  }

  // Add aspect ratio to prompt
  fullPrompt += `\n\nAspect ratio: ${params.aspectRatio}`

  // Get the generative model
  const model = client.getGenerativeModel({
    model: params.model === 'imagen-3' ? 'imagen-3.0-generate-001' : 'gemini-2.0-flash-exp',
  })

  const images: string[] = []

  try {
    // Generate images
    for (let i = 0; i < params.numberOfImages; i++) {
      let result

      if (params.referenceImage) {
        // With reference image
        result = await model.generateContent([
          fullPrompt,
          {
            inlineData: {
              mimeType: 'image/png',
              data: params.referenceImage,
            },
          },
        ])
      } else {
        // Text-only prompt
        result = await model.generateContent(fullPrompt)
      }

      // Extract image from response
      const response = result.response
      const parts = response.candidates?.[0]?.content?.parts

      if (parts) {
        for (const part of parts) {
          if ('inlineData' in part && part.inlineData?.data) {
            images.push(part.inlineData.data)
          }
        }
      }
    }

    if (images.length === 0) {
      throw new Error('No images generated')
    }

    return images
  } catch (error) {
    console.error('Gemini generation error:', error)
    throw new Error(
      `Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
