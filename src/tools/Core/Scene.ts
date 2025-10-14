import { getMousePosition } from "../../lib/utils";
import type { DrawableItem, ItemBaseInfo } from "../Core.t";
import { correctRectangleAngles } from "../Rect";


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


  // MOUSE 
  private mouseStart: { x: number; y: number } | null = null;

  // DRAG AND DROP
  private isDragging: boolean = false;
  private isCursorInsideSelection: boolean = false;


  // RESIZE
  private isCursorInsideCorner:boolean = false;
  private isResizing:boolean = false;
  private resizingCorner:SelectedCorner = ""



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

  onMouseUp = (e:MouseEvent) => {
    if(this.isDragging || this.isResizing) {
      e.stopImmediatePropagation()
      this.isDragging = false;
      this.isResizing = false;
      this.mouseStart = null;
    }
    console.log(this.selectedItems)
  }


  onMouseDown = (e:MouseEvent) => {
    this.mouseStart = this.getMousePos(e);

    if(this.isCursorInsideCorner) {
      e.stopImmediatePropagation()
      this.isResizing = true;
    }

    if(this.isCursorInsideSelection) {
      e.stopImmediatePropagation()
      this.isDragging = true;
    }

  }
  
  onMouseMove = (e:MouseEvent) => {
    if(!this.selectRect) {
      document.body.style.cursor = "default"
      this.isCursorInsideSelection = false;
      this.isDragging = false;
      this.isResizing = false;
      this.resizingCorner = "";
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

    if(this.isDragging){
      this.moveDraggedItems(x,y)
    }




    // Resize logic
    if(this.isResizing) {
      this.resizeSelectedItems(x, y)
    }else{
      const selectedCorner = isCursorOnPoint(x, y, this.selectRect)
      changeCursorByResizeCorner(selectedCorner)
      this.isCursorInsideCorner = Boolean(selectedCorner.length)
      this.resizingCorner = selectedCorner
    }
  }
//NOTE Нужно увеличивать не одну сторону, а равномерно каждую в процентном соотношении
resizeSelectedItems = (x: number, y: number) => {
  if (!this.mouseStart || !this.selectRect) return;

  const dx = x - this.mouseStart.x;
  const dy = y - this.mouseStart.y;

  let { x: rx1, y: ry1, x2: rx2, y2: ry2 } = this.selectRect;

  switch (this.resizingCorner) {
    case "LEFT_TOP":
      rx1 += dx;
      ry1 += dy;
      break;
    case "RIGHT_TOP":
      rx2 += dx;
      ry1 += dy;
      break;
    case "LEFT_BOTTOM":
      rx1 += dx;
      ry2 += dy;
      break;
    case "RIGHT_BOTTOM":
      rx2 += dx;
      ry2 += dy;
      break;
  }

  // нормализуем координаты
  const corrected = correctRectangleAngles({ x: rx1, y: ry1, x2: rx2, y2: ry2 });

  // если стороны перевернулись, нужно «переключить» текущий угол
  if (this.resizingCorner) {
    const flippedX = rx1 > rx2;
    const flippedY = ry1 > ry2;

    if (flippedX && flippedY) {
      // полностью зеркально
      if (this.resizingCorner === "LEFT_TOP") this.resizingCorner = "RIGHT_BOTTOM";
      else if (this.resizingCorner === "RIGHT_BOTTOM") this.resizingCorner = "LEFT_TOP";
      else if (this.resizingCorner === "RIGHT_TOP") this.resizingCorner = "LEFT_BOTTOM";
      else if (this.resizingCorner === "LEFT_BOTTOM") this.resizingCorner = "RIGHT_TOP";
    } else if (flippedX) {
      // только по горизонтали
      if (this.resizingCorner === "LEFT_TOP") this.resizingCorner = "RIGHT_TOP";
      else if (this.resizingCorner === "RIGHT_TOP") this.resizingCorner = "LEFT_TOP";
      else if (this.resizingCorner === "LEFT_BOTTOM") this.resizingCorner = "RIGHT_BOTTOM";
      else if (this.resizingCorner === "RIGHT_BOTTOM") this.resizingCorner = "LEFT_BOTTOM";
    } else if (flippedY) {
      // только по вертикали
      if (this.resizingCorner === "LEFT_TOP") this.resizingCorner = "LEFT_BOTTOM";
      else if (this.resizingCorner === "LEFT_BOTTOM") this.resizingCorner = "LEFT_TOP";
      else if (this.resizingCorner === "RIGHT_TOP") this.resizingCorner = "RIGHT_BOTTOM";
      else if (this.resizingCorner === "RIGHT_BOTTOM") this.resizingCorner = "RIGHT_TOP";
    }
  }

  // обновляем selectRect
  this.selectRect = corrected;

  // обновляем выбранные элементы
  this.selectedItems.forEach(item => {
    let { x, y, x2, y2 } = item.data;
    // вычисляем относительное смещение для этого угла
    if (this.resizingCorner === "LEFT_TOP") {
      x += dx;
      y += dy;
    } else if (this.resizingCorner === "RIGHT_TOP") {
      x2 += dx;
      y += dy;
    } else if (this.resizingCorner === "LEFT_BOTTOM") {
      x += dx;
      y2 += dy;
    } else if (this.resizingCorner === "RIGHT_BOTTOM") {
      x2 += dx;
      y2 += dy;
    }
    item.data = correctRectangleAngles({ x, y, x2, y2 });
  });

  // обновляем позицию мыши
  this.mouseStart = { x, y };
};


  moveDraggedItems = (x:number, y:number) => {
    if(this.isCursorInsideSelection && this.mouseStart && this.selectRect) {
        const dx = x - this.mouseStart.x;
        const dy = y - this.mouseStart.y;

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



            //-------------- Связано с инструментом кисть
            // Если это нарисованный элемент — двигаем все точки
            if (Array.isArray(item.data.dots)) {
              item.data.dots = item.data.dots.map(dot => ({
                x: dot.x + dx,
                y: dot.y + dy,
              }));
            }
            //-------------- Связано с инструментом кисть
         });

        // Сохраняем текущую позицию как новую стартовую
        this.mouseStart = { x, y };
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


// Чекаем попадает ли курсов внутрь фигуры
function isCursorInsideRect(cursorX: number, cursorY: number, rect: SelectRect): boolean {
  return cursorX >= rect.x && cursorX <= rect.x2 && cursorY >= rect.y && cursorY <= rect.y2;
}


// Меняем курсор в зависимости от того какую сторону тянем
function changeCursorByResizeCorner(corner:SelectedCorner) {
    console.log(corner)
    if(corner === "LEFT_BOTTOM" || corner === "RIGHT_TOP") {
      document.body.style.cursor = "ne-resize"
      return
    }
    if(corner === "LEFT_TOP" || corner === "RIGHT_BOTTOM") {
       document.body.style.cursor = "nw-resize"
       return
    }
    document.body.style.cursor = "default"
}



// Детектит наведение на кружки по углам при выделении фигуры
type SelectedCorner = "LEFT_TOP" | "RIGHT_TOP" | "LEFT_BOTTOM" | "RIGHT_BOTTOM" | ""

function isCursorOnPoint(cursorX: number, cursorY: number, rect: SelectRect): SelectedCorner{
  const maxArea = 15

  const isUpperSide = rect.y - cursorY > 0 && rect.y - cursorY < maxArea
  const isBottomPoint = cursorY - rect.y2 > 0 && cursorY - rect.y2 < maxArea

  const isLeftSide = rect.x - cursorX > 0 && rect.x - cursorX < maxArea
  const isRightSide = cursorX - rect.x2 > 0 && cursorX - rect.x2 < maxArea
  

  let type = ""

  if(isLeftSide && isBottomPoint) type = "LEFT_BOTTOM"
  if(isLeftSide && isUpperSide)  type = "LEFT_TOP"
  if(isRightSide && isBottomPoint) type = "RIGHT_BOTTOM"
  if(isRightSide && isUpperSide) type = "RIGHT_TOP"

  return type as SelectedCorner
}

