import { useCallback, useEffect, useRef } from "react";
import { Vector2 } from "../Core/Vector";
import Canvas from "./Canvas";
import { MouseState } from "../Core/MouseState";
import "../Extensions/Canvas";
import "../Extensions/Array";
import { METER, HANDLE_RADIUS, INITIAL_VERTICES } from "../Constants/Editor";
import { State } from "../Core/State";
import { deepCopy } from "../Functions/Object";
import styles from "./Editor.module.css";

const Editor = () => {
    const refContext = useRef<CanvasRenderingContext2D>();

    const refMouseState = useRef<MouseState>({
        timestamp: 0,
        updated: false,
        origin: { x: 0, y: 0 },
        isDragging: false,
    });

    const refState = useRef<State>({
        vertices: INITIAL_VERTICES,
    });

    const refMemory = useRef<State[]>([deepCopy(refState.current)]);

    const drawGrid = useCallback((context: CanvasRenderingContext2D) => {
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
    }, []);

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

    const drawState = useCallback((context: CanvasRenderingContext2D) => {
        const { vertices } = refState.current;

        drawWalls(context, vertices);

        drawHolders(context, vertices);

        drawLengths(context, vertices);
    }, []);

    const draw = useCallback(
        (context: CanvasRenderingContext2D) => {
            refContext.current = context;

            context.clearRect(
                context.canvas.width * -0.5,
                context.canvas.height * -0.5,
                context.canvas.width,
                context.canvas.height
            );

            drawGrid(context);

            drawState(context);
        },
        [drawState, drawGrid]
    );

    const forceDraw = useCallback(() => {
        const context = refContext.current!;

        draw(context);
    }, [draw]);

    const isOnVertex = (
        { x: x1, y: y1 }: Vector2,
        { x: x2, y: y2 }: Vector2
    ) => {
        const sqrX = Math.pow(x2 - x1, 2);

        const sqrY = Math.pow(y2 - y1, 2);

        return sqrX + sqrY < Math.pow(HANDLE_RADIUS, 2) * 8;
    };

    const checkHolders = (position: Vector2) => {
        const { vertices } = refState.current;

        for (let i = 0; i < vertices.length; i++) {
            if (!isOnVertex(vertices[i], position)) {
                continue;
            }

            save();

            refMouseState.current.holding = i;

            return;
        }

        const isOnLine = (
            { x: x1, y: y1 }: Vector2,
            { x: x2, y: y2 }: Vector2
        ) => {
            const a = y2 - y1;

            const b = x1 - x2;

            const c = x1 * (y1 - y2) + y1 * (x2 - x1);

            const l = a * a + b * b;

            const d = Math.pow(a * position.x + b * position.y + c, 2) / l;

            if (d > HANDLE_RADIUS * HANDLE_RADIUS * 8) {
                return false;
            }

            const mx = position.x - (x2 + x1) * 0.5;

            const my = position.y - (y2 + y1) * 0.5;

            return Math.pow(mx, 2) + Math.pow(my, 2) < l * 0.25;
        };

        for (let i = 0; i < vertices.length; i++) {
            const v1 = vertices.at(i - 1)!;

            const v2 = vertices.at(i)!;

            if (!isOnLine(v1, v2)) {
                continue;
            }

            save();

            vertices.splice(i, 0, position);

            refMouseState.current.updated = true;

            refMouseState.current.holding = i;

            forceDraw();

            return;
        }
    };

    const onMouseMove = (position: Vector2) => {
        const { holding } = refMouseState.current;

        if (holding === undefined) {
            return;
        }

        refState.current.vertices[holding] = position;

        refMouseState.current.updated = true;

        forceDraw();
    };

    const initMouseState = (position: Vector2) => {
        refMouseState.current.timestamp = Date.now();

        refMouseState.current.isDragging = true;

        refMouseState.current.updated = false;

        refMouseState.current.origin = position;
    };

    const onMouseDown = (position: Vector2) => {
        initMouseState(position);

        checkHolders(position);
    };

    const save = () => refMemory.current.push(deepCopy(refState.current));

    const onMouseUp = (position: Vector2) => {
        refMouseState.current.isDragging = false;

        refMouseState.current.holding = undefined;

        if (refMouseState.current.updated) {
            return;
        }

        const duration = Date.now() - refMouseState.current.timestamp;

        if (duration > 200) {
            return;
        }

        const { vertices } = refState.current;

        if (vertices.length <= 3) {
            return;
        }

        for (let i = 0; i < vertices.length; i++) {
            if (!isOnVertex(vertices[i], position)) {
                continue;
            }

            save();

            console.log(i);

            vertices.splice(i, 1);

            forceDraw();

            return;
        }
    };

    const undo = useCallback(() => {
        const { current: context } = refContext;

        if (!context) {
            return;
        }

        const state = refMemory.current.pop();

        if (!state) {
            return;
        }

        refState.current = state;

        forceDraw();
    }, [forceDraw]);

    const onKeyboardDown = useCallback(
        ({ key, ctrlKey, metaKey }: KeyboardEvent) => {
            if (key === "z" && (ctrlKey || metaKey)) {
                undo();
            }
        },
        [undo]
    );

    useEffect(() => {
        window.addEventListener("keydown", onKeyboardDown);

        return () => {
            window.removeEventListener("keydown", onKeyboardDown);
        };
    }, [onKeyboardDown]);

    return (
        <div className={styles.container}>
            <Canvas
                draw={draw}
                onMouseMove={onMouseMove}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
            />
        </div>
    );
};

export default Editor;
