# AI Image Generation Workflow Editor - Development Prompt

## Project Overview

Build a visual node-based workflow editor (similar to ComfyUI) for AI image generation. The application allows users to create workflows by connecting different nodes on a canvas, then execute the workflow to generate images using AI models (Google Gemini, Fal.ai).

## Tech Stack

- **Runtime**: Bun
- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS 4
- **Node Editor**: litegraph.js
- **Backend**: Elysia.js
- **Database**: SQLite (for saving workflows)
- **Package Manager**: Bun
- **Environment**: Use .env files for all API keys

## Project Structure

```
src/
├── components/
│   ├── WorkflowCanvas.tsx      # Main canvas wrapper component
│   ├── Toolbar.tsx             # Top toolbar with actions
│   ├── NodePanel.tsx           # Side panel listing available nodes
│   ├── PropertiesPanel.tsx     # Right panel for selected node properties
│   └── OutputPreview.tsx       # Preview panel for generated images
├── nodes/
│   ├── index.ts                # Node registration
│   ├── base/
│   │   └── BaseNode.ts         # Base node class with shared functionality
│   ├── input/
│   │   ├── PromptNode.ts       # Text prompt input
│   │   ├── ImageSourceNode.ts  # Image upload/URL input
│   │   ├── NumberNode.ts       # Numeric value input
│   │   └── SeedNode.ts         # Random seed generator
│   ├── processing/
│   │   ├── CombinePromptsNode.ts    # Merge multiple prompts
│   │   ├── StylePresetNode.ts       # Apply style modifiers
│   │   ├── NegativePromptNode.ts    # Negative prompt input
│   │   └── ImageResizeNode.ts       # Resize/crop images
│   ├── generation/
│   │   ├── GeminiGeneratorNode.ts   # Google Gemini image generation
│   │   ├── FalFluxNode.ts           # Fal.ai Flux model
│   │   └── FalVideoNode.ts          # Fal.ai video generation (Veo 3)
│   └── output/
│       ├── ImageOutputNode.ts       # Display generated image
│       ├── SaveImageNode.ts         # Save to disk/download
│       └── GalleryNode.ts           # Multi-image gallery view
├── lib/
│   ├── graph-executor.ts       # Topological sort and execution engine
│   ├── api-client.ts           # API calls to backend
│   └── workflow-storage.ts     # Save/load workflows
├── hooks/
│   ├── useGraph.ts             # Graph state management
│   └── useExecution.ts         # Execution state and progress
├── styles/
│   └── litegraph-custom.css    # Custom Litegraph theme (dark mode)
├── types/
│   └── nodes.ts                # TypeScript types for nodes
├── App.tsx
└── main.tsx

server/
├── index.ts                    # Elysia server entry
├── routes/
│   ├── generate.ts             # Image generation endpoints
│   ├── workflows.ts            # Workflow CRUD
│   └── upload.ts               # Image upload handling
├── services/
│   ├── gemini.ts               # Google Gemini API integration
│   ├── fal.ts                  # Fal.ai API integration
│   └── storage.ts              # File storage service
└── db/
    ├── schema.ts               # SQLite schema
    └── client.ts               # Database client
```

## Node Specifications

### Input Nodes

#### PromptNode
- **Colour**: Blue (#2563eb)
- **Outputs**: `prompt` (string)
- **Widgets**: 
  - Multiline text area for prompt input
  - Character count display
- **Features**: Supports template variables like {style}, {subject}

#### ImageSourceNode
- **Colour**: Green (#16a34a)
- **Outputs**: `image` (base64 string)
- **Widgets**:
  - Upload button
  - URL input field
  - Thumbnail preview (60x60px)
- **Features**: Drag-and-drop support, paste from clipboard

#### SeedNode
- **Colour**: Yellow (#ca8a04)
- **Outputs**: `seed` (number)
- **Widgets**:
  - Number input
  - "Randomise" button
  - "Lock" toggle
- **Features**: Generates random seed on each execution unless locked

### Processing Nodes

#### CombinePromptsNode
- **Colour**: Cyan (#0891b2)
- **Inputs**: `prompt_1` (string), `prompt_2` (string), `prompt_3` (string)
- **Outputs**: `combined` (string)
- **Widgets**:
  - Separator dropdown (comma, newline, space)
- **Features**: Dynamically add/remove input slots

#### StylePresetNode
- **Colour**: Pink (#db2777)
- **Inputs**: `prompt` (string)
- **Outputs**: `styled_prompt` (string)
- **Widgets**:
  - Preset dropdown (Photorealistic, Anime, Oil Painting, Watercolour, 3D Render, Pixel Art, Comic Book, Cinematic)
- **Features**: Appends style-specific tokens to prompt

#### NegativePromptNode
- **Colour**: Red (#dc2626)
- **Outputs**: `negative` (string)
- **Widgets**:
  - Multiline text area
  - Quick-add buttons for common negatives (blurry, low quality, watermark, etc.)

### Generation Nodes

#### GeminiGeneratorNode
- **Colour**: Purple (#7c3aed)
- **Inputs**: 
  - `prompt` (string) - required
  - `negative` (string) - optional
  - `reference` (image) - optional
  - `seed` (number) - optional
- **Outputs**: `image` (base64 string)
- **Widgets**:
  - Model selector (imagen-3, gemini-2.0-flash)
  - Aspect ratio (1:1, 16:9, 9:16, 4:3, 3:4)
  - Number of images (1-4)
  - Safety filter toggle
- **Features**: 
  - Progress indicator during generation
  - Error display on failure
  - Execution time display

#### FalFluxNode
- **Colour**: Orange (#ea580c)
- **Inputs**: 
  - `prompt` (string) - required
  - `reference` (image) - optional
  - `seed` (number) - optional
- **Outputs**: `image` (base64 string)
- **Widgets**:
  - Model selector (flux-pro, flux-dev, flux-schnell)
  - Image size presets
  - Guidance scale slider (1-20)
  - Steps slider (1-50)
- **Features**: Queue position display, estimated time

### Output Nodes

#### ImageOutputNode
- **Colour**: Emerald (#059669)
- **Inputs**: `image` (base64 string)
- **Widgets**: None (display only)
- **Features**: 
  - Large preview (resizable node)
  - Click to view fullscreen
  - Right-click context menu (copy, save, send to input)

#### SaveImageNode
- **Colour**: Slate (#475569)
- **Inputs**: `image` (base64 string)
- **Widgets**:
  - Filename template input
  - Format dropdown (PNG, JPEG, WebP)
  - Quality slider (for JPEG/WebP)
  - Auto-save toggle
- **Features**: Batch naming with incrementing numbers

## UI Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Workflow Editor    [New] [Save] [Load]    [▶ Run] [Settings] │
├────────────┬────────────────────────────────────────┬───────────────┤
│            │                                        │               │
│  NODE      │                                        │  PROPERTIES   │
│  LIBRARY   │         CANVAS AREA                    │               │
│            │         (Litegraph)                    │  - Node name  │
│  ▸ Input   │                                        │  - Settings   │
│    Prompt  │    ┌──────┐    ┌───────────┐          │  - Inputs     │
│    Image   │    │Prompt├───►│ Generator │          │               │
│    Seed    │    └──────┘    └─────┬─────┘          │               │
│            │                      │                 │               │
│  ▸ Process │              ┌───────▼───────┐        │               │
│    Combine │              │    Output     │        │               │
│    Style   │              └───────────────┘        │               │
│            │                                        │               │
│  ▸ Generate│                                        ├───────────────┤
│    Gemini  │                                        │               │
│    Fal.ai  │                                        │  OUTPUT       │
│            │                                        │  PREVIEW      │
│  ▸ Output  │                                        │               │
│    Display │                                        │  [Generated   │
│    Save    │                                        │   Image]      │
│            │                                        │               │
└────────────┴────────────────────────────────────────┴───────────────┘
```

## Graph Execution Engine

Implement a proper execution engine that:

1. **Topological Sort**: Orders nodes so dependencies execute first
2. **Async Execution**: Handles async API calls properly
3. **Progress Tracking**: Emits events for UI progress updates
4. **Error Handling**: Catches errors per-node without stopping entire workflow
5. **Caching**: Optionally cache unchanged node outputs
6. **Cancellation**: Support cancelling mid-execution

```typescript
// Example execution flow
interface ExecutionContext {
  nodeId: string
  status: 'pending' | 'running' | 'completed' | 'error'
  progress?: number
  result?: unknown
  error?: Error
}

interface ExecutionEngine {
  execute(graph: LGraph): AsyncGenerator<ExecutionContext>
  cancel(): void
  getResults(): Map<string, unknown>
}
```

## Backend API Endpoints

### POST /api/generate/gemini
```typescript
interface GeminiRequest {
  prompt: string
  negativePrompt?: string
  referenceImage?: string // base64
  model: 'imagen-3' | 'gemini-2.0-flash'
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
  numberOfImages: number
  seed?: number
}

interface GeminiResponse {
  images: string[] // base64 array
  executionTime: number
}
```

### POST /api/generate/fal
```typescript
interface FalRequest {
  prompt: string
  model: 'flux-pro' | 'flux-dev' | 'flux-schnell'
  imageSize: { width: number; height: number }
  guidanceScale: number
  steps: number
  seed?: number
  referenceImage?: string
}

interface FalResponse {
  images: string[]
  seed: number
  executionTime: number
}
```

### Workflow CRUD
- `GET /api/workflows` - List saved workflows
- `GET /api/workflows/:id` - Get single workflow
- `POST /api/workflows` - Create new workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

## Styling Requirements

### Litegraph Theme (Dark Mode)
```css
/* Custom dark theme for Litegraph */
:root {
  --lg-background: #18181b;
  --lg-node-bg: #27272a;
  --lg-node-border: #3f3f46;
  --lg-connection: #a1a1aa;
  --lg-connection-hover: #f4f4f5;
  --lg-text: #fafafa;
  --lg-text-muted: #a1a1aa;
  --lg-selection: #3b82f6;
}
```

### Node Appearance
- Rounded corners (8px)
- Subtle drop shadow
- Smooth connection curves
- Animated connection flow (optional)
- Clear slot labels
- Colour-coded by category

## Additional Features

### Keyboard Shortcuts
- `Space + Drag`: Pan canvas
- `Scroll`: Zoom in/out
- `Delete/Backspace`: Remove selected
- `Ctrl+D`: Duplicate selected
- `Ctrl+G`: Group selected nodes
- `Ctrl+S`: Save workflow
- `Ctrl+Z/Y`: Undo/Redo
- `F`: Fit view to all nodes
- `A`: Add node menu at cursor

### Context Menus
- **Canvas**: Add node, paste, fit view
- **Node**: Duplicate, delete, disable, collapse, change colour
- **Connection**: Delete, insert node

### Workflow Templates
Include pre-built workflow templates:
1. Simple Generation (Prompt → Generator → Output)
2. Style Transfer (Image + Style → Generator → Output)
3. Prompt Refinement (Multiple Prompts → Combine → Generator → Output)
4. Batch Generation (Prompt → Multiple Generators → Gallery)

## Environment Variables

```env
# .env file
GEMINI_API_KEY=your_gemini_key
FAL_KEY=your_fal_key
DATABASE_URL=./data/workflows.db
PORT=3000
```

## Development Commands

```bash
# Install dependencies
bun install

# Run development server (frontend + backend)
bun run dev

# Build for production
bun run build

# Run production server
bun run start
```

## Implementation Notes

1. **Modular Approach**: Keep each node in its own file, max 500 lines per file
2. **Type Safety**: Full TypeScript with strict mode
3. **Error Boundaries**: Wrap canvas in error boundary to prevent crashes
4. **Performance**: Use `requestAnimationFrame` for canvas updates
5. **Accessibility**: Keyboard navigation support where possible
6. **Responsive**: Collapsible side panels for smaller screens
7. **State Management**: React context for global state, avoid heavy libraries

## File Size Guidelines

- Components: Max 300 lines each
- Node definitions: Max 200 lines each  
- Utility files: Max 500 lines each
- Break larger files into smaller modules

---

## Prompt for AI Code Generation

Use the above specification to generate a complete, production-ready application. Start with:

1. Project setup (package.json, tsconfig, vite config, tailwind config)
2. Core Litegraph integration and canvas component
3. Base node class and node registration system
4. Individual node implementations (start with PromptNode, GeneratorNode, OutputNode)
5. Backend server with Elysia
6. API integrations (Gemini, Fal.ai)
7. Workflow save/load functionality
8. UI panels and styling

Generate clean, well-commented code following modern React patterns. Use British English for all comments and documentation.
