import { useRef } from "react";
import { Vector2 } from "../Core/Vector";
import Canvas from "./Canvas";
import "../Extensions/Canvas";
import { METER } from "../Core/Meter";

const Editor = () => {
    const verticesRef = useRef<Vector2[]>([
        {
            x: -5 * METER,
            y: -3 * METER,
        },
        {
            x: 8 * METER,
            y: -3 * METER,
        },
        {
            x: 6 * METER,
            y: 0 * METER,
        },
        {
            x: 7 * METER,
            y: 6 * METER,
        },
        {
            x: 5 * METER,
            y: 6 * METER,
        },
        {
            x: -9 * METER,
            y: 1 * METER,
        },
        {
            x: -5 * METER,
            y: -3 * METER,
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

    const drawShape = (context: CanvasRenderingContext2D) => {
        const { current: vertices } = verticesRef;

        if (vertices.length === 0) {
            return;
        }

        context.beginPath();

        context.moveTo(vertices[0].x, vertices[0].y);

        for (let i = 1; i < vertices.length; i++) {
            context.lineTo(vertices[i].x, vertices[i].y);
        }

        context.fillStyle = "#fff";

        context.fill();

        context.strokeStyle = "#777";

        context.lineWidth = 2;

        context.lineCap = "round";

        context.stroke();
    };

    const drawNumbers = (context: CanvasRenderingContext2D) => {
        const { current: vertices } = verticesRef;

        const { length } = vertices;

        if (length === 0) {
            return;
        }

        context.beginPath();

        for (let i = 1; i < vertices.length; i++) {
            const { x: x1, y: y1 } = vertices[i - 1];

            const { x: x2, y: y2 } = vertices[i];

            const theta = Math.atan2(y2 - y1, x2 - x1);

            console.log(i, (theta * 180) / Math.PI);

            const dx = Math.cos(theta - Math.PI * 0.5) * 0.5 * METER;

            const dy = Math.sin(theta - Math.PI * 0.5) * 0.5 * METER;

            context.moveTo(x1 + dx, y1 + dy);

            context.lineTo(x2 + dx, y2 + dy);

            context.strokeStyle = "#bebebe";

            context.lineWidth = 1;

            context.stroke();

            const mx = (x1 + x2 + 2 * dx) / 2;

            const my = (y1 + y2 + 2 * dy) / 2;

            context.font = "14px serif";

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

    const draw = (context: CanvasRenderingContext2D) => {
        drawGrid(context);

        drawShape(context);

        drawNumbers(context);
    };

    return <Canvas draw={draw} />;
};

export default Editor;
