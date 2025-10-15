import { CONSTANTS } from "../../constanst/constants";
import type { Corner, Point, Rect } from "./Core.t";

// ==================== ДЕТЕКТОР УГЛОВ ====================
export class CornerDetector {
  detectCorner(point: Point, rect: Rect): Corner | null {
    const radius = CONSTANTS.CORNER_DETECTION_RADIUS;
    
    const nearTop = Math.abs(point.y - rect.y) < radius;
    const nearBottom = Math.abs(point.y - rect.y2) < radius;
    const nearLeft = Math.abs(point.x - rect.x) < radius;
    const nearRight = Math.abs(point.x - rect.x2) < radius;

    if (nearLeft && nearTop) return "LEFT_TOP";
    if (nearLeft && nearBottom) return "LEFT_BOTTOM";
    if (nearRight && nearTop) return "RIGHT_TOP";
    if (nearRight && nearBottom) return "RIGHT_BOTTOM";

    return null;
  }
}