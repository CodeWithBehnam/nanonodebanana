/**
 * Type declarations for litegraph.js
 * Provides TypeScript support for the Litegraph library.
 */

declare module 'litegraph.js' {
  export interface INodeSlot {
    name: string
    type: string | number
    link?: number | null
    links?: number[]
    dir?: number
    color_on?: string
    color_off?: string
    label?: string
    locked?: boolean
    nameLocked?: boolean
  }

  export interface INodeInputSlot extends INodeSlot {
    link: number | null
  }

  export interface INodeOutputSlot extends INodeSlot {
    links: number[]
  }

  export interface IWidget {
    name: string
    type: string
    value: unknown
    options?: Record<string, unknown>
    callback?: (value: unknown, widget: IWidget, node: LGraphNode) => void
    draw?: (ctx: CanvasRenderingContext2D, node: LGraphNode, width: number, y: number, height: number) => void
    computeSize?: (width: number) => [number, number]
    mouse?: (event: MouseEvent, pos: [number, number], node: LGraphNode) => boolean
    y?: number
    last_y?: number
    width?: number
    disabled?: boolean
  }

  export interface SerializedLGraphNode {
    id: number
    type: string
    pos: [number, number]
    size: [number, number]
    flags: Record<string, boolean>
    order: number
    mode: number
    inputs?: INodeInputSlot[]
    outputs?: INodeOutputSlot[]
    properties?: Record<string, unknown>
    widgets_values?: unknown[]
  }

  export interface IContextMenuItem {
    content: string
    callback?: (item: IContextMenuItem, options: unknown, event: MouseEvent, parentMenu: unknown, node: LGraphNode) => void
    submenu?: { options: IContextMenuItem[] }
    has_submenu?: boolean
    disabled?: boolean
    title?: string
  }

  export class LGraphNode {
    id: number
    type: string | null
    title: string
    pos: [number, number]
    size: [number, number]
    graph: LGraph | null
    flags: Record<string, boolean>
    mode: number
    order: number
    color?: string
    bgcolor?: string
    boxcolor?: string
    shape?: number

    inputs: INodeInputSlot[]
    outputs: INodeOutputSlot[]
    properties: Record<string, unknown>
    widgets?: IWidget[]
    widgets_values?: unknown[]

    constructor(title?: string)

    configure(data: SerializedLGraphNode): void
    serialize(): SerializedLGraphNode
    clone(): LGraphNode

    addInput(name: string, type: string | number, extra_info?: Partial<INodeInputSlot>): INodeInputSlot
    addOutput(name: string, type: string | number, extra_info?: Partial<INodeOutputSlot>): INodeOutputSlot
    removeInput(slot: number): void
    removeOutput(slot: number): void

    findInputSlot(name: string): number
    findOutputSlot(name: string): number

    getInputData<T = unknown>(slot: number): T | undefined
    getInputLink(slot: number): LLink | null
    getInputNode(slot: number): LGraphNode | null
    setOutputData(slot: number, data: unknown): void
    getOutputNodes(slot: number): LGraphNode[]

    addProperty(name: string, defaultValue: unknown, type?: string, extra_info?: Record<string, unknown>): void
    setProperty(name: string, value: unknown): void
    getProperty(name: string): unknown

    addWidget(
      type: string,
      name: string,
      value: unknown,
      callback?: (value: unknown, widget: IWidget, node: LGraphNode) => void,
      options?: Record<string, unknown>
    ): IWidget

    connect(outputSlot: number, targetNode: LGraphNode, targetSlot: number | string): LLink | null
    disconnectOutput(slot: number, targetNode?: LGraphNode): boolean
    disconnectInput(slot: number): boolean

    trigger(action: string, param?: unknown): void
    triggerSlot(slot: number, param?: unknown, link_id?: number): void

    setDirtyCanvas(dirty_foreground: boolean, dirty_background?: boolean): void
    collapse(force?: boolean): void

    getTitle(): string
    setSize(size: [number, number]): void
    getConnectionPos(is_input: boolean, slot_number: number, out?: [number, number]): [number, number]
    getBounding(out?: Float32Array): Float32Array

    onAdded?(graph: LGraph): void
    onRemoved?(): void
    onStart?(): void
    onStop?(): void
    onDrawBackground?(ctx: CanvasRenderingContext2D, canvas: LGraphCanvas): void
    onDrawForeground?(ctx: CanvasRenderingContext2D, canvas: LGraphCanvas): void
    onMouseDown?(event: MouseEvent, pos: [number, number], canvas: LGraphCanvas): boolean | void
    onMouseMove?(event: MouseEvent, pos: [number, number], canvas: LGraphCanvas): boolean | void
    onMouseUp?(event: MouseEvent, pos: [number, number], canvas: LGraphCanvas): boolean | void
    onMouseEnter?(event: MouseEvent, pos: [number, number], canvas: LGraphCanvas): void
    onMouseLeave?(event: MouseEvent, pos: [number, number], canvas: LGraphCanvas): void
    onDblClick?(event: MouseEvent, pos: [number, number], canvas: LGraphCanvas): void
    onKeyDown?(event: KeyboardEvent): boolean | void
    onKeyUp?(event: KeyboardEvent): boolean | void
    onSelected?(): void
    onDeselected?(): void
    onDropFile?(file: File): void
    onDropData?(data: string, filename: string, file: File): void
    onPropertyChanged?(name: string, value: unknown, prev_value: unknown): boolean | void
    onConnectionsChange?(
      type: number,
      slot: number,
      connected: boolean,
      link_info: LLink,
      input_info: INodeInputSlot
    ): void
    onConfigure?(data: SerializedLGraphNode): void
    onSerialize?(data: SerializedLGraphNode): void
    onExecute?(): void
    onAction?(action: string, param?: unknown): void
    onGetInputs?(): Array<[string, string | number]>
    onGetOutputs?(): Array<[string, string | number]>
    getMenuOptions?(canvas: LGraphCanvas): IContextMenuItem[]
    getExtraMenuOptions?(canvas: LGraphCanvas, options: IContextMenuItem[]): IContextMenuItem[]
    getSlotMenuOptions?(slot: INodeSlot): IContextMenuItem[]
  }

  export interface LLink {
    id: number
    type: string | number
    origin_id: number
    origin_slot: number
    target_id: number
    target_slot: number
    data?: unknown
  }

  export interface SerializedLGraph {
    last_node_id: number
    last_link_id: number
    nodes: SerializedLGraphNode[]
    links: Array<[number, number, number, number, number, string]>
    groups?: Array<{ title: string; bounding: number[]; color: string }>
    config?: Record<string, unknown>
    extra?: Record<string, unknown>
    version?: number
  }

  export class LGraph {
    static supported_types: string[]
    static STATUS_STOPPED: number
    static STATUS_RUNNING: number

    _nodes: LGraphNode[]
    _nodes_by_id: Record<number, LGraphNode>
    _nodes_in_order: LGraphNode[]
    links: Record<number, LLink>
    iteration: number
    globaltime: number
    runningtime: number
    fixedtime: number
    fixedtime_lapse: number
    elapsed_time: number
    last_update_time: number
    starttime: number
    status: number
    last_node_id: number
    last_link_id: number
    config: Record<string, unknown>
    extra: Record<string, unknown>

    constructor(data?: SerializedLGraph)

    clear(): void
    setDirtyCanvas(foreground: boolean, background?: boolean): void
    configure(data: SerializedLGraph, keep_old?: boolean): boolean
    serialize(): SerializedLGraph

    add(node: LGraphNode, skip_compute_order?: boolean): void
    remove(node: LGraphNode): void
    getNodeById(id: number): LGraphNode | null
    findNodesByClass<T extends LGraphNode>(classObject: new () => T): T[]
    findNodesByType(type: string): LGraphNode[]
    findNodesByTitle(title: string): LGraphNode[]
    findNodeByTitle(title: string): LGraphNode | null
    getNodeOnPos(x: number, y: number, nodes_list?: LGraphNode[], margin?: number): LGraphNode | null

    arrange(margin?: number, layout?: string): void
    computeExecutionOrder(only_onExecute?: boolean, set_level?: boolean): LGraphNode[]

    start(interval?: number): void
    stop(): void
    runStep(num?: number, do_not_catch_errors?: boolean): void

    sendEventToAllNodes(eventname: string, param?: unknown, mode?: number): void

    getTime(): number
    getFixedTime(): number
    getElapsedTime(): number

    connectionChange(node: LGraphNode, link_info: LLink): void

    onNodeAdded?(node: LGraphNode): void
    onNodeRemoved?(node: LGraphNode): void
    onNodeConnectionChange?(node: LGraphNode): void
    onPlayEvent?(): void
    onStopEvent?(): void
    onConfigure?(data: SerializedLGraph): void
    onSerialize?(data: SerializedLGraph): void
    onBeforeChange?(graph: LGraph, info?: { type: string }): void
    onAfterChange?(graph: LGraph, info?: { type: string }): void
    onAfterExecute?(): void
  }

  export interface CanvasRenderingState {
    scale: number
    offset: [number, number]
  }

  export class LGraphCanvas {
    static active_canvas: LGraphCanvas | null
    static link_type_colors: Record<string, string>

    graph: LGraph | null
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    ds: CanvasRenderingState
    scale: number
    offset: [number, number]

    selected_nodes: Record<number, LGraphNode>
    current_node: LGraphNode | null
    node_over: LGraphNode | null
    node_capturing_input: LGraphNode | null
    connecting_node: LGraphNode | null
    connecting_output: INodeOutputSlot | null
    connecting_slot: number
    connecting_pos: [number, number] | null

    last_mouse: [number, number]
    last_click_position: [number, number]

    background_image: string
    clear_background: boolean
    render_shadows: boolean
    render_connection_arrows: boolean
    render_curved_connections: boolean
    render_connections_border: boolean
    render_execution_order: boolean
    render_only_selected: boolean
    live_mode: boolean
    show_info: boolean
    allow_dragcanvas: boolean
    allow_dragnodes: boolean
    allow_interaction: boolean
    allow_searchbox: boolean
    allow_reconnect_links: boolean
    drag_mode: boolean
    dragging_rectangle: [number, number, number, number] | null

    highquality_render: boolean
    editor_alpha: number
    pause_rendering: boolean
    read_only: boolean

    title_text_font: string
    inner_text_font: string
    node_title_color: string
    default_link_color: string
    default_connection_color: string
    default_connection_color_byType: Record<string, string>
    default_connection_color_byTypeOff: Record<string, string>

    fps: number
    frame: number

    constructor(canvas: HTMLCanvasElement, graph?: LGraph, options?: Record<string, unknown>)

    setGraph(graph: LGraph, skip_clear?: boolean): void
    setCanvas(canvas: HTMLCanvasElement, skip_events?: boolean): void
    setZoom(value: number, center?: [number, number]): void
    bringToFront(node: LGraphNode): void
    sendToBack(node: LGraphNode): void

    centerOnNode(node: LGraphNode): void
    setDirty(foreground?: boolean, background?: boolean): void

    draw(force_foreground?: boolean, force_background?: boolean): void
    drawFrontCanvas(): void
    drawBackCanvas(): void
    drawNode(node: LGraphNode, ctx: CanvasRenderingContext2D): void
    drawConnections(ctx: CanvasRenderingContext2D): void

    resize(width?: number, height?: number): void
    switchLiveMode(transition?: boolean): void

    processMouseDown(event: MouseEvent): boolean
    processMouseMove(event: MouseEvent): boolean
    processMouseUp(event: MouseEvent): boolean
    processMouseWheel(event: WheelEvent): boolean
    processKey(event: KeyboardEvent): boolean

    selectNode(node: LGraphNode, add_to_current?: boolean): void
    selectNodes(nodes?: LGraphNode[], add_to_current?: boolean): void
    deselectNode(node: LGraphNode): void
    deselectAllNodes(): void
    deleteSelectedNodes(): void

    copyToClipboard(): void
    pasteFromClipboard(): void

    convertOffsetToCanvas(pos: [number, number], out?: [number, number]): [number, number]
    convertCanvasToOffset(pos: [number, number], out?: [number, number]): [number, number]

    getCanvasWindow(): Window
    getCanvasMouse(event: MouseEvent): [number, number]

    prompt(title: string, value: unknown, callback: (value: string) => void, event?: MouseEvent): HTMLDivElement
    showSearchBox(event?: MouseEvent): void
    showShowNodePanel(node: LGraphNode): void
    showConnectionMenu(options?: { nodeFrom?: LGraphNode; slotFrom?: number; nodeFromType?: string }): void

    isLiveMode(): boolean
    closeSubgraph(): void
    openSubgraph(graph: LGraph): void

    getNodeMenuOptions(node: LGraphNode): IContextMenuItem[]
    getGroupMenuOptions(group: unknown): IContextMenuItem[]
    getCanvasMenuOptions(): IContextMenuItem[]
    processContextMenu(node: LGraphNode | null, event: MouseEvent): void

    onNodeSelected?(node: LGraphNode): void
    onNodeDeselected?(node: LGraphNode): void
    onShowNodePanel?(node: LGraphNode): void
    onNodeDblClicked?(node: LGraphNode): void
    onSelectionChange?(nodes: Record<number, LGraphNode>): void
    onDropItem?(event: DragEvent): void
    onRender?(canvas: LGraphCanvas, ctx: CanvasRenderingContext2D): void
    onDrawBackground?(ctx: CanvasRenderingContext2D, visible_area: number[]): void
    onDrawForeground?(ctx: CanvasRenderingContext2D, visible_area: number[]): void
    onMouse?(event: MouseEvent): boolean | void
    onMouseDown?(event: MouseEvent): boolean | void
    onMouseMove?(event: MouseEvent): void
    onMouseUp?(event: MouseEvent): void
    onSearchBox?(helper: unknown, value: string, graphCanvas: LGraphCanvas): string[]
    onSearchBoxSelection?(name: string, event: MouseEvent, graphCanvas: LGraphCanvas): void
  }

  export const LiteGraph: {
    VERSION: string
    CANVAS_GRID_SIZE: number
    NODE_TITLE_HEIGHT: number
    NODE_TITLE_TEXT_Y: number
    NODE_SLOT_HEIGHT: number
    NODE_WIDGET_HEIGHT: number
    NODE_WIDTH: number
    NODE_MIN_WIDTH: number
    NODE_COLLAPSED_RADIUS: number
    NODE_COLLAPSED_WIDTH: number
    NODE_TITLE_COLOR: string
    NODE_SELECTED_TITLE_COLOR: string
    NODE_TEXT_SIZE: number
    NODE_TEXT_COLOR: string
    NODE_SUBTEXT_SIZE: number
    NODE_DEFAULT_COLOR: string
    NODE_DEFAULT_BGCOLOR: string
    NODE_DEFAULT_BOXCOLOR: string
    NODE_DEFAULT_SHAPE: string
    NODE_BOX_OUTLINE_COLOR: string
    DEFAULT_SHADOW_COLOR: string
    DEFAULT_GROUP_FONT: number
    WIDGET_BGCOLOR: string
    WIDGET_OUTLINE_COLOR: string
    WIDGET_TEXT_COLOR: string
    WIDGET_SECONDARY_TEXT_COLOR: string
    LINK_COLOR: string
    EVENT_LINK_COLOR: string
    CONNECTING_LINK_COLOR: string

    INPUT: number
    OUTPUT: number
    EVENT: number
    ACTION: number

    NODE_MODES: string[]
    NODE_MODES_COLORS: string[]

    ALWAYS: number
    ON_EVENT: number
    NEVER: number
    ON_TRIGGER: number

    UP: number
    DOWN: number
    LEFT: number
    RIGHT: number
    CENTER: number

    LINK_RENDER_MODES: string[]
    STRAIGHT_LINK: number
    LINEAR_LINK: number
    SPLINE_LINK: number

    NORMAL_TITLE: number
    NO_TITLE: number
    TRANSPARENT_TITLE: number
    AUTOHIDE_TITLE: number

    BOX_SHAPE: number
    ROUND_SHAPE: number
    CIRCLE_SHAPE: number
    CARD_SHAPE: number
    ARROW_SHAPE: number
    GRID_SHAPE: number

    registered_node_types: Record<string, typeof LGraphNode>
    searchbox_extras: Record<string, { data: { outputs: Array<[string, string]>; title: string }; desc: string; type: string }>

    createNode<T extends LGraphNode = LGraphNode>(type: string, title?: string, options?: Record<string, unknown>): T | null
    registerNodeType(type: string, base_class: typeof LGraphNode): void
    unregisterNodeType(type: string): void
    clearRegisteredTypes(): void

    getNodeTypesCategories(): string[]
    getNodeTypesInCategory(category: string, filter?: string): string[]
    getNodeType(type: string): typeof LGraphNode | null

    isValidConnection(type_a: string, type_b: string): boolean
    registerSearchboxExtra(type: string, description: string, data: unknown): void

    extendClass<T, U>(target: T, origin: U): T & U

    ContextMenu: new (
      values: Array<IContextMenuItem | string | null>,
      options?: {
        callback?: (item: IContextMenuItem | null, options: unknown, event: MouseEvent, parentMenu: unknown, node?: LGraphNode) => void
        event?: MouseEvent
        parentMenu?: unknown
        title?: string
        autoopen?: boolean
        node?: LGraphNode
        extra?: unknown
      },
      window?: Window
    ) => {
      root: HTMLDivElement
      close(event?: MouseEvent, ignore_parent_menu?: boolean): void
    }
  }
}
