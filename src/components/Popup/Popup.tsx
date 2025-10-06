import { useLayoutEffect, useRef, useState, type JSX } from 'react'

import { observeMove } from '../../lib/ObserveMove'
import { useLastOutsideClick } from '../../lib/useLastOutsideClick'

/**
 * Вычисляет корректную позицию по оси Y, чтобы не выходить за границы экрана
 */
const computeYPosition = (y?: number | null, elemHeight: number = 0): number | undefined => {
  if (y == null) return
  const root = document.documentElement
  const delta = Math.floor(root.clientHeight - y - elemHeight)

  return delta < 0 ? Math.floor(y + delta) : y
}

/**
 * Вычисляет корректную позицию по оси X, чтобы не выходить за границы экрана
 */
export const computeXPosition = (x?: number | null, elemWidth: number = 0): number | undefined => {
  if (x == null) return
  const root = document.documentElement
  const delta = Math.floor(root.clientWidth - x - elemWidth)

  return delta < 0 ? Math.floor(x + delta - 10) : x
}

interface UsePopupParams<T extends HTMLElement> {
  parent: React.RefObject<T | null>
  onClose: () => void
  uniqId?: string
}

interface PopupPosition {
  x: number
  y: number
}

/**
 * Хук управления позицией и поведением Popup
 */
export const usePopup = <T extends HTMLElement> ({ parent, onClose, uniqId }: UsePopupParams<T>) => {
  const [position, setPosition] = useState<PopupPosition | null>(null)
  const ref = useRef<HTMLDivElement | null>(null)

  useLastOutsideClick<HTMLDivElement>(ref, onClose, uniqId)

  useLayoutEffect(() => {
    if (!parent) return

    return observeMove(parent.current, (rect: DOMRect) => {
        const containerRect = parent.current?.offsetParent?.getBoundingClientRect()
        setPosition({
        x: rect.left - (containerRect?.left ?? 0),
        y: rect.bottom - (containerRect?.top ?? 0),
        })
    })
  }, [parent, onClose])

  const callbackRef: React.RefCallback<HTMLDivElement> = (elem) => {
    if (elem) {
      ref.current = elem
      const { height, width } = elem.getBoundingClientRect()
      const left = computeXPosition(position?.x, width)
      const top = computeYPosition(position?.y, height)

      
      if (left !== undefined && top !== undefined) {
        elem.style.left = `${left}px`
        elem.style.top = `${top}px`
      }
    }
  }

  return {
    callbackRef,
  }
}


interface PopupProps<T extends HTMLElement> {
  parent: React.RefObject<T | null>
  onClose: () => void
  children?: React.ReactNode
  uniqId?: string
}

export const Popup = <T extends HTMLElement>({
  parent,
  onClose,
  children,
  uniqId,
}: PopupProps<T>): JSX.Element | null => {
  const { callbackRef } = usePopup({ parent, onClose, uniqId })

  if (!parent) return null

  return (
    <div ref={callbackRef} style={{position:"absolute"}}>
      {children}
    </div>
  )
}