import {
    FunctionComponent,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
} from "react";
import { Vector2 } from "../Types/Vector";
import { ViewportContext } from "./Viewport";
import { getOffset } from "../Functions/Common/Element";

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
    const { refViewport } = useContext(ViewportContext);

    const getPosition = useCallback(
        (e: MouseEvent) => {
            const current = refViewport.current;

            if (!current) {
                return { x: 0, y: 0 };
            }

            const offset = getOffset(current);

            const width = current.scrollWidth;

            const x = e.x - offset.x - width * 0.5 + current.scrollLeft;

            const height = current.scrollHeight;

            const y = e.y - offset.y - height * 0.5 + current.scrollTop;

            return { x, y };
        },
        [refViewport]
    );

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
        const { current } = refViewport;

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
    }, [refViewport, mouseMove, mouseDown, mouseUp]);

    return <>{children}</>;
};

export default GestureDetector;
