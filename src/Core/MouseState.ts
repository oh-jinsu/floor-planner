import { Vector2 } from "./Vector";

export type MouseState = {
    timestamp: number;
    updated: boolean;
    origin: Vector2;
    isDragging: boolean;
    holding?: number;
};