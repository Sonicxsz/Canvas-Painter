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

  render = (items: Map<string, DrawableItem>, selected: Map<string, DrawableItem>) => {
    this.clear();
    items.forEach(item => {
      this.applyStyles(item.styles);
      item.draw(this.ctx);
    });

    selected.forEach(item => {
      this.applyStyles(item.styles);
      item.draw(this.ctx);
      
      this.selectItem(item)
    });
  }

  selectItem(item: DrawableItem) {
    const x = item.data.x - 5
    const y = item.data.y - 5
    const w = item.data.x2 - x + 5
    const h = item.data.y2 - y + 5

    this.ctx.beginPath()
    // TODO вынести цвет селекта в конфигурацию
    this.ctx.strokeStyle = "#4086f7"
    this.ctx.fillStyle = "transparent"
    this.ctx.rect(x, y, w, h)
    this.ctx.stroke()

    this.renderCircles(item)
  }

  // Рисует круги в углах выделения
  renderCircles(item: DrawableItem){
    const radius = 5;
    const endEngle = 2 * Math.PI

    const {x, y, x2, y2} = item.data
    const extraSize = 10
    
    // Левый верхний
    this.ctx.beginPath();
    this.ctx.arc(x - extraSize , y - extraSize, radius, 0, endEngle);
    this.ctx.stroke();
    this.ctx.closePath();

    // Правый верхний
    this.ctx.beginPath();
      this.ctx.arc(x2 + extraSize, y - extraSize, radius, 0, endEngle);
      this.ctx.stroke();
    this.ctx.closePath(); 

    // Левый нижний
    this.ctx.beginPath();
      this.ctx.arc(x - extraSize, y2 + extraSize, radius, 0, endEngle);
      this.ctx.stroke();
    this.ctx.closePath(); 

    // Правый нижний
    this.ctx.beginPath();
      this.ctx.arc(x2 + extraSize, y2 + extraSize, radius, 0, endEngle);
      this.ctx.stroke();
    this.ctx.closePath();
  }

  clear = (): void => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}