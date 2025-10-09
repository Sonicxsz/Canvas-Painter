import { getMousePosition } from "../../lib/utils"
import type { DrawableItem, CanvasStyles } from "../Core.t"

interface Actions {
    addItem: (item:DrawableItem) => void
    select:(x:number, y:number, x2:number, y2:number) => DrawableItem | null
    clearEditCanvas:() => void
}


export class Tool {
    protected actions: Actions
    protected ctx:CanvasRenderingContext2D
    protected canvas: HTMLCanvasElement
    protected styles: CanvasStyles


    constructor(canvas: HTMLCanvasElement, actions: Actions) {
        const ctx = canvas.getContext("2d")
        this.canvas = canvas
        
        if(!ctx) {
            throw new Error("Cannot get context")
        }
        this.ctx = ctx
        this.actions = actions

        this.styles = {
            fillStyle: this.ctx.fillStyle,
            strokeStyle: this.ctx.strokeStyle,
            lineCap: this.ctx.lineCap,
            lineWidth: this.ctx.lineWidth,
        }
    }


    addItem(item:DrawableItem){
        return this.actions.addItem(item)
    }

    getCanvas() {
        return this.canvas
    }

    getContext() {
        return this.ctx
    }

    select(x:number, y:number, x2:number, y2:number){
        return this.actions.select(x,y, x2, y2)
    }

    setStyles(styles: Partial<CanvasStyles>) {
        this.ctx.fillStyle = styles.fillStyle || this.ctx.fillStyle
        this.ctx.strokeStyle = styles.strokeStyle || this.ctx.strokeStyle
        this.ctx.lineCap = styles.lineCap || this.ctx.lineCap
        this.ctx.lineWidth = styles.lineWidth || this.ctx.lineWidth
        this.styles = {...this.styles, ...styles}
    }

    onToolChange = () => {
        this.actions.clearEditCanvas()
        if(this.styles){
            this.setStyles(this.styles)
        }
        
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
        this.config.onToolChange()
    }


    addItem(item:any) {
        this.config.addItem(item)
    }

    clearCanvas(){
        this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height)
    }

    getMousePos = (e: MouseEvent) =>  getMousePosition(e)

    getCurrentCanvasStyles():CanvasStyles{
        return {
            fillStyle: this.ctx.fillStyle,
            lineCap: this.ctx.lineCap,
            lineWidth: this.ctx.lineWidth,
            strokeStyle: this.ctx.strokeStyle
        }
    }

    setCanvasStyles(styles:Partial<CanvasStyles>): void {
        this.ctx.fillStyle = styles.fillStyle || this.ctx.fillStyle
        this.ctx.lineCap = styles.lineCap || this.ctx.lineCap
        this.ctx.lineWidth = styles.lineWidth || this.ctx.lineWidth
        this.ctx.strokeStyle = styles.strokeStyle || this.ctx.strokeStyle
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

    selectByCoords(x:number, y:number, x2:number, y2:number){
        return this.config.select(x,y,x2, y2)
    }
}
