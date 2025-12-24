import { useState, useEffect, useCallback } from 'react'
import type { WorkflowData } from '../types/nodes'
import { workflowApi } from '../lib/api-client'
import {
  exportWorkflow,
  importWorkflow,
} from '../lib/workflow-storage'
import { useGraph } from '../hooks/useGraph'

interface SaveLoadDialogProps {
  isOpen: boolean
  mode: 'save' | 'load'
  onClose: () => void
  onSave?: (name: string, description?: string) => Promise<void>
  onLoad?: (workflow: WorkflowData) => void
}

/**
 * Dialog for saving and loading workflows.
 * Supports both server storage and local file import/export.
 */
export function SaveLoadDialog({
  isOpen,
  mode,
  onClose,
  onSave,
  onLoad,
}: SaveLoadDialogProps) {
  const { graph } = useGraph()
  const [workflows, setWorkflows] = useState<WorkflowData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowData | null>(null)

  // Fetch workflows on open
  useEffect(() => {
    if (isOpen && mode === 'load') {
      setLoading(true)
      setError(null)

      workflowApi.list()
        .then(setWorkflows)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [isOpen, mode])

  // Handle save
  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setError('Please enter a workflow name')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onSave?.(name.trim(), description.trim() || undefined)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workflow')
    } finally {
      setLoading(false)
    }
  }, [name, description, onSave, onClose])

  // Handle load
  const handleLoad = useCallback(() => {
    if (!selectedWorkflow) {
      setError('Please select a workflow to load')
      return
    }

    onLoad?.(selectedWorkflow)
    onClose()
  }, [selectedWorkflow, onLoad, onClose])

  // Handle export
  const handleExport = useCallback(() => {
    if (!graph) return

    const workflowName = name.trim() || 'workflow'
    exportWorkflow(graph, workflowName)
  }, [graph, name])

  // Handle import
  const handleImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const data = await importWorkflow(file)
      onLoad?.({
        id: '',
        name: data.name,
        graph: data.graph,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import workflow')
    } finally {
      setLoading(false)
    }
  }, [onLoad, onClose])

  // Handle delete
  const handleDelete = useCallback(async (workflow: WorkflowData) => {
    if (!confirm(`Delete "${workflow.name}"?`)) return

    setLoading(true)
    setError(null)

    try {
      await workflowApi.delete(workflow.id)
      setWorkflows(prev => prev.filter(w => w.id !== workflow.id))
      if (selectedWorkflow?.id === workflow.id) {
        setSelectedWorkflow(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workflow')
    } finally {
      setLoading(false)
    }
  }, [selectedWorkflow])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-zinc-800 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-3">
          <h2 className="text-lg font-semibold text-zinc-50">
            {mode === 'save' ? 'Save Workflow' : 'Load Workflow'}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {error && (
            <div className="mb-4 rounded-md bg-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {mode === 'save' ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-300">
                  Workflow Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="My Workflow"
                  className="w-full rounded-md border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-300">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full rounded-md border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Workflow list */}
              <div className="max-h-64 overflow-y-auto rounded-md border border-zinc-700">
                {loading ? (
                  <div className="p-4 text-center text-sm text-zinc-500">
                    Loading workflows...
                  </div>
                ) : workflows.length === 0 ? (
                  <div className="p-4 text-center text-sm text-zinc-500">
                    No saved workflows found
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-700">
                    {workflows.map(workflow => (
                      <div
                        key={workflow.id}
                        onClick={() => setSelectedWorkflow(workflow)}
                        className={`flex cursor-pointer items-center justify-between p-3 hover:bg-zinc-700 ${
                          selectedWorkflow?.id === workflow.id ? 'bg-zinc-700' : ''
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-zinc-200">
                            {workflow.name}
                          </p>
                          {workflow.description && (
                            <p className="text-xs text-zinc-500">
                              {workflow.description}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-zinc-600">
                            {new Date(workflow.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            handleDelete(workflow)
                          }}
                          className="rounded p-1 text-zinc-500 hover:bg-zinc-600 hover:text-red-400"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Import from file */}
              <div className="border-t border-zinc-700 pt-4">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-zinc-600 p-4 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-300">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Import from file
                  <input
                    type="file"
                    accept=".json,.workflow.json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-700 px-4 py-3">
          <div>
            {mode === 'save' && (
              <button
                onClick={handleExport}
                className="text-sm text-zinc-400 hover:text-zinc-300"
              >
                Export to file
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              onClick={mode === 'save' ? handleSave : handleLoad}
              disabled={loading || (mode === 'load' && !selectedWorkflow)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : mode === 'save' ? 'Save' : 'Load'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
