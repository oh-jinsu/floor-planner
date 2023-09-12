import { BASE_SCALE_UNIT } from "../../Constants/Editor";
import { EditorState } from "../../Types/EditorState";
import { scale } from "../Common/Math";
import { drawDoor } from "./DrawDoor";
import { drawWindow } from "./DrawWindow";
import { drawWall } from "./DrawWall";

export const drawLine = (
    context: CanvasRenderingContext2D,
    state: EditorState,
    i: number,
) => {
    const { vertices, lines } = state;

    const { type, anchor } = lines[i];

    const v1 = scale(BASE_SCALE_UNIT, vertices[anchor[0]]);

    const v2 = scale(BASE_SCALE_UNIT, vertices[anchor[1]]);

    switch (type) {
        case "door":
            drawDoor(context, state, v1, v2);

            return;
        case "window":
            drawWindow(context, state, v1, v2);

            return;
        case "wall":
            drawWall(context, state, v1, v2);
            
            return;
    }
};