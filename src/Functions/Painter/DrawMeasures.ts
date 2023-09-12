import { EditorState } from "../../Types/EditorState";
import { drawMeasure } from "./DrawMeasure";

export const drawMeasures = (
    context: CanvasRenderingContext2D,
    state: EditorState,
) => {
    const { vertices, lines } = state;

    for (let i = 0; i < lines.length; i++) {
        const { anchor } = lines[i];

        const [i1, i2] = anchor;

        const v1 = vertices[i1];

        const v2 = vertices[i2];

        drawMeasure(context, state, v1, v2);
    }
};