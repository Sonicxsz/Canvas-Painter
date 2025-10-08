import { BaseTool, Tool } from "./Core/Tool";



export class Cursor extends BaseTool {
    constructor(config: Tool){
        super(config)
        this.listen()
    }
    x = 0;
    y = 0;

    canvasStyle = this.getCurrentCanvasStyles()
    
    mouseDown = false

    listen(){
        this.canvas.onmousedown = this.mouseDownHandler.bind(this)
        this.canvas.onmouseup = this.mouseUpHandler.bind(this)
        this.canvas.onmousemove = this.mouseMoveHandler.bind(this)
    }

    mouseUpHandler(e:MouseEvent) {
        this.mouseDown = false
        this.clearCanvas()
        this.setCanvasStyles(this.canvasStyle)
        const position = this.getMousePos(e)
        
        this.getNode(this.x,this.y, position.x, position.y)

    }

    mouseDownHandler(e:MouseEvent) {
            this.mouseDown = true
            this.ctx.beginPath()
            const position = this.getMousePos(e)

            this.x = position.x
            this.y = position.y
    }



    mouseMoveHandler (e:MouseEvent) {
        if (!this.mouseDown) return;

        const position = this.getMousePos(e)

        const width = position.x - this.x;
        const height = position.y - this.y;

       this.clearCanvas()
       this.draw({x: this.x, y:this.y, width, height})
    }

    // Рисуем текущий прямоугольник поверх
    draw(params: {x: number, y:number, width: number, height: number}) {
        const { x, y, width, height} = params

        this.ctx.beginPath();
        this.strokeColor =  "#4086f7"
        this.fillColor = "#4086f766"
        this.ctx.rect(x, y, width, height);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath()
    }

}