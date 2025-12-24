import { createNodeClass, getWidgetValue, type ExecutableNode } from '../base/BaseNode'
import { NODE_TYPE_COLOURS } from '../../types/nodes'

/**
 * PromptNode - Text prompt input node.
 * Provides a multiline text area for entering prompts.
 * Supports template variables like {style}, {subject}.
 */
export const PromptNode = createNodeClass(
  {
    title: 'Prompt',
    category: 'input',
    colour: NODE_TYPE_COLOURS.prompt,
    outputs: [
      { name: 'prompt', type: 'string' },
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
    },
  },
  async (node: ExecutableNode) => {
    const text = getWidgetValue<string>(node, 'text') ?? ''

    // Set output
    node.setOutputData(0, text)

    return { prompt: text }
  }
)
