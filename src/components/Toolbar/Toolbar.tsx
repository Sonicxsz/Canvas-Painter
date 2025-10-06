import "./toolbar.css"
import { Cursor } from "../../tools/Cursor"
import {  LineTool } from "../../tools/Line"
import { useState } from "react"
import { BrushIcon, CircleIcon, CursorIcon, RectIcon } from "../../assets/svg"
import { BrushTool } from "../../tools/Brush"

import { CircleTool } from "../../tools/Circle"
import { RectTool } from "../../tools/Rect"
import type { Tool } from "../../tools/Core/Tool"
import { HexColorPicker } from "../ColorPicker/ColorPicker"


export function Toolbar({config}:{config?:Tool}) {
    const [active, setActive] = useState(0)
    const [color,setColor] = useState("#000")


    const select = (id:number) => setActive(id)
    
    if(!config) return null

    return <div className="toolbar">
       {
        btns.map(el => {
            return <button key={el.id} className={`btn ${el.class} ${active === el.id ? "active" : ""}`}
                onClick={() => {
                    select(el.id)
                    new el.Tool(config)
                }}
            >
               { el.icon}
            </button>
        })
       }
       <button className={`btn color`}>
                <HexColorPicker value={color} onChange={(val) => {
                    setColor(val)
                    config.setFillColor(val)
                }}/>
       </button>
      
    </div>
}

 const btns = [
        {
            class: "cursor",
            title: "cursor",
            id: 1,
            Tool: Cursor,
            icon: <CursorIcon />
        },
        {
            class: "brush",
            title: "brush",
            id: 2,
            Tool: BrushTool,
            icon: <BrushIcon />
        },
        {
            class: "rect",
            title: "rect",
            id: 3,
            Tool: RectTool,
            icon: <RectIcon />
        },{
            class: "circle",
            title: "circle",
            id: 4,
            Tool: CircleTool,
            icon: <CircleIcon />
        },{
            class: "line",
            title: "line",
            id: 5,
            Tool: LineTool,
            icon: <BrushIcon />
        }
    ]