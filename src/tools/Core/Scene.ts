import type { DrawableItem } from "../Core.t";



interface Config {
    renderer: (items: Map<string, DrawableItem>, selected:  Map<string, DrawableItem>) => void
}


export class SceneManager {
  private items: Map<string, DrawableItem> = new Map();
  private selected:  Map<string, DrawableItem> = new Map();


  private config: Config

  constructor(config: Config){
    this.config = config
  }

  addItem = (item: DrawableItem) => {
    this.items.set(item.id, item);
    this.rerender()
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
  getNode = (initialX: number, initialY: number, endX:number, endY: number): DrawableItem | null => {
    const selX1 = Math.min(initialX, endX);
    const selY1 = Math.min(initialY, endY);
    const selX2 = Math.max(initialX, endX);
    const selY2 = Math.max(initialY, endY);


    // Если уже что-то лежит в selected 
    // Перекидываем обратно в items
     if(this.selected.size) {
          this.deselectItems()
          this.rerender()
      }

    for (const el of this.items.values()) {
      const { x, y, x2, y2 } = el.data;
    
      if (rectsIntersect(x, y, x2, y2, selX1, selY1, selX2, selY2)) {
        this.selected.set(el.id, el)
        this.items.delete(el.id)
        this.rerender()
        return el
      }
    }

    return null;
};


  deselectItems(){
    this.selected.forEach(el => {
      this.items.set(el.id, el)
    })
    this.selected.clear()
  }

  rerender = () => {
    this.config.renderer(this.items,this.selected)
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