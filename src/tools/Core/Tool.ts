import type { DrawableItem, ItemStyles, Point } from "../Core.t"

interface Config {
    addItem: (item:DrawableItem) => void
    getNode:(x:number, y:number) => DrawableItem | null
}


export class Tool {
    protected config: Config
    protected ctx:CanvasRenderingContext2D
    protected canvas: HTMLCanvasElement

    constructor(canvas: HTMLCanvasElement, config: Config) {
        const ctx = canvas.getContext("2d")
        this.canvas = canvas
        
        if(!ctx) {
            throw new Error("Cannot get context")
        }
        this.ctx = ctx
        this.config = config
    }

    addItem(item:DrawableItem){
        return this.config.addItem(item)
    }

    getCanvas() {
        return this.canvas
    }

    getContext() {
        return this.ctx
    }

    getNode(x:number, y:number){
        return this.config.getNode(x,y)
    }

    setFillColor(color: string | CanvasGradient | CanvasPattern) {
        this.ctx.fillStyle = color
        return 
    }
}



export class BaseTool {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    config: Tool

    constructor(config: Tool) {
        this.canvas = config.getCanvas()
        this.ctx = config.getContext()
        this.config = config
    }

    set fillColor(color:string) {
        if(this.ctx) this.ctx.fillStyle = color
    }

    set strokeColor(color:string) {
        if(this.ctx) this.ctx.strokeStyle = color
    }

    set lineWidth(size:number){
        if(this.ctx) this.ctx.lineWidth = size
    }
    set lineCap(variant:CanvasLineCap){
        if(this.ctx) this.ctx.lineCap = variant
    }


    addItem(item:any) {
        this.config.addItem(item)
    }

    clearCanvas(){
        this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height)
    }

    getMousePos(e: MouseEvent): Point {
        const target = e.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        };
    }

    getCurrentCanvasStyles():ItemStyles{
        return {
            fillStyle: this.ctx.fillStyle,
            lineCap: this.ctx.lineCap,
            lineWidth: this.ctx.lineWidth,
            strokeStyle: this.ctx.strokeStyle
        }
    }

    destroyListeners() {
        if(this.canvas) {
            this.canvas.onmousemove = null
            this.canvas.onmouseup = null
            this.canvas.onmousedown = null
        }
    }

    generateId() {
        return `${Date.now()}_${Math.random()}`;
    }

    getNode(x:number, y:number){
        return this.config.getNode(x,y)
    }
}
