import { useEffect, useRef, useState } from "react";
import { Canvas } from "../components/Canvas/Canvas";
import { Toolbar } from "../components/Toolbar/Toolbar";
import { CanvasApp } from "../tools/Core/Canvas";
import "./canvasPage.css"


export function CanvasPage(){
    const [app,setApp] = useState<CanvasApp | null>(null)

    const renderCanvas = useRef<HTMLCanvasElement | null>(null)
    const paintCanvas  = useRef<HTMLCanvasElement | null>(null)
    const controllCanvas  = useRef<HTMLCanvasElement | null>(null)


    useEffect(() => {
        if(renderCanvas.current && paintCanvas.current && controllCanvas.current){
            setApp(new CanvasApp(renderCanvas.current, paintCanvas.current, controllCanvas.current))
        }
    }, [])

    return <div className="canvas_page_wrapper">
        <Canvas
            renderCanvasRef={renderCanvas}
            paintCanvasRef={paintCanvas}
            controllCanvasRef={controllCanvas}
            render={app?.scene.rerender}
        />
        <Toolbar config={app?.tool} />
    </div>
}

