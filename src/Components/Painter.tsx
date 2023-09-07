import {
    FunctionComponent,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from "react";
import Canvas, { DrawCall } from "./Canvas";
import { Subject, map } from "rxjs";
import { EditorContext, State } from "./Editor";
import { Vector2 } from "../Core/Vector";
import {
    BASE_GRID_SPACE,
    DEFAULT_HANDLE_RADIUS,
    BASE_SCALE_UNIT,
} from "../Constants/Editor";
import { distance } from "../Core/Math";

const Painter: FunctionComponent = () => {
    const queue = useRef(new Subject<DrawCall>());

    const { subjectState } = useContext(EditorContext);

    const drawGrid = useCallback(
        (context: CanvasRenderingContext2D) => {
            const gridScale =
                subjectState.getValue().option.gridSize / BASE_GRID_SPACE;

            context.beginPath();

            const { width } = context.canvas;

            for (let x = 0; x < width * 0.5; x += BASE_SCALE_UNIT * gridScale) {
                context.moveTo(x, width * -0.5);

                context.lineTo(x, width * 0.5);

                if (x === 0) {
                    continue;
                }

                context.moveTo(-x, width * -0.5);

                context.lineTo(-x, width * 0.5);
            }

            const { height } = context.canvas;

            for (
                let y = 0;
                y < height * 0.5;
                y += BASE_SCALE_UNIT * gridScale
            ) {
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

    const drawHandle = (
        context: CanvasRenderingContext2D,
        { x, y }: Vector2,
        radius: number
    ) => {
        context.beginPath();

        context.arc(
            x * BASE_SCALE_UNIT,
            y * BASE_SCALE_UNIT,
            DEFAULT_HANDLE_RADIUS,
            0,
            Math.PI * 2
        );

        context.fillBy("#777");

        context.closePath();
    };

    const drawHandles = useCallback(
        (
            context: CanvasRenderingContext2D,
            vertices: Vector2[],
            radius: number
        ) => {
            for (let i = 0; i < vertices.length; i++) {
                drawHandle(context, vertices[i], radius);
            }
        },
        []
    );

    const drawWalls = (
        context: CanvasRenderingContext2D,
        vertices: Vector2[],
        lineWidth: number
    ) => {
        if (vertices.length === 0) {
            return;
        }

        context.beginPath();

        context.moveTo(
            vertices[0].x * BASE_SCALE_UNIT,
            vertices[0].y * BASE_SCALE_UNIT
        );

        for (let i = 1; i < vertices.length; i++) {
            context.lineTo(
                vertices[i].x * BASE_SCALE_UNIT,
                vertices[i].y * BASE_SCALE_UNIT
            );
        }

        context.lineTo(
            vertices[0].x * BASE_SCALE_UNIT,
            vertices[0].y * BASE_SCALE_UNIT
        );

        context.fillBy("#fff");

        context.strokeBy("#777", lineWidth, "square");

        context.closePath();
    };

    const drawLength = (
        context: CanvasRenderingContext2D,
        { x: x1, y: y1 }: Vector2,
        { x: x2, y: y2 }: Vector2
    ) => {
        const l = distance({ x: x1, y: y1 }, { x: x2, y: y2 });

        if (l === 0) {
            return;
        }

        context.beginPath();

        const theta = Math.atan2(y2 - y1, x2 - x1);

        const dx = Math.cos(theta - Math.PI * 0.5) * 0.5;

        const dy = Math.sin(theta - Math.PI * 0.5) * 0.5;

        const sx = (x1 + dx) * BASE_SCALE_UNIT;

        const sy = (y1 + dy) * BASE_SCALE_UNIT;

        const ex = (x2 + dx) * BASE_SCALE_UNIT;

        const ey = (y2 + dy) * BASE_SCALE_UNIT;

        context.moveTo(sx, sy);

        context.lineTo(ex, ey);

        const adx = Math.cos(theta - Math.PI * 0.5) * BASE_SCALE_UNIT * 0.2;

        const ady = Math.sin(theta - Math.PI * 0.5) * BASE_SCALE_UNIT * 0.2;

        context.moveTo(sx - adx, sy - ady);

        context.lineTo(sx + adx, sy + ady);

        context.moveTo(ex - adx, ey - ady);

        context.lineTo(ex + adx, ey + ady);

        context.strokeBy("#bbb", 1);

        context.closePath();

        const mx = (x1 + x2 + 2 * dx) / 2;

        const my = (y1 + y2 + 2 * dy) / 2;

        context.setTextStyle("15px serif", "#000", "center", "middle");

        context.fillText(
            `${Math.round(l * BASE_GRID_SPACE)}`,
            mx * BASE_SCALE_UNIT,
            my * BASE_SCALE_UNIT
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
        ({ vertices, option }: State) => {
            return (context: CanvasRenderingContext2D) => {
                context.clearScreen();

                drawGrid(context);

                drawWalls(context, vertices, option.lineWidth);

                drawHandles(context, vertices, option.handleRadius);

                drawLengths(context, vertices);
            };
        },
        [drawHandles, drawLengths, drawGrid]
    );

    useEffect(() => {
        subjectState.pipe(map(toDrawCall)).subscribe(queue.current);
    }, [subjectState, queue, toDrawCall]);

    return <Canvas queue={queue.current} />;
};

export default Painter;
