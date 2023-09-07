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
import { HANDLE_RADIUS, SCALE_UNIT } from "../Constants/Editor";
import { distance } from "../Core/Math";

const Painter: FunctionComponent = () => {
    const queue = useRef(new Subject<DrawCall>());

    const { subjectState } = useContext(EditorContext);

    const drawGrid = useCallback(
        (context: CanvasRenderingContext2D) => {
            const gridScale = subjectState.getValue().option.gridSize / 100;

            context.beginPath();

            const { width } = context.canvas;

            for (let x = 0; x < width * 0.5; x += SCALE_UNIT * gridScale) {
                context.moveTo(x, width * -0.5);

                context.lineTo(x, width * 0.5);

                if (x === 0) {
                    continue;
                }

                context.moveTo(-x, width * -0.5);

                context.lineTo(-x, width * 0.5);
            }

            const { height } = context.canvas;

            for (let y = 0; y < height * 0.5; y += SCALE_UNIT * gridScale) {
                context.moveTo(height * -0.5, y);

                context.lineTo(height * 0.5, y);

                if (y === 0) {
                    continue;
                }

                context.moveTo(height * -0.5, -y);

                context.lineTo(height * 0.5, -y);
            }

            context.strokeBy("#eee");
        },
        [subjectState]
    );

    const drawHolder = (
        context: CanvasRenderingContext2D,
        { x, y }: Vector2
    ) => {
        context.beginPath();

        context.arc(
            x * SCALE_UNIT,
            y * SCALE_UNIT,
            HANDLE_RADIUS,
            0,
            Math.PI * 2
        );

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

        context.moveTo(vertices[0].x * SCALE_UNIT, vertices[0].y * SCALE_UNIT);

        for (let i = 1; i < vertices.length; i++) {
            context.lineTo(
                vertices[i].x * SCALE_UNIT,
                vertices[i].y * SCALE_UNIT
            );
        }

        context.lineTo(vertices[0].x * SCALE_UNIT, vertices[0].y * SCALE_UNIT);

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

        const sx = (x1 + dx) * SCALE_UNIT;

        const sy = (y1 + dy) * SCALE_UNIT;

        const ex = (x2 + dx) * SCALE_UNIT;

        const ey = (y2 + dy) * SCALE_UNIT;

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

        context.fillText(
            `${Math.round(l * 100)}`,
            mx * SCALE_UNIT,
            my * SCALE_UNIT
        );
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
        [drawHolders, drawLengths, drawGrid]
    );

    useEffect(() => {
        subjectState.pipe(map(toDrawCall)).subscribe(queue.current);
    }, [subjectState, queue, toDrawCall]);

    return <Canvas queue={queue.current} />;
};

export default Painter;
