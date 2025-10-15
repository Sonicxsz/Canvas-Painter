import { CONSTANTS } from "../../constanst/constants";
import type { Corner } from "./Core.t";

// ==================== МЕНЕДЖЕР КУРСОРА ====================
export class CursorManager {
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  setCursor(style: string): void {
    this.canvas.style.cursor = style;
  }

  setDefault(): void {
    this.setCursor(CONSTANTS.CURSOR_STYLES.DEFAULT);
  }

  setMove(): void {
    this.setCursor(CONSTANTS.CURSOR_STYLES.MOVE);
  }

  setResize(corner: Corner | null): void {
    if (!corner) {
      this.setDefault();
      return;
    }

    const isNE = corner === "LEFT_BOTTOM" || corner === "RIGHT_TOP";
    this.setCursor(isNE ? CONSTANTS.CURSOR_STYLES.RESIZE_NE : CONSTANTS.CURSOR_STYLES.RESIZE_NW);
  }
}