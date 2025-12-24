import { useGraphContext } from '../context/GraphContext'

/**
 * Hook for accessing and manipulating the graph state.
 * Provides a convenient interface for components to interact with the Litegraph instance.
 */
export function useGraph() {
  const context = useGraphContext()

  return {
    graph: context.graph,
    canvas: context.canvas,
    selectedNode: context.selectedNode,
    setGraph: context.setGraph,
    setCanvas: context.setCanvas,
    setSelectedNode: context.setSelectedNode,
    clearSelection: context.clearSelection,
  }
}
