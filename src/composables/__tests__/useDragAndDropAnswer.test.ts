import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDragAndDropAnswer } from '../useDragAndDropAnswer'

/**
 * Mock PointerEvent with clientX/clientY and basic methods.
 */
function makePointer(x: number, y: number): PointerEvent {
  return {
    clientX: x,
    clientY: y,
    pointerId: 1,
    preventDefault: vi.fn(),
    target: {
      setPointerCapture: vi.fn(),
      getBoundingClientRect: () => ({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 }),
    },
  } as unknown as PointerEvent
}

function makeDropZone(x: number, y: number, w: number, h: number): HTMLElement {
  return {
    getBoundingClientRect: () => ({
      left: x,
      top: y,
      right: x + w,
      bottom: y + h,
      width: w,
      height: h,
    }),
  } as unknown as HTMLElement
}

describe('useDragAndDropAnswer', () => {
  let drag: ReturnType<typeof useDragAndDropAnswer>

  beforeEach(() => {
    drag = useDragAndDropAnswer()
  })

  describe('initialization', () => {
    it('should start with no drag in progress', () => {
      expect(drag.state.value.isDragging).toBe(false)
    })

    it('should start with no drag value', () => {
      expect(drag.state.value.dragValue).toBeNull()
    })

    it('should start with no dropped value', () => {
      expect(drag.droppedValue.value).toBeNull()
    })

    it('should start with zero offsets', () => {
      expect(drag.state.value.offsetX).toBe(0)
      expect(drag.state.value.offsetY).toBe(0)
    })
  })

  describe('onPointerDown', () => {
    it('should start dragging', () => {
      const e = makePointer(100, 200)
      drag.onPointerDown(e, 42)
      expect(drag.state.value.isDragging).toBe(true)
    })

    it('should capture the drag value', () => {
      const e = makePointer(100, 200)
      drag.onPointerDown(e, 42)
      expect(drag.state.value.dragValue).toBe(42)
    })

    it('should record start position', () => {
      const e = makePointer(100, 200)
      drag.onPointerDown(e, 7)
      expect(drag.state.value.startX).toBe(100)
      expect(drag.state.value.startY).toBe(200)
    })

    it('should call preventDefault', () => {
      const e = makePointer(100, 200)
      drag.onPointerDown(e, 5)
      expect(e.preventDefault).toHaveBeenCalled()
    })

    it('should call setPointerCapture', () => {
      const e = makePointer(100, 200)
      drag.onPointerDown(e, 5)
      expect((e.target as any).setPointerCapture).toHaveBeenCalledWith(1)
    })

    it('should set sourceEl to event target', () => {
      const e = makePointer(100, 200)
      drag.onPointerDown(e, 5)
      // sourceEl is set to e.target from the mock
      expect(drag.state.value.sourceEl).toBeDefined()
    }) 
  })

  describe('onPointerMove', () => {
    it('should update offsets during drag', () => {
      drag.onPointerDown(makePointer(100, 200), 5)
      drag.onPointerMove(makePointer(130, 250))
      expect(drag.state.value.offsetX).toBe(30)
      expect(drag.state.value.offsetY).toBe(50)
    })

    it('should not update if not dragging', () => {
      drag.onPointerMove(makePointer(200, 300))
      expect(drag.state.value.offsetX).toBe(0)
      expect(drag.state.value.offsetY).toBe(0)
    })

    it('should track negative offsets when moving left/up', () => {
      drag.onPointerDown(makePointer(200, 300), 5)
      drag.onPointerMove(makePointer(150, 250))
      expect(drag.state.value.offsetX).toBe(-50)
      expect(drag.state.value.offsetY).toBe(-50)
    })
  })

  describe('onPointerUp - drop in zone', () => {
    it('should set droppedValue when dropped inside zone', () => {
      drag.onPointerDown(makePointer(50, 50), 42)
      const zone = makeDropZone(0, 0, 100, 100)
      drag.onPointerUp(makePointer(50, 50), zone)
      expect(drag.droppedValue.value).toBe(42)
    })

    it('should end dragging on pointer up', () => {
      drag.onPointerDown(makePointer(50, 50), 42)
      const zone = makeDropZone(0, 0, 100, 100)
      drag.onPointerUp(makePointer(50, 50), zone)
      expect(drag.state.value.isDragging).toBe(false)
    })

    it('should clear dragValue on pointer up', () => {
      drag.onPointerDown(makePointer(50, 50), 42)
      const zone = makeDropZone(0, 0, 100, 100)
      drag.onPointerUp(makePointer(50, 50), zone)
      expect(drag.state.value.dragValue).toBeNull()
    })
  })

  describe('onPointerUp - drop outside zone', () => {
    it('should NOT set droppedValue when dropped outside zone', () => {
      drag.onPointerDown(makePointer(50, 50), 42)
      const zone = makeDropZone(200, 200, 100, 100) // zone far away
      drag.onPointerUp(makePointer(50, 50), zone)
      expect(drag.droppedValue.value).toBeNull()
    })

    it('should still end dragging even if dropped outside', () => {
      drag.onPointerDown(makePointer(50, 50), 42)
      const zone = makeDropZone(200, 200, 100, 100)
      drag.onPointerUp(makePointer(50, 50), zone)
      expect(drag.state.value.isDragging).toBe(false)
    })
  })

  describe('onPointerUp - no drop zone', () => {
    it('should handle null drop zone gracefully', () => {
      drag.onPointerDown(makePointer(50, 50), 42)
      drag.onPointerUp(makePointer(50, 50), null)
      expect(drag.droppedValue.value).toBeNull()
      expect(drag.state.value.isDragging).toBe(false)
    })
  })

  describe('onPointerUp - not dragging', () => {
    it('should be a no-op when not dragging', () => {
      const zone = makeDropZone(0, 0, 100, 100)
      drag.onPointerUp(makePointer(50, 50), zone)
      expect(drag.droppedValue.value).toBeNull()
    })
  })

  describe('reset', () => {
    it('should reset all state', () => {
      drag.onPointerDown(makePointer(100, 200), 42)
      drag.onPointerMove(makePointer(150, 250))
      drag.reset()

      expect(drag.state.value.isDragging).toBe(false)
      expect(drag.state.value.offsetX).toBe(0)
      expect(drag.state.value.offsetY).toBe(0)
      expect(drag.state.value.dragValue).toBeNull()
      expect(drag.droppedValue.value).toBeNull()
    })

    it('should reset after successful drop', () => {
      drag.onPointerDown(makePointer(50, 50), 42)
      const zone = makeDropZone(0, 0, 100, 100)
      drag.onPointerUp(makePointer(50, 50), zone)
      expect(drag.droppedValue.value).toBe(42)

      drag.reset()
      expect(drag.droppedValue.value).toBeNull()
    })
  })

  describe('full drag lifecycle', () => {
    it('should complete full drag-drop cycle', () => {
      // 1. Start drag
      drag.onPointerDown(makePointer(100, 100), 7)
      expect(drag.state.value.isDragging).toBe(true)
      expect(drag.state.value.dragValue).toBe(7)

      // 2. Move
      drag.onPointerMove(makePointer(200, 150))
      expect(drag.state.value.offsetX).toBe(100)
      expect(drag.state.value.offsetY).toBe(50)

      // 3. Drop in zone
      const zone = makeDropZone(150, 100, 100, 100)
      drag.onPointerUp(makePointer(200, 150), zone)
      expect(drag.droppedValue.value).toBe(7)
      expect(drag.state.value.isDragging).toBe(false)
    })

    it('should support multiple drag-drop cycles', () => {
      // First drag
      drag.onPointerDown(makePointer(50, 50), 3)
      const zone1 = makeDropZone(0, 0, 100, 100)
      drag.onPointerUp(makePointer(50, 50), zone1)
      expect(drag.droppedValue.value).toBe(3)

      // Reset for next
      drag.reset()

      // Second drag
      drag.onPointerDown(makePointer(50, 50), 7)
      const zone2 = makeDropZone(0, 0, 100, 100)
      drag.onPointerUp(makePointer(50, 50), zone2)
      expect(drag.droppedValue.value).toBe(7)
    })
  })

  describe('edge cases', () => {
    it('should handle pointer at exact boundary of drop zone', () => {
      drag.onPointerDown(makePointer(0, 0), 5)
      const zone = makeDropZone(0, 0, 100, 100)
      // Pointer at exact right-bottom corner
      drag.onPointerUp(makePointer(100, 100), zone)
      expect(drag.droppedValue.value).toBe(5)
    })

    it('should handle pointer just outside drop zone', () => {
      drag.onPointerDown(makePointer(0, 0), 5)
      const zone = makeDropZone(0, 0, 100, 100)
      drag.onPointerUp(makePointer(101, 100), zone)
      expect(drag.droppedValue.value).toBeNull()
    })

    it('should handle zero value drag', () => {
      drag.onPointerDown(makePointer(50, 50), 0)
      const zone = makeDropZone(0, 0, 100, 100)
      drag.onPointerUp(makePointer(50, 50), zone)
      expect(drag.droppedValue.value).toBe(0)
    })

    it('should handle negative value drag', () => {
      drag.onPointerDown(makePointer(50, 50), -5)
      const zone = makeDropZone(0, 0, 100, 100)
      drag.onPointerUp(makePointer(50, 50), zone)
      expect(drag.droppedValue.value).toBe(-5)
    })
  })
})
