import {
    FunctionComponent,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from "react";
import { Vector2 } from "../Core/Vector";
import { MouseState } from "../Core/MouseState";
import { HANDLE_RADIUS } from "../Constants/Editor";
import { State } from "../Core/State";
import { deepCopy } from "../Functions/Object";
import { isOnCircle, isOnLine } from "../Core/Math";
import GestureDetector from "./GestureDetector";
import { EditorContext } from "./Editor";

const Control: FunctionComponent = () => {
    const refMouseState = useRef<MouseState>({
        timestamp: 0,
        updated: false,
        origin: { x: 0, y: 0 },
        isDragging: false,
    });

    const { stateQueue } = useContext(EditorContext);

    const refMemory = useRef<State[]>([deepCopy(stateQueue.getValue())]);

    const checkHolders = (position: Vector2) => {
        const { vertices } = stateQueue.getValue();

        for (let i = 0; i < vertices.length; i++) {
            if (!isOnCircle(position, vertices[i], HANDLE_RADIUS * 3)) {
                continue;
            }

            captureState();

            refMouseState.current.holding = i;

            return;
        }

        for (let i = 0; i < vertices.length; i++) {
            const v1 = vertices.at(i - 1)!;

            const v2 = vertices.at(i)!;

            if (!isOnLine(position, v1, v2, HANDLE_RADIUS * 2)) {
                continue;
            }

            captureState();

            vertices.splice(i, 0, position);

            refMouseState.current.updated = true;

            refMouseState.current.holding = i;

            stateQueue.next(stateQueue.getValue());

            return;
        }
    };

    const onMouseMove = (position: Vector2) => {
        const { holding } = refMouseState.current;

        if (holding === undefined) {
            return;
        }

        stateQueue.getValue().vertices[holding] = position;

        refMouseState.current.updated = true;

        stateQueue.next(stateQueue.getValue());
    };

    const onMouseDown = (position: Vector2) => {
        refMouseState.current.timestamp = Date.now();

        refMouseState.current.isDragging = true;

        refMouseState.current.updated = false;

        refMouseState.current.origin = position;

        checkHolders(position);
    };

    const captureState = () => {
        refMemory.current.push(deepCopy(stateQueue.getValue()));
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

        const { vertices } = stateQueue.getValue();

        if (vertices.length <= 3) {
            return;
        }

        for (let i = 0; i < vertices.length; i++) {
            if (!isOnCircle(position, vertices[i], HANDLE_RADIUS * 3)) {
                continue;
            }

            captureState();

            vertices.splice(i, 1);

            stateQueue.next(stateQueue.getValue());

            return;
        }
    };

    const undo = useCallback(() => {
        const state = refMemory.current.pop();

        if (!state) {
            return;
        }

        stateQueue.next(state);
    }, [stateQueue]);

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
    }, [onKeyboardDown, stateQueue]);

    return (
        <GestureDetector
            onMouseMove={onMouseMove}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
        />
    );
};

export default Control;
