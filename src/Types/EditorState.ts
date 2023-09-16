import { EditorOption } from "./EditorOption";
import { GrabbingObject } from "./GrabbingObject";
import { Line } from "./Line";
import { Vector2 } from "./Vector";

export type EditorState = {
    level: number,
    grabbingObject?: GrabbingObject;
    option: EditorOption;
    vertices: Vector2[];
    lines: Line[];
};
