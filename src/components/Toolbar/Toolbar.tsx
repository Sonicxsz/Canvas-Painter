import "./toolbar.css"
import { Cursor } from "../../tools/Cursor"
import {  LineTool } from "../../tools/Line"
import { useEffect, useState } from "react"
import { BrushIcon, CircleIcon, CursorIcon, RectIcon, UndoIcon } from "../../assets/svg"
import { BrushTool } from "../../tools/Brush"

import { CircleTool } from "../../tools/Circle"
import { RectTool } from "../../tools/Rect"
import type { Tool } from "../../tools/Core/Tool"
import { HexColorPicker } from "../ColorPicker/ColorPicker"


export function Toolbar({config}:{config?:Tool}) {
    const [active, setActive] = useState(0)
    const [color,setColor] = useState("#000")

    useEffect(() => {
        function onKeyDown(e:KeyboardEvent){
             const toolIndex = btns.findIndex(el => el.selectKey?.toLocaleLowerCase() === e.key)
            if(toolIndex != -1 && config){
                select(btns[toolIndex].id)
                new btns[toolIndex].Tool(config)
            }
        }

        window.addEventListener('keydown', onKeyDown)

        return () => {
            window.removeEventListener("keydown", onKeyDown)
        }
    }, [config])
    
    if(!config) return null
d
    const select = (id:number) => setActive(id)

    const onColorSelect = (val: string) => {
            setColor(val)
            config.setFillColor(val)
    }

    

    return <>
    <div className="toolbar toolbar__list">
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
                <HexColorPicker value={color} onChange={onColorSelect}/>
       </button>
    </div>
    <div className="toolbar toolbar__bottomList">
            {
             bottomList.map(el => <button key={el.id} className={`btn color`}>{el.icon}</button>)   
            }
    </div>
    </>
}




 const bottomList = [
    {
        id: 1,
        icon: <UndoIcon/>,
        type: "undo"
    },
    {
        id: 2,
        icon: <UndoIcon style={{ transform: "   scaleX(-1)" }}/>,
        type: "do"
    }
 ]
 const btns = [
        {
            class: "cursor",
            title: "cursor",
            id: 1,
            Tool: Cursor,
            icon: <CursorIcon />,
            selectKey: "w"
        },
        {
            class: "brush",
            title: "brush",
            id: 2,
            Tool: BrushTool,
            icon: <BrushIcon />,
            selectKey: "f"
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