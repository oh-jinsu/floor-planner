import { BASE_SCALE_UNIT } from "../../Constants/Editor";
import { EditorState } from "../../Types/EditorState";
import { scale } from "../Common/Math";
import { drawDoor } from "./DrawDoor";
import { drawWindow } from "./DrawWindow";

export const drawHoldingObject = (
    context: CanvasRenderingContext2D,
    state: EditorState,
) => {
    const { grabbingObject } = state;

    if (!grabbingObject) {
        return;
    }

    const { id, position, length } = grabbingObject;

    if (!position) {
        return;
    }

    const v1 = scale(BASE_SCALE_UNIT, position);

    const v2 = {
        x: v1.x + length * BASE_SCALE_UNIT,
        y: v1.y,
    }

    switch (id) {
        case "door": {
            drawDoor(context, state,  v1, v2);

            return;
        }
        case "window": {
            drawWindow(context, state,  v1, v2);

            return;
        }
    }
};