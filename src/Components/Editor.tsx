import { useCallback, useEffect, useRef } from "react";
import { Vector2 } from "../Core/Vector";
import { MouseState } from "../Core/MouseState";
import { HANDLE_RADIUS, INITIAL_VERTICES } from "../Constants/Editor";
import { State } from "../Core/State";
import { deepCopy } from "../Functions/Object";
import styles from "./Editor.module.css";
import { Subject, map } from "rxjs";
import Canvas from "./Canvas";
import { toDrawCall } from "./Editor.function";
import { isOnCircle, isOnLine } from "../Core/Math";

const Editor = () => {
    const stateQueue = useRef(new Subject<State>());

    const refMouseState = useRef<MouseState>({
        timestamp: 0,
        updated: false,
        origin: { x: 0, y: 0 },
        isDragging: false,
    });

    const refState = useRef<State>({
        vertices: INITIAL_VERTICES,
    });

    const refMemory = useRef<State[]>([deepCopy(refState.current)]);

    const checkHolders = (position: Vector2) => {
        const { vertices } = refState.current;

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

            stateQueue.current.next(refState.current);

            return;
        }
    };

    const onMouseMove = (position: Vector2) => {
        const { holding } = refMouseState.current;

        if (holding === undefined) {
            return;
        }

        refState.current.vertices[holding] = position;

        refMouseState.current.updated = true;

        stateQueue.current.next(refState.current);
    };

    const onMouseDown = (position: Vector2) => {
        refMouseState.current.timestamp = Date.now();

        refMouseState.current.isDragging = true;

        refMouseState.current.updated = false;

        refMouseState.current.origin = position;

        checkHolders(position);
    };

    const captureState = () => {
        refMemory.current.push(deepCopy(refState.current));
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

        const { vertices } = refState.current;

        if (vertices.length <= 3) {
            return;
        }

        for (let i = 0; i < vertices.length; i++) {
            if (!isOnCircle(position, vertices[i], HANDLE_RADIUS * 3)) {
                continue;
            }

            captureState();

            vertices.splice(i, 1);

            stateQueue.current.next(refState.current);

            return;
        }
    };

    const undo = useCallback(() => {
        const state = refMemory.current.pop();

        if (!state) {
            return;
        }

        refState.current = state;

        stateQueue.current.next(refState.current);
    }, []);

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

        stateQueue.current.next(refState.current);

        return () => {
            window.removeEventListener("keydown", onKeyboardDown);
        };
    }, [onKeyboardDown, stateQueue]);

    const drawCallQueue = stateQueue.current.pipe(map(toDrawCall));

    return (
        <div className={styles.container}>
            <Canvas
                queue={drawCallQueue}
                onMouseMove={onMouseMove}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
            />
        </div>
    );
};

export default Editor;
