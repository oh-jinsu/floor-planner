import { FunctionComponent, useRef } from "react";
import styles from "./Editor.module.css";
import Control from "./Control";
import { BehaviorSubject } from "rxjs";
import Painter from "./Painter";
import { createContext } from "react";
import { Vector2 } from "../Core/Vector";
import { deepCopy } from "../Functions/Object";
import { INITIAL_VERTICES } from "../Constants/Editor";

export type EditorContextProps = {
    subjectVertices: BehaviorSubject<Vector2[]>;
    subjectMemory: BehaviorSubject<Vector2[][]>;
    addVertex: (i: number, position: Vector2) => void;
    moveVertex: (i: number, position: Vector2) => void;
    removeVertex: (i: number) => void;
    capture: () => void;
    undo: () => void;
};

export const EditorContext = createContext<EditorContextProps>({} as any);

const Editor: FunctionComponent = () => {
    const refSubjectVertices = useRef(
        new BehaviorSubject<Vector2[]>(INITIAL_VERTICES)
    );

    const refMemory = useRef(new BehaviorSubject<Vector2[][]>([]));

    const addVertex = (i: number, position: Vector2) => {
        const vertices = refSubjectVertices.current.getValue();

        refSubjectVertices.current.next([
            ...vertices.slice(0, i),
            position,
            ...vertices.slice(i),
        ]);
    };

    const moveVertex = (i: number, position: Vector2) => {
        const vertices = refSubjectVertices.current.getValue();

        const copy = vertices.map((value, index) => {
            if (index !== i) {
                return value;
            }

            return position;
        });

        refSubjectVertices.current.next(copy);
    };

    const removeVertex = (i: number) => {
        const vertices = refSubjectVertices.current.getValue();

        const copy = vertices.filter((_, index) => index !== i);

        refSubjectVertices.current.next(copy);
    };

    const capture = () => {
        const vertices = refSubjectVertices.current.getValue();

        const copy = deepCopy(vertices);

        refMemory.current.next([...refMemory.current.getValue(), copy]);
    };

    const undo = () => {
        const memory = refMemory.current.getValue();

        if (memory.length === 0) {
            return;
        }

        refMemory.current.next(memory.slice(0, -1));

        refSubjectVertices.current.next(memory[memory.length - 1]);
    };

    const value = {
        subjectVertices: refSubjectVertices.current,
        subjectMemory: refMemory.current,
        addVertex,
        moveVertex,
        removeVertex,
        capture,
        undo,
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
