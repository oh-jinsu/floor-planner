import { EditorState } from "../../Types/EditorState";
import { drawHandle } from "./DrawHandle";

export const drawHandles = (
    context: CanvasRenderingContext2D,
    state: EditorState,
) => {
    const { vertices } = state;
    
    for (let i = 0; i < vertices.length; i++) {
        drawHandle(context, state, vertices[i]);
    }
};