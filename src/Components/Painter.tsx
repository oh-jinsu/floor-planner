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
import { EditorContext, State } from "./Editor";
import { Vector2 } from "../Core/Vector";
import { HANDLE_RADIUS, SIZE } from "../Constants/Editor";
import { distance } from "../Core/Math";

const Painter: FunctionComponent = () => {
    const queue = useRef(new Subject<DrawCall>());

    const { subjectState: subjectVertices } = useContext(EditorContext);

    const drawGrid = (context: CanvasRenderingContext2D) => {
        context.beginPath();

        const fullWidth = Math.round(context.canvas.width / SIZE) * SIZE;

        for (let x = 0; x < fullWidth * 0.5; x += SIZE) {
            context.moveTo(x, context.canvas.width * -0.5);

            context.lineTo(x, context.canvas.width * 0.5);

            if (x === 0) {
                continue;
            }

            context.moveTo(-x, context.canvas.width * -0.5);

            context.lineTo(-x, context.canvas.width * 0.5);
        }

        const fullHeight = Math.round(context.canvas.height / SIZE) * SIZE;

        for (let y = 0; y < fullHeight * 0.5; y += SIZE) {
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

        context.arc(x * SIZE, y * SIZE, HANDLE_RADIUS, 0, Math.PI * 2);

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

        context.moveTo(vertices[0].x * SIZE, vertices[0].y * SIZE);

        for (let i = 1; i < vertices.length; i++) {
            context.lineTo(vertices[i].x * SIZE, vertices[i].y * SIZE);
        }

        context.lineTo(vertices[0].x * SIZE, vertices[0].y * SIZE);

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

        const dx = Math.cos(theta - Math.PI * 0.5) * 0.5;

        const dy = Math.sin(theta - Math.PI * 0.5) * 0.5;

        const sx = (x1 + dx) * SIZE;

        const sy = (y1 + dy) * SIZE;

        const ex = (x2 + dx) * SIZE;

        const ey = (y2 + dy) * SIZE;

        context.moveTo(sx, sy);

        context.lineTo(ex, ey);

        const adx = Math.cos(theta - Math.PI * 0.5) * 10;

        const ady = Math.sin(theta - Math.PI * 0.5) * 10;

        context.moveTo(sx - adx, sy - ady);

        context.lineTo(sx + adx, sy + ady);

        context.moveTo(ex - adx, ey - ady);

        context.lineTo(ex + adx, ey + ady);

        context.strokeBy("#bfbfbf", 1);

        context.closePath();

        const mx = (x1 + x2 + 2 * dx) / 2;

        const my = (y1 + y2 + 2 * dy) / 2;

        context.setTextStyle("15px serif", "#111", "center", "middle");

        const l = distance({ x: x1, y: y1 }, { x: x2, y: y2 });

        context.fillText(`${Math.round(l * 1000)}`, mx * SIZE, my * SIZE);
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
        ({ vertices }: State) => {
            return (context: CanvasRenderingContext2D) => {
                context.clearScreen();

                drawGrid(context);

                drawWalls(context, vertices);

                drawHolders(context, vertices);

                drawLengths(context, vertices);
            };
        },
        [drawHolders, drawLengths]
    );

    useEffect(() => {
        subjectVertices.pipe(map(toDrawCall)).subscribe(queue.current);
    }, [subjectVertices, queue, toDrawCall]);

    return <Canvas queue={queue.current} />;
};

export default Painter;
