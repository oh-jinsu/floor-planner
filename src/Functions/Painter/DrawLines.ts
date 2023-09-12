import { EditorState } from "../../Types/EditorState";
import { drawLine } from "./DrawLine";

export const drawLines = (context: CanvasRenderingContext2D, state: EditorState) => {
    const { vertices, lines } = state;

    if (vertices.length === 0) {
        return;
    }

    for (let i = 0; i < lines.length; i++) {
        drawLine(context, state, i);
    }
};