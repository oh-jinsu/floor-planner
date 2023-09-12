import { BASE_SCALE_UNIT } from "../../Constants/Editor";
import { EditorState } from "../../Types/EditorState";
import { Vector2 } from "../../Types/Vector";
import { distance, scale } from "../Common/Math";

export const FindVertexIndexOnPosition = ({ vertices, option }: EditorState, position: Vector2): number | undefined => {
    const { handleRadius, spareScale } = option;
    
    for (let i = 0; i < vertices.length; i++) {
        const vertex = scale(BASE_SCALE_UNIT, vertices[i]);

        if (distance(position, vertex) < handleRadius * spareScale) {
            return i;
        }
    }
}