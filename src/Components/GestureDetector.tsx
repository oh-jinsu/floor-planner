import {
    FunctionComponent,
    ReactNode,
    useCallback,
    useEffect,
    useRef,
} from "react";
import { Vector2 } from "../Core/Vector";
import styles from "./GestureDetector.module.css";

export type Props = {
    children?: ReactNode;
    onMouseMove?: (position: Vector2) => void;
    onMouseUp?: (position: Vector2) => void;
    onMouseDown?: (position: Vector2) => void;
};

const GestureDetector: FunctionComponent<Props> = ({
    children,
    onMouseMove,
    onMouseDown,
    onMouseUp,
}) => {
    const ref = useRef<HTMLDivElement>(null);

    const getPosition = useCallback((e: MouseEvent) => {
        const current = ref.current!;

        const offsetX = current.parentElement?.offsetLeft || 0;

        const x = e.x - offsetX - current.offsetWidth * 0.5;

        const offsetY = current.parentElement?.offsetTop || 0;

        const y = e.y - offsetY - current.offsetHeight * 0.5;

        return { x, y };
    }, []);

    const mouseMove = useCallback(
        (e: MouseEvent) => {
            const position = getPosition(e);

            onMouseMove?.(position);
        },
        [getPosition, onMouseMove]
    );

    const mouseDown = useCallback(
        (e: MouseEvent) => {
            const position = getPosition(e);

            onMouseDown?.(position);
        },
        [getPosition, onMouseDown]
    );

    const mouseUp = useCallback(
        (e: MouseEvent) => {
            const position = getPosition(e);

            onMouseUp?.(position);
        },
        [getPosition, onMouseUp]
    );

    const preventDefault = (e: Event) => {
        e.preventDefault();
    };

    useEffect(() => {
        const { current } = ref;

        current?.addEventListener("contextmenu", preventDefault);

        window.addEventListener("mousemove", mouseMove);

        window.addEventListener("mousedown", mouseDown);

        window.addEventListener("mouseup", mouseUp);

        return () => {
            current?.addEventListener("contextmenu", preventDefault);

            window.removeEventListener("mousemove", mouseMove);

            window.removeEventListener("mousedown", mouseDown);

            window.removeEventListener("mouseup", mouseUp);
        };
    }, [mouseMove, mouseDown, mouseUp]);

    return (
        <div ref={ref} className={styles.container}>
            {children}
        </div>
    );
};

export default GestureDetector;
