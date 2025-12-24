import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import type { ExecutionContext as NodeExecutionContext } from '../types/nodes'

/**
 * Execution state interface for managing workflow execution.
 */
interface ExecutionState {
  isExecuting: boolean
  currentNodeId: string | null
  executionResults: Map<string, unknown>
  executionErrors: Map<string, Error>
  progress: number
  execute: () => Promise<void>
  cancel: () => void
  getNodeStatus: (nodeId: string) => NodeExecutionContext | undefined
}

const ExecutionContext = createContext<ExecutionState | undefined>(undefined)

interface ExecutionProviderProps {
  children: ReactNode
}

/**
 * Provider component for execution state management.
 * Handles workflow execution, cancellation, and progress tracking.
 */
export function ExecutionProvider({ children }: ExecutionProviderProps) {
  const [isExecuting, setIsExecuting] = useState(false)
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)
  const [executionResults] = useState<Map<string, unknown>>(new Map())
  const [executionErrors] = useState<Map<string, Error>>(new Map())
  const [progress, setProgress] = useState(0)
  const [nodeStatuses, setNodeStatuses] = useState<Map<string, NodeExecutionContext>>(new Map())

  const cancelRef = useRef(false)

  const execute = useCallback(async () => {
    cancelRef.current = false
    setIsExecuting(true)
    setProgress(0)
    executionResults.clear()
    executionErrors.clear()
    setNodeStatuses(new Map())

    try {
      // TODO: Implement actual execution engine integration
      // This will be replaced with the graph executor
      console.log('Executing workflow...')

      // Simulate execution progress
      for (let i = 0; i <= 100; i += 10) {
        if (cancelRef.current) {
          console.log('Execution cancelled')
          break
        }
        setProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.error('Execution failed:', error)
    } finally {
      setIsExecuting(false)
      setCurrentNodeId(null)
    }
  }, [executionResults, executionErrors])

  const cancel = useCallback(() => {
    cancelRef.current = true
    setIsExecuting(false)
    setCurrentNodeId(null)
  }, [])

  const getNodeStatus = useCallback(
    (nodeId: string): NodeExecutionContext | undefined => {
      return nodeStatuses.get(nodeId)
    },
    [nodeStatuses]
  )

  const value: ExecutionState = {
    isExecuting,
    currentNodeId,
    executionResults,
    executionErrors,
    progress,
    execute,
    cancel,
    getNodeStatus,
  }

  return (
    <ExecutionContext.Provider value={value}>
      {children}
    </ExecutionContext.Provider>
  )
}

/**
 * Hook to access execution state from any component.
 * Must be used within an ExecutionProvider.
 */
export function useExecutionContext(): ExecutionState {
  const context = useContext(ExecutionContext)

  if (context === undefined) {
    throw new Error('useExecutionContext must be used within an ExecutionProvider')
  }

  return context
}
