import { BASE_SCALE_UNIT } from "../../Constants/Editor";
import { distance } from "../Common/Math";
import { EditorState } from "../../Types/EditorState";
import { Vector2 } from "../../Types/Vector";

export const drawMeasure = (
    context: CanvasRenderingContext2D,
    { option }: EditorState,
    { x: x1, y: y1 }: Vector2,
    { x: x2, y: y2 }: Vector2
) => {
    const {
        measureColor,
        measureCalibartion,
        measureDistanceRatio,
    } = option;

    const l = distance({ x: x1, y: y1 }, { x: x2, y: y2 });

    if (l === 0) {
        return;
    }

    context.beginPath();

    const theta = Math.atan2(y2 - y1, x2 - x1);

    const dx =
        Math.cos(theta - Math.PI * 0.5) * 1000 * measureDistanceRatio;

    const dy =
        Math.sin(theta - Math.PI * 0.5) * 1000 * measureDistanceRatio;

    const sx = (x1 + dx) * BASE_SCALE_UNIT;

    const sy = (y1 + dy) * BASE_SCALE_UNIT;

    const ex = (x2 + dx) * BASE_SCALE_UNIT;

    const ey = (y2 + dy) * BASE_SCALE_UNIT;

    context.moveTo(sx, sy);

    context.lineTo(ex, ey);

    const adx = Math.cos(theta - Math.PI * 0.5) * 200 * BASE_SCALE_UNIT;

    const ady = Math.sin(theta - Math.PI * 0.5) * 200 * BASE_SCALE_UNIT;

    context.moveTo(sx - adx, sy - ady);

    context.lineTo(sx + adx, sy + ady);

    context.moveTo(ex - adx, ey - ady);

    context.lineTo(ex + adx, ey + ady);

    context.strokeBy(measureColor, 1);

    context.closePath();

    const mx = (x1 + x2 + 2 * dx) / 2;

    const my = (y1 + y2 + 2 * dy) / 2;

    context.setTextStyle("15px serif", "#000", "center", "middle");

    context.fillText(
        `${Math.round(l * measureCalibartion)}`,
        mx * BASE_SCALE_UNIT,
        my * BASE_SCALE_UNIT
    );
};