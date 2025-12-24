import { Elysia, t } from 'elysia'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../db/client'

/**
 * Workflow request/response schema.
 */
const workflowSchema = t.Object({
  name: t.String(),
  description: t.Optional(t.String()),
  graph: t.Any(), // Serialised Litegraph data
  thumbnail: t.Optional(t.String()),
})

/**
 * Workflow CRUD routes.
 */
export const workflowRoutes = new Elysia({ prefix: '/api/workflows' })
  /**
   * List all saved workflows.
   */
  .get('/', () => {
    const workflows = db.getAllWorkflows()
    return workflows
  })

  /**
   * Get a single workflow by ID.
   */
  .get(
    '/:id',
    ({ params, set }) => {
      const workflow = db.getWorkflow(params.id)

      if (!workflow) {
        set.status = 404
        return { error: 'Workflow not found' }
      }

      return workflow
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  /**
   * Create a new workflow.
   */
  .post(
    '/',
    ({ body }) => {
      const id = uuidv4()
      const now = new Date().toISOString()

      const workflow = {
        id,
        name: body.name,
        description: body.description ?? null,
        graph: JSON.stringify(body.graph),
        thumbnail: body.thumbnail ?? null,
        createdAt: now,
        updatedAt: now,
      }

      db.createWorkflow(workflow)

      return {
        ...workflow,
        graph: body.graph,
      }
    },
    {
      body: workflowSchema,
    }
  )

  /**
   * Update an existing workflow.
   */
  .put(
    '/:id',
    ({ params, body, set }) => {
      const existing = db.getWorkflow(params.id)

      if (!existing) {
        set.status = 404
        return { error: 'Workflow not found' }
      }

      const now = new Date().toISOString()

      // existing.graph is already an object (from WorkflowResponse), so stringify it if not overriding
      const graphString = body.graph ? JSON.stringify(body.graph) : JSON.stringify(existing.graph)

      const workflow = {
        id: params.id,
        name: body.name ?? existing.name,
        description: body.description ?? existing.description,
        graph: graphString,
        thumbnail: body.thumbnail ?? existing.thumbnail,
        createdAt: existing.createdAt,
        updatedAt: now,
      }

      db.updateWorkflow(workflow)

      return {
        ...workflow,
        graph: body.graph ?? existing.graph,
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Partial(workflowSchema),
    }
  )

  /**
   * Delete a workflow.
   */
  .delete(
    '/:id',
    ({ params, set }) => {
      const existing = db.getWorkflow(params.id)

      if (!existing) {
        set.status = 404
        return { error: 'Workflow not found' }
      }

      db.deleteWorkflow(params.id)

      return { success: true }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
