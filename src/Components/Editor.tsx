import { useRef } from "react";
import { Vector2 } from "../Core/Vector";
import Canvas from "./Canvas";
import { METER } from "../Core/Meter";
import { MouseState } from "../Core/MouseState";
import "../Extensions/Canvas";
import "../Extensions/Array";
import { HANDLE_RADIUS } from "../Constants/Editor";

const Editor = () => {
    const mouseStateRef = useRef<MouseState>({
        origin: { x: 0, y: 0 },
        isDragging: false,
    });

    const verticesRef = useRef<Vector2[]>([
        {
            x: -5 * METER,
            y: -3 * METER,
        },
        {
            x: 5 * METER,
            y: -3 * METER,
        },
        {
            x: 5 * METER,
            y: 3 * METER,
        },
        {
            x: -5 * METER,
            y: 3 * METER,
        },
    ]);

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
        const drawHolder = (x: number, y: number) => {
            context.beginPath();

            context.arc(x, y, HANDLE_RADIUS, 0, Math.PI * 2);

            context.fillStyle = "#777";

            context.fill();

            context.closePath();
        };

        for (let i = 0; i < vertices.length; i++) {
            const { x, y } = vertices[i];

            drawHolder(x, y);
        }
    };

    const drawWalls = (
        context: CanvasRenderingContext2D,
        vertices: Vector2[]
    ) => {
        if (vertices.length === 0) {
            return;
        }

        context.beginPath();

        context.moveTo(vertices[0].x, vertices[0].y);

        for (let i = 1; i < vertices.length; i++) {
            context.lineTo(vertices[i].x, vertices[i].y);
        }

        context.lineTo(vertices[0].x, vertices[0].y);

        context.fillStyle = "#fff";

        context.fill();

        context.strokeStyle = "#777";

        context.lineWidth = 2;

        context.lineCap = "round";

        context.stroke();

        context.closePath();
    };

    const drawLengths = (
        context: CanvasRenderingContext2D,
        vertices: Vector2[]
    ) => {
        if (vertices.length === 0) {
            return;
        }

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

            context.strokeStyle = "#bfbfbf";

            context.lineWidth = 1;

            context.stroke();

            context.closePath();

            const mx = (x1 + x2 + 2 * dx) / 2;

            const my = (y1 + y2 + 2 * dy) / 2;

            context.font = "15px serif";

            context.textBaseline = "middle";

            context.textAlign = "center";

            context.fillStyle = "#111";

            const direction = Math.pow(
                Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2),
                0.5
            );

            const length = Math.round((direction * 1000) / METER);

            context.fillText(`${length}`, mx, my);
        }
    };

    const drawForVertices = (context: CanvasRenderingContext2D) => {
        const { current: vertices } = verticesRef;

        drawWalls(context, vertices);

        drawHolders(context, vertices);

        drawLengths(context, vertices);
    };

    const draw = (context: CanvasRenderingContext2D) => {
        context.clearRect(
            context.canvas.width * -0.5,
            context.canvas.height * -0.5,
            context.canvas.width,
            context.canvas.height
        );

        drawGrid(context);

        drawForVertices(context);
    };

    const checkHolders = (
        context: CanvasRenderingContext2D,
        position: Vector2
    ) => {
        const { current: vertices } = verticesRef;

        for (let i = 0; i < vertices.length; i++) {
            const value = vertices[i];

            const mag =
                Math.pow(value.x - position.x, 2) +
                Math.pow(value.y - position.y, 2);

            if (mag > HANDLE_RADIUS * HANDLE_RADIUS * 8) {
                continue;
            }

            mouseStateRef.current.holding = i;

            return;
        }

        for (let i = 0; i < vertices.length; i++) {
            const { x: x1, y: y1 } = vertices.at(i - 1)!;

            const { x: x2, y: y2 } = vertices.at(i)!;

            const a = y2 - y1;

            const b = x1 - x2;

            const c = x1 * (y1 - y2) + y1 * (x2 - x1);

            const d =
                Math.pow(a * position.x + b * position.y + c, 2) /
                (a * a + b * b);

            if (d > HANDLE_RADIUS * HANDLE_RADIUS * 8) {
                continue;
            }

            vertices.splice(i, 0, position);

            mouseStateRef.current.holding = i;

            draw(context);

            return;
        }
    };

    const onMouseMove = (
        context: CanvasRenderingContext2D,
        position: Vector2
    ) => {
        const { holding } = mouseStateRef.current;

        if (holding === undefined) {
            return;
        }

        verticesRef.current[holding].x = position.x;

        verticesRef.current[holding].y = position.y;

        draw(context);
    };

    const onMouseDown = (
        context: CanvasRenderingContext2D,
        position: Vector2
    ) => {
        mouseStateRef.current.isDragging = true;

        mouseStateRef.current.origin = position;

        checkHolders(context, position);
    };

    const onMouseUp = (_: CanvasRenderingContext2D) => {
        mouseStateRef.current.isDragging = false;
        mouseStateRef.current.holding = undefined;
    };

    return (
        <Canvas
            draw={draw}
            onMouseMove={onMouseMove}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
        />
    );
};

export default Editor;
