import type { DrawableItem, ItemStyles } from "./Core.t";
import { BaseTool, Tool } from "./Core/Tool";

interface CircleItemData extends CircleData {
    x2: number;
    y2: number;
}

interface CircleData{
    x: number;
    y: number;
    width: number;
    height: number;
}

export class CircleItem implements DrawableItem {
    id: string;
    name = "CircleItem";

    data:  CircleItemData 

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

    draw = (ctx: CanvasRenderingContext2D) => drawCircle(ctx, this.data)
}


export class CircleTool extends BaseTool {
    mouseDown = false;
    x = 0;
    y = 0;
    width = 0;
    height = 0;

    constructor(config: Tool) {
        super(config);
        this.listen();
    }

    reset() {
          this.x = 0;
          this.y = 0;
          this.width = 0;
          this.height = 0;
    }


    listen() {
        this.canvas.onmousedown = this.mouseDownHandler.bind(this);
        this.canvas.onmouseup = this.mouseUpHandler.bind(this);
        this.canvas.onmousemove = this.mouseMoveHandler.bind(this);
    }

    mouseDownHandler(e: MouseEvent) {
        this.mouseDown = true;
        const position = this.getMousePos(e)
        this.x = position.x
        this.y = position.y;
    }

    mouseUpHandler(e: MouseEvent) {
        this.mouseDown = false;
        if(!this.width || !this.height) return

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
        this.reset();
    }

    mouseMoveHandler(e: MouseEvent) {
        if (!this.mouseDown) return;
        const position = this.getMousePos(e)
        this.width = position.x;
        this.height = position.y;

        this.clearCanvas();
        this.draw();
    }

    draw = () =>  drawCircle(this.ctx, { x: this.x, y: this.y, width: this.width, height: this.height })
}



function drawCircle(ctx: CanvasRenderingContext2D, data:CircleData) {
    const centerX = (data.x + data.width) / 2;
    const centerY = (data.y + data.height) / 2;
    const dx = data.width - data.x;
    const dy = data.height - data.y;
    const radius = Math.sqrt(dx * dx + dy * dy) / 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}