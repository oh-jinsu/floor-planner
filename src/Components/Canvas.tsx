import { FunctionComponent, useCallback, useEffect, useRef } from "react";
import styles from "./Canvas.module.css";

export type Props = {
    resolution?: number;
    draw: (context: CanvasRenderingContext2D) => void;
};

const Canvas: FunctionComponent<Props> = ({ resolution, draw }) => {
    const ref = useRef<HTMLCanvasElement>(null);

    const getContext = () => {
        return ref.current?.getContext("2d");
    };

    const resize = useCallback(() => {
        const { current } = ref;

        if (!current) {
            return;
        }

        const canvasResolution = resolution || 2;

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

        draw(context);
    }, [resolution, draw]);

    useEffect(() => {
        window.addEventListener("resize", resize, false);

        resize();

        return () => {
            window.removeEventListener("resize", resize, false);
        };
    }, [resize, draw]);

    return <canvas className={styles.canvas} ref={ref} />;
};

export default Canvas;
