import { useMemo } from 'react'
import type { NodeExecutionStatus } from '../types/nodes'

interface ProgressIndicatorProps {
  nodeStatuses: Record<number, NodeExecutionStatus>
  totalNodes: number
  currentNodeId?: number
  isExecuting: boolean
}

/**
 * Progress indicator showing workflow execution status.
 * Displays overall progress, current node, and execution time.
 */
export function ProgressIndicator({
  nodeStatuses,
  totalNodes,
  currentNodeId,
  isExecuting,
}: ProgressIndicatorProps) {
  const { completed, failed, pending, percentage } = useMemo(() => {
    const statuses = Object.values(nodeStatuses)
    const completed = statuses.filter(s => s.status === 'completed').length
    const failed = statuses.filter(s => s.status === 'error').length
    const pending = totalNodes - completed - failed
    const percentage = totalNodes > 0 ? Math.round((completed / totalNodes) * 100) : 0

    return { completed, failed, pending, percentage }
  }, [nodeStatuses, totalNodes])

  if (!isExecuting && Object.keys(nodeStatuses).length === 0) {
    return null
  }

  const currentStatus = currentNodeId ? nodeStatuses[currentNodeId] : null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <div className="rounded-lg bg-zinc-800/95 border border-zinc-700 shadow-xl backdrop-blur-sm p-4 min-w-[300px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isExecuting ? (
              <>
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-sm font-medium text-zinc-200">Executing workflow...</span>
              </>
            ) : failed > 0 ? (
              <>
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-red-400">Execution failed</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-400">Completed</span>
              </>
            )}
          </div>
          <span className="text-sm text-zinc-400">{percentage}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-zinc-700 overflow-hidden mb-3">
          <div
            className={`h-full transition-all duration-300 ${
              failed > 0
                ? 'bg-gradient-to-r from-green-500 to-red-500'
                : 'bg-gradient-to-r from-blue-500 to-green-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-zinc-400">Done: {completed}</span>
          </div>
          {failed > 0 && (
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-zinc-400">Failed: {failed}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-zinc-500" />
            <span className="text-zinc-400">Pending: {pending}</span>
          </div>
        </div>

        {/* Current node */}
        {currentStatus && isExecuting && (
          <div className="mt-3 pt-3 border-t border-zinc-700">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
              <span className="text-xs text-zinc-400">
                Processing: Node #{currentNodeId}
              </span>
            </div>
          </div>
        )}

        {/* Error message */}
        {currentStatus?.error && (
          <div className="mt-3 pt-3 border-t border-zinc-700">
            <div className="rounded-md bg-red-500/10 p-2 text-xs text-red-400">
              {currentStatus.error}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface NodeStatusBadgeProps {
  status: NodeExecutionStatus['status']
  className?: string
}

/**
 * Small badge showing node execution status.
 * Can be used in node headers or lists.
 */
export function NodeStatusBadge({ status, className = '' }: NodeStatusBadgeProps) {
  const config = {
    idle: { color: 'bg-zinc-500', label: 'Idle' },
    pending: { color: 'bg-yellow-500', label: 'Pending' },
    running: { color: 'bg-blue-500 animate-pulse', label: 'Running' },
    completed: { color: 'bg-green-500', label: 'Done' },
    error: { color: 'bg-red-500', label: 'Error' },
  }[status]

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className={`h-2 w-2 rounded-full ${config.color}`} />
      <span className="text-xs text-zinc-400">{config.label}</span>
    </div>
  )
}

interface ExecutionTimerProps {
  startTime: number | null
  endTime: number | null
  isRunning: boolean
}

/**
 * Timer showing execution duration.
 */
export function ExecutionTimer({ startTime, endTime, isRunning }: ExecutionTimerProps) {
  const duration = useMemo(() => {
    if (!startTime) return 0
    const end = endTime || (isRunning ? Date.now() : startTime)
    return Math.round((end - startTime) / 100) / 10
  }, [startTime, endTime, isRunning])

  if (!startTime) return null

  return (
    <span className="text-xs text-zinc-500">
      {duration}s
    </span>
  )
}
