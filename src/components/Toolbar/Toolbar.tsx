import "./toolbar.css"
import { useEffect, useState } from "react"
import { BrushIcon, CircleIcon, CursorIcon, RectIcon, UndoIcon } from "../../assets/svg"
import { ToolFabric, type AviableToolsType } from "../../tools/ToolFabric"
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
                new ToolFabric(btns[toolIndex].type, config)
            }
        }

        window.addEventListener('keydown', onKeyDown)

        return () => {
            window.removeEventListener("keydown", onKeyDown)
        }
    }, [config])
    
    if(!config) return null

    const select = (id:number) => setActive(id)

    const onColorSelect = (val: string) => {
            setColor(val)
            config.setStyles({fillStyle:val, strokeStyle: val})
    }

    

    return <>
    <div className="toolbar toolbar__list">
       {
        btns.map(el => {
            return <button key={el.id} className={`btn ${el.class} ${active === el.id ? "active" : ""}`}
                onClick={() => {
                    select(el.id)
                    new ToolFabric(el.type, config)
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


interface ToolView {
    class: string
    title: string
    id: number
    type: AviableToolsType
    icon: React.ReactNode
    selectKey?: string
}


 const btns:ToolView[] = [
        {
            class: "cursor",
            title: "cursor",
            id: 1,
            type: "Cursor",
            icon: <CursorIcon />,
            selectKey: "w"
        },
        {
            class: "brush",
            title: "brush",
            id: 2,
            type: "Brush",
            icon: <BrushIcon />,
            selectKey: "f"
        },
        {
            class: "rect",
            title: "rect",
            id: 3,
            type: "Rect",
            icon: <RectIcon />
        },{
            class: "circle",
            title: "circle",
            id: 4,
            type: "Circle",
            icon: <CircleIcon />
        },{
            class: "line",
            title: "line",
            id: 5,
            type: "Line",
            icon: <BrushIcon />
        }
    ]