import type { DrawableItem, CanvasStyles } from "./Core.t";
import { BaseTool, Tool} from "./Core/Tool";


interface LineData {
        x: number;
        y: number;
        x2: number;
        y2: number;
}

// ===== Line Item =====
export class LineItem implements DrawableItem {
    id: string;
    name = "LineItem";
    data: LineData
    styles: CanvasStyles;

    constructor(id: string, x: number, y: number, x2: number, y2: number, styles: CanvasStyles) {
        this.id = id;
        this.data = {
            x,
            y,
            x2,
            y2,
        }
        this.styles = styles;
    }

    draw = (ctx: CanvasRenderingContext2D) => drawLine(ctx, this.data)
}





// ===== Line Tool =====
export class LineTool extends BaseTool {
    mouseDown = false;
    data = {
        x:0,
        y:0,
        x2:0,
        y2:0
    }

    reset() {
        this.data = {
            x:0,
            y:0,
            x2:0,
            y2:0
        }
    }


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
        const position = this.getMousePos(e)
        this.data.x = position.x;
        this.data.y = position.y;
    }

    mouseUpHandler() {
        this.mouseDown = false;
        if(!this.data.x2 && !this.data.y2) return;


        const item = new LineItem(
            this.generateId(),
            this.data.x,
            this.data.y,
            this.data.x2,
            this.data.y2,
            this.getCurrentCanvasStyles()
        );

        this.addItem(item);
        this.clearCanvas();
        this.reset()
    }

    mouseMoveHandler(e: MouseEvent) {
        if (!this.mouseDown) return;
        const position = this.getMousePos(e)

        this.data.x2 = position.x;
        this.data.y2 = position.y;


        this.clearCanvas();
        this.draw();
    }

    draw = () => drawLine(this.ctx, this.data)
}


function drawLine(ctx: CanvasRenderingContext2D, data: LineData) {
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
        ctx.lineTo(data.x2, data.y2);
        ctx.stroke();
        ctx.closePath();
}