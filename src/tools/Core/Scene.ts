import type { DrawableItem } from "../Core.t";



interface Config {
    renderer: (items: Map<string, DrawableItem>) => void
}


export class SceneManager {
  private items: Map<string, DrawableItem> = new Map();
  private selected: string = ""


  private config: Config

  constructor(config: Config){
    this.config = config
  }

  addItem = (item: DrawableItem) => {
    console.log(this.items)
    this.items.set(item.id, item);
    this.config.renderer(this.items)
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


  // По координатам клика ищем item 
  getNode = (targetX: number, targetY: number): DrawableItem | null => {
    for (const el of this.items.values()) {
      const { x, y, x2, y2 } = el.data;
      if (x <= targetX && y <= targetY && x2 >= targetX && y2 >= targetY) {
        return el; 
      } 
    }
    return null;
}

  rerender = () => {
    this.config.renderer(this.items)
  }

}