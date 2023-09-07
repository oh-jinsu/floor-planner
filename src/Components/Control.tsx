import {
    FunctionComponent,
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
import ToolBar from "./ToolBar";

type MouseState = {
    timestamp: number;
    updated: boolean;
    origin: Vector2;
    isDragging: boolean;
    holding?: number;
};

const Control: FunctionComponent = () => {
    const refMouseState = useRef<MouseState>({
        timestamp: 0,
        updated: false,
        origin: { x: 0, y: 0 },
        isDragging: false,
    });

    const { subjectState, addVertex, moveVertex, removeVertex, capture, undo } =
        useContext(EditorContext);

    const checkHolders = (position: Vector2) => {
        const { vertices, option } = subjectState.getValue();

        const { handleRadius, lineWidth, spareScale } = option;

        for (let i = 0; i < vertices.length; i++) {
            const v = scale(BASE_SCALE_UNIT, vertices[i]);

            if (distance(position, v) > handleRadius * spareScale) {
                continue;
            }

            refMouseState.current.holding = i;

            return;
        }

        for (let i = 0; i < vertices.length; i++) {
            const v1 = scale(BASE_SCALE_UNIT, vertices.at(i - 1)!);

            const v2 = scale(BASE_SCALE_UNIT, vertices.at(i)!);

            if (!isOnLine(position, v1, v2, lineWidth * spareScale)) {
                continue;
            }

            addVertex(i, scale(1 / BASE_SCALE_UNIT, position));

            refMouseState.current.updated = true;

            refMouseState.current.holding = i;

            return;
        }
    };

    const onMouseMove = (position: Vector2) => {
        const { holding } = refMouseState.current;

        if (holding === undefined) {
            return;
        }

        moveVertex(holding, scale(1 / BASE_SCALE_UNIT, position));

        refMouseState.current.updated = true;
    };

    const onMouseDown = (position: Vector2) => {
        refMouseState.current.timestamp = Date.now();

        refMouseState.current.isDragging = true;

        refMouseState.current.updated = false;

        refMouseState.current.origin = position;

        checkHolders(position);
    };

    const onMouseUp = (position: Vector2) => {
        refMouseState.current.isDragging = false;

        refMouseState.current.holding = undefined;

        if (refMouseState.current.updated) {
            capture();

            return;
        }

        const duration = Date.now() - refMouseState.current.timestamp;

        const { vertices, option } = subjectState.getValue();

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
    }, [onKeyboardDown, subjectState]);

    return (
        <GestureDetector
            onMouseMove={onMouseMove}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
        >
            <ToolBar />
        </GestureDetector>
    );
};

export default Control;
