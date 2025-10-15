import type { Corner, DrawableItem, Point, Rect } from "./Core.t";
import { GeometryUtils } from "./GeometryUtils";

// ==================== ОБРАБОТЧИК ИЗМЕНЕНИЯ РАЗМЕРА ====================
export class ResizeHandler {
  private isResizing = false;
  private activeCorner: Corner | null = null;
  private startPoint: Point | null = null;

  startResize(point: Point, corner: Corner): void {
    this.isResizing = true;
    this.activeCorner = corner;
    this.startPoint = point;
  }

  stopResize(): void {
    this.isResizing = false;
    this.activeCorner = null;
    this.startPoint = null;
  }

  isActive(): boolean {
    return this.isResizing;
  }

  getActiveCorner(): Corner | null {
    return this.activeCorner;
  }

  resize(currentPoint: Point, items: DrawableItem[], selectionRect: Rect): {
    items: DrawableItem[],
    rect: Rect
  } {
    if (!this.isResizing || !this.startPoint || !this.activeCorner) {
      return { items, rect: selectionRect };
    }

    const dx = currentPoint.x - this.startPoint.x;
    const dy = currentPoint.y - this.startPoint.y;

    // Вычисляем старые размеры
    const oldWidth = selectionRect.x2 - selectionRect.x;
    const oldHeight = selectionRect.y2 - selectionRect.y;

    // Обновляем rect
    let newRect = { ...selectionRect };
    
    switch (this.activeCorner) {
      case "LEFT_TOP":
        newRect.x += dx;
        newRect.y += dy;
        break;
      case "RIGHT_TOP":
        newRect.x2 += dx;
        newRect.y += dy;
        break;
      case "LEFT_BOTTOM":
        newRect.x += dx;
        newRect.y2 += dy;
        break;
      case "RIGHT_BOTTOM":
        newRect.x2 += dx;
        newRect.y2 += dy;
        break;
    }

    newRect = GeometryUtils.correctRectAngles(newRect);

    // Вычисляем новые размеры и коэффициенты масштабирования
    const newWidth = newRect.x2 - newRect.x;
    const newHeight = newRect.y2 - newRect.y;
    

    // Масштабируем элементы пропорционально
    const updatedItems = items.map(item => {
      const relX = (item.data.x - selectionRect.x) / oldWidth;
      const relY = (item.data.y - selectionRect.y) / oldHeight;
      const relX2 = (item.data.x2 - selectionRect.x) / oldWidth;
      const relY2 = (item.data.y2 - selectionRect.y) / oldHeight;

      return {
        ...item,
        data: {
          ...item.data,
          x: newRect.x + relX * newWidth,
          y: newRect.y + relY * newHeight,
          x2: newRect.x + relX2 * newWidth,
          y2: newRect.y + relY2 * newHeight,
          dots: item.data.dots?.map(dot => ({
            x: newRect.x + ((dot.x - selectionRect.x) / oldWidth) * newWidth,
            y: newRect.y + ((dot.y - selectionRect.y) / oldHeight) * newHeight,
          })),
        }
      };
    });

    this.startPoint = currentPoint;

    return { items: updatedItems, rect: newRect };
  }
}