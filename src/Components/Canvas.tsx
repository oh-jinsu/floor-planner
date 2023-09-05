import { FunctionComponent, useCallback, useEffect, useRef } from "react";
import styles from "./Canvas.module.css";
import { Vector2 } from "../Core/Vector";
import { Observable } from "rxjs";
import { DrawCall } from "../Core/DrawCall";

export type Props = {
    resolution?: number;
    queue: Observable<DrawCall>;
    onMouseMove?: (position: Vector2) => void;
    onMouseUp?: (position: Vector2) => void;
    onMouseDown?: (position: Vector2) => void;
};

const Canvas: FunctionComponent<Props> = ({
    resolution,
    queue,
    onMouseMove,
    onMouseDown,
    onMouseUp,
}) => {
    const lastCall = useRef<DrawCall>();

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

        lastCall.current?.(context);
    }, [getCanvasResolution]);

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

            onMouseMove?.(position);
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

            onMouseDown?.(position);
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

            onMouseUp?.(position);
        },
        [getPosition, onMouseUp]
    );

    const onNext = useCallback((drawCall: DrawCall) => {
        const context = getContext()!;

        lastCall.current = drawCall;

        drawCall(context);
    }, []);

    useEffect(() => {
        window.addEventListener("resize", resize, false);

        resize();

        window.addEventListener("mousemove", mouseMove);

        window.addEventListener("mousedown", mouseDown);

        window.addEventListener("mouseup", mouseUp);

        const subscription = queue.subscribe(onNext);

        return () => {
            subscription.unsubscribe();

            window.removeEventListener("resize", resize, false);

            window.removeEventListener("mousemove", mouseMove);

            window.removeEventListener("mousedown", mouseDown);

            window.removeEventListener("mouseup", mouseUp);
        };
    }, [resize, queue, onNext, mouseMove, mouseDown, mouseUp]);

    return <canvas className={styles.canvas} ref={ref} />;
};

export default Canvas;
