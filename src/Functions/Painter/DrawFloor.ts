import { BASE_SCALE_UNIT } from "../../Constants/Editor";
import { EditorState } from "../../Types/EditorState";

export const drawFloor = (context: CanvasRenderingContext2D, { vertices, lines }: EditorState) => {
    context.beginPath();

    for (let i = 0; i < lines.length; i++) {
        const [i1, i2] = lines[i].anchor;

        const v1 = vertices[i1];

        const v2 = vertices[i2];

        context.lineTo(v1.x * BASE_SCALE_UNIT, v1.y * BASE_SCALE_UNIT);

        context.lineTo(v2.x * BASE_SCALE_UNIT, v2.y * BASE_SCALE_UNIT);
    }

    context.fillBy("#fff");

    context.closePath();
}