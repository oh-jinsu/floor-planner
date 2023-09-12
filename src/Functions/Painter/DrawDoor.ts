import { BASE_LINE_WIDTH } from "../../Constants/Editor";
import { distance } from "../Common/Math";
import { EditorState } from "../../Types/EditorState";
import { Vector2 } from "../../Types/Vector";

export const drawDoor = (
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

    context.fillBy("#fff");

    context.strokeBy(lineColor, BASE_LINE_WIDTH);

    context.closePath();

    context.beginPath();

    const px = v1.x;

    const py = v1.y;

    context.moveTo(px, py);

    const length = distance(v1, v2);

    context.arc(px, py, length, theta + Math.PI * 1.5, theta + Math.PI * 2);

    context.strokeBy(lineColor, BASE_LINE_WIDTH);

    context.closePath();
};