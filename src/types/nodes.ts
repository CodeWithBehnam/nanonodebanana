import type { LGraphNode, LGraph } from 'litegraph.js'

/**
 * Node categories for organisation and colour-coding.
 */
export type NodeCategory = 'input' | 'processing' | 'generation' | 'output'

/**
 * Execution status for a single node.
 */
export type ExecutionStatus = 'idle' | 'pending' | 'running' | 'completed' | 'error'

/**
 * Node execution status with additional metadata.
 */
export interface NodeExecutionStatus {
  status: ExecutionStatus
  progress?: number
  error?: string
  result?: unknown
  startTime?: number
  endTime?: number
}

/**
 * Context passed during node execution.
 */
export interface ExecutionContext {
  nodeId: string
  status: ExecutionStatus
  progress?: number
  result?: unknown
  error?: Error
}

/**
 * Execution engine interface for running workflows.
 */
export interface ExecutionEngine {
  execute(graph: LGraph): AsyncGenerator<ExecutionContext>
  cancel(): void
  getResults(): Map<string, unknown>
}

/**
 * Base properties all custom nodes share.
 */
export interface BaseNodeProperties {
  title: string
  category: NodeCategory
  colour: string
}

/**
 * Slot type definitions for node inputs and outputs.
 */
export type SlotType = 'string' | 'number' | 'image' | 'boolean'

/**
 * Input slot definition.
 */
export interface InputSlotDef {
  name: string
  type: SlotType
  optional?: boolean
}

/**
 * Output slot definition.
 */
export interface OutputSlotDef {
  name: string
  type: SlotType
}

/**
 * Widget types supported in nodes.
 */
export type WidgetType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'slider'
  | 'toggle'
  | 'combo'
  | 'button'
  | 'image'

/**
 * Widget definition for node properties.
 */
export interface WidgetDef {
  name: string
  type: WidgetType
  defaultValue?: unknown
  options?: Record<string, unknown>
}

/**
 * Extended LGraphNode with custom workflow properties.
 */
export interface WorkflowNode extends LGraphNode {
  category: NodeCategory
  executionStatus?: ExecutionStatus
  executionProgress?: number
  executionError?: Error
  executionResult?: unknown

  /**
   * Called when the node should execute its logic.
   * @returns Promise resolving to the node's output values
   */
  onExecute?(): Promise<Record<string, unknown>>
}

/**
 * Workflow data structure for saving/loading.
 */
export interface WorkflowData {
  id: string
  name: string
  description?: string
  graph: object // Serialised LGraph data
  createdAt: string
  updatedAt: string
  thumbnail?: string
}

/**
 * API request types for image generation.
 */
export interface GeminiRequest {
  prompt: string
  negativePrompt?: string
  referenceImage?: string
  model: 'imagen-3' | 'gemini-2.0-flash'
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
  numberOfImages: number
  seed?: number
}

export interface GeminiResponse {
  images: string[]
  executionTime: number
}

export interface FalRequest {
  prompt: string
  model: 'flux-pro' | 'flux-dev' | 'flux-schnell'
  imageSize: { width: number; height: number }
  guidanceScale: number
  steps: number
  seed?: number
  referenceImage?: string
}

export interface FalResponse {
  images: string[]
  seed: number
  executionTime: number
}

/**
 * Node colour definitions by category.
 */
export const NODE_COLOURS: Record<NodeCategory, string> = {
  input: '#2563eb',
  processing: '#0891b2',
  generation: '#7c3aed',
  output: '#059669',
}

/**
 * Individual node type colours.
 */
export const NODE_TYPE_COLOURS = {
  // Input nodes
  prompt: '#2563eb',
  imageSource: '#16a34a',
  seed: '#ca8a04',
  number: '#2563eb',

  // Processing nodes
  combinePrompts: '#0891b2',
  stylePreset: '#db2777',
  negativePrompt: '#dc2626',
  imageResize: '#0891b2',

  // Generation nodes
  gemini: '#7c3aed',
  falFlux: '#ea580c',
  falVideo: '#ea580c',

  // Output nodes
  imageOutput: '#059669',
  saveImage: '#475569',
  gallery: '#059669',
} as const
