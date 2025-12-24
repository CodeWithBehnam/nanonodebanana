import { useState, useCallback } from 'react'
import { workflowTemplates, type WorkflowTemplate } from '../lib/workflow-templates'

interface TemplateDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (template: WorkflowTemplate) => void
}

/**
 * Dialog for browsing and selecting workflow templates.
 * Provides quick-start options for common workflow patterns.
 */
export function TemplateDialog({ isOpen, onClose, onSelect }: TemplateDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'basic' | 'advanced' | 'video'>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null)

  const filteredTemplates = selectedCategory === 'all'
    ? workflowTemplates
    : workflowTemplates.filter(t => t.category === selectedCategory)

  const handleSelect = useCallback(() => {
    if (selectedTemplate) {
      onSelect(selectedTemplate)
      onClose()
    }
  }, [selectedTemplate, onSelect, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl rounded-lg bg-zinc-800 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-3">
          <h2 className="text-lg font-semibold text-zinc-50">Workflow Templates</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 border-b border-zinc-700 px-4 py-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'basic', label: 'Basic' },
            { id: 'advanced', label: 'Advanced' },
            { id: 'video', label: 'Video' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as typeof selectedCategory)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-zinc-700 text-zinc-50'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-2 gap-4 p-4 max-h-[50vh] overflow-y-auto">
          {filteredTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`flex flex-col rounded-lg border p-4 text-left transition-all ${
                selectedTemplate?.id === template.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-700/50'
              }`}
            >
              {/* Thumbnail placeholder */}
              <div className="mb-3 flex h-24 items-center justify-center rounded-md bg-zinc-700/50">
                <svg className="h-12 w-12 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>

              <h3 className="text-sm font-medium text-zinc-200">{template.name}</h3>
              <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{template.description}</p>

              <div className="mt-2">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    template.category === 'basic'
                      ? 'bg-green-500/20 text-green-400'
                      : template.category === 'advanced'
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}
                >
                  {template.category}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-700 px-4 py-3">
          <div className="text-sm text-zinc-500">
            {selectedTemplate
              ? `Selected: ${selectedTemplate.name}`
              : 'Select a template to get started'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedTemplate}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              Use Template
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
