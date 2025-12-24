import type { LGraph, LGraphNode } from 'litegraph.js'
import type { ExecutionContext, ExecutionEngine } from '../types/nodes'

/**
 * Topologically sorts nodes in the graph for execution order.
 * Ensures dependencies are executed before dependent nodes.
 */
function topologicalSort(graph: LGraph): LGraphNode[] {
  const nodes = graph._nodes || []
  const visited = new Set<number>()
  const result: LGraphNode[] = []

  // Build adjacency list from connections
  const dependencies = new Map<number, Set<number>>()

  for (const node of nodes) {
    dependencies.set(node.id, new Set())
  }

  // Find dependencies based on input connections
  for (const node of nodes) {
    if (!node.inputs) continue

    for (const input of node.inputs) {
      if (input.link != null) {
        const linkInfo = graph.links[input.link]
        if (linkInfo) {
          dependencies.get(node.id)?.add(linkInfo.origin_id)
        }
      }
    }
  }

  // Kahn's algorithm for topological sort
  const inDegree = new Map<number, number>()
  for (const node of nodes) {
    inDegree.set(node.id, dependencies.get(node.id)?.size || 0)
  }

  const queue: LGraphNode[] = nodes.filter(n => inDegree.get(n.id) === 0)

  while (queue.length > 0) {
    const node = queue.shift()!
    result.push(node)
    visited.add(node.id)

    // Find nodes that depend on this one
    for (const otherNode of nodes) {
      if (dependencies.get(otherNode.id)?.has(node.id)) {
        const newDegree = (inDegree.get(otherNode.id) || 1) - 1
        inDegree.set(otherNode.id, newDegree)
        if (newDegree === 0 && !visited.has(otherNode.id)) {
          queue.push(otherNode)
        }
      }
    }
  }

  return result
}

/**
 * Gets input values for a node from connected output nodes.
 */
function getNodeInputs(
  node: LGraphNode,
  graph: LGraph,
  results: Map<string, Record<string, unknown>>
): Record<string, unknown> {
  const inputs: Record<string, unknown> = {}

  if (!node.inputs) return inputs

  for (const input of node.inputs) {
    if (input.link == null) continue

    const linkInfo = graph.links[input.link]
    if (!linkInfo) continue

    const sourceNodeId = linkInfo.origin_id
    const sourceSlot = linkInfo.origin_slot
    const sourceResults = results.get(String(sourceNodeId))

    if (sourceResults) {
      const sourceNode = graph.getNodeById(sourceNodeId)
      if (sourceNode?.outputs?.[sourceSlot]) {
        const outputName = sourceNode.outputs[sourceSlot].name
        inputs[input.name] = sourceResults[outputName]
      }
    }
  }

  return inputs
}

/**
 * Creates a graph execution engine.
 * Executes nodes in topological order, handling async operations.
 */
export function createExecutionEngine(): ExecutionEngine {
  let cancelled = false
  const results = new Map<string, unknown>()

  async function* execute(graph: LGraph): AsyncGenerator<ExecutionContext> {
    cancelled = false
    results.clear()

    const sortedNodes = topologicalSort(graph)
    const nodeResults = new Map<string, Record<string, unknown>>()

    for (let i = 0; i < sortedNodes.length; i++) {
      if (cancelled) break

      const node = sortedNodes[i]!
      const nodeId = String(node.id)

      // Emit running status
      yield {
        nodeId,
        status: 'running',
        progress: (i / sortedNodes.length) * 100,
      }

      try {
        // Get input values from connected nodes
        const inputs = getNodeInputs(node, graph, nodeResults)

        // Execute the node if it has an onExecute method
        let nodeOutput: Record<string, unknown> = {}

        if ('onExecute' in node && typeof node.onExecute === 'function') {
          // Set inputs on the node
          for (const [key, value] of Object.entries(inputs)) {
            node.setProperty(key, value)
          }

          // Execute and get output
          const executeResult = await (node as unknown as { onExecute: () => Promise<Record<string, unknown>> }).onExecute()
          nodeOutput = executeResult || {}
        }

        // Store results
        nodeResults.set(nodeId, nodeOutput)
        results.set(nodeId, nodeOutput)

        // Emit completed status
        yield {
          nodeId,
          status: 'completed',
          progress: ((i + 1) / sortedNodes.length) * 100,
          result: nodeOutput,
        }
      } catch (error) {
        // Emit error status
        yield {
          nodeId,
          status: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        }
      }
    }
  }

  function cancel() {
    cancelled = true
  }

  function getResults() {
    return new Map(results)
  }

  return {
    execute,
    cancel,
    getResults,
  }
}
