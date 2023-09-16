import { FunctionComponent, useRef } from "react";
import styles from "./Editor.module.css";
import Control from "./Control";
import { BehaviorSubject } from "rxjs";
import Painter from "./Painter";
import { createContext } from "react";
import { Vector2 } from "../Types/Vector";
import { clone } from "../Functions/Common/Object";
import { BASE_SCALE_UNIT, DEFAULT_STATE } from "../Constants/Editor";
import { currentValue } from "../Functions/Common/React";
import { arrayBufferToString } from "../Functions/Common/Buffer";
import Viewport from "./Viewport";
import ToolBar from "./ToolBar";
import SideBar from "./Sidebar";
import { isNearFromLine, nearestOnLine } from "../Functions/Common/Math";
import { EditorState } from "../Types/EditorState";
import { EditorOption } from "../Types/EditorOption";
import { snapPosition } from "../Functions/Editor/SnapPosition";
import { GrabbingObject } from "../Types/GrabbingObject";
import { addVerticesToState } from "../Functions/Editor/AddVerticesToState";
import { removeVertexFromState } from "../Functions/Editor/RemoveVertexFromState";

export type EditorContextProps = {
    stateSubject: BehaviorSubject<EditorState>;
    memorySubject: BehaviorSubject<EditorState[]>;
    addVertices: (i: number, ...position: Vector2[]) => number[];
    moveVertex: (i: number, position: Vector2) => Vector2;
    removeVertex: (i: number) => boolean;
    moveObject: (position: Vector2) => boolean;
    clean: () => void;
    capture: () => void;
    serialize: () => Blob;
    deserialize: (blob: Blob) => void;
    undo: () => void;
    redo: () => void;
    changeOption: (option: Partial<EditorOption>) => void;
    setHoldingObject: (grabbingObject?: GrabbingObject) => void;
};

export const EditorContext = createContext<EditorContextProps>({} as any);

const Editor: FunctionComponent = () => {
    const refState = useRef(new BehaviorSubject<EditorState>(DEFAULT_STATE));

    const refMemory = useRef(
        new BehaviorSubject<EditorState[]>([clone(currentValue(refState))])
    );

    const refMemoryPointer = useRef(0);

    const initialize = (state: EditorState) => {
        refState.current.next(state);

        refMemory.current.next([clone(state)]);

        refMemoryPointer.current = 0;
    };

    const addVertices = (i: number, ...positions: Vector2[]) => {
        const state = currentValue(refState);

        const { result, vertices, lines } = addVerticesToState(
            i,
            state,
            positions
        );

        refState.current.next({
            ...state,
            vertices,
            lines,
        });

        return result;
    };

    const moveVertex = (i: number, position: Vector2) => {
        const state = currentValue(refState);

        const destination = snapPosition(state, position);

        const vertices = state.vertices.map((value, index) => {
            if (index !== i) {
                return value;
            }

            return destination;
        });

        refState.current.next({
            ...state,
            vertices,
        });

        return destination;
    };

    const removeVertex = (i: number) => {
        const state = currentValue(refState);

        const { vertices, lines } = removeVertexFromState(state, i);

        const result = {
            ...state,
            vertices,
            lines,
        };

        refState.current.next(result);

        return true;
    };

    const moveObject = (position: Vector2) => {
        const state = currentValue(refState);

        const { grabbingObject, option } = state;

        if (!grabbingObject) {
            return false;
        }

        const memory = currentValue(refMemory)[refMemoryPointer.current];

        const { vertices, lines } = memory;

        for (let i = 0; i < lines.length; i++) {
            const [i1, i2] = lines[i].anchor;

            const v1 = vertices[i1];

            const v2 = vertices[i2];

            const r = (5 * option.spareScale) / BASE_SCALE_UNIT;

            if (!isNearFromLine(position, v1, v2, r)) {
                continue;
            }

            const p = nearestOnLine(position, v1, v2);

            const theta = Math.atan2(v2.y - v1.y, v2.x - v1.x);

            const l = grabbingObject.length;

            const dx = Math.cos(theta) * l;

            const dy = Math.sin(theta) * l;

            const a1 = { x: p.x, y: p.y };

            const a2 = { x: p.x + dx, y: p.y + dy };

            if (
                !isNearFromLine(a1, v1, v2, 1) ||
                !isNearFromLine(a2, v1, v2, 1)
            ) {
                continue;
            }

            const result = addVerticesToState(
                i,
                memory,
                [a1, a2],
                grabbingObject.type
            );

            refState.current.next({
                ...state,
                vertices: result.vertices,
                lines: result.lines,
                grabbingObject: {
                    ...grabbingObject,
                    position: undefined,
                },
            });

            return true;
        }

        refState.current.next({
            ...state,
            vertices,
            lines,
            grabbingObject: {
                ...grabbingObject,
                position,
            },
        });

        return true;
    };

    const clean = () => {};

    const capture = () => {
        clean();

        const state = currentValue(refState);

        const memory = currentValue(refMemory);

        const copy = [
            ...memory.slice(0, refMemoryPointer.current + 1),
            clone(state),
        ];

        const capacity = Math.min(100, copy.length);

        refMemory.current.next(copy.slice(-capacity));

        refMemoryPointer.current = copy.length - 1;
    };

    const pointCurrentMemory = () => {
        const i = refMemoryPointer.current;

        const state = currentValue(refMemory)[i];

        refState.current.next(state);
    };

    const serialize = () => {
        const state = currentValue(refState);

        const content = JSON.stringify(state);

        return new Blob([content], { type: "text/plain " });
    };

    const deserialize = (blob: Blob) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const result = event.target?.result;

            if (!result) {
                return;
            }

            const data =
                result instanceof ArrayBuffer
                    ? arrayBufferToString(result)
                    : result;

            const state = JSON.parse(data);

            initialize(state);
        };

        reader.readAsText(blob);
    };

    const undo = () => {
        if (refMemoryPointer.current === 0) {
            return;
        }

        refMemoryPointer.current -= 1;

        pointCurrentMemory();
    };

    const redo = () => {
        const memory = currentValue(refMemory);

        if (refMemoryPointer.current === memory.length - 1) {
            return;
        }

        refMemoryPointer.current += 1;

        pointCurrentMemory();
    };

    const changeOption = (option: Partial<EditorOption>) => {
        if (option.gridSpace !== undefined && option.gridSpace < 100) {
            return;
        }

        const state = currentValue(refState);

        refState.current.next({
            ...state,
            option: {
                ...state.option,
                ...option,
            },
        });
    };

    const setHoldingObject = (grabbingObject?: GrabbingObject) => {
        const state = refState.current.getValue();

        refState.current.next({
            ...state,
            grabbingObject,
        });
    };

    const value: EditorContextProps = {
        stateSubject: refState.current,
        memorySubject: refMemory.current,
        addVertices,
        moveVertex,
        removeVertex,
        moveObject,
        clean,
        capture,
        serialize,
        deserialize,
        undo,
        redo,
        changeOption,
        setHoldingObject,
    };

    return (
        <EditorContext.Provider value={value}>
            <div className={styles.container}>
                <SideBar />
                <main className={styles.main}>
                    <Viewport>
                        <Control>
                            <Painter />
                        </Control>
                    </Viewport>
                    <ToolBar />
                </main>
            </div>
        </EditorContext.Provider>
    );
};

export default Editor;
