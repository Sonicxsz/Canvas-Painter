import { getMousePosition } from "../../lib/utils";
import type { DrawableItem, ItemBaseInfo } from "../Core.t";


export interface SelectRect {
    x:number, 
    y: number,
    x2: number,
    y2: number
  }


interface Config {
    renderMainLayer: (items: Map<string, DrawableItem>) => void
    renderEditLayer: (items: Map<string, DrawableItem>, selectionRect:SelectRect | null) => void
    paintCanvas:HTMLCanvasElement
}


export class SceneManager {
  private items: Map<string, DrawableItem> = new Map();
  private selectedItems:  Map<string, DrawableItem> = new Map();
  private selectRect: SelectRect | null = null

  private renderEditLayerLoopId: null | number = null;
  private config: Config

  // Drag and drop
  private isDragging: boolean = false;
  private isCursorInsideSelection: boolean = false;
  private dragStart: { x: number; y: number } | null = null;




  constructor(config: Config){
    this.config = config
    this.listen()
  }



  listen() {
      this.config.paintCanvas.addEventListener("mousemove",this.onMouseMove)
      this.config.paintCanvas.addEventListener("mousedown",this.onMouseDown)
      this.config.paintCanvas.addEventListener("mouseup",this.onMouseUp)
  }

  getMousePos = (e: MouseEvent) => getMousePosition(e)

  
  onMouseMove = (e:MouseEvent) => {
    if(!this.selectRect) {
      document.body.style.cursor = "default"
      this.isCursorInsideSelection = false;
      this.isDragging = false;
      return;
    };

    const {x,y} = this.getMousePos(e)


    if(isCursorInsideRect(x, y, this.selectRect)) {
       document.body.style.cursor = "move"
       this.isCursorInsideSelection = true;
    }else{
        document.body.style.cursor = "default"
        this.isCursorInsideSelection = false;
    }

    this.moveDraggedItems(x,y)
  }


  moveDraggedItems = (x:number, y:number) => {
    if(this.isCursorInsideSelection && this.isDragging && this.dragStart && this.selectRect) {
        const dx = x - this.dragStart.x;
        const dy = y - this.dragStart.y;

        // Обновляем selectRect
        this.selectRect = {
          x: this.selectRect.x + dx,
          y: this.selectRect.y + dy,
          x2: this.selectRect.x2 + dx,
          y2: this.selectRect.y2 + dy,
        };

        // Двигаем все выбранные элементы
        this.selectedItems.forEach(item => {
            // Двигаем базовые координаты
            item.data.x += dx;
            item.data.y += dy;
            item.data.x2 += dx;
            item.data.y2 += dy;

            // Если это нарисованный элемент — двигаем все точки
            if (Array.isArray(item.data.dots)) {
              item.data.dots = item.data.dots.map(dot => ({
                x: dot.x + dx,
                y: dot.y + dy,
              }));
            }
         });

        


        // Сохраняем текущую позицию как новую стартовую
        this.dragStart = { x, y };
    }
  }


  onMouseUp = (e:MouseEvent) => {
    if(this.isDragging) {
      e.stopImmediatePropagation()
      this.isDragging = false;
      this.dragStart = null;
    }
  }


  onMouseDown = (e:MouseEvent) => {
    if(this.isCursorInsideSelection) {
      e.stopImmediatePropagation()
      this.dragStart = this.getMousePos(e);
      this.isDragging = true;

    }
  }


  addItem = (item: DrawableItem) => {
    this.items.set(item.id, item);
    this.rerender()
  }

  selectItem = (items: DrawableItem[]) => {
    const {x,x2,y,y2} = items[0].data
    this.selectRect = {x,x2,y,y2}

    items.forEach(el => {
      this.selectedItems.set(el.id, el)
      // Выкидываем из обычного рендера
      this.items.delete(el.id)

      if(!this.selectRect) return;


      this.selectRect = generateRect(this.selectRect, el.data)
    })

      
      this.rerender()
      this.renderSelected()
  }


  select = (initialX: number, initialY: number, endX:number, endY: number): DrawableItem | null => {
    const selX1 = Math.min(initialX, endX);
    const selY1 = Math.min(initialY, endY);
    const selX2 = Math.max(initialX, endX);
    const selY2 = Math.max(initialY, endY);


    // Если уже что-то лежит в selected 
    // Перекидываем обратно в items
     if(this.selectedItems.size) {
          this.deselectItems()
          this.rerender()
    }

    const selection: DrawableItem[] = []

    for (const el of this.items.values()) {
      const { x, y, x2, y2 } = el.data;
    
      if (rectsIntersect(x, y, x2, y2, selX1, selY1, selX2, selY2)) {
        selection.push(el)
      }
    }

    if(selection.length) this.selectItem(selection)
    return null;
};


  deselectItems = () => {
    this.selectedItems.forEach(el => {
      this.items.set(el.id, el)
    })

    // Убираем визуальное выделение
    this.selectRect = null
    this.selectedItems.clear()

    
    this.rerender()
    
  }

  rerender = () => {
    this.config.renderMainLayer(this.items)
  }


  
  renderSelected = () => {
    const loop = () => {
      this.config.renderEditLayer(this.selectedItems, this.selectRect)
      
      if (!this.selectedItems.size && this.renderEditLayerLoopId) {
        cancelAnimationFrame(this.renderEditLayerLoopId);
        this.renderEditLayerLoopId = null;
        return;
      }
      this.renderEditLayerLoopId = requestAnimationFrame(loop);
    };

    if (!this.renderEditLayerLoopId) {
      this.renderEditLayerLoopId = requestAnimationFrame(loop);
    }
  }
}



// Формируем правильный прямоугольник для визуального выделения всех выбранных элементов
function generateRect(currentRect:SelectRect,  item: ItemBaseInfo): SelectRect  {
      const {x, x2,y, y2} = item
      currentRect.x = x < currentRect.x ? x : currentRect.x
      currentRect.x2 = x2 > currentRect.x2 ? x2 : currentRect.x2
      currentRect.y = y < currentRect.y ? y : currentRect.y
      currentRect.y2 = y2 > currentRect.y2 ? y2 : currentRect.y2

      return currentRect
}

// Вычисляет пересечение по координатам 
function rectsIntersect(
    ax1: number, ay1: number, ax2: number, ay2: number,
    bx1: number, by1: number, bx2: number, by2: number
  ): boolean {
    return (
      ax1 < bx2 && ax2 > bx1 &&
      ay1 < by2 && ay2 > by1
    );
}



function isCursorInsideRect(cursorX: number, cursorY: number, rect: SelectRect): boolean {
  return cursorX >= rect.x && cursorX <= rect.x2 && cursorY >= rect.y && cursorY <= rect.y2;
}


