import { FunctionComponent, useRef } from "react";
import styles from "./Editor.module.css";
import Control from "./Control";
import { BehaviorSubject } from "rxjs";
import { INITIAL_STATE, State } from "../Core/State";
import Painter from "./Painter";
import { createContext } from "react";
import { Vector2 } from "../Core/Vector";
import { deepCopy } from "../Functions/Object";

export type EditorContextProps = {
    stateQueue: BehaviorSubject<State>;
    memory: State[];
    addVertex: (i: number, position: Vector2) => void;
    moveVertex: (i: number, position: Vector2) => void;
    capture: () => void;
    undo: () => void;
};

export const EditorContext = createContext<EditorContextProps>({} as any);

const Editor: FunctionComponent = () => {
    const refStateQueue = useRef(new BehaviorSubject<State>(INITIAL_STATE));

    const refMemory = useRef<State[]>([
        deepCopy(refStateQueue.current.getValue()),
    ]);

    const addVertex = (i: number, position: Vector2) => {
        refStateQueue.current.getValue().vertices.splice(i, 0, position);

        refStateQueue.current.next(refStateQueue.current.getValue());
    };

    const moveVertex = (i: number, position: Vector2) => {
        refStateQueue.current.getValue().vertices[i] = position;
    };

    const capture = () => {
        refMemory.current.push(deepCopy(refStateQueue.current.getValue()));
    };

    const undo = () => {
        const state = refMemory.current.pop();

        if (!state) {
            return;
        }

        refStateQueue.current.next(state);
    };

    const value = {
        stateQueue: refStateQueue.current,
        memory: refMemory.current,
        addVertex,
        moveVertex,
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
