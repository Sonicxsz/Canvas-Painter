import type { DrawableItem, ItemStyles } from "./Core.t";
import { BaseTool, type ToolConfig } from "./Core/Tool";

// ===== Line Item =====
export class LineItem implements DrawableItem {
    id: string;
    name = "LineItem";
    data: {
        x: number;
        y: number;
        x2: number;
        y2: number;
    }
    styles: ItemStyles;

    constructor(id: string, x: number, y: number, x2: number, y2: number, styles: ItemStyles) {
        this.id = id;
        this.data = {
            x,
            y,
            x2,
            y2,
        }
        this.styles = styles;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.moveTo(this.data.x, this.data.y);
        ctx.lineTo(this.data.x2, this.data.y2);
        ctx.stroke();
        ctx.closePath();
    }
}


// ===== Line Tool =====
export class LineTool extends BaseTool {
    mouseDown = false;
    startX = 0;
    startY = 0;
    x = 0;
    y = 0;
    saved = "";

    constructor(config: ToolConfig) {
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
        this.startX = e.pageX - target.offsetLeft;
        this.startY = e.pageY - target.offsetTop;
        this.saved = this.canvas.toDataURL();
    }

    mouseUpHandler() {
        this.mouseDown = false;

        const item = new LineItem(
            this.generateId(),
            this.startX,
            this.startY,
            this.x,
            this.y,
            this.getCurrentCanvasStyles()
        );

        this.addItem(item);
        this.clearCanvas();
    }

    mouseMoveHandler(e: MouseEvent) {
        if (!this.mouseDown) return;

        const target = e.target as HTMLElement;
        this.x = e.pageX - target.offsetLeft;
        this.y = e.pageY - target.offsetTop;


        this.clearCanvas();
        this.drawPreview(this.ctx, { x1: this.startX, y1: this.startY, x2: this.x, y2: this.y });
    }

    drawPreview(ctx: CanvasRenderingContext2D, params: { x1: number; y1: number; x2: number; y2: number }) {
        const { x1, y1, x2, y2 } = params;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
    }
}
