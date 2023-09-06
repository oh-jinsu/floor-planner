import { useContext, useEffect, useState } from "react";
import { EditorContext } from "./Editor";
import styles from "./ToolBar.module.css";
import { Vector2 } from "../Core/Vector";
import { MdUndo, MdGridView } from "react-icons/md";

const ToolBar = () => {
    const { subjectMemory, undo } = useContext(EditorContext);

    const [showUndo, setShowUndo] = useState(false);

    const onMemoryChanged = (memory: Vector2[][]) => {
        setShowUndo(memory.length > 0);
    };

    const onUndoButtonClicked = () => {
        undo();
    };

    useEffect(() => {
        const subscription = subjectMemory.subscribe(onMemoryChanged);

        return () => {
            subscription.unsubscribe();
        };
    }, [subjectMemory]);

    return (
        <div className={styles.container}>
            <button className={styles.button} onClick={onUndoButtonClicked}>
                <MdUndo size={18} />
                <label>되돌리기</label>
            </button>
            <button className={styles.button}>
                <MdGridView size={18} />
                <label>격자에 맞추기</label>
            </button>
        </div>
    );
};

export default ToolBar;
