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
        const firstPoint = points[0]
        const lastPoint = points.at(-1) || firstPoint



        this.data = {
            dots: points,
            x: firstPoint.x,
            y: firstPoint.y,
            x2: lastPoint.x,
            y2: lastPoint.y

        };
        this.styles = styles;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.data.dots.length < 2) return;
        const points = this.data.dots
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


        const target = e.target as HTMLElement;
        //TODO изучить
        this.ctx?.moveTo(e.pageX - target.offsetLeft, e.pageY - target.offsetTop)
    }


    mouseMoveHandler(e:MouseEvent) {
        if(this.mouseDown){
            const target = e.target as HTMLElement;
             this.x = e.pageX - target.offsetLeft
             this.y = e.pageY - target.offsetTop

            const last = this.memory[this.memory.length - 1];

            if (!last || Math.hypot(this.x - last.x, this.y - last.y) > 2) {
                this.memory.push({ x: this.x, y: this.y });
            }
            this.draw()
        }
    }

    draw() {

        if (this.memory.length < 2) return;
        const points = this.memory
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length - 2; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            this.ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }

        const penultimate = points[points.length - 2];
        const last = points[points.length - 1];
        this.ctx.quadraticCurveTo(penultimate.x, penultimate.y, last.x, last.y);

        this.ctx.stroke();
        this.ctx.closePath();
    }
   

}