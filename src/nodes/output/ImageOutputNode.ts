import { createNodeClass, getInputValue, type ExecutableNode } from '../base/BaseNode'
import { NODE_TYPE_COLOURS } from '../../types/nodes'

/**
 * ImageOutputNode - Displays generated images.
 * Provides a preview of the generated image with options to view fullscreen,
 * copy to clipboard, or save.
 */
export const ImageOutputNode = createNodeClass(
  {
    title: 'Image Output',
    category: 'output',
    colour: NODE_TYPE_COLOURS.imageOutput,
    inputs: [
      { name: 'image', type: 'image' },
    ],
    outputs: [],
    properties: {
      imageData: '',
    },
    // Enable image preview - shows output result
    showImagePreview: true,
    imageProperty: 'imageData',
    previewHeight: 200,
  },
  async (node: ExecutableNode) => {
    const image = getInputValue<string>(node, 'image')

    if (!image) {
      throw new Error('No image input')
    }

    // Store image for display
    node.setProperty('imageData', image)

    // Trigger visual update
    node.setDirtyCanvas(true, true)

    return { displayed: true }
  }
)
