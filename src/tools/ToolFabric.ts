import { RectTool } from "./Rect";
import { CursorTool } from "./Cursor";
import { LineTool } from "./Line";
import type { Tool } from "./Core/Tool";



export type AviableToolsType = "Rect" | "Circle" | "Cursor" | "Line" | "Brush"

export class ToolFabric {
    constructor(type: AviableToolsType, config:Tool) {
        // if(type === "Brush") return new BrushTool(config)
        // if(type === "Circle") return new CircleTool(config)
        if(type === "Cursor") return new CursorTool(config)
        if(type === "Rect") return new RectTool(config)
        if(type === "Line") return new LineTool(config)
    }
}