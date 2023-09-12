import { EditorState } from "../../Types/EditorState";
import { Vector2 } from "../../Types/Vector";

export const snapPosition = ({ option }: EditorState, position: Vector2): Vector2 => {
    const { gridSpace, snapping } = option;

    if (snapping) {
        return {
            x: Math.round(position.x / gridSpace) * gridSpace,
            y: Math.round(position.y / gridSpace) * gridSpace,
        };
    }

    return position;
};