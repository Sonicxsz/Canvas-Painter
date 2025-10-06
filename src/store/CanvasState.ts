import { create } from "zustand";

interface CanvasState {
        canvas: HTMLCanvasElement | null, 
        setCanvas: (ref: HTMLCanvasElement | null) => void
}

export const canvasState = create<CanvasState>((set) => ({
    canvas:null,
    setCanvas: (ref) => set({ canvas: ref })
}))
