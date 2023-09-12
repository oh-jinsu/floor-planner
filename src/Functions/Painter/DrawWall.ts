import { EditorState } from "../../Types/EditorState";
import { Vector2 } from "../../Types/Vector";

export const drawWall = (
    context: CanvasRenderingContext2D,
    { option }: EditorState,
    v1: Vector2,
    v2: Vector2,
) => {
    const { lineColor, wallLineWidth } = option;

    context.beginPath();
    
    context.lineTo(v1.x, v1.y);

    context.lineTo(v2.x, v2.y);

    context.strokeBy(lineColor, wallLineWidth);

    context.closePath();
};