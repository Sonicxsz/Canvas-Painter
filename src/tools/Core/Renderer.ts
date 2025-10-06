import type { DrawableItem, ItemStyles } from "../Core.t";

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D context not supported');
    this.ctx = ctx;
  }

  

  applyStyles(styles: ItemStyles): void {
    this.ctx.fillStyle = styles.fillStyle;
    this.ctx.strokeStyle = styles.strokeStyle;
    this.ctx.lineWidth = styles.lineWidth;
    this.ctx.lineCap = styles.lineCap;
  }

  render = (items: Map<string, DrawableItem>) => {
    this.clear();
    items.forEach(item => {
      this.applyStyles(item.styles);
      item.draw(this.ctx);
    });
  }

  clear = (): void => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}