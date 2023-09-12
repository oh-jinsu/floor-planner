import {
    FunctionComponent,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from "react";
import { Vector2 } from "../Types/Vector";
import { BASE_SCALE_UNIT } from "../Constants/Editor";
import { scale } from "../Functions/Common/Math";
import GestureDetector from "./GestureDetector";
import { EditorContext } from "./Editor";
import { ViewportContext } from "./Viewport";
import { FindVertexIndexOnPosition } from "../Functions/Control/FindVertexIndexOnPosition";
import { findLineIndexOnPosition } from "../Functions/Control/FindLineIndexOnPosition";

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
    const { setCursor } = useContext(ViewportContext);

    const refMouseState = useRef<MouseState>({
        timestamp: 0,
        updated: false,
        origin: { x: 0, y: 0 },
        isDragging: false,
    });

    const {
        stateSubject,
        moveObject,
        addVertices,
        moveVertex,
        removeVertex,
        capture,
        undo,
        setHoldingObject,
    } = useContext(EditorContext);

    const scanVertices = (position: Vector2) => {
        const state = stateSubject.getValue();

        {
            const i = FindVertexIndexOnPosition(state, position);

            if (i !== undefined) {
                refMouseState.current.holding = i;

                refMouseState.current.origin = state.vertices[i];

                return;
            }
        }

        {
            const i = findLineIndexOnPosition(state, position);

            if (i !== undefined) {
                const vertices = addVertices(
                    i,
                    scale(1 / BASE_SCALE_UNIT, position)
                );

                refMouseState.current.holding = vertices[0];

                refMouseState.current.updated = true;

                return;
            }
        }
    };

    const onMouseMove = (position: Vector2) => {
        const point = scale(1 / BASE_SCALE_UNIT, position);

        const { grabbingObject } = stateSubject.getValue();

        if (grabbingObject) {
            setCursor("none");

            moveObject(point);

            return;
        }

        setCursor("default");

        const { holding } = refMouseState.current;

        if (holding === undefined) {
            return;
        }

        const dst = moveVertex(holding, point);

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

        const state = stateSubject.getValue();

        const { grabbingObject, option } = state;

        if (grabbingObject !== undefined) {
            capture();

            setHoldingObject();
        }

        if (refMouseState.current.updated) {
            capture();

            return;
        }

        const duration = Date.now() - refMouseState.current.timestamp;

        if (duration > option.shortClickThreshold) {
            return;
        }

        const i = FindVertexIndexOnPosition(state, position);

        if (i !== undefined) {
            removeVertex(i);

            capture();
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
    }, [onKeyboardDown, stateSubject]);

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
