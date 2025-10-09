import type { CanvasStyles, DrawableItem} from "../Core.t";


interface CanvasType  {
   type: "Main" | "Paint"
   canvas: HTMLCanvasElement;
   ctx: CanvasRenderingContext2D
}


export class Renderer {
  private mainCanvas: CanvasType
  private editCanvas: CanvasType



  constructor(mainCanvas: HTMLCanvasElement, paintCanvas: HTMLCanvasElement) {
    const ctxMain = mainCanvas.getContext('2d')
    const ctxPaint = paintCanvas.getContext('2d')
    
    if (!ctxMain || !ctxPaint) throw new Error('2D context not supported');
    
    this.mainCanvas = {
      type: "Main",
      canvas: mainCanvas,
      ctx: ctxMain
    };

    this.editCanvas = {
      type: "Paint",
      canvas: paintCanvas,
      ctx: ctxPaint,
    }
  }

  applyStyles(layer: CanvasType, styles: CanvasStyles): void {
    layer.ctx.fillStyle = styles.fillStyle;
    layer.ctx.strokeStyle = styles.strokeStyle;
    layer.ctx.lineWidth = styles.lineWidth;
    layer.ctx.lineCap = styles.lineCap;
  }

  renderMainLayer = (items: Map<string, DrawableItem>, ) => {
    this.clear(this.mainCanvas);
    items.forEach(item => {
      this.applyStyles(this.mainCanvas, item.styles);
      item.draw(this.mainCanvas.ctx);
    });
  }


  renderEditLayer = (items: Map<string, DrawableItem>) => {
    this.clear(this.editCanvas);
    if(!items.size)  return;

    items.forEach(item => {
      this.applyStyles(this.editCanvas, item.styles);
      item.draw(this.editCanvas.ctx);
      this.selectItem(item)
    });
  }

  selectItem(item: DrawableItem) {
    const margin = 0  

    const x = item.data.x - margin
    const y = item.data.y - margin
    const w = item.data.x2 - x + margin
    const h = item.data.y2 - y + margin
    this.editCanvas.ctx.beginPath()

    this.editCanvas.ctx.strokeStyle = "#4086f7"
    this.editCanvas.ctx.fillStyle = "transparent"
    this.editCanvas.ctx.lineWidth = 2
    this.editCanvas.ctx.rect(x, y, w, h)
    this.editCanvas.ctx.stroke()

    this.renderCircles(item)

  }

  // Рисует круги в углах выделения
  renderCircles(item: DrawableItem){
    const radius = 5;
    const endEngle = 2 * Math.PI

    const {x, y, x2, y2} = item.data
    const extraMarginSize = 5
    
    // Левый верхний
    this.editCanvas.ctx.beginPath();
    this.editCanvas.ctx.arc(x - extraMarginSize , y - extraMarginSize, radius, 0, endEngle);
    this.editCanvas.ctx.stroke();
    this.editCanvas.ctx.closePath();

    // Правый верхний
    this.editCanvas.ctx.beginPath();
      this.editCanvas.ctx.arc(x2 + extraMarginSize, y - extraMarginSize, radius, 0, endEngle);
      this.editCanvas.ctx.stroke();
    this.editCanvas.ctx.closePath(); 

    // Левый нижний
    this.editCanvas.ctx.beginPath();
      this.editCanvas.ctx.arc(x - extraMarginSize, y2 + extraMarginSize, radius, 0, endEngle);
      this.editCanvas.ctx.stroke();
    this.editCanvas.ctx.closePath(); 

    // Правый нижний
    this.editCanvas.ctx.beginPath();
      this.editCanvas.ctx.arc(x2 + extraMarginSize, y2 + extraMarginSize, radius, 0, endEngle);
      this.editCanvas.ctx.stroke();
    this.editCanvas.ctx.closePath();
  }

  clear = (layer: CanvasType): void => {
    layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
  }
}