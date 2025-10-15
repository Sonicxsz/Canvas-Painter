import type { DrawableItem, Point, Rect } from "./Core.t";
import { GeometryUtils } from "./GeometryUtils";

// ==================== МЕНЕДЖЕР ВЫДЕЛЕНИЯ ====================
export class SelectionManager {
  private selectedItems = new Map<string, DrawableItem>();
  private selectionRect: Rect | null = null;

  getSelectedItems(): Map<string, DrawableItem> {
    return this.selectedItems;
  }

  getSelectionRect(): Rect | null {
    return this.selectionRect;
  }

  hasSelection(): boolean {
    return this.selectedItems.size > 0;
  }

  select(items: DrawableItem[]): void {
    this.clear();
    items.forEach(item => this.selectedItems.set(item.id, item));
    this.selectionRect = GeometryUtils.getBoundingRect(items);
  }

  deselect(item: DrawableItem): void {
    this.selectedItems.delete(item.id);
    this.updateSelectionRect();
  }

  clear(): void {
    this.selectedItems.clear();
    this.selectionRect = null;
  }

  updateSelectionRect(): void {
    const items = Array.from(this.selectedItems.values());
    this.selectionRect = GeometryUtils.getBoundingRect(items);
  }

  isPointInSelection(point: Point): boolean {
    return this.selectionRect 
      ? GeometryUtils.isPointInRect(point, this.selectionRect)
      : false;
  }

  findIntersectingItems(items: Map<string, DrawableItem>, selectionArea: Rect): DrawableItem[] {
    const result: DrawableItem[] = [];
    
    items.forEach(item => {
      if (GeometryUtils.rectsIntersect(item.data, selectionArea)) {
        result.push(item);
      }
    });

    return result;
  }
}