import { FunctionComponent, useCallback, useEffect, useRef } from "react";
import styles from "./Canvas.module.css";
import { Vector2 } from "../Core/Vector";

export type Props = {
    resolution?: number;
    draw: (context: CanvasRenderingContext2D) => void;
    onMouseMove?: (
        context: CanvasRenderingContext2D,
        position: Vector2
    ) => void;
    onMouseUp?: (context: CanvasRenderingContext2D, position: Vector2) => void;
    onMouseDown?: (
        context: CanvasRenderingContext2D,
        position: Vector2
    ) => void;
};

const Canvas: FunctionComponent<Props> = ({
    resolution,
    draw,
    onMouseMove,
    onMouseDown,
    onMouseUp,
}) => {
    const ref = useRef<HTMLCanvasElement>(null);

    const getContext = () => {
        return ref.current?.getContext("2d");
    };

    const getCanvasResolution = useCallback(
        () => resolution || 2,
        [resolution]
    );

    const resize = useCallback(() => {
        const { current } = ref;

        if (!current) {
            return;
        }

        const canvasResolution = getCanvasResolution();

        current.width = current.clientWidth * canvasResolution;

        current.height = current.clientHeight * canvasResolution;

        const context = getContext();

        if (!context) {
            return;
        }

        context.setTransform(
            canvasResolution,
            0,
            0,
            canvasResolution,
            current.width * 0.5,
            current.height * 0.5
        );

        context.clearRect(0, 0, current.width, current.height);

        draw(context);
    }, [getCanvasResolution, draw]);

    const getPosition = useCallback(
        (e: MouseEvent, current: HTMLCanvasElement) => {
            const canvasResolution = getCanvasResolution();

            const x =
                e.x -
                current.offsetLeft -
                (current.width * 0.5) / canvasResolution;

            const y =
                e.y -
                current.offsetTop -
                (current.height * 0.5) / canvasResolution;

            return { x, y };
        },
        [getCanvasResolution]
    );

    const mouseMove = useCallback(
        (e: MouseEvent) => {
            const context = getContext();

            if (!context) {
                return;
            }

            const position = getPosition(e, context.canvas);

            onMouseMove?.(context, position);
        },
        [getPosition, onMouseMove]
    );

    const mouseDown = useCallback(
        (e: MouseEvent) => {
            const context = getContext();

            if (!context) {
                return;
            }

            const position = getPosition(e, context.canvas);

            onMouseDown?.(context, position);
        },
        [getPosition, onMouseDown]
    );

    const mouseUp = useCallback(
        (e: MouseEvent) => {
            const context = getContext();

            if (!context) {
                return;
            }

            const position = getPosition(e, context.canvas);

            onMouseUp?.(context, position);
        },
        [getPosition, onMouseUp]
    );

    useEffect(() => {
        window.addEventListener("resize", resize, false);

        resize();

        window.addEventListener("mousemove", mouseMove);

        window.addEventListener("mousedown", mouseDown);

        window.addEventListener("mouseup", mouseUp);

        return () => {
            window.removeEventListener("resize", resize, false);

            window.removeEventListener("mousemove", mouseMove);

            window.removeEventListener("mousedown", mouseDown);

            window.removeEventListener("mouseup", mouseUp);
        };
    }, [resize, draw, mouseMove, mouseDown, mouseUp]);

    return <canvas className={styles.canvas} ref={ref} />;
};

export default Canvas;
