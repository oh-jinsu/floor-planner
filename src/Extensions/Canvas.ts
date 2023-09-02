import { Vector2 } from "../Core/Vector";

declare global {
    interface CanvasRenderingContext2D {
        getOrigin: () => Vector2;
    }
}

CanvasRenderingContext2D.prototype.getOrigin = function() {
    const { canvas } = this;

    return {
        x: Math.round(canvas.width / 4),
        y: Math.round(canvas.height / 4),
    }
}

export {};