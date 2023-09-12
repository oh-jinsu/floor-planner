import {
    FunctionComponent,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from "react";
import styles from "./Canvas.module.css";
import { BehaviorSubject } from "rxjs";
import { BASE_VIEWPORT_HEIGHT, BASE_VIEWPORT_WIDTH } from "../Constants/Editor";
import { ViewportContext } from "./Viewport";

export type DrawCall = (context: CanvasRenderingContext2D) => void;

export type Props = {
    resolution?: number;
    queue: BehaviorSubject<DrawCall>;
};

const Canvas: FunctionComponent<Props> = ({ resolution, queue }) => {
    const { refViewport } = useContext(ViewportContext);

    const refCanvas = useRef<HTMLCanvasElement>(null);

    const getContext = () => {
        return refCanvas.current?.getContext("2d");
    };

    const getCanvasResolution = useCallback(
        () => resolution || 2,
        [resolution]
    );

    const resize = useCallback(() => {
        const { current: viewport } = refViewport;

        const { current: canvas } = refCanvas;

        if (!canvas || !viewport) {
            return;
        }

        const canvasResolution = getCanvasResolution();

        const width = Math.max(viewport.clientWidth, BASE_VIEWPORT_WIDTH);

        const height = Math.max(viewport.clientHeight, BASE_VIEWPORT_HEIGHT);

        canvas.style.width = `${width}px`;

        canvas.style.height = `${height}px`;

        canvas.width = canvas.clientWidth * canvasResolution;

        canvas.height = canvas.clientHeight * canvasResolution;

        const context = getContext();

        if (!context) {
            return;
        }

        context.setTransform(
            canvasResolution,
            0,
            0,
            canvasResolution,
            canvas.width * 0.5,
            canvas.height * 0.5
        );

        queue.getValue()(context);
    }, [getCanvasResolution, refViewport, queue]);

    const onNext = useCallback((drawCall: DrawCall) => {
        const context = getContext()!;

        drawCall(context);
    }, []);

    useEffect(() => {
        window.addEventListener("resize", resize);

        resize();

        const subscription = queue.subscribe(onNext);

        return () => {
            window.removeEventListener("resize", resize);

            subscription.unsubscribe();
        };
    }, [resize, queue, onNext]);

    return <canvas className={styles.canvas} ref={refCanvas} />;
};

export default Canvas;
