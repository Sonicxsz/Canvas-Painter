export interface ItemStyles {
    fillStyle: string | CanvasGradient | CanvasPattern,
    strokeStyle: string | CanvasGradient | CanvasPattern,
    lineWidth: number,
    lineCap:CanvasLineCap,
}

export interface SerializableItem {
  id: string;
  name: string;
  styles: ItemStyles;
  data: ItemBaseInfo;
}


export interface ItemBaseInfo extends Point {
  x2: number
  y2: number
}


export interface Point {
  x: number;
  y: number;
}

export interface DrawableItem extends SerializableItem{
  draw(ctx: CanvasRenderingContext2D): void;
}
