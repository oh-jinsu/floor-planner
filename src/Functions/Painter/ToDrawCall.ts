import { EditorState } from "../../Types/EditorState";
import { drawFloor } from "./DrawFloor";
import { drawGrid } from "./DrawGrid";
import { drawHandles } from "./DrawHandles";
import { drawHoldingObject } from "./DrawHoldingObject";
import { drawLines } from "./DrawLines";
import { drawMeasures } from "./DrawMeasures";

export const toDrawCall = (state: EditorState) => {
    return (context: CanvasRenderingContext2D) => {
        context.clearScreen();

        drawGrid(context, state);

        drawFloor(context, state);

        drawLines(context, state);

        drawHoldingObject(context, state);

        drawHandles(context, state);

        drawMeasures(context, state);
    };
}