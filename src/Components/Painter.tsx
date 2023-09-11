import {
    FunctionComponent,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from "react";
import Canvas, { DrawCall } from "./Canvas";
import { BehaviorSubject, combineLatest, map } from "rxjs";
import { EditorContext, HoldingObject } from "./Editor";
import { Vector2 } from "../Types/Vector";
import {
    BASE_BORDER_WIDTH,
    BASE_LINE_WIDTH,
    BASE_SCALE_UNIT,
} from "../Constants/Editor";
import { distance, scale } from "../Functions/Math";
import { EditorOption } from "../Types/EditorOption";
import { EditorState } from "../Types/EditorState";
import { Line } from "../Types/Line";

const Painter: FunctionComponent = () => {
    const queue = useRef(new BehaviorSubject<DrawCall>(() => {}));

    const { state, holdingObject } = useContext(EditorContext);

    const drawGrid = useCallback(
        (context: CanvasRenderingContext2D) => {
            const { gridSpace } = state.getValue().option;

            context.beginPath();

            const { width } = context.canvas;

            for (let x = 0; x < width * 0.5; x += gridSpace * BASE_SCALE_UNIT) {
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
                y += gridSpace * BASE_SCALE_UNIT
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
        { handleRadius, lineColor }: EditorOption
    ) => {
        context.beginPath();

        context.arc(
            x * BASE_SCALE_UNIT,
            y * BASE_SCALE_UNIT,
            handleRadius,
            0,
            Math.PI * 2
        );

        context.fillBy("#fff");

        context.strokeBy(lineColor, BASE_BORDER_WIDTH);

        context.closePath();
    };

    const drawHandles = useCallback(
        (
            context: CanvasRenderingContext2D,
            vertices: Vector2[],
            option: EditorOption
        ) => {
            for (let i = 0; i < vertices.length; i++) {
                drawHandle(context, vertices[i], option);
            }
        },
        []
    );

    const drawWall = (
        context: CanvasRenderingContext2D,
        v1: Vector2,
        v2: Vector2,
        { lineColor, wallLineWidth }: EditorOption
    ) => {
        context.beginPath();

        context.lineTo(v1.x * BASE_SCALE_UNIT, v1.y * BASE_SCALE_UNIT);

        context.lineTo(v2.x * BASE_SCALE_UNIT, v2.y * BASE_SCALE_UNIT);

        context.strokeBy(lineColor, wallLineWidth);

        context.closePath();
    };

    const drawLine = useCallback(
        (
            context: CanvasRenderingContext2D,
            vertices: Vector2[],
            { type, anchor }: Line,
            option: EditorOption
        ) => {
            const [i1, i2] = anchor;

            const v1 = vertices[i1];

            const v2 = vertices[i2];

            if (type === "door") {
                const s1 = scale(BASE_SCALE_UNIT, v1);

                const s2 = scale(BASE_SCALE_UNIT, v2);

                drawDoor(context, s1, s2, option);

                return;
            }

            drawWall(context, v1, v2, option);
        },
        []
    );

    const drawLines = useCallback(
        (
            context: CanvasRenderingContext2D,
            vertices: Vector2[],
            lines: Line[],
            option: EditorOption
        ) => {
            if (vertices.length === 0) {
                return;
            }

            context.beginPath();

            for (let i = 0; i < lines.length; i++) {
                const [i1, i2] = lines[i].anchor;

                const v1 = vertices[i1];

                const v2 = vertices[i2];

                context.lineTo(v1.x * BASE_SCALE_UNIT, v1.y * BASE_SCALE_UNIT);

                context.lineTo(v2.x * BASE_SCALE_UNIT, v2.y * BASE_SCALE_UNIT);
            }

            context.fillBy("#fff");

            context.closePath();

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                drawLine(context, vertices, line, option);
            }
        },
        [drawLine]
    );

    const drawMeasure = (
        context: CanvasRenderingContext2D,
        {
            measureColor,
            measureCalibartion,
            measureDistanceRatio,
        }: EditorOption,
        { x: x1, y: y1 }: Vector2,
        { x: x2, y: y2 }: Vector2
    ) => {
        const l = distance({ x: x1, y: y1 }, { x: x2, y: y2 });

        if (l === 0) {
            return;
        }

        context.beginPath();

        const theta = Math.atan2(y2 - y1, x2 - x1);

        const dx =
            Math.cos(theta - Math.PI * 0.5) * 1000 * measureDistanceRatio;

        const dy =
            Math.sin(theta - Math.PI * 0.5) * 1000 * measureDistanceRatio;

        const sx = (x1 + dx) * BASE_SCALE_UNIT;

        const sy = (y1 + dy) * BASE_SCALE_UNIT;

        const ex = (x2 + dx) * BASE_SCALE_UNIT;

        const ey = (y2 + dy) * BASE_SCALE_UNIT;

        context.moveTo(sx, sy);

        context.lineTo(ex, ey);

        const adx = dx * 0.4 * BASE_SCALE_UNIT;

        const ady = dy * 0.4 * BASE_SCALE_UNIT;

        context.moveTo(sx - adx, sy - ady);

        context.lineTo(sx + adx, sy + ady);

        context.moveTo(ex - adx, ey - ady);

        context.lineTo(ex + adx, ey + ady);

        context.strokeBy(measureColor, 1);

        context.closePath();

        const mx = (x1 + x2 + 2 * dx) / 2;

        const my = (y1 + y2 + 2 * dy) / 2;

        context.setTextStyle("15px serif", "#000", "center", "middle");

        context.fillText(
            `${Math.round(l * measureCalibartion)}`,
            mx * BASE_SCALE_UNIT,
            my * BASE_SCALE_UNIT
        );
    };

    const drawMeasures = useCallback(
        (
            context: CanvasRenderingContext2D,
            vertices: Vector2[],
            lines: Line[],
            option: EditorOption
        ) => {
            for (let i = 0; i < lines.length; i++) {
                const { anchor } = lines[i];

                const [i1, i2] = anchor;

                const v1 = vertices[i1];

                const v2 = vertices[i2];

                drawMeasure(context, option, v1, v2);
            }
        },
        []
    );

    const drawDoor = (
        context: CanvasRenderingContext2D,
        v1: Vector2,
        v2: Vector2,
        { wallLineWidth, lineColor }: EditorOption
    ) => {
        const theta = Math.atan2(v2.y - v1.y, v2.x - v1.x);

        const dx = Math.sin(theta * Math.PI) * wallLineWidth * 0.5;

        const dy = Math.cos(theta * Math.PI) * wallLineWidth * 0.5;

        context.beginPath();

        context.moveTo(v1.x - dx, v1.y - dy);

        context.lineTo(v1.x + dx, v1.y + dy);

        context.lineTo(v2.x + dx, v2.y + dy);

        context.lineTo(v2.x - dx, v2.y - dy);

        context.lineTo(v1.x - dx, v1.y - dy);

        context.fillBy("#fff");

        context.strokeBy(lineColor, BASE_LINE_WIDTH);

        const px = v1.x - dx;

        const py = v1.y - dy;

        context.moveTo(px, py);

        const length = distance(v1, v2);

        context.arc(px, py, length, theta + Math.PI * 1.5, theta + Math.PI * 2);

        context.strokeBy(lineColor, BASE_LINE_WIDTH);

        context.closePath();
    };

    const drawHoldingObject = useCallback(
        (
            context: CanvasRenderingContext2D,
            holdingObject: HoldingObject,
            option: EditorOption
        ) => {
            const { id, position } = holdingObject;

            if (!position) {
                return;
            }

            switch (id) {
                case "door":
                    const { anchor } = holdingObject;

                    const [v1, v2] = (() => {
                        if (anchor) {
                            const v1 = scale(BASE_SCALE_UNIT, anchor.v1);

                            const v2 = scale(BASE_SCALE_UNIT, anchor.v2);

                            return [v1, v2];
                        }

                        const v1 = scale(BASE_SCALE_UNIT, position);

                        const { length } = holdingObject;

                        const v2 = {
                            x: v1.x + length * BASE_SCALE_UNIT,
                            y: v1.y,
                        };

                        return [v1, v2];
                    })();

                    drawDoor(context, v1, v2, option);

                    break;
            }
        },
        []
    );

    const toDrawCall = useCallback(
        ([{ vertices, lines, option }, holdingObject]: [
            EditorState,
            HoldingObject | undefined
        ]) => {
            return (context: CanvasRenderingContext2D) => {
                context.clearScreen();

                drawGrid(context);

                drawLines(context, vertices, lines, option);

                if (holdingObject) {
                    drawHoldingObject(context, holdingObject, option);
                }

                drawHandles(context, vertices, option);

                drawMeasures(context, vertices, lines, option);
            };
        },
        [drawHandles, drawMeasures, drawGrid, drawHoldingObject, drawLines]
    );

    useEffect(() => {
        combineLatest([state, holdingObject])
            .pipe(map(toDrawCall))
            .subscribe(queue.current);
    }, [state, holdingObject, queue, toDrawCall]);

    return <Canvas queue={queue.current} />;
};

export default Painter;
