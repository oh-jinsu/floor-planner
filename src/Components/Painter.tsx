import {
    FunctionComponent,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from "react";
import Canvas, { DrawCall } from "./Canvas";
import { Subject, combineLatest, map } from "rxjs";
import { EditorContext, State, HoldingObjectState } from "./Editor";
import { Vector2 } from "../Core/Vector";
import {
    BASE_BORDER_WIDTH,
    BASE_GRID_SPACE,
    BASE_LINE_WIDTH,
    BASE_SCALE_UNIT,
} from "../Constants/Editor";
import { distance, scale } from "../Core/Math";

const Painter: FunctionComponent = () => {
    const queue = useRef(new Subject<DrawCall>());

    const { state, holdingObject } = useContext(EditorContext);

    const drawGrid = useCallback(
        (context: CanvasRenderingContext2D) => {
            const gridScale =
                state.getValue().option.gridSize / BASE_GRID_SPACE;

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

            context.strokeBy("#eee", 1);
        },
        [state]
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
            radius,
            0,
            Math.PI * 2
        );

        context.fillBy("#fff");

        context.strokeBy("#777", BASE_BORDER_WIDTH);

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

        context.strokeBy("#777", lineWidth);

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

    const drawHoldingObject = useCallback(
        (
            context: CanvasRenderingContext2D,
            holdingObject: HoldingObjectState,
            lineWidth: number
        ) => {
            const { id, position } = holdingObject;

            if (!position) {
                return;
            }

            switch (id) {
                case "door":
                    context.beginPath();

                    const { x: x1, y: y1 } = scale(BASE_SCALE_UNIT, position);

                    const adx =
                        Math.cos(-Math.PI * 0.5) *
                        (0.5 * lineWidth - BASE_LINE_WIDTH * 0.5);

                    const ady =
                        Math.sin(-Math.PI * 0.5) *
                        (0.5 * lineWidth - BASE_LINE_WIDTH * 0.5);

                    context.moveTo(x1 + adx, y1 + ady);

                    context.lineTo(x1 + BASE_SCALE_UNIT + adx, y1 + ady);

                    context.lineTo(x1 + BASE_SCALE_UNIT - adx, y1 - ady);

                    context.lineTo(x1 - adx, y1 - ady);

                    context.lineTo(x1 + adx, y1 + ady);

                    context.fillBy("#fff");

                    context.strokeBy("#777", BASE_LINE_WIDTH);

                    context.moveTo(x1 + BASE_SCALE_UNIT - adx, y1 - ady);

                    context.arc(
                        x1 + BASE_SCALE_UNIT - adx,
                        y1 - ady,
                        BASE_SCALE_UNIT,
                        Math.PI * 0.5,
                        Math.PI * 1
                    );

                    context.strokeBy("#777", BASE_LINE_WIDTH);

                    context.closePath();

                    break;
            }
        },
        []
    );

    const toDrawCall = useCallback(
        ([{ vertices, option }, holdingObject]: [
            State,
            HoldingObjectState | undefined
        ]) => {
            return (context: CanvasRenderingContext2D) => {
                context.clearScreen();

                drawGrid(context);

                drawWalls(context, vertices, option.lineWidth);

                if (holdingObject) {
                    drawHoldingObject(context, holdingObject, option.lineWidth);
                }

                drawHandles(context, vertices, option.handleRadius);

                drawLengths(context, vertices);
            };
        },
        [drawHandles, drawLengths, drawGrid, drawHoldingObject]
    );

    useEffect(() => {
        combineLatest([state, holdingObject])
            .pipe(map(toDrawCall))
            .subscribe(queue.current);
    }, [state, holdingObject, queue, toDrawCall]);

    return <Canvas queue={queue.current} />;
};

export default Painter;
