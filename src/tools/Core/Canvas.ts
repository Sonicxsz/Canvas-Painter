import { Renderer } from "./Renderer"
import { SceneManager } from "./Scene"
import { Tool } from "./Tool"



export class CanvasApp {
    renderCanvas: HTMLCanvasElement
    paintCanvas: HTMLCanvasElement
    controllCanvas:HTMLCanvasElement

    protected renderer: Renderer
    tool: Tool
    scene: SceneManager



    constructor(renderCanvas: HTMLCanvasElement, paintCanvas:HTMLCanvasElement, controllCanvas:HTMLCanvasElement){
        this.renderCanvas = renderCanvas;
        this.paintCanvas = paintCanvas;
        this.controllCanvas = controllCanvas;


        this.renderer = new Renderer(this.renderCanvas)

        this.scene = new SceneManager({
            renderer: this.renderer.render
        })

        this.tool = new Tool(this.paintCanvas, {
            addItem: this.scene.addItem,
            getNode: this.scene.getNode
        })  
    }


}