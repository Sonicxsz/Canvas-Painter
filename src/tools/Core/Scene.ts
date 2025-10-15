import type { DrawableItem, Point, Rect } from "./Core.t";
import { DragHandler } from "./Drag";
import  { EventManager } from "./Event";
import  { ResizeHandler } from "./Resize";
import { SelectionManager } from "./Selection";
import  { CursorManager } from "./Cursor";
import  { CornerDetector } from "./CornerDetector";
import { GeometryUtils } from "./GeometryUtils";

// ==================== ГЛАВНЫЙ МЕНЕДЖЕР СЦЕНЫ ====================
export interface RenderConfig {
  renderMainLayer: (items: Map<string, DrawableItem>) => void;
  renderEditLayer: (items: Map<string, DrawableItem>, selectionRect: Rect | null) => void;
}

export class SceneManager {
  private items = new Map<string, DrawableItem>();
  private renderLoopId: number | null = null;

  // Модули
  private selectionManager: SelectionManager;
  private dragHandler: DragHandler;
  private resizeHandler: ResizeHandler;
  private cursorManager: CursorManager;
  private cornerDetector: CornerDetector;
  private eventManager: EventManager;

  private config: RenderConfig;

  private canvas: HTMLCanvasElement;

  constructor(
    canvas: HTMLCanvasElement,
    config: RenderConfig
  ) {
    this.canvas = canvas;
    this.config = config;
    this.selectionManager = new SelectionManager();
    this.dragHandler = new DragHandler();
    this.resizeHandler = new ResizeHandler();
    this.cursorManager = new CursorManager(canvas);
    this.cornerDetector = new CornerDetector();
    this.eventManager = new EventManager(canvas);

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventManager.on("mousedown", this.handleMouseDown);
    this.eventManager.on("mousemove", this.handleMouseMove);
    this.eventManager.on("mouseup", this.handleMouseUp);
  }

  private getMousePos(e: MouseEvent): Point {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  private handleMouseDown = (e: MouseEvent): void => {
    const point = this.getMousePos(e);
    const selectionRect = this.selectionManager.getSelectionRect();

    if (!selectionRect) return;

    const corner = this.cornerDetector.detectCorner(point, selectionRect);
    
    if (corner) {
      e.stopImmediatePropagation();
      this.resizeHandler.startResize(point, corner);
    } else if (this.selectionManager.isPointInSelection(point)) {
      e.stopImmediatePropagation();
      this.dragHandler.startDrag(point);
    }
  };

  private handleMouseMove = (e: MouseEvent): void => {
    const point = this.getMousePos(e);
    const selectionRect = this.selectionManager.getSelectionRect();

    if (!selectionRect) {
      this.cursorManager.setDefault();
      return;
    }

    // Обработка drag
    if (this.dragHandler.isActive()) {
      const selectedItems = Array.from(this.selectionManager.getSelectedItems().values());
      const { items, rect } = this.dragHandler.drag(point, selectedItems, selectionRect);
      
      this.updateSelectedItems(items);
      this.selectionManager.updateSelectionRect();
      this.startRenderLoop();
      return;
    }

    // Обработка resize
    if (this.resizeHandler.isActive()) {
      const selectedItems = Array.from(this.selectionManager.getSelectedItems().values());
      const { items, rect } = this.resizeHandler.resize(point, selectedItems, selectionRect);
      
      this.updateSelectedItems(items);
      this.selectionManager.updateSelectionRect();
      this.startRenderLoop();
      return;
    }

    // Обновление курсора
    const corner = this.cornerDetector.detectCorner(point, selectionRect);
    if (corner) {
      this.cursorManager.setResize(corner);
    } else if (this.selectionManager.isPointInSelection(point)) {
      this.cursorManager.setMove();
    } else {
      this.cursorManager.setDefault();
    }
  };

  private handleMouseUp = (e: MouseEvent): void => {
    if (this.dragHandler.isActive() || this.resizeHandler.isActive()) {
      e.stopImmediatePropagation();
      this.dragHandler.stopDrag();
      this.resizeHandler.stopResize();
    }
  };

  private updateSelectedItems(items: DrawableItem[]): void {
    const selectedMap = this.selectionManager.getSelectedItems();
    items.forEach(item => selectedMap.set(item.id, item));
  }

  // ==================== ПУБЛИЧНЫЕ МЕТОДЫ ====================

  addItem(item: DrawableItem): void {
    this.items.set(item.id, item);
    this.renderMainLayer();
  }

  selectArea(start: Point, end: Point): void {
    const selectionArea = GeometryUtils.correctRectAngles({
      x: start.x,
      y: start.y,
      x2: end.x,
      y2: end.y,
    });

    // Переносим выделенные элементы обратно
    if (this.selectionManager.hasSelection()) {
      this.deselectAll();
    }

    const intersecting = this.selectionManager.findIntersectingItems(this.items, selectionArea);
    
    if (intersecting.length) {
      intersecting.forEach(item => this.items.delete(item.id));
      this.selectionManager.select(intersecting);
      this.renderMainLayer();
      this.startRenderLoop();


      console.log({mainItems:this.items})
    }
  }

  deselectAll(): void {
    const selectedItems = this.selectionManager.getSelectedItems();
    selectedItems.forEach(item => this.items.set(item.id, item));
    this.selectionManager.clear();
    this.stopRenderLoop();
    this.renderMainLayer();
  }

  private renderMainLayer(): void {
    this.config.renderMainLayer(this.items);
  }

  private startRenderLoop(): void {
    if (this.renderLoopId) return;

    const loop = () => {
      const rect = this.selectionManager.getSelectionRect()
      this.config.renderEditLayer(this.selectionManager.getSelectedItems(), rect)
    

      if (!this.selectionManager.hasSelection()) {
        this.stopRenderLoop();
        return;
      }

      this.renderLoopId = requestAnimationFrame(loop);
    };

    this.renderLoopId = requestAnimationFrame(loop);
  }

  private stopRenderLoop(): void {
    if (this.renderLoopId) {
      cancelAnimationFrame(this.renderLoopId);
      this.renderLoopId = null;
    }
  }

  destroy(): void {
    this.stopRenderLoop();
    this.eventManager.destroy();
    this.items.clear();
    this.selectionManager.clear();
  }
}