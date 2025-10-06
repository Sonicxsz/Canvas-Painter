import { useEffect } from 'react'

interface StackItem<T extends HTMLElement> {
  ref: React.RefObject<T | null>
  cb?: (event: MouseEvent) => void
  id?: string
}

let stack: StackItem<HTMLElement>[] = []

/**
 * Хук, который вызывает колбэк при клике вне указанного элемента.
 * Работает со "стеком" — реагирует только последний зарегистрированный элемент.
 */
export const useLastOutsideClick = <T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  cb?: (event: MouseEvent) => void,
  id?: string
): void => {
  const clear = () => {
    stack = stack.filter((el) => el.id !== id)
  }

  useEffect(() => {
    stack.push({ ref, cb, id })
    return clear
  }, [ref, cb, id])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const last = stack[stack.length - 1]
      if (!last || last.id !== id) return // Только последний реагирует

      const element = last.ref.current
      if (element && !element.contains(event.target as Node)) {
        last.cb?.(event)
        clear()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [id])
}
