/**
 * Database schema definitions.
 * Defines the structure for SQLite tables.
 */

/**
 * SQL statement to create the workflows table.
 */
export const CREATE_WORKFLOWS_TABLE = `
  CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    graph TEXT NOT NULL,
    thumbnail TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`

/**
 * SQL statement to create an index on workflow names.
 */
export const CREATE_WORKFLOWS_NAME_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_workflows_name ON workflows(name)
`

/**
 * SQL statement to create an index on workflow update times.
 */
export const CREATE_WORKFLOWS_UPDATED_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_workflows_updated ON workflows(updated_at DESC)
`

/**
 * Workflow database row type.
 */
export interface WorkflowRow {
  id: string
  name: string
  description: string | null
  graph: string
  thumbnail: string | null
  created_at: string
  updated_at: string
}

/**
 * Workflow API response type.
 */
export interface WorkflowResponse {
  id: string
  name: string
  description: string | null
  graph: object
  thumbnail: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Converts a database row to an API response.
 */
export function rowToResponse(row: WorkflowRow): WorkflowResponse {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    graph: JSON.parse(row.graph),
    thumbnail: row.thumbnail,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
