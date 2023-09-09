export type LineType = "wall" | "door" | "window"

export type Line = {
    type: LineType;
    anchor: [number, number];
}