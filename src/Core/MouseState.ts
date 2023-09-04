import { Vector2 } from "./Vector";

export type MouseState = {
    origin: Vector2;
    isDragging: boolean;
    holding?: number;
};