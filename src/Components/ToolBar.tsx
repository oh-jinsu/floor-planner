import { useContext } from "react";
import { EditorContext } from "./Editor";
import styles from "./ToolBar.module.css";
import Tooltip from "./Tooltip";
import {
    MdUndo,
    MdRedo,
    MdUpload,
    MdDownload,
    MdGridView,
} from "react-icons/md";

const ToolBar = () => {
    const { undo, redo } = useContext(EditorContext);

    return (
        <div className={styles.container}>
            <Tooltip text="다운로드">
                <button className={styles.button}>
                    <MdDownload size={20} />
                </button>
            </Tooltip>
            <Tooltip text="업로드">
                <button className={styles.button}>
                    <MdUpload size={20} />
                </button>
            </Tooltip>
            <Tooltip text="되돌리기">
                <button className={styles.button} onClick={undo}>
                    <MdUndo size={20} />
                </button>
            </Tooltip>
            <Tooltip text="다시실행">
                <button className={styles.button} onClick={redo}>
                    <MdRedo size={20} />
                </button>
            </Tooltip>

            <Tooltip text="격자에 맞추기">
                <button className={styles.button}>
                    <MdGridView size={20} />
                </button>
            </Tooltip>
        </div>
    );
};

export default ToolBar;
