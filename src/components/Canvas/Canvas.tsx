import { useState } from "react"

import "./canvas.css"
import { useResizeWindow } from "../../lib/useObserver"

interface WindowEvent {
    target:{
        outerHeight: number;
        outerWidth: number;
    }
} 


interface Canvas {
    render?: () => void 
    paintCanvasRef: React.RefObject<HTMLCanvasElement | null>
    renderCanvasRef: React.RefObject<HTMLCanvasElement | null>
    controllCanvasRef: React.RefObject<HTMLCanvasElement | null>
}


export function Canvas({render, paintCanvasRef, renderCanvasRef, controllCanvasRef}:Canvas) {
    const [size,setSize] = useState<{width:number, height:number}>({
        width: window.outerWidth,
        height: window.outerHeight
    })

    
    useResizeWindow((e:WindowEvent) => {
        setSize({width: e.target.outerWidth, height: e.target.outerHeight})
        render?.()
    })
    

    if(!size) return 

    return (
        <div className="canvas">
            <canvas className="position" width={size?.width} height={size?.height} ref={renderCanvasRef}></canvas>
            <canvas className="position" width={size?.width} height={size?.height} ref={controllCanvasRef}></canvas>
            <canvas id="paintCanvas" className="position" width={size?.width} height={size?.height} ref={paintCanvasRef}></canvas> 
       </div>
    )
}
