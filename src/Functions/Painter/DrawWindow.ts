import { BASE_LINE_WIDTH } from "../../Constants/Editor";
import { EditorState } from "../../Types/EditorState";
import { Vector2 } from "../../Types/Vector";

export const drawWindow = (
    context: CanvasRenderingContext2D,
    { option }: EditorState,
    v1: Vector2,
    v2: Vector2,
) => {
    const { wallLineWidth, lineColor } = option;

    const theta = Math.atan2(v2.y - v1.y, v2.x - v1.x);

    const dx =
        Math.sin(theta * Math.PI) *
        (wallLineWidth * 0.5 - BASE_LINE_WIDTH * 0.5);

    const dy =
        Math.cos(theta * Math.PI) *
        (wallLineWidth * 0.5 - BASE_LINE_WIDTH * 0.5);

    context.beginPath();

    context.moveTo(v1.x - dx, v1.y - dy);

    context.lineTo(v1.x + dx, v1.y + dy);

    context.lineTo(v2.x + dx, v2.y + dy);

    context.lineTo(v2.x - dx, v2.y - dy);

    context.lineTo(v1.x - dx, v1.y - dy);

    context.moveTo(v1.x, v1.y);

    context.lineTo(v2.x, v2.y);

    context.fillBy("#fff");

    context.strokeBy(lineColor, BASE_LINE_WIDTH);

    context.closePath();
};