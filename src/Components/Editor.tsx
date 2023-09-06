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
    memory: Vector2[][];
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

    const refMemory = useRef<Vector2[][]>([
        deepCopy(refSubjectVertices.current.getValue()),
    ]);

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

        refMemory.current.push(copy);
    };

    const undo = () => {
        const state = refMemory.current.pop();

        if (!state) {
            return;
        }

        refSubjectVertices.current.next(state);
    };

    const value = {
        subjectVertices: refSubjectVertices.current,
        memory: refMemory.current,
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
