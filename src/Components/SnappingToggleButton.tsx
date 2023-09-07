import styles from "./SnappingToggleButton.module.css";
import Tooltip from "./Tooltip";
import { FunctionComponent, useContext, useEffect, useState } from "react";
import { join } from "../Functions/Element";
import {
    MdGridView,
    MdKeyboardArrowDown,
    MdKeyboardArrowUp,
} from "react-icons/md";
import { EditorContext } from "./Editor";

const SnappingToggleButton: FunctionComponent = () => {
    const { subjectState, changeOption } = useContext(EditorContext);

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
        <Tooltip text="격자에 맞추기">
            <button
                className={join(styles.button, snapping && "active")}
                onClick={onSnappingButtonClicked}
            >
                <MdGridView size={20} />
                <span className={styles.size}>{gridSize}</span>
            </button>
            <div className={styles.sidebar}>
                <button
                    className={styles.arrow}
                    onClick={onGridUpButtonClicked}
                >
                    <MdKeyboardArrowUp size={16} />
                </button>
                <button
                    className={styles.arrow}
                    onClick={onGridDownButtonClicked}
                >
                    <MdKeyboardArrowDown size={16} />
                </button>
            </div>
        </Tooltip>
    );
};

export default SnappingToggleButton;
