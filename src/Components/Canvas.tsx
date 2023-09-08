import { FunctionComponent, useCallback, useEffect, useRef } from "react";
import styles from "./Canvas.module.css";
import { Observable } from "rxjs";
import { BASE_VIEWPORT_HEIGHT, BASE_VIEWPORT_WIDTH } from "../Constants/Editor";

export type DrawCall = (context: CanvasRenderingContext2D) => void;

export type Props = {
    resolution?: number;
    queue: Observable<DrawCall>;
};

const Canvas: FunctionComponent<Props> = ({ resolution, queue }) => {
    const ref = useRef<HTMLCanvasElement>(null);

    const getContext = () => {
        return ref.current?.getContext("2d");
    };

    const getCanvasResolution = useCallback(
        () => resolution || 2,
        [resolution]
    );

    const initialize = useCallback(() => {
        const { current } = ref;

        if (!current) {
            return;
        }

        const canvasResolution = getCanvasResolution();

        current.style.width = `${BASE_VIEWPORT_WIDTH}px`;

        current.style.height = `${BASE_VIEWPORT_HEIGHT}px`;

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
    }, [getCanvasResolution]);

    const onNext = useCallback((drawCall: DrawCall) => {
        const context = getContext()!;

        drawCall(context);
    }, []);

    useEffect(() => {
        initialize();

        const subscription = queue.subscribe(onNext);

        return () => {
            subscription.unsubscribe();
        };
    }, [initialize, queue, onNext]);

    return <canvas className={styles.canvas} ref={ref} />;
};

export default Canvas;
