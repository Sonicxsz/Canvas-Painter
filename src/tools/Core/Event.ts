// ==================== МЕНЕДЖЕР СОБЫТИЙ ====================
export class EventManager {
  private handlers = new Map<string, (e: Event) => void>();
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    console.log(this.canvas)
  }

  on(event: string, handler: (e: any) => void): void {
    this.canvas.addEventListener(event, handler);
    this.handlers.set(event, handler);
  }

  off(event: string): void {
    const handler = this.handlers.get(event);
    if (handler) {
      this.canvas.removeEventListener(event, handler);
      this.handlers.delete(event);
    }
  }

  destroy(): void {
    this.handlers.forEach((handler, event) => {
      this.canvas.removeEventListener(event, handler);
    });
    this.handlers.clear();
  }
}