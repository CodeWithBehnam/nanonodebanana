import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { LGraph, LGraphNode, LGraphCanvas } from 'litegraph.js'

/**
 * Graph state interface for managing the Litegraph instance.
 */
interface GraphState {
  graph: LGraph | null
  canvas: LGraphCanvas | null
  selectedNode: LGraphNode | null
  setGraph: (graph: LGraph | null) => void
  setCanvas: (canvas: LGraphCanvas | null) => void
  setSelectedNode: (node: LGraphNode | null) => void
  clearSelection: () => void
}

const GraphContext = createContext<GraphState | undefined>(undefined)

interface GraphProviderProps {
  children: ReactNode
}

/**
 * Provider component for graph state management.
 * Wraps the application to provide access to the Litegraph instance.
 */
export function GraphProvider({ children }: GraphProviderProps) {
  const [graph, setGraph] = useState<LGraph | null>(null)
  const [canvas, setCanvas] = useState<LGraphCanvas | null>(null)
  const [selectedNode, setSelectedNode] = useState<LGraphNode | null>(null)

  const clearSelection = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const value: GraphState = {
    graph,
    canvas,
    selectedNode,
    setGraph,
    setCanvas,
    setSelectedNode,
    clearSelection,
  }

  return (
    <GraphContext.Provider value={value}>
      {children}
    </GraphContext.Provider>
  )
}

/**
 * Hook to access graph state from any component.
 * Must be used within a GraphProvider.
 */
export function useGraphContext(): GraphState {
  const context = useContext(GraphContext)

  if (context === undefined) {
    throw new Error('useGraphContext must be used within a GraphProvider')
  }

  return context
}
