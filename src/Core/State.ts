import { METER } from "../Constants/Editor"
import { Vector2 } from "./Vector"

export type State = {
    vertices: Vector2[]
}

export const INITIAL_STATE: State = {
    vertices: [
        {
            x: -5 * METER,
            y: -3 * METER,
        },
        {
            x: 5 * METER,
            y: -3 * METER,
        },
        {
            x: 5 * METER,
            y: 3 * METER,
        },
        {
            x: -5 * METER,
            y: 3 * METER,
        },
    ]
}

export type Action = {
    type: string;
}

export const stateReducer = (state: State, action: Action) => {
    switch (action.type) {
        default:
            return state;
    }
}