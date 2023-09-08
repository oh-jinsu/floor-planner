import { FunctionComponent, useRef } from "react";
import styles from "./Editor.module.css";
import Control from "./Control";
import { BehaviorSubject } from "rxjs";
import Painter from "./Painter";
import { createContext } from "react";
import { Vector2 } from "../Core/Vector";
import { clone } from "../Functions/Object";
import {
    BASE_GRID_SPACE,
    DEFAULT_HANDLE_RADIUS,
    DEFAULT_LINE_WIDTH,
    DEFAULT_SHORT_CLICK_THRESHOLD,
    DEFAULT_SPARE_SCALE,
    INITIAL_VERTICES,
} from "../Constants/Editor";
import { currentValue } from "../Functions/React";
import { arrayBufferToString } from "../Functions/Buffer";
import Viewport from "./Viewport";
import ToolBar from "./ToolBar";
import SideBar from "./Sidebar";

export type Option = {
    snapping: boolean;
    gridSize: number;
    handleRadius: number;
    spareScale: number;
    lineWidth: number;
    shortClickThreshold: number;
};

export type State = {
    option: Option;
    vertices: Vector2[];
};

export type EditorContextProps = {
    state: BehaviorSubject<State>;
    memory: BehaviorSubject<State[]>;
    addVertex: (i: number, position: Vector2) => boolean;
    moveVertex: (i: number, position: Vector2) => Vector2;
    removeVertex: (i: number) => boolean;
    clean: () => void;
    capture: () => void;
    serialize: () => Blob;
    deserialize: (blob: Blob) => void;
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
                gridSize: BASE_GRID_SPACE,
                handleRadius: DEFAULT_HANDLE_RADIUS,
                spareScale: DEFAULT_SPARE_SCALE,
                lineWidth: DEFAULT_LINE_WIDTH,
                shortClickThreshold: DEFAULT_SHORT_CLICK_THRESHOLD,
            },
            vertices: INITIAL_VERTICES,
        })
    );

    const refMemory = useRef(
        new BehaviorSubject<State[]>([clone(currentValue(refState))])
    );

    const refMemoryPointer = useRef(0);

    const initialize = (state: State) => {
        refState.current.next(state);

        refMemory.current.next([clone(state)]);

        refMemoryPointer.current = 0;
    };

    const snapPosition = (position: Vector2): Vector2 => {
        const state = currentValue(refState);

        const gridScale = BASE_GRID_SPACE / state.option.gridSize;

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
        const state = currentValue(refState);

        const { vertices } = currentValue(refState);

        refState.current.next({
            ...state,
            vertices: [...vertices.slice(0, i), position, ...vertices.slice(i)],
        });

        return true;
    };

    const moveVertex = (i: number, position: Vector2) => {
        const state = currentValue(refState);

        const destination = snapPosition(position);

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

        const vertices = state.vertices.filter((_, index) => index !== i);

        refState.current.next({
            ...state,
            vertices,
        });

        return true;
    };

    const clean = () => {
        const state = currentValue(refState);

        const isUnique = (p: Vector2, i: number) => {
            const { vertices } = state;

            const j = (i + 1) % vertices.length;

            const q = vertices[j];

            return q.x !== p.x || q.y !== p.y;
        };

        const vertices = state.vertices.filter(isUnique);

        refState.current.next({
            ...state,
            vertices,
        });
    };

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

    const changeOption = (option: Partial<Option>) => {
        if (option.gridSize !== undefined && option.gridSize < 10) {
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

    const value: EditorContextProps = {
        state: refState.current,
        memory: refMemory.current,
        addVertex,
        moveVertex,
        removeVertex,
        clean,
        capture,
        serialize,
        deserialize,
        undo,
        redo,
        changeOption,
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
