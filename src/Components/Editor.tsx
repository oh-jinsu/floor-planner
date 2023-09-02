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

    const draw = (context: CanvasRenderingContext2D) => {
        drawGrid(context);

        const { current: vertices } = verticesRef;

        if (vertices.length === 0) {
            return;
        }

        context.beginPath();

        context.moveTo(vertices[0].x, vertices[0].y);

        for (let i = 1; i < vertices.length; i++) {
            context.lineTo(vertices[i].x, vertices[i].y);
        }

        context.lineTo(vertices[0].x, vertices[0].y);

        context.strokeStyle = "#666";

        context.lineWidth = 4;

        context.stroke();

        context.fillStyle = "#fff";

        context.fill();
    };

    return <Canvas draw={draw} />;
};

export default Editor;
