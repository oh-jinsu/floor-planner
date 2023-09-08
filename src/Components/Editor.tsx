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
    BASE_SCALE_UNIT,
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
import { isOnLine, nearestOnLine } from "../Core/Math";

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

export type HoldingObjectState = {
    id: string;
    position?: Vector2;
};

export type EditorContextProps = {
    state: BehaviorSubject<State>;
    memory: BehaviorSubject<State[]>;
    holdingObject: BehaviorSubject<HoldingObjectState | undefined>;
    addVertex: (i: number, position: Vector2) => boolean;
    moveVertex: (i: number, position: Vector2) => Vector2;
    removeVertex: (i: number) => boolean;
    moveObject: (position: Vector2) => boolean;
    clean: () => void;
    capture: () => void;
    serialize: () => Blob;
    deserialize: (blob: Blob) => void;
    undo: () => void;
    redo: () => void;
    changeOption: (option: Partial<Option>) => void;
    setHoldingObject: (holdingObject?: HoldingObjectState) => void;
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

    const refHoldingObject = useRef(
        new BehaviorSubject<HoldingObjectState | undefined>(undefined)
    );

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

    const moveObject = (position: Vector2) => {
        const holdingObject = currentValue(refHoldingObject);

        if (!holdingObject) {
            return false;
        }

        const { vertices, option } = currentValue(refState);

        if (holdingObject.id === "door") {
            for (let i = 0; i < vertices.length; i++) {
                const v1 = vertices[i];

                const v2 = vertices.at(i - 1)!;

                const r = (5 * option.spareScale) / BASE_SCALE_UNIT;

                if (isOnLine(position, v2, v1, r)) {
                    refHoldingObject.current.next({
                        ...holdingObject,
                        position: nearestOnLine(position, v2, v1),
                    });

                    return true;
                }
            }
        }

        refHoldingObject.current.next({
            ...holdingObject,
            position,
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

    const setHoldingObject = (obj?: HoldingObjectState) => {
        refHoldingObject.current.next(obj);
    };

    const value: EditorContextProps = {
        state: refState.current,
        memory: refMemory.current,
        holdingObject: refHoldingObject.current,
        addVertex,
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
