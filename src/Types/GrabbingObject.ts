import { Vector2 } from "./Vector";

export type GrabbingObject = { position?: Vector2 } & (
    | GrabbingDoor
    | GrabbingWindow
);

export type GrabbingDoor = {
    type: "door";
    length: number;
};

export type GrabbingWindow = {
    type: "window";
    length: number;
};
