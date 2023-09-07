import { MdUpload } from "react-icons/md";
import Tooltip from "./Tooltip";
import { ChangeEvent, useContext, useRef } from "react";
import { EditorContext } from "./Editor";
import ToolBarButton from "./ToolBarButton";

const UploadButton = () => {
    const { deserialize } = useContext(EditorContext)
    
    const refFileInput = useRef<HTMLInputElement>(null);

    const onUploadButtonClicked = () => {
        refFileInput.current?.click();
    }

    const onFileInputChanged = (e: ChangeEvent<HTMLInputElement> ) => {
        const { files } = e.target;

        if (!files || files.length === 0) {
            return;
        }
        
        deserialize(files[0]);
    }

    return <Tooltip text="업로드">
        <ToolBarButton onClick={onUploadButtonClicked}>
            <MdUpload size={20} />
            <input ref={refFileInput} type="file" accept=".gfp" onChange={onFileInputChanged} style={{display: "none"}} />
        </ToolBarButton>
    </Tooltip>;
}

export default UploadButton;