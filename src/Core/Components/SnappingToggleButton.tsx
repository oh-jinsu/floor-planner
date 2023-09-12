import styles from "./SnappingToggleButton.module.css";
import Tooltip from "./Tooltip";
import {
    FunctionComponent,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { join } from "../Functions/Element";
import {
    MdGridView,
    MdKeyboardArrowDown,
    MdKeyboardArrowUp,
} from "react-icons/md";
import { EditorContext } from "./Editor";

const SnappingToggleButton: FunctionComponent = () => {
    const { state, changeOption } = useContext(EditorContext);

    const [snapping, setSnapping] = useState<boolean>();

    const [gridSpaceString, setGridSpaceString] = useState("");

    const onSnappingButtonClicked = () => {
        changeOption({
            snapping: !snapping,
        });
    };

    const onGridUpButtonClicked = () => {
        changeOption({
            gridSpace: state.getValue().option.gridSpace + 100,
        });
    };

    const onGridDownButtonClicked = () => {
        changeOption({
            gridSpace: state.getValue().option.gridSpace - 100,
        });
    };

    const toGridSpaceString = useCallback(
        (value: number) => {
            const calibartion = state.getValue().option.measureCalibartion;

            return `${value * calibartion}cm`;
        },
        [state]
    );

    useEffect(() => {
        const sub = state.subscribe(({ option }) => {
            const { snapping, gridSpace } = option;

            setGridSpaceString(toGridSpaceString(gridSpace));

            setSnapping(snapping);
        });

        return () => {
            sub.unsubscribe();
        };
    }, [state, toGridSpaceString]);

    return (
        <Tooltip text="격자에 맞추기">
            <button
                className={join(styles.button, snapping && "active")}
                onClick={onSnappingButtonClicked}
            >
                <MdGridView size={20} />
                <span className={styles.size}>{gridSpaceString}</span>
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
