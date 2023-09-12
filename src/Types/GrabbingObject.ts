import { Vector2 } from "./Vector";

export type GrabbingObject = { position?: Vector2 } & (
    | GrabbingDoor
    | GrabbingWindow
);

export type GrabbingDoor = {
    id: "door";
    length: number;
};

export type GrabbingWindow = {
    id: "window";
    length: number;
};
