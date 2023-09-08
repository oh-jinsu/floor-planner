import { useContext } from "react";
import { EditorContext } from "./Editor";
import styles from "./ToolBar.module.css";
import Tooltip from "./Tooltip";
import { MdUndo, MdRedo } from "react-icons/md";
import SnappingToggleButton from "./SnappingToggleButton";
import DownloadButton from "./DownloadButton";
import UploadButton from "./UploadButton";
import ToolBarButton from "./ToolBarButton";

const ToolBar = () => {
    const { undo, redo } = useContext(EditorContext);

    return (
        <div className={styles.container}>
            <DownloadButton />
            <UploadButton />
            <SnappingToggleButton />
            <Tooltip text="되돌리기">
                <ToolBarButton onClick={undo}>
                    <MdUndo size={20} />
                </ToolBarButton>
            </Tooltip>
            <Tooltip text="다시실행">
                <ToolBarButton onClick={redo}>
                    <MdRedo size={20} />
                </ToolBarButton>
            </Tooltip>
        </div>
    );
};

export default ToolBar;
