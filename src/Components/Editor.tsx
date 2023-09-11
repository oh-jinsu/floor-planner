import { FunctionComponent, useRef } from "react";
import styles from "./Editor.module.css";
import Control from "./Control";
import { BehaviorSubject } from "rxjs";
import Painter from "./Painter";
import { createContext } from "react";
import { Vector2 } from "../Types/Vector";
import { clone } from "../Functions/Object";
import {
    DEFAULT_GRID_SPACE,
    BASE_SCALE_UNIT,
    DEFAULT_HANDLE_RADIUS,
    DEFAULT_LINE_COLOR,
    DEFAULT_WALL_LINE_WIDTH,
    DEFAULT_MEASURE_CALIBRATION,
    DEFAULT_MEASURE_COLOR,
    DEFAULT_SHORT_CLICK_THRESHOLD,
    DEFAULT_SPARE_SCALE,
    INITIAL_VERTICES,
    DEFAULT_MEASURE_DISTANCE_RATIO,
    INITIAL_LINES,
} from "../Constants/Editor";
import { currentValue } from "../Functions/React";
import { arrayBufferToString } from "../Functions/Buffer";
import Viewport from "./Viewport";
import ToolBar from "./ToolBar";
import SideBar from "./Sidebar";
import { isNearFromLine, nearestOnLine } from "../Functions/Math";
import { EditorState } from "../Types/EditorState";
import { EditorOption } from "../Types/EditorOption";
import { Line, LineType } from "../Types/Line";

export type HoldingObject = { position?: Vector2 } & HoldingDoor;

export type HoldingDoor = {
    id: "door";
    length: number;
    anchor?: {
        v1: Vector2;
        v2: Vector2;
    };
};

export type EditorContextProps = {
    state: BehaviorSubject<EditorState>;
    memory: BehaviorSubject<EditorState[]>;
    holdingObject: BehaviorSubject<HoldingObject | undefined>;
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
    setHoldingObject: (holdingObject?: HoldingObject) => void;
};

export const EditorContext = createContext<EditorContextProps>({} as any);

const Editor: FunctionComponent = () => {
    const refState = useRef(
        new BehaviorSubject<EditorState>({
            option: {
                snapping: true,
                gridSpace: DEFAULT_GRID_SPACE,
                handleRadius: DEFAULT_HANDLE_RADIUS,
                spareScale: DEFAULT_SPARE_SCALE,
                lineColor: DEFAULT_LINE_COLOR,
                wallLineWidth: DEFAULT_WALL_LINE_WIDTH,
                measureColor: DEFAULT_MEASURE_COLOR,
                measureCalibartion: DEFAULT_MEASURE_CALIBRATION,
                measureDistanceRatio: DEFAULT_MEASURE_DISTANCE_RATIO,
                shortClickThreshold: DEFAULT_SHORT_CLICK_THRESHOLD,
            },
            vertices: INITIAL_VERTICES,
            lines: INITIAL_LINES,
        })
    );

    const refMemory = useRef(
        new BehaviorSubject<EditorState[]>([clone(currentValue(refState))])
    );

    const refMemoryPointer = useRef(0);

    const refHoldingObject = useRef(
        new BehaviorSubject<HoldingObject | undefined>(undefined)
    );

    const initialize = (state: EditorState) => {
        refState.current.next(state);

        refMemory.current.next([clone(state)]);

        refMemoryPointer.current = 0;
    };

    const snapPosition = (position: Vector2): Vector2 => {
        const state = currentValue(refState);

        const { gridSpace } = state.option;

        const { snapping } = state.option;

        if (snapping) {
            return {
                x: Math.round(position.x / gridSpace) * gridSpace,
                y: Math.round(position.y / gridSpace) * gridSpace,
            };
        }

        return position;
    };

    const addVertices = (i: number, ...positions: Vector2[]) => {
        const state = currentValue(refState);

        const next = addVerticesToState(i, state, positions);

        refState.current.next(next);

        return positions.map(
            (_, i) => next.vertices.length - positions.length + i
        );
    };

    const addVerticesToState = (
        i: number,
        state: EditorState,
        positions: Vector2[],
        type?: LineType
    ): EditorState => {
        const { vertices, lines } = state;

        const line = lines[i];

        const brokenLines: Line[] = [...Array(positions.length + 1)].map(
            (_, i, array) => {
                const isFirst = i === 0;

                const isLast = i === array.length - 1;

                return {
                    ...line,
                    type: !isFirst && !isLast ? type ?? line.type : line.type,
                    anchor: [
                        isFirst ? line.anchor[0] : vertices.length + i - 1,
                        isLast ? line.anchor[1] : vertices.length + i,
                    ],
                };
            }
        );

        return {
            ...state,
            vertices: [...vertices, ...positions],
            lines: [
                ...lines.slice(0, i),
                ...brokenLines,
                ...lines.slice(i + 1),
            ],
        };
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

        const vertices = [
            ...state.vertices.slice(0, i),
            ...state.vertices.slice(i + 1),
        ];

        const indexedLines = state.lines.map((value, index) => ({
            value,
            index,
        }));

        const l1 = indexedLines.find(({ value }) => value.anchor[1] === i);

        const l2 = indexedLines.find(({ value }) => value.anchor[0] === i);

        if (!l1 || !l2) {
            return false;
        }

        const mergedLine: Line = {
            ...l1.value,
            anchor: [l1.value.anchor[0], l2.value.anchor[1]],
        };

        const filteredLines = state.lines.filter(({ anchor }) =>
            anchor.every((a) => a !== i)
        );

        const shiftedLines: Line[] = [
            ...filteredLines.slice(0, l2.index),
            mergedLine,
            ...filteredLines.slice(l2.index),
        ].map((line) => ({
            ...line,
            anchor: [
                line.anchor[0] - (line.anchor[0] > i ? 1 : 0),
                line.anchor[1] - (line.anchor[1] > i ? 1 : 0),
            ],
        }));

        const result = {
            ...state,
            vertices,
            lines: shiftedLines,
        };

        refState.current.next(result);

        return true;
    };

    const moveObject = (position: Vector2) => {
        const holdingObject = currentValue(refHoldingObject);

        if (!holdingObject) {
            return false;
        }

        const state = currentValue(refState);

        const { option } = state;

        const memory = currentValue(refMemory)[refMemoryPointer.current];

        const { vertices, lines } = memory;

        switch (holdingObject.id) {
            case "door":
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

                    const l = holdingObject.length;

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

                    refHoldingObject.current.next({
                        ...holdingObject,
                        position: undefined,
                        anchor: {
                            v1: a1,
                            v2: a2,
                        },
                    });

                    const next = addVerticesToState(
                        i,
                        memory,
                        [a1, a2],
                        "door"
                    );

                    refState.current.next(next);

                    return true;
                }

                refHoldingObject.current.next({
                    ...holdingObject,
                    position: position,
                    anchor: undefined,
                });

                refState.current.next({
                    ...state,
                    vertices,
                    lines,
                });

                return true;
        }
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

    const setHoldingObject = (obj?: HoldingObject) => {
        refHoldingObject.current.next(obj);
    };

    const value: EditorContextProps = {
        state: refState.current,
        memory: refMemory.current,
        holdingObject: refHoldingObject.current,
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
