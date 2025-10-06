import type { DrawableItem, ItemStyles } from "./Core.t";
import { BaseTool, Tool } from "./Core/Tool";

export class CircleItem implements DrawableItem {
    id: string;
    name = "CircleItem";

    data: {
        x: number;
        y: number;
        x2: number;
        y2: number;
        width: number;
        height: number;
    } 

    styles: ItemStyles;

    constructor(data:{id: string, x: number, y: number,x2: number, y2: number, width: number, height: number, styles: ItemStyles}) {
        this.id = data.id;
        this.data = {
            x:data.x,
            x2:data.x2,
            y:data.y,
            y2:data.y2,
            height: data.height,
            width:data.width
        }
        this.styles = data.styles;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const centerX = (this.data.x + this.data.width) / 2;
        const centerY = (this.data.y + this.data.height) / 2;
        const dx = this.data.width - this.data.x;
        const dy = this.data.height - this.data.y;
        const radius = Math.sqrt(dx * dx + dy * dy) / 2;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
}


export class CircleTool extends BaseTool {
    mouseDown = false;
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    saved = "";

    constructor(config: Tool) {
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
        const target = e.target as HTMLElement;
        this.x = e.pageX - target.offsetLeft;
        this.y = e.pageY - target.offsetTop;
        this.saved = this.canvas.toDataURL();
    }

    mouseUpHandler(e: MouseEvent) {
        this.mouseDown = false;


         const position = this.getMousePos(e)


        const item = new CircleItem({
            
            id:this.generateId(),
            x:this.x,
            y:this.y,
            x2:position.x,
            y2: position.y,
            width:this.width,
            height:this.height,
            styles:this.getCurrentCanvasStyles()
        
        });

        this.addItem(item);
        this.clearCanvas();
    }

    mouseMoveHandler(e: MouseEvent) {
        if (!this.mouseDown) return;

        const target = e.target as HTMLElement;
        this.width = e.pageX - target.offsetLeft;
        this.height = e.pageY - target.offsetTop;

        this.clearCanvas();
        this.drawPreview(this.ctx, { x: this.x, y: this.y, width: this.width, height: this.height });
    }

    drawPreview(ctx: CanvasRenderingContext2D, params: { x: number; y: number; width: number; height: number }) {
        const { x, y, width, height } = params;
        const centerX = (x + width) / 2;
        const centerY = (y + height) / 2;
        const dx = width - x;
        const dy = height - y;
        const radius = Math.sqrt(dx * dx + dy * dy) / 2;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
    }
}
