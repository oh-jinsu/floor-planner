import { FunctionComponent, useRef } from "react";
import styles from "./Editor.module.css";
import Control from "./Control";
import { BehaviorSubject } from "rxjs";
import Painter from "./Painter";
import { createContext } from "react";
import { Vector2 } from "../Core/Vector";
import { deepCopy } from "../Functions/Object";
import { INITIAL_VERTICES } from "../Constants/Editor";

export type Option = {
    snapping: boolean;
    gridSize: number;
};

export type State = {
    option: Option;
    vertices: Vector2[];
};

export type EditorContextProps = {
    subjectState: BehaviorSubject<State>;
    subjectMemory: BehaviorSubject<State[]>;
    addVertex: (i: number, position: Vector2) => boolean;
    moveVertex: (i: number, position: Vector2) => boolean;
    removeVertex: (i: number) => boolean;
    clean: () => void;
    capture: () => void;
    undo: () => void;
    redo: () => void;
    changeOption: (option: Partial<Option>) => void;
};

export const EditorContext = createContext<EditorContextProps>({} as any);

const Editor: FunctionComponent = () => {
    const refState = useRef(
        new BehaviorSubject<State>({
            option: {
                snapping: true,
                gridSize: 100,
            },
            vertices: INITIAL_VERTICES,
        })
    );

    const refMemory = useRef(
        new BehaviorSubject<State[]>([refState.current.getValue()])
    );

    const refMemoryPointer = useRef(0);

    const snapPosition = (position: Vector2): Vector2 => {
        const state = refState.current.getValue();

        const gridScale = 100 / state.option.gridSize;

        const { snapping } = state.option;

        if (snapping) {
            return {
                x: Math.round(position.x * gridScale) / gridScale,
                y: Math.round(position.y * gridScale) / gridScale,
            };
        }

        return position;
    };

    const addVertex = (i: number, position: Vector2) => {
        const state = refState.current.getValue();

        const { vertices } = state;

        refState.current.next({
            ...state,
            vertices: [...vertices.slice(0, i), position, ...vertices.slice(i)],
        });

        return true;
    };

    const moveVertex = (i: number, position: Vector2) => {
        const state = refState.current.getValue();

        const vertices = state.vertices.map((value, index) => {
            if (index !== i) {
                return value;
            }

            return snapPosition(position);
        });

        refState.current.next({
            ...state,
            vertices,
        });

        return true;
    };

    const removeVertex = (i: number) => {
        const state = refState.current.getValue();

        const vertices = state.vertices.filter((_, index) => index !== i);

        refState.current.next({
            ...state,
            vertices,
        });

        return true;
    };

    const clean = () => {};

    const capture = () => {
        const vertices = refState.current.getValue();

        const memory = refMemory.current.getValue();

        const copy = [
            ...memory.slice(0, refMemoryPointer.current + 1),
            deepCopy(vertices),
        ];

        const capacity = Math.min(100, copy.length);

        refMemory.current.next(copy.slice(-capacity));

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

    const changeOption = (option: Partial<Option>) => {
        if (option.gridSize !== undefined && option.gridSize < 10) {
            return;
        }

        const state = refState.current.getValue();

        refState.current.next({
            ...state,
            option: {
                ...state.option,
                ...option,
            },
        });
    };

    const value: EditorContextProps = {
        subjectState: refState.current,
        subjectMemory: refMemory.current,
        addVertex,
        moveVertex,
        removeVertex,
        clean,
        capture,
        undo,
        redo,
        changeOption,
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
