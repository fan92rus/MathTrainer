import { ref } from 'vue'

export interface DragState {
  isDragging: boolean
  startX: number
  startY: number
  offsetX: number
  offsetY: number
  dragValue: number | null
  sourceEl: HTMLElement | null
}

/**
 * Composable для Drag & Drop ответов (Pattern 1).
 * Pure Pointer Events API — no HTML5 drag, no external libraries.
 *
 * Взаимодействие:
 *   1. onPointerDown(e, value)  — захват блока
 *   2. onPointerMove(e)        — обновление позиции (GPU: translate3d)
 *   3. onPointerUp(e, zoneEl)  — проверка попадания в drop-target
 *
 * На мобильных: instant drag (0ms delay), touch-action: none.
 */
export function useDragAndDropAnswer() {
  const state = ref<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    dragValue: null,
    sourceEl: null,
  })

  /** Значение, успешно сброшенное в drop-зону (null пока не сброшено) */
  const droppedValue = ref<number | null>(null)

  /**
   * Захват блока. Вызывать в @pointerdown.prevent на DraggableBlock.
   * setPointerCapture привязывает все последующие pointer-события к элементу.
   */
  function onPointerDown(e: PointerEvent, value: number): void {
    e.preventDefault()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    state.value = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: 0,
      offsetY: 0,
      dragValue: value,
      sourceEl: e.target as HTMLElement,
    }
  }

  /**
   * Обновление позиции. Вызывать в @pointermove на родительском контейнере.
   * Использует offsetX/offsetY для transform: translate3d().
   */
  function onPointerMove(e: PointerEvent): void {
    if (!state.value.isDragging) return
    state.value.offsetX = e.clientX - state.value.startX
    state.value.offsetY = e.clientY - state.value.startY
  }

  /**
   * Сброс блока. Вызывать в @pointerup на родительском контейнере.
   * Проверяет попадание в dropZoneEl и, при попадании, записывает droppedValue.
   */
  function onPointerUp(e: PointerEvent, dropZoneEl: HTMLElement | null): void {
    if (!state.value.isDragging) return

    const value = state.value.dragValue
    state.value.isDragging = false
    state.value.dragValue = null

    if (value !== null && dropZoneEl) {
      const rect = dropZoneEl.getBoundingClientRect() as DOMRect
      const insideX = e.clientX >= rect.left && e.clientX <= rect.right
      const insideY = e.clientY >= rect.top && e.clientY <= rect.bottom
      if (insideX && insideY) {
        droppedValue.value = value
      }
    }
  }

  /** Сброс состояния (после обработки ответа или при новом примере) */
  function reset(): void {
    state.value = {
      isDragging: false,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
      dragValue: null,
      sourceEl: null,
    }
    droppedValue.value = null
  }

  return {
    state,
    droppedValue,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    reset,
  }
}
