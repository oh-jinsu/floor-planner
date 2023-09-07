import { Vector2 } from "../Core/Vector";

declare global {
    interface CanvasRenderingContext2D {
        getOrigin: () => Vector2;

        clearScreen: () => void;

        strokeBy(style: string, width?: number, cap?: CanvasLineCap): void

        fillBy(style: string): void;

        setTextStyle(font: string, style: string, align: CanvasTextAlign, baseline: CanvasTextBaseline): void
    }
}

CanvasRenderingContext2D.prototype.getOrigin = function() {
    return {
        x: Math.round(this.canvas.width / 4),
        y: Math.round(this.canvas.height / 4),
    }
}

CanvasRenderingContext2D.prototype.clearScreen = function() {
    this.clearRect(
        this.canvas.width * -0.5,
        this.canvas.height * -0.5,
        this.canvas.width,
        this.canvas.height
    );
}

CanvasRenderingContext2D.prototype.strokeBy = function(style, width, cap) {
    this.strokeStyle = style;

    if (width) {
        this.lineWidth = width;
    }

    if (cap) {
        this.lineCap = cap;
    }

    this.lineJoin = "round";

    this.stroke();
}

CanvasRenderingContext2D.prototype.fillBy = function(style) {
    this.fillStyle = style;

    this.fill();
}

CanvasRenderingContext2D.prototype.setTextStyle = function(font, style, align, baseline) {
    this.font = font;

    if (style) {
        this.fillStyle = style;
    }

    if (align) {
        this.textAlign = align;

    }

    if (baseline) {
        this.textBaseline = baseline;
    }
}
export {};