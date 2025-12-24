import type { SerializedLGraph } from 'litegraph.js'

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: 'basic' | 'advanced' | 'video'
  thumbnail?: string
  graph: SerializedLGraph
}

/**
 * Predefined workflow templates for common use cases.
 * These can be loaded to quickly start a new workflow.
 */
export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'simple-text-to-image',
    name: 'Simple Text to Image',
    description: 'Basic workflow: prompt → image generation → output',
    category: 'basic',
    graph: {
      last_node_id: 3,
      last_link_id: 2,
      nodes: [
        {
          id: 1,
          type: 'input/prompt',
          pos: [100, 200],
          size: [300, 120],
          flags: {},
          order: 0,
          mode: 0,
          properties: {
            text: 'A beautiful sunset over mountains, digital art, vibrant colors',
          },
          widgets_values: ['A beautiful sunset over mountains, digital art, vibrant colors'],
        },
        {
          id: 2,
          type: 'generation/fal-flux',
          pos: [450, 200],
          size: [200, 150],
          flags: {},
          order: 1,
          mode: 0,
          inputs: [{ name: 'prompt', type: 'string', link: 1 }],
          outputs: [{ name: 'image', type: 'image', links: [2] }],
          properties: {
            width: 1024,
            height: 1024,
            steps: 28,
          },
        },
        {
          id: 3,
          type: 'output/image',
          pos: [700, 200],
          size: [200, 200],
          flags: {},
          order: 2,
          mode: 0,
          inputs: [{ name: 'image', type: 'image', link: 2 }],
          properties: {},
        },
      ],
      links: [
        [1, 1, 0, 2, 0, 'string'],
        [2, 2, 0, 3, 0, 'image'],
      ],
      groups: [],
      config: {},
      extra: {},
      version: 0.4,
    },
  },
  {
    id: 'styled-generation',
    name: 'Styled Image Generation',
    description: 'Workflow with style presets and negative prompts',
    category: 'basic',
    graph: {
      last_node_id: 6,
      last_link_id: 5,
      nodes: [
        {
          id: 1,
          type: 'input/prompt',
          pos: [100, 150],
          size: [300, 120],
          flags: {},
          order: 0,
          mode: 0,
          properties: {
            text: 'A futuristic city with flying cars',
          },
        },
        {
          id: 2,
          type: 'processing/style',
          pos: [100, 300],
          size: [200, 80],
          flags: {},
          order: 1,
          mode: 0,
          properties: {
            style: 'digital-art',
          },
        },
        {
          id: 3,
          type: 'processing/combine',
          pos: [400, 200],
          size: [200, 100],
          flags: {},
          order: 2,
          mode: 0,
          inputs: [
            { name: 'prompt1', type: 'string', link: 1 },
            { name: 'prompt2', type: 'string', link: 2 },
          ],
          outputs: [{ name: 'combined', type: 'string', links: [3] }],
          properties: {
            separator: ', ',
          },
        },
        {
          id: 4,
          type: 'processing/negative',
          pos: [400, 350],
          size: [200, 80],
          flags: {},
          order: 3,
          mode: 0,
          outputs: [{ name: 'negative', type: 'string', links: [4] }],
          properties: {
            preset: 'quality',
          },
        },
        {
          id: 5,
          type: 'generation/fal-flux',
          pos: [650, 250],
          size: [200, 150],
          flags: {},
          order: 4,
          mode: 0,
          inputs: [
            { name: 'prompt', type: 'string', link: 3 },
            { name: 'negative_prompt', type: 'string', link: 4 },
          ],
          outputs: [{ name: 'image', type: 'image', links: [5] }],
          properties: {
            width: 1024,
            height: 1024,
            steps: 28,
          },
        },
        {
          id: 6,
          type: 'output/image',
          pos: [900, 250],
          size: [200, 200],
          flags: {},
          order: 5,
          mode: 0,
          inputs: [{ name: 'image', type: 'image', link: 5 }],
          properties: {},
        },
      ],
      links: [
        [1, 1, 0, 3, 0, 'string'],
        [2, 2, 0, 3, 1, 'string'],
        [3, 3, 0, 5, 0, 'string'],
        [4, 4, 0, 5, 1, 'string'],
        [5, 5, 0, 6, 0, 'image'],
      ],
      groups: [],
      config: {},
      extra: {},
      version: 0.4,
    },
  },
  {
    id: 'image-to-image',
    name: 'Image to Image',
    description: 'Transform an existing image with a prompt',
    category: 'advanced',
    graph: {
      last_node_id: 4,
      last_link_id: 3,
      nodes: [
        {
          id: 1,
          type: 'input/image',
          pos: [100, 150],
          size: [200, 150],
          flags: {},
          order: 0,
          mode: 0,
          outputs: [{ name: 'image', type: 'image', links: [1] }],
          properties: {
            source: 'upload',
            url: '',
          },
        },
        {
          id: 2,
          type: 'input/prompt',
          pos: [100, 350],
          size: [300, 120],
          flags: {},
          order: 1,
          mode: 0,
          outputs: [{ name: 'prompt', type: 'string', links: [2] }],
          properties: {
            text: 'Transform into anime style, vibrant colors, detailed',
          },
        },
        {
          id: 3,
          type: 'generation/gemini',
          pos: [450, 250],
          size: [200, 150],
          flags: {},
          order: 2,
          mode: 0,
          inputs: [
            { name: 'image', type: 'image', link: 1 },
            { name: 'prompt', type: 'string', link: 2 },
          ],
          outputs: [{ name: 'image', type: 'image', links: [3] }],
          properties: {
            model: 'gemini-2.0-flash-exp',
          },
        },
        {
          id: 4,
          type: 'output/image',
          pos: [700, 250],
          size: [200, 200],
          flags: {},
          order: 3,
          mode: 0,
          inputs: [{ name: 'image', type: 'image', link: 3 }],
          properties: {},
        },
      ],
      links: [
        [1, 1, 0, 3, 0, 'image'],
        [2, 2, 0, 3, 1, 'string'],
        [3, 3, 0, 4, 0, 'image'],
      ],
      groups: [],
      config: {},
      extra: {},
      version: 0.4,
    },
  },
  {
    id: 'video-generation',
    name: 'Text to Video',
    description: 'Generate a video from a text prompt',
    category: 'video',
    graph: {
      last_node_id: 3,
      last_link_id: 2,
      nodes: [
        {
          id: 1,
          type: 'input/prompt',
          pos: [100, 200],
          size: [300, 120],
          flags: {},
          order: 0,
          mode: 0,
          properties: {
            text: 'A cat playing with a ball of yarn, cinematic lighting',
          },
        },
        {
          id: 2,
          type: 'generation/fal-video',
          pos: [450, 200],
          size: [200, 150],
          flags: {},
          order: 1,
          mode: 0,
          inputs: [{ name: 'prompt', type: 'string', link: 1 }],
          outputs: [{ name: 'video', type: 'video', links: [2] }],
          properties: {
            duration: 5,
            fps: 24,
          },
        },
        {
          id: 3,
          type: 'output/gallery',
          pos: [700, 200],
          size: [200, 200],
          flags: {},
          order: 2,
          mode: 0,
          inputs: [{ name: 'media', type: 'any', link: 2 }],
          properties: {},
        },
      ],
      links: [
        [1, 1, 0, 2, 0, 'string'],
        [2, 2, 0, 3, 0, 'video'],
      ],
      groups: [],
      config: {},
      extra: {},
      version: 0.4,
    },
  },
  {
    id: 'batch-generation',
    name: 'Batch Generation',
    description: 'Generate multiple variations with different seeds',
    category: 'advanced',
    graph: {
      last_node_id: 5,
      last_link_id: 4,
      nodes: [
        {
          id: 1,
          type: 'input/prompt',
          pos: [100, 200],
          size: [300, 120],
          flags: {},
          order: 0,
          mode: 0,
          properties: {
            text: 'A magical forest with glowing mushrooms',
          },
        },
        {
          id: 2,
          type: 'input/seed',
          pos: [100, 350],
          size: [200, 80],
          flags: {},
          order: 1,
          mode: 0,
          outputs: [{ name: 'seed', type: 'number', links: [2] }],
          properties: {
            seed: -1,
            batchCount: 4,
          },
        },
        {
          id: 3,
          type: 'generation/fal-flux',
          pos: [450, 250],
          size: [200, 150],
          flags: {},
          order: 2,
          mode: 0,
          inputs: [
            { name: 'prompt', type: 'string', link: 1 },
            { name: 'seed', type: 'number', link: 2 },
          ],
          outputs: [{ name: 'image', type: 'image', links: [3] }],
          properties: {
            width: 1024,
            height: 1024,
            steps: 28,
          },
        },
        {
          id: 4,
          type: 'output/gallery',
          pos: [700, 250],
          size: [200, 200],
          flags: {},
          order: 3,
          mode: 0,
          inputs: [{ name: 'images', type: 'image', link: 3 }],
          properties: {
            columns: 2,
          },
        },
        {
          id: 5,
          type: 'output/save',
          pos: [700, 500],
          size: [200, 80],
          flags: {},
          order: 4,
          mode: 0,
          inputs: [{ name: 'image', type: 'image', link: 4 }],
          properties: {
            prefix: 'batch_',
            format: 'png',
          },
        },
      ],
      links: [
        [1, 1, 0, 3, 0, 'string'],
        [2, 2, 0, 3, 1, 'number'],
        [3, 3, 0, 4, 0, 'image'],
        [4, 3, 0, 5, 0, 'image'],
      ],
      groups: [],
      config: {},
      extra: {},
      version: 0.4,
    },
  },
]

/**
 * Get templates by category.
 */
export function getTemplatesByCategory(category: WorkflowTemplate['category']): WorkflowTemplate[] {
  return workflowTemplates.filter(t => t.category === category)
}

/**
 * Get a template by ID.
 */
export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return workflowTemplates.find(t => t.id === id)
}

/**
 * Get all template categories.
 */
export function getTemplateCategories(): WorkflowTemplate['category'][] {
  return [...new Set(workflowTemplates.map(t => t.category))]
}
