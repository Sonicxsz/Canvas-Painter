import type { Point } from "../tools/Core.t";

export function getMousePosition (e: MouseEvent): Point {
        const target = e.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }