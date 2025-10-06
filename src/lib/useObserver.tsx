import { useEffect } from "react";



export function useResizeWindow(cb: Function) {
    
    useEffect(() => {
        window.addEventListener("resize", (e) => {
            cb(e)
        })
    }, [])
}