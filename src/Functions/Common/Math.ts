import { Vector2 } from "../../Types/Vector";

export const scale = (k: number, v: Vector2): Vector2 => {
    return {
        x: v.x * k,
        y: v.y * k,
    };
};

export const distance = (
    { x: x1, y: y1 }: Vector2,
    { x: x2, y: y2 }: Vector2
) => {
    return Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
};

export const isNearFromLine = (
    { x: px, y: py }: Vector2,
    { x: x1, y: y1 }: Vector2,
    { x: x2, y: y2 }: Vector2,
    r = 1
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

    return Math.pow(mx, 2) + Math.pow(my, 2) <= l * 0.25;
};

export const nearestOnLine = (
    { x: px, y: py }: Vector2,
    { x: x1, y: y1 }: Vector2,
    { x: x2, y: y2 }: Vector2,
): Vector2 => {
    const v = { x: x2 - x1, y: y2 - y1 };

    const w = { x: px - x1, y: py - y1 };

    const c1 = w.x * v.x + w.y * v.y;

    const c2 = v.x * v.x + v.y * v.y;

    if (c2 === 0) return { x: x1, y: y1 };

    const b = c1 / c2;

    if (b >= 0 && b <= 1) {
        return { x: x1 + b * v.x, y: y1 + b * v.y }
    };

    if (b < 0) {
        return {x: x1, y: y1 }
    };

    return {x: x2, y: y2 };
}