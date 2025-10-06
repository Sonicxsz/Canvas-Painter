import { create } from "zustand";
import type { Tool } from "../tools/Core/Tool";


interface ToolState {
        tool: Tool | null, 
        setTool: (val: Tool) => void
}

export const toolState = create<ToolState>((set) => ({
    tool:null,
    setTool: (val: Tool) => set({ tool: val })
}))
