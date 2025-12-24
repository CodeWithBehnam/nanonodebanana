/**
 * Suppress passive event listener warnings for libraries that need
 * to call preventDefault() on scroll/touch events (like LiteGraph).
 *
 * This doesn't break functionality - it just silences Chrome's warning.
 */
export function suppressPassiveEventWarnings(): void {
  // Only run in browser
  if (typeof window === 'undefined') return

  const originalAddEventListener = EventTarget.prototype.addEventListener

  EventTarget.prototype.addEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ) {
    // These events trigger the warning but libraries often need preventDefault()
    const scrollBlockingEvents = ['mousewheel', 'wheel', 'touchstart', 'touchmove']

    // If it's a scroll-blocking event with no options, don't modify
    // (let the library handle it as intended)
    if (scrollBlockingEvents.includes(type) && options === undefined) {
      return originalAddEventListener.call(this, type, listener, { passive: false })
    }

    return originalAddEventListener.call(this, type, listener, options)
  }
}
