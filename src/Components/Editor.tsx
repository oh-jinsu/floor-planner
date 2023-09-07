import { FunctionComponent, useRef } from "react";
import styles from "./Editor.module.css";
import Control from "./Control";
import { BehaviorSubject } from "rxjs";
import Painter from "./Painter";
import { createContext } from "react";
import { Vector2 } from "../Core/Vector";
import { deepCopy } from "../Functions/Object";
import { INITIAL_VERTICES } from "../Constants/Editor";

export type State = {
    vertices: Vector2[];
};

export type EditorContextProps = {
    subjectState: BehaviorSubject<State>;
    subjectMemory: BehaviorSubject<State[]>;
    addVertex: (i: number, position: Vector2) => void;
    moveVertex: (i: number, position: Vector2) => void;
    removeVertex: (i: number) => void;
    capture: () => void;
    undo: () => void;
    redo: () => void;
};

export const EditorContext = createContext<EditorContextProps>({} as any);

const Editor: FunctionComponent = () => {
    const refState = useRef(
        new BehaviorSubject<State>({
            vertices: INITIAL_VERTICES,
        })
    );

    const refMemory = useRef(
        new BehaviorSubject<State[]>([refState.current.getValue()])
    );

    const refMemoryPointer = useRef(0);

    const addVertex = (i: number, position: Vector2) => {
        const state = refState.current.getValue();

        const { vertices } = state;

        refState.current.next({
            ...state,
            vertices: [...vertices.slice(0, i), position, ...vertices.slice(i)],
        });
    };

    const moveVertex = (i: number, position: Vector2) => {
        const state = refState.current.getValue();

        const vertices = state.vertices.map((value, index) => {
            if (index !== i) {
                return value;
            }

            return position;
        });

        refState.current.next({
            ...state,
            vertices,
        });
    };

    const removeVertex = (i: number) => {
        const state = refState.current.getValue();

        const vertices = state.vertices.filter((_, index) => index !== i);

        refState.current.next({
            ...state,
            vertices,
        });
    };

    const capture = () => {
        const vertices = refState.current.getValue();

        const memory = refMemory.current.getValue();

        const copy = [
            ...memory.slice(0, refMemoryPointer.current + 1),
            deepCopy(vertices),
        ];

        refMemory.current.next(copy);

        refMemoryPointer.current = copy.length - 1;
    };

    const pointCurrentMemory = () => {
        const i = refMemoryPointer.current;

        const state = refMemory.current.getValue()[i];

        refState.current.next(state);
    };

    const undo = () => {
        if (refMemoryPointer.current === 0) {
            return;
        }

        refMemoryPointer.current -= 1;

        pointCurrentMemory();
    };

    const redo = () => {
        const memory = refMemory.current.getValue();

        if (refMemoryPointer.current === memory.length - 1) {
            return;
        }

        refMemoryPointer.current += 1;

        pointCurrentMemory();
    };

    const value = {
        subjectState: refState.current,
        subjectMemory: refMemory.current,
        addVertex,
        moveVertex,
        removeVertex,
        capture,
        undo,
        redo,
    };

    return (
        <EditorContext.Provider value={value}>
            <div className={styles.container}>
                <Painter />
                <Control />
            </div>
        </EditorContext.Provider>
    );
};

export default Editor;
