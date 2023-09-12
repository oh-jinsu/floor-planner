import { EditorOption } from "./EditorOption";
import { Line } from "./Line";
import { Vector2 } from "./Vector";

export type EditorState = {
    option: EditorOption;
    vertices: Vector2[];
    lines: Line[];
};
