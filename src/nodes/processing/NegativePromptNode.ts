import { createNodeClass, getWidgetValue, type ExecutableNode } from '../base/BaseNode'
import { NODE_TYPE_COLOURS } from '../../types/nodes'

/**
 * Common negative prompt tokens.
 */
const COMMON_NEGATIVES: Record<string, string> = {
  'Blurry': 'blurry, out of focus',
  'Low Quality': 'low quality, low resolution, jpeg artifacts',
  'Watermark': 'watermark, signature, text',
  'Deformed': 'deformed, distorted, disfigured',
  'Bad Anatomy': 'bad anatomy, extra limbs, missing limbs',
  'NSFW': 'nsfw, nude, explicit',
}

/**
 * NegativePromptNode - Negative prompt input node.
 * Provides quick-add buttons for common negative prompt tokens.
 */
export const NegativePromptNode = createNodeClass(
  {
    title: 'Negative Prompt',
    category: 'processing',
    colour: NODE_TYPE_COLOURS.negativePrompt,
    outputs: [
      { name: 'negative', type: 'string' },
    ],
    widgets: [
      {
        name: 'text',
        type: 'textarea',
        defaultValue: '',
        options: {
          multiline: true,
        },
      },
    ],
    properties: {
      text: '',
      quickAdds: Object.keys(COMMON_NEGATIVES),
    },
  },
  async (node: ExecutableNode) => {
    const text = getWidgetValue<string>(node, 'text') ?? ''

    // Set output
    node.setOutputData(0, text)

    return { negative: text }
  }
)

// Export for use in UI
export { COMMON_NEGATIVES }
