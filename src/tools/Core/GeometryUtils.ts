import type { DrawableItem, Point, Rect } from "./Core.t";

export class GeometryUtils {
  static rectsIntersect(a: Rect, b: Rect): boolean {
    return a.x < b.x2 && a.x2 > b.x && a.y < b.y2 && a.y2 > b.y;
  }

  static isPointInRect(point: Point, rect: Rect): boolean {
    return point.x >= rect.x && point.x <= rect.x2 && 
           point.y >= rect.y && point.y <= rect.y2;
  }

  static getBoundingRect(items: DrawableItem[]): Rect | null {
    if (!items.length) return null;
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    items.forEach(item => {
      minX = Math.min(minX, item.data.x);
      minY = Math.min(minY, item.data.y);
      maxX = Math.max(maxX, item.data.x2);
      maxY = Math.max(maxY, item.data.y2);
    });

    return { x: minX, y: minY, x2: maxX, y2: maxY };
  }

  static correctRectAngles(rect: Rect): Rect {
    return {
      x: Math.min(rect.x, rect.x2),
      y: Math.min(rect.y, rect.y2),
      x2: Math.max(rect.x, rect.x2),
      y2: Math.max(rect.y, rect.y2),
    };
  }
}