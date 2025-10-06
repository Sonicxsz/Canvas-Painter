import { BaseTool, Tool } from "./Core/Tool";



export class Cursor extends BaseTool {
    constructor(config: Tool){
        super(config)
        this.listen()
    }

    x = 0;
    y = 0;
    
    mouseDown = false
    saved = ""

    listen(){
        this.canvas.onmousedown = this.mouseDownHandler.bind(this)
        this.canvas.onmouseup = this.mouseUpHandler.bind(this)
        this.canvas.onmousemove = this.mouseMoveHandler.bind(this)
    }

    mouseUpHandler() {
        this.mouseDown = false
        this.clearCanvas()
    }

    mouseDownHandler(e:MouseEvent) {
            this.mouseDown = true
            this.ctx.beginPath()


            const target = e.target as HTMLElement;

            this.x = e.pageX - target.offsetLeft
            this.y = e.pageY - target.offsetTop

            this.saved = this.canvas.toDataURL()

            console.log(this.getNode(this.x,this.y))
    }



    mouseMoveHandler (e:MouseEvent) {
        if (!this.mouseDown) return;
        const target = e.target as HTMLElement;

        let currentX = e.pageX - target.offsetLeft;
        let currentY = e.pageY - target.offsetTop;

        const width = currentX - this.x;
        const height = currentY - this.y;

        
       this.clearCanvas()

       this.draw({x: this.x, y:this.y, width, height})
    }

    // рисуем текущий прямоугольник поверх
    draw(params: {x: number, y:number, width: number, height: number}) {
        const { x, y, width, height} = params

        this.ctx.beginPath();

        this.strokeColor = "#6BE8B2"
        this.fillColor = "#6be8b27f"

        this.ctx.rect(x, y, width, height);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath()
    }

}