import {
    FunctionComponent,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from "react";
import { Vector2 } from "../Core/Vector";
import { MouseState } from "../Core/MouseState";
import { HANDLE_RADIUS, SIZE } from "../Constants/Editor";
import { isOnCircle, isOnLine, scalar } from "../Core/Math";
import GestureDetector from "./GestureDetector";
import { EditorContext } from "./Editor";
import ToolBar from "./ToolBar";

const Control: FunctionComponent = () => {
    const refMouseState = useRef<MouseState>({
        timestamp: 0,
        updated: false,
        origin: { x: 0, y: 0 },
        isDragging: false,
    });

    const {
        subjectVertices,
        addVertex,
        moveVertex,
        removeVertex,
        capture,
        undo,
    } = useContext(EditorContext);

    const checkHolders = (position: Vector2) => {
        const vertices = subjectVertices.getValue();

        for (let i = 0; i < vertices.length; i++) {
            const v = scalar(SIZE, vertices[i]);

            if (!isOnCircle(position, v, HANDLE_RADIUS * 3)) {
                continue;
            }

            capture();

            refMouseState.current.holding = i;

            return;
        }

        for (let i = 0; i < vertices.length; i++) {
            const v1 = scalar(SIZE, vertices.at(i - 1)!);

            const v2 = scalar(SIZE, vertices.at(i)!);

            if (!isOnLine(position, v1, v2, HANDLE_RADIUS * 2)) {
                continue;
            }

            capture();

            addVertex(i, scalar(1 / SIZE, position));

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

        moveVertex(holding, scalar(1 / SIZE, position));

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
            return;
        }

        const duration = Date.now() - refMouseState.current.timestamp;

        if (duration > 200) {
            return;
        }

        const vertices = subjectVertices.getValue();

        if (vertices.length <= 3) {
            return;
        }

        for (let i = 0; i < vertices.length; i++) {
            const v = scalar(SIZE, vertices[i]);

            if (!isOnCircle(position, v, HANDLE_RADIUS * 3)) {
                continue;
            }

            capture();

            removeVertex(i);

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
    }, [onKeyboardDown, subjectVertices]);

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
