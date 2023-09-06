import {
    FunctionComponent,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from "react";
import Canvas from "./Canvas";
import { Subject, map } from "rxjs";
import { DrawCall } from "../Core/DrawCall";
import { EditorContext } from "./Editor";
import { State } from "../Core/State";
import { Vector2 } from "../Core/Vector";
import { HANDLE_RADIUS, METER } from "../Constants/Editor";

const Painter: FunctionComponent = () => {
    const queue = useRef(new Subject<DrawCall>());

    const { stateQueue } = useContext(EditorContext);

    const drawGrid = (context: CanvasRenderingContext2D) => {
        context.beginPath();

        const fullWidth = Math.round(context.canvas.width / METER) * METER;

        for (let x = 0; x < fullWidth * 0.5; x += METER) {
            context.moveTo(x, context.canvas.width * -0.5);

            context.lineTo(x, context.canvas.width * 0.5);

            if (x === 0) {
                continue;
            }

            context.moveTo(-x, context.canvas.width * -0.5);

            context.lineTo(-x, context.canvas.width * 0.5);
        }

        const fullHeight = Math.round(context.canvas.height / METER) * METER;

        for (let y = 0; y < fullHeight * 0.5; y += METER) {
            context.moveTo(context.canvas.height * -0.5, y);

            context.lineTo(context.canvas.height * 0.5, y);

            if (y === 0) {
                continue;
            }

            context.moveTo(context.canvas.height * -0.5, -y);

            context.lineTo(context.canvas.height * 0.5, -y);
        }

        context.strokeBy("#eee");
    };

    const drawHolder = (
        context: CanvasRenderingContext2D,
        { x, y }: Vector2
    ) => {
        context.beginPath();

        context.arc(x, y, HANDLE_RADIUS, 0, Math.PI * 2);

        context.fillBy("#777");

        context.closePath();
    };

    const drawHolders = useCallback(
        (context: CanvasRenderingContext2D, vertices: Vector2[]) => {
            for (let i = 0; i < vertices.length; i++) {
                drawHolder(context, vertices[i]);
            }
        },
        []
    );

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

        context.fillBy("#fff");

        context.strokeBy("#777", 3, "round");

        context.closePath();
    };

    const drawLength = (
        context: CanvasRenderingContext2D,
        { x: x1, y: y1 }: Vector2,
        { x: x2, y: y2 }: Vector2
    ) => {
        context.beginPath();

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

        const d = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));

        const length = Math.round((d * 1000) / METER);

        context.fillText(`${length}`, mx, my);
    };

    const drawLengths = useCallback(
        (context: CanvasRenderingContext2D, vertices: Vector2[]) => {
            for (let i = 0; i < vertices.length; i++) {
                const v1 = vertices.at(i - 1)!;

                const v2 = vertices.at(i)!;

                drawLength(context, v1, v2);
            }
        },
        []
    );

    const toDrawCall = useCallback(
        (state: State) => {
            return (context: CanvasRenderingContext2D) => {
                context.clearScreen();

                drawGrid(context);

                const { vertices } = state;

                drawWalls(context, vertices);

                drawHolders(context, vertices);

                drawLengths(context, vertices);
            };
        },
        [drawHolders, drawLengths]
    );

    useEffect(() => {
        stateQueue.pipe(map(toDrawCall)).subscribe(queue.current);
    }, [stateQueue, queue, toDrawCall]);

    return <Canvas queue={queue.current} />;
};

export default Painter;
