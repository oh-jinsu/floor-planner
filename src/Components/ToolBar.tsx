import { useContext, useEffect, useState } from "react";
import { EditorContext } from "./Editor";
import styles from "./ToolBar.module.css";
import Tooltip from "./Tooltip";
import {
    MdUndo,
    MdRedo,
    MdUpload,
    MdDownload,
    MdGridView,
    MdKeyboardArrowDown,
    MdKeyboardArrowUp,
} from "react-icons/md";
import { join } from "../Functions/Element";

const ToolBar = () => {
    const { subjectState, undo, redo, changeOption } =
        useContext(EditorContext);

    const [snapping, setSnapping] = useState<boolean>();

    const [gridSize, setGridSize] = useState("");

    const onSnappingButtonClicked = () => {
        changeOption({
            snapping: !snapping,
        });
    };

    const onGridUpButtonClicked = () => {
        changeOption({
            gridSize: subjectState.getValue().option.gridSize + 10,
        });
    };

    const onGridDownButtonClicked = () => {
        changeOption({
            gridSize: subjectState.getValue().option.gridSize - 10,
        });
    };

    const toGridSizeFormat = (gridSize: number) => {
        return `${gridSize}cm`;
    };

    useEffect(() => {
        const sub = subjectState.subscribe(({ option }) => {
            const { snapping, gridSize } = option;

            setGridSize(toGridSizeFormat(gridSize));
            setSnapping(snapping);
        });

        return () => {
            sub.unsubscribe();
        };
    }, [subjectState]);

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
            <div className={styles.grid_button}>
                <Tooltip text="격자에 맞추기">
                    <button
                        className={join(styles.button, snapping && "active")}
                        onClick={onSnappingButtonClicked}
                    >
                        <MdGridView size={20} />
                        <span className={styles.grid_size}>{gridSize}</span>
                    </button>
                </Tooltip>
                <div className={styles.grid_arrow_container}>
                    <button
                        className={styles.grid_arrow}
                        onClick={onGridUpButtonClicked}
                    >
                        <MdKeyboardArrowUp size={16} />
                    </button>
                    <button
                        className={styles.grid_arrow}
                        onClick={onGridDownButtonClicked}
                    >
                        <MdKeyboardArrowDown size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ToolBar;
