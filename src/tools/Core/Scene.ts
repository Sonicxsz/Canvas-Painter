import type { DrawableItem } from "../Core.t";



interface Config {
    renderMainLayer: (items: Map<string, DrawableItem>) => void
    renderEditLayer: (items: Map<string, DrawableItem>) => void
    paintCanvas:HTMLCanvasElement
}


export class SceneManager {
  private items: Map<string, DrawableItem> = new Map();
  private selectedItems:  Map<string, DrawableItem> = new Map();
  private renderEditLayerLoopId: null | number = null;
  private config: Config

  constructor(config: Config){
    this.config = config
    this.listen()
  }
  
  listen() {
        this.config.paintCanvas.onmousedown = this.onMouseDown.bind(this);
        this.config.paintCanvas.onmouseup = this.onMouseUp.bind(this);
        this.config.paintCanvas.onmousemove = this.onMouseMove.bind(this);
  }

  onMouseMove = (e:MouseEvent) => {
    // console.log(e.target)
  }
  onMouseUp = (e:MouseEvent) => {
    // console.log(e.target)
  }
  onMouseDown = (e:MouseEvent) => {}


  addItem = (item: DrawableItem) => {
    this.items.set(item.id, item);
    this.rerender()
  }

  selectItem = (item: DrawableItem) => {
      this.selectedItems.set(item.id, item)

      // Выкидываем из обычного рендера
      this.items.delete(item.id)
      this.rerender()
      this.renderOnSelect()
  }

  removeItem = (id: string) => {
    this.items.delete(id);
  }

  getItem = (id: string): DrawableItem | undefined =>  {
    return this.items.get(id);
  }

  getAllItems = (): DrawableItem[] => {
    return Array.from(this.items.values());
  }


  // По координатам клика ищем 
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

    for (const el of this.items.values()) {
      const { x, y, x2, y2 } = el.data;
    
      if (rectsIntersect(x, y, x2, y2, selX1, selY1, selX2, selY2)) {
        this.selectItem(el)
        return el
      }
    }

    return null;
};


  deselectItems = () => {
    this.selectedItems.forEach(el => {
      this.items.set(el.id, el)
    })
    this.rerender()
    this.selectedItems.clear()
  }

  rerender = () => {
    this.config.renderMainLayer(this.items)
  }

  renderOnSelect = () => {
    if(!this.selectedItems.size) return;

    const loop = () => {
      this.config.renderEditLayer(this.selectedItems)
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