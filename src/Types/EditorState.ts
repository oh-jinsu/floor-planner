import { EditorOption } from "./EditorOption";
import { Vector2 } from "./Vector";

export type EditorState = {
    option: EditorOption;
    vertices: Vector2[];
};
