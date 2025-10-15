import { Renderer } from "./Renderer"
import { SceneManager } from "./Scene"
import { Tool } from "./Tool"



export class CanvasApp {
    renderCanvas: HTMLCanvasElement
    paintCanvas: HTMLCanvasElement
    editCanvas:HTMLCanvasElement

    protected renderer: Renderer
    tool: Tool
    scene: SceneManager



    constructor(renderCanvas: HTMLCanvasElement, paintCanvas:HTMLCanvasElement, controllCanvas:HTMLCanvasElement){
        this.renderCanvas = renderCanvas;
        this.paintCanvas = paintCanvas;
        this.editCanvas = controllCanvas;


        this.renderer = new Renderer(this.renderCanvas, this.editCanvas)

        this.scene = new SceneManager(this.paintCanvas,
        {
            renderMainLayer: this.renderer.renderMainLayer,
            renderEditLayer: this.renderer.renderEditLayer,
        })

        this.tool = new Tool(this.paintCanvas, {
            addItem: this.scene.addItem.bind(this.scene),
            select: this.scene.selectArea.bind(this.scene),
            clearEditCanvas: this.scene.deselectAll.bind(this.scene)
        })  
    }


}