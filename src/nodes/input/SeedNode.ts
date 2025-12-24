import { createNodeClass, getWidgetValue, type ExecutableNode } from '../base/BaseNode'
import { NODE_TYPE_COLOURS } from '../../types/nodes'

/**
 * SeedNode - Random seed generator node.
 * Provides a seed value for reproducible image generation.
 * Can be locked to maintain the same seed across executions.
 */
export const SeedNode = createNodeClass(
  {
    title: 'Seed',
    category: 'input',
    colour: NODE_TYPE_COLOURS.seed,
    outputs: [
      { name: 'seed', type: 'number' },
    ],
    widgets: [
      {
        name: 'seed',
        type: 'number',
        defaultValue: 0,
        options: {
          min: 0,
          max: 2147483647,
          step: 1,
        },
      },
      {
        name: 'locked',
        type: 'toggle',
        defaultValue: false,
      },
    ],
    properties: {
      seed: 0,
      locked: false,
    },
  },
  async (node: ExecutableNode) => {
    const locked = getWidgetValue<boolean>(node, 'locked') ?? false
    let seed = getWidgetValue<number>(node, 'seed') ?? 0

    // Generate new random seed if not locked
    if (!locked) {
      seed = Math.floor(Math.random() * 2147483647)
      // Update widget value
      const seedWidget = node.widgets?.find(w => w.name === 'seed')
      if (seedWidget) {
        seedWidget.value = seed
      }
    }

    // Set output
    node.setOutputData(0, seed)

    return { seed }
  }
)
