import type { DrawableItem, Point, Rect } from "./Core.t";

// ==================== ОБРАБОТЧИК ПЕРЕТАСКИВАНИЯ ====================
export class DragHandler {
  private isDragging = false;
  private startPoint: Point | null = null;

  startDrag(point: Point): void {
    this.isDragging = true;
    this.startPoint = point;
  }

  stopDrag(): void {
    this.isDragging = false;
    this.startPoint = null;
  }

  isActive(): boolean {
    return this.isDragging;
  }

  drag(currentPoint: Point, items: DrawableItem[], selectionRect: Rect): { 
    items: DrawableItem[], 
    rect: Rect 
  } {
    if (!this.isDragging || !this.startPoint) {
      return { items, rect: selectionRect };
    }

    const dx = currentPoint.x - this.startPoint.x;
    const dy = currentPoint.y - this.startPoint.y;

    // Обновляем элементы
    const updatedItems = items.map(item => ({
      ...item,
      data: {
        ...item.data,
        x: item.data.x + dx,
        y: item.data.y + dy,
        x2: item.data.x2 + dx,
        y2: item.data.y2 + dy,
        dots: item.data.dots?.map(dot => ({
          x: dot.x + dx,
          y: dot.y + dy,
        })),
      }
    }));

    // Обновляем селекцию
    const updatedRect: Rect = {
      x: selectionRect.x + dx,
      y: selectionRect.y + dy,
      x2: selectionRect.x2 + dx,
      y2: selectionRect.y2 + dy,
    };

    this.startPoint = currentPoint;

    return { items: updatedItems, rect: updatedRect };
  }
}