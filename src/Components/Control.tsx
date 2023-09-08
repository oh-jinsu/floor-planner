import {
    FunctionComponent,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from "react";
import { Vector2 } from "../Core/Vector";
import { BASE_SCALE_UNIT } from "../Constants/Editor";
import { distance, isOnLine, scale } from "../Core/Math";
import GestureDetector from "./GestureDetector";
import { EditorContext } from "./Editor";
import { ViewportContext } from "./Viewport";

type MouseState = {
    timestamp: number;
    updated: boolean;
    origin: Vector2;
    isDragging: boolean;
    holding?: number;
};

export type Props = {
    children?: ReactNode;
};

const Control: FunctionComponent<Props> = ({ children }) => {
    const { refViewport } = useContext(ViewportContext);

    const refMouseState = useRef<MouseState>({
        timestamp: 0,
        updated: false,
        origin: { x: 0, y: 0 },
        isDragging: false,
    });

    const {
        state,
        holdingObject,
        moveObject,
        addVertex,
        moveVertex,
        removeVertex,
        capture,
        undo,
        setHoldingObject,
    } = useContext(EditorContext);

    const scanVertices = (position: Vector2) => {
        const { vertices, option } = state.getValue();

        const { handleRadius, lineWidth, spareScale } = option;

        for (let i = 0; i < vertices.length; i++) {
            const v1 = scale(BASE_SCALE_UNIT, vertices[i]);

            if (distance(position, v1) < handleRadius * spareScale) {
                refMouseState.current.holding = i;

                refMouseState.current.origin = {
                    x: vertices[i].x,
                    y: vertices[i].y,
                };

                return;
            }

            const v2 = scale(BASE_SCALE_UNIT, vertices.at(i - 1)!);

            if (isOnLine(position, v2, v1, lineWidth * spareScale)) {
                const updated = addVertex(
                    i,
                    scale(1 / BASE_SCALE_UNIT, position)
                );

                refMouseState.current.updated = updated;

                refMouseState.current.holding = i;

                return;
            }
        }
    };

    const onMouseMove = (position: Vector2) => {
        const p = scale(1 / BASE_SCALE_UNIT, position);

        const object = holdingObject.getValue();

        const { current: viewport } = refViewport;

        if (viewport) {
            viewport.style.cursor = object ? "none" : "default";
        }

        if (object) {
            moveObject(p);
        }

        const { holding } = refMouseState.current;

        if (holding === undefined) {
            return;
        }

        const dst = moveVertex(holding, p);

        const { origin } = refMouseState.current;

        const updated = dst.x !== origin.x || dst.y !== origin.y;

        refMouseState.current.updated = updated;
    };

    const onMouseDown = (position: Vector2) => {
        refMouseState.current.timestamp = Date.now();

        refMouseState.current.isDragging = true;

        refMouseState.current.updated = false;

        scanVertices(position);
    };

    const onMouseUp = (position: Vector2) => {
        refMouseState.current.isDragging = false;

        refMouseState.current.holding = undefined;

        if (holdingObject.getValue() !== undefined) {
            setHoldingObject();
        }

        if (refMouseState.current.updated) {
            capture();

            return;
        }

        const duration = Date.now() - refMouseState.current.timestamp;

        const { vertices, option } = state.getValue();

        const { handleRadius, spareScale, shortClickThreshold } = option;

        if (duration > shortClickThreshold) {
            return;
        }

        if (vertices.length <= 3) {
            return;
        }

        for (let i = 0; i < vertices.length; i++) {
            const v = scale(BASE_SCALE_UNIT, vertices[i]);

            if (distance(position, v) > handleRadius * spareScale) {
                continue;
            }

            removeVertex(i);

            capture();

            return;
        }
    };

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
    }, [onKeyboardDown, state]);

    return (
        <GestureDetector
            onMouseMove={onMouseMove}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
        >
            {children}
        </GestureDetector>
    );
};

export default Control;
