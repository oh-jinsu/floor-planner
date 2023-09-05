export type Vector2 = {
    x: number;
    y: number;
};

export const distance = (v1: Vector2, v2: Vector2): number => {
    const dx = v2.x - v1.x;

    const dy = v2.y - v1.y;

    return Math.pow(dx * dx + dy * dy, 0.5);
}