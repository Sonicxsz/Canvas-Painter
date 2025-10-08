import simplify from "simplify-js";
import { BaseTool, Tool } from "./Core/Tool";
import type { DrawableItem, ItemStyles, Point } from "./Core.t";



export class BrushItem implements DrawableItem{
    id: string;
    styles: ItemStyles;
    data: {
        dots: Point[],
        x: number,
        y: number,
        x2: number,
        y2: number
    };
    name = "BrushItem";

    constructor(id: string, points: Point[], styles: ItemStyles){
        this.id = id;
        const square =  this.getMaxAndMinPoints(points)

        this.data = {
            dots: points,
            ...square
        };
        this.styles = styles;
    }


    getMaxAndMinPoints(points: Point[]): {
        x: number;
        y: number;
        x2: number;
        y2: number;
    } {
       const square =  {x:points[0].x,y:points[0].y,x2:points[0].x,y2:points[0].y}

        points.forEach(el => {
             if(el.x < square.x) square.x = el.x
             if(el.y < square.y) square.y = el.y

            if(el.x > square.x2 ) square.x2 = el.x
            if(el.y > square.y2 ) square.y2 = el.y 
        })

        return square
    }

    draw = (ctx: CanvasRenderingContext2D) => drawBrush(ctx, this.data.dots)
}






export class BrushTool extends BaseTool {
    constructor(config: Tool){
        super(config)
        this.listen()
    }

    x = 0;
    y = 0;
    memory:{x:number, y:number}[] = []
    mouseDown = false

    listen() {
            this.canvas.onmousedown = this.mouseDownHandler.bind(this)
            this.canvas.onmouseup = this.mouseUpHandler.bind(this)
            this.canvas.onmousemove = this.mouseMoveHandler.bind(this)
    }

    mouseUpHandler() {
        this.mouseDown = false
        this.memory.push({x:this.x, y:this.y})
            const simplified = simplify(this.memory, 0.8, true);
            this.memory = simplified;
            const item = new BrushItem(this.generateId(), this.memory, this.getCurrentCanvasStyles())

            this.addItem(item)
            

            this.memory = []
            this.clearCanvas()
    }

    mouseDownHandler(e:MouseEvent) {
        this.mouseDown = true
        this.ctx?.beginPath()
        const position = this.getMousePos(e)

        this.ctx?.moveTo(position.x, position.y)
    }


    mouseMoveHandler(e:MouseEvent) {
        if(this.mouseDown){
            const position = this.getMousePos(e)
             this.x = position.x
             this.y = position.y

            const last = this.memory[this.memory.length - 1];

            if (!last || Math.hypot(this.x - last.x, this.y - last.y) > 2) {
                this.memory.push({ x: this.x, y: this.y });
            }
            this.draw()
        }
    }

    draw = () => drawBrush(this.ctx, this.memory)
}


// Рисовалка по точкам
function drawBrush(ctx: CanvasRenderingContext2D, points: Point[]): void {
    if (points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length - 2; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }

        const penultimate = points[points.length - 2];
        const last = points[points.length - 1];
        ctx.quadraticCurveTo(penultimate.x, penultimate.y, last.x, last.y);

        ctx.stroke();
        ctx.closePath();
}