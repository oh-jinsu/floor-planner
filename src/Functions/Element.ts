import { Vector2 } from "../Types/Vector";

export const join = (...classNames: any[]) => {
    return classNames.filter((element) => typeof element === "string").join(" ")
}

export const getOffset = (e: HTMLElement, prev: Vector2 = {x: 0, y: 0}): Vector2 => {
    const result = {
        x: prev.x + e.offsetLeft,
        y: prev.y + e.offsetTop
    };

    if (!e.parentElement) {
        return result
    }

    return getOffset(e.parentElement, result);
};
