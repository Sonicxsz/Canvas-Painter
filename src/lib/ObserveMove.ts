/**
 * Отслеживает перемещение элемента на экране и вызывает callback при изменении позиции.
 * Использует IntersectionObserver для реактивного обновления координат.
 */
export function observeMove(
  element: HTMLElement | null,
  callback: (rect: DOMRect) => void
): (() => void) | undefined {
  if (!element) return

  const root = document.documentElement
  let intersectionObserver: IntersectionObserver | null = null

  const disconnect = (): void => {
    if (intersectionObserver) {
      intersectionObserver.disconnect()
    }
    intersectionObserver = null
  }

  const refresh = (): void => {
    disconnect()
    if (!root) return

    const coord = element.getBoundingClientRect()
    callback(coord)

    const margins = [
      coord.top,
      root.clientWidth - coord.right,
      root.clientHeight - coord.bottom,
      coord.left,
    ]

    const rootMargin = margins.map((val) => `${-Math.floor(val)}px`).join(' ')

    intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return

        const ratio = entry.intersectionRatio
        if (ratio < 1) {
          refresh()
        }
      },
      {
        root: document, // Можно оставить `null`, но в оригинале используется document
        rootMargin,
        threshold: 1,
      }
    )

    intersectionObserver.observe(element)
  }

  refresh()

  return disconnect
}
