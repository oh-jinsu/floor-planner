import { BASE_BORDER_WIDTH, BASE_SCALE_UNIT } from "../../Constants/Editor";
import { EditorState } from "../../Types/EditorState";
import { Vector2 } from "../../Types/Vector";

export const drawHandle = (
    context: CanvasRenderingContext2D,
    { option }: EditorState,
    { x, y }: Vector2,
) => {
    const { handleRadius, lineColor } = option;

    context.beginPath();

    context.arc(
        x * BASE_SCALE_UNIT,
        y * BASE_SCALE_UNIT,
        handleRadius,
        0,
        Math.PI * 2
    );

    context.fillBy("#fff");

    context.strokeBy(lineColor, BASE_BORDER_WIDTH);

    context.closePath();
};