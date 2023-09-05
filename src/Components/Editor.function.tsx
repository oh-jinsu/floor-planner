import { Vector2 } from "../Core/Vector";
import { State } from "../Core/State";
import { HANDLE_RADIUS, METER } from "../Constants/Editor";

const drawGrid = (context: CanvasRenderingContext2D) => {
    context.beginPath();

    const fullWidth = Math.round(context.canvas.width / METER) * METER;

    for (let x = 0; x < fullWidth * 0.5; x += METER) {
        context.moveTo(x, context.canvas.width * -0.5);

        context.lineTo(x, context.canvas.width * 0.5);
    }

    for (let x = METER; x > fullWidth * -0.5; x -= METER) {
        context.moveTo(x, context.canvas.width * -0.5);

        context.lineTo(x, context.canvas.width * 0.5);
    }

    const fullHeight = Math.round(context.canvas.height / METER) * METER;

    for (let y = 0; y < fullHeight * 0.5; y += METER) {
        context.moveTo(context.canvas.height * -0.5, y);

        context.lineTo(context.canvas.height * 0.5, y);
    }

    for (let y = METER; y > fullHeight * -0.5; y -= METER) {
        context.moveTo(context.canvas.height * -0.5, y);

        context.lineTo(context.canvas.height * 0.5, y);
    }

    context.strokeStyle = "#eee";

    context.stroke();
};

const drawHolders = (
    context: CanvasRenderingContext2D,
    vertices: Vector2[]
) => {
    for (let i = 0; i < vertices.length; i++) {
        const { x, y } = vertices[i];

        context.beginPath();

        context.arc(x, y, HANDLE_RADIUS, 0, Math.PI * 2);

        context.fillStyle = "#777";

        context.fill();

        context.closePath();
    }
};

const drawWalls = (context: CanvasRenderingContext2D, vertices: Vector2[]) => {
    if (vertices.length === 0) {
        return;
    }

    context.beginPath();

    context.moveTo(vertices[0].x, vertices[0].y);

    for (let i = 1; i < vertices.length; i++) {
        context.lineTo(vertices[i].x, vertices[i].y);
    }

    context.lineTo(vertices[0].x, vertices[0].y);

    context.fillBy("#fff");

    context.strokeBy("#777", 3, "round");

    context.closePath();
};

const drawLengths = (
    context: CanvasRenderingContext2D,
    vertices: Vector2[]
) => {
    for (let i = 0; i < vertices.length; i++) {
        context.beginPath();

        const { x: x1, y: y1 } = vertices.at(i - 1)!;

        const { x: x2, y: y2 } = vertices.at(i)!;

        const theta = Math.atan2(y2 - y1, x2 - x1);

        const dx = Math.cos(theta - Math.PI * 0.5) * 0.5 * METER;

        const dy = Math.sin(theta - Math.PI * 0.5) * 0.5 * METER;

        context.moveTo(x1 + dx, y1 + dy);

        context.lineTo(x2 + dx, y2 + dy);

        const adx = Math.cos(theta - Math.PI * 0.5) * 7;

        const ady = Math.sin(theta - Math.PI * 0.5) * 7;

        context.moveTo(x1 + dx - adx, y1 + dy - ady);

        context.lineTo(x1 + dx + adx, y1 + dy + ady);

        context.moveTo(x2 + dx - adx, y2 + dy - ady);

        context.lineTo(x2 + dx + adx, y2 + dy + ady);

        context.strokeBy("#bfbfbf", 1);

        context.closePath();

        const mx = (x1 + x2 + 2 * dx) / 2;

        const my = (y1 + y2 + 2 * dy) / 2;

        context.setTextStyle("15px serif", "#111", "center", "middle");

        const direction = Math.pow(
            Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2),
            0.5
        );

        const length = Math.round((direction * 1000) / METER);

        context.fillText(`${length}`, mx, my);
    }
};

export const toDrawCall =
    (state: State) => (context: CanvasRenderingContext2D) => {
        context.clearScreen();

        drawGrid(context);

        const { vertices } = state;

        drawWalls(context, vertices);

        drawHolders(context, vertices);

        drawLengths(context, vertices);
    };
