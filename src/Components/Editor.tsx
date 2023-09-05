import { FunctionComponent, useRef } from "react";
import styles from "./Editor.module.css";
import Control from "./Control";
import { BehaviorSubject } from "rxjs";
import { INITIAL_STATE, State } from "../Core/State";
import Painter from "./Painter";
import { createContext } from "react";

export type EditorContextProps = {
    stateQueue: BehaviorSubject<State>;
};

export const EditorContext = createContext<EditorContextProps>({} as any);

const Editor: FunctionComponent = () => {
    const stateQueue = useRef(new BehaviorSubject<State>(INITIAL_STATE));

    const value = {
        stateQueue: stateQueue.current,
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
