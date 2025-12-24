import { createNodeClass, getWidgetValue, type ExecutableNode } from '../base/BaseNode'
import { NODE_TYPE_COLOURS } from '../../types/nodes'

/**
 * ImageSourceNode - Image upload/URL input node.
 * Allows users to upload images or provide image URLs.
 * Supports drag-and-drop and clipboard paste.
 */
export const ImageSourceNode = createNodeClass(
  {
    title: 'Image Source',
    category: 'input',
    colour: NODE_TYPE_COLOURS.imageSource,
    outputs: [
      { name: 'image', type: 'image' },
    ],
    widgets: [
      {
        name: 'url',
        type: 'text',
        defaultValue: '',
        options: {
          placeholder: 'Image URL or upload',
        },
      },
    ],
    properties: {
      url: '',
      base64: '',
    },
    // Enable image preview
    showImagePreview: true,
    imageProperty: 'url',
    previewHeight: 150,
  },
  async (node: ExecutableNode) => {
    const url = getWidgetValue<string>(node, 'url') ?? ''
    let base64 = node.properties?.base64 as string

    // If URL is provided but no base64, fetch and convert
    if (url && !base64) {
      try {
        const response = await fetch(url)
        const blob = await response.blob()
        base64 = await blobToBase64(blob)
      } catch (error) {
        console.error('Failed to fetch image:', error)
        throw new Error('Failed to load image from URL')
      }
    }

    // Set output
    node.setOutputData(0, base64)

    return { image: base64 }
  }
)

/**
 * Converts a Blob to base64 string.
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      // Remove data URL prefix if present
      const base64 = result.includes(',') ? result.split(',')[1] : result
      resolve(base64 ?? '')
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
