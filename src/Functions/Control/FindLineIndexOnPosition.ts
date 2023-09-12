import { BASE_SCALE_UNIT } from "../../Constants/Editor";
import { EditorState } from "../../Types/EditorState";
import { Vector2 } from "../../Types/Vector";
import { isNearFromLine, scale } from "../Common/Math";

export const findLineIndexOnPosition = ({ vertices, lines, option }: EditorState, position: Vector2): number | undefined => {
    const { wallLineWidth, spareScale } = option;

    for (let i = 0; i < lines.length; i++) {
        const { type, anchor } = lines[i];

        if (type !== "wall") {
            continue;
        }

        const v1 = scale(BASE_SCALE_UNIT, vertices[anchor[0]]);

        const v2 = scale(BASE_SCALE_UNIT, vertices[anchor[1]]);

        if (isNearFromLine(position, v1, v2, wallLineWidth * spareScale)) {
            return i;
        }
    }
}