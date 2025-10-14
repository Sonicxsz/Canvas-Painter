export interface CanvasStyles {
    fillStyle: string | CanvasGradient | CanvasPattern,
    strokeStyle: string | CanvasGradient | CanvasPattern,
    lineWidth: number,
    lineCap:CanvasLineCap,
}

export interface SerializableItem {
  id: string;
  name: string;
  styles: CanvasStyles;
  data: ItemBaseInfo;
}


export interface ItemBaseInfo extends Point {
  x2: number
  y2: number
  dots?: Point[]
}


export interface Point {
  x: number;
  y: number;
}

export interface DrawableItem extends SerializableItem{
  draw(ctx: CanvasRenderingContext2D): void;
}

export interface Port {
  id: string;
  x: number;
  y: number;
  type: "input" | "output";
}

export interface Node extends DrawableItem {
  data: ItemBaseInfo & {
    ports: Port[];
  };
}

export interface Edge {
  id: string;
  from: { nodeId: string; portId: string };
  to: { nodeId: string; portId: string };
}