import { Vector2 } from "./Vector";

export const isOnCircle = (
    { x: x1, y: y1 }: Vector2,
    { x: x2, y: y2 }: Vector2,
    r = 1,
) => {
    const sqrX = Math.pow(x2 - x1, 2);

    const sqrY = Math.pow(y2 - y1, 2);

    return sqrX + sqrY < r * r;
};

export const isOnLine = (
    { x: px, y: py}: Vector2,
    { x: x1, y: y1 }: Vector2,
    { x: x2, y: y2 }: Vector2,
    r = 1,
) => {
    const a = y2 - y1;

    const b = x1 - x2;

    const c = x1 * (y1 - y2) + y1 * (x2 - x1);

    const l = a * a + b * b;

    const d = Math.pow(a * px + b * py + c, 2) / l;

    if (d > r * r) {
        return false;
    }

    const mx = px - (x2 + x1) * 0.5;

    const my = py - (y2 + y1) * 0.5;

    return Math.pow(mx, 2) + Math.pow(my, 2) < l * 0.25;
};