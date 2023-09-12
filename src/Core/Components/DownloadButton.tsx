import { MdDownload } from "react-icons/md";
import Tooltip from "./Tooltip";
import { useContext } from "react";
import { EditorContext } from "./Editor";
import ToolBarButton from "./ToolBarButton";

const DownloadButton = () => {
    const { serialize } = useContext(EditorContext);

    const onDownloadButtonClicked = () => {
        const blob = serialize();

        const link = document.createElement("a");

        link.download = "untitled.gfp";

        link.href = URL.createObjectURL(blob);

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
    };

    return (
        <Tooltip text="다운로드">
            <ToolBarButton onClick={onDownloadButtonClicked}>
                <MdDownload size={20} />
            </ToolBarButton>
        </Tooltip>
    );
};

export default DownloadButton;
