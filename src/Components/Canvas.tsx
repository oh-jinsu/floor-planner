import { FunctionComponent, useCallback, useEffect, useRef } from "react";
import styles from "./Canvas.module.css";
import { Observable } from "rxjs";
import { DrawCall } from "../Core/DrawCall";

export type Props = {
    resolution?: number;
    queue: Observable<DrawCall>;
};

const Canvas: FunctionComponent<Props> = ({ resolution, queue }) => {
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

    const onNext = useCallback((drawCall: DrawCall) => {
        const context = getContext()!;

        lastCall.current = drawCall;

        drawCall(context);
    }, []);

    useEffect(() => {
        window.addEventListener("resize", resize, false);

        resize();

        const subscription = queue.subscribe(onNext);

        return () => {
            subscription.unsubscribe();

            window.removeEventListener("resize", resize, false);
        };
    }, [resize, queue, onNext]);

    return <canvas className={styles.canvas} ref={ref} />;
};

export default Canvas;
