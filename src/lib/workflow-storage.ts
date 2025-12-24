import type { LGraph } from 'litegraph.js'
import type { WorkflowData } from '../types/nodes'
import { workflowApi } from './api-client'

const LOCAL_STORAGE_KEY = 'nanonodebanana_current_workflow'
const AUTOSAVE_KEY = 'nanonodebanana_autosave'

/**
 * Serialises a Litegraph graph to a JSON-compatible object.
 */
export function serialiseGraph(graph: LGraph): object {
  return graph.serialize()
}

/**
 * Deserialises a graph from saved data.
 */
export function deserialiseGraph(graph: LGraph, data: object): void {
  graph.configure(data)
}

/**
 * Saves the current workflow to local storage for recovery.
 */
export function saveToLocalStorage(graph: LGraph, name: string): void {
  const data = {
    name,
    graph: serialiseGraph(graph),
    savedAt: new Date().toISOString(),
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
}

/**
 * Loads a workflow from local storage.
 */
export function loadFromLocalStorage(): {
  name: string
  graph: object
  savedAt: string
} | null {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (!data) return null

  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

/**
 * Clears the current workflow from local storage.
 */
export function clearLocalStorage(): void {
  localStorage.removeItem(LOCAL_STORAGE_KEY)
}

/**
 * Enables autosave for the graph.
 * Saves to local storage on every change.
 */
export function enableAutosave(graph: LGraph, name: string): () => void {
  const intervalId = setInterval(() => {
    const data = {
      name,
      graph: serialiseGraph(graph),
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data))
  }, 30000) // Autosave every 30 seconds

  return () => clearInterval(intervalId)
}

/**
 * Loads the autosaved workflow if available.
 */
export function loadAutosave(): {
  name: string
  graph: object
  savedAt: string
} | null {
  const data = localStorage.getItem(AUTOSAVE_KEY)
  if (!data) return null

  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

/**
 * Clears the autosave data.
 */
export function clearAutosave(): void {
  localStorage.removeItem(AUTOSAVE_KEY)
}

/**
 * Saves a workflow to the server.
 */
export async function saveWorkflow(
  graph: LGraph,
  name: string,
  description?: string
): Promise<WorkflowData> {
  return workflowApi.create({
    name,
    description,
    graph: serialiseGraph(graph),
  })
}

/**
 * Updates an existing workflow on the server.
 */
export async function updateWorkflow(
  id: string,
  graph: LGraph,
  name?: string,
  description?: string
): Promise<WorkflowData> {
  return workflowApi.update(id, {
    name,
    description,
    graph: serialiseGraph(graph),
  })
}

/**
 * Loads a workflow from the server.
 */
export async function loadWorkflow(id: string): Promise<WorkflowData> {
  return workflowApi.get(id)
}

/**
 * Lists all saved workflows from the server.
 */
export async function listWorkflows(): Promise<WorkflowData[]> {
  return workflowApi.list()
}

/**
 * Deletes a workflow from the server.
 */
export async function deleteWorkflow(id: string): Promise<void> {
  return workflowApi.delete(id)
}

/**
 * Exports a workflow as a downloadable JSON file.
 */
export function exportWorkflow(graph: LGraph, name: string): void {
  const data = {
    name,
    version: '1.0.0',
    graph: serialiseGraph(graph),
    exportedAt: new Date().toISOString(),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${name.toLowerCase().replace(/\s+/g, '-')}.workflow.json`
  link.click()

  URL.revokeObjectURL(url)
}

/**
 * Imports a workflow from a JSON file.
 */
export async function importWorkflow(file: File): Promise<{
  name: string
  graph: object
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (!data.graph) {
          throw new Error('Invalid workflow file: missing graph data')
        }
        resolve({
          name: data.name || 'Imported Workflow',
          graph: data.graph,
        })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
