import type { DrawableItem, CanvasStyles } from "./Core.t";
import { BaseTool, Tool } from "./Core/Tool";

// ===== Rect Item =====
export class RectItem implements DrawableItem {
    id: string;
    name = "RectItem";
    data: {
        x: number;
        y: number;
        x2:number;
        y2:number;
        width: number;
        height: number;
    }
    styles: CanvasStyles;

    constructor({id,height,styles,width,x,y,y2,x2}:{id: string, x: number, y: number,x2:number,y2:number, width: number, height: number, styles: CanvasStyles}) {
        this.id = id;
        this.data = {
            x,
            y,
            width,
            height,
            y2,
            x2
        }
        this.styles = styles;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.rect(this.data.x, this.data.y, this.data.width, this.data.height);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
}


// ===== Rect Tool =====
export class RectTool extends BaseTool {
    mouseDown = false;

    data = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };

    clear(){
        this.data = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
        }
    }

    constructor(config:Tool) {
        super(config);
        this.listen();
    }

    listen() {
        this.canvas.onmousedown = this.mouseDownHandler.bind(this);
        this.canvas.onmouseup = this.mouseUpHandler.bind(this);
        this.canvas.onmousemove = this.mouseMoveHandler.bind(this);
    }

    mouseDownHandler(e: MouseEvent) {
        this.mouseDown = true;
        const position = this.getMousePos(e)

        this.data.x = position.x;
        this.data.y = position.y;
    }

    mouseMoveHandler(e: MouseEvent) {
        if (!this.mouseDown) return;

        const position = this.getMousePos(e)

        this.data.width = position.x - this.data.x;
        this.data.height = position.y - this.data.y;

        this.clearCanvas();
        this.drawPreview(this.ctx, this.data);
    }

    mouseUpHandler(e: MouseEvent) {
        this.mouseDown = false;
        if(!this.data.width || !this.data.height) return

        
        const position = this.getMousePos(e)

        const item = new RectItem(
           {
            id:this.generateId(),
            x:this.data.x,
            y:this.data.y,
            x2:position.x,
            y2:position.y,
            width:this.data.width,
            height:this.data.height,
            styles:this.getCurrentCanvasStyles()
           }
        );

        this.addItem(item);
        this.clearCanvas();
        this.clear();
    }

    drawPreview(ctx: CanvasRenderingContext2D, data: { x: number; y: number; width: number; height: number }) {
        ctx.beginPath();
        ctx.rect(data.x, data.y, data.width, data.height);
        ctx.stroke();
        ctx.closePath();
    }
}
