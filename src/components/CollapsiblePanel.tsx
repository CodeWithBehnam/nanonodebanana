import { useState, useCallback, type ReactNode } from 'react'

interface CollapsiblePanelProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
  icon?: ReactNode
}

/**
 * Collapsible panel component with smooth animations.
 * Used for organizing content in sidebars and property editors.
 */
export function CollapsiblePanel({
  title,
  children,
  defaultOpen = true,
  className = '',
  icon,
}: CollapsiblePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  return (
    <div className={`border-b border-zinc-700 ${className}`}>
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-zinc-800/50"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-zinc-400">{icon}</span>}
          <span className="text-sm font-medium text-zinc-200">{title}</span>
        </div>
        <svg
          className={`h-4 w-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-3 pb-3">{children}</div>
      </div>
    </div>
  )
}

interface CollapsibleSidebarProps {
  children: ReactNode
  side: 'left' | 'right'
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
}

/**
 * Collapsible sidebar component with resize handle.
 * Supports both left and right positioning.
 */
export function CollapsibleSidebar({
  children,
  side,
  defaultWidth = 256,
  minWidth = 200,
  maxWidth = 400,
}: CollapsibleSidebarProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)

    const startX = e.clientX
    const startWidth = width

    const handleMouseMove = (e: MouseEvent) => {
      const delta = side === 'left' ? e.clientX - startX : startX - e.clientX
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + delta))
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [width, side, minWidth, maxWidth])

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  return (
    <div
      className={`relative flex ${side === 'right' ? 'flex-row-reverse' : ''}`}
      style={{ width: isCollapsed ? 40 : width }}
    >
      {/* Sidebar content */}
      <div
        className={`flex-1 overflow-hidden transition-all ${
          isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'
        }`}
      >
        {children}
      </div>

      {/* Collapse button and resize handle */}
      <div
        className={`flex flex-col items-center ${
          side === 'left' ? 'border-r' : 'border-l'
        } border-zinc-700`}
      >
        {/* Collapse button */}
        <button
          onClick={toggleCollapse}
          className="flex h-8 w-8 items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          <svg
            className={`h-4 w-4 transition-transform ${
              isCollapsed
                ? side === 'left'
                  ? 'rotate-0'
                  : 'rotate-180'
                : side === 'left'
                ? 'rotate-180'
                : 'rotate-0'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Resize handle */}
        {!isCollapsed && (
          <div
            onMouseDown={handleMouseDown}
            className={`flex-1 w-1 cursor-col-resize hover:bg-blue-500/50 ${
              isDragging ? 'bg-blue-500' : ''
            }`}
          />
        )}
      </div>
    </div>
  )
}
