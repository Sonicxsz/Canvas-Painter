import { Renderer } from "./Renderer"
import { SceneManager } from "./Scene"
import { Tool } from "./Tool"



export class CanvasApp {
    renderCanvas: HTMLCanvasElement
    paintCanvas: HTMLCanvasElement

    protected renderer: Renderer
    tool: Tool
    sceneManager: SceneManager



    constructor(renderCanvas: HTMLCanvasElement, paintCanvas:HTMLCanvasElement){
        this.renderCanvas = renderCanvas;
        this.paintCanvas = paintCanvas;


        this.renderer = new Renderer(this.renderCanvas)

        this.sceneManager = new SceneManager({
            renderer: this.renderer.render
        })

        this.tool = new Tool(this.paintCanvas, {
            addItem: this.sceneManager.addItem,
            getNode: this.sceneManager.getNode
        })  
    }


}