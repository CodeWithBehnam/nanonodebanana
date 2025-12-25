import '@testing-library/jest-dom/vitest'

// Mock ResizeObserver - not available in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock matchMedia - not available in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock canvas context - LiteGraph uses canvas extensively
HTMLCanvasElement.prototype.getContext = (() => {
  return null
}) as typeof HTMLCanvasElement.prototype.getContext

// Suppress console output during tests unless debugging
if (!process.env.DEBUG_TESTS) {
  global.console = {
    ...console,
    log: () => {},
    debug: () => {},
    info: () => {},
    // Keep warn and error for actual issues
  }
}
