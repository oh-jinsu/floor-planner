import { EditorState } from "../../Types/EditorState";
import { Line, LineType } from "../../Types/Line";
import { Vector2 } from "../../Types/Vector";

export const addVerticesToState = (
    i: number,
    state: EditorState,
    positions: Vector2[],
    type?: LineType
): {
    result: number[],
    vertices: Vector2[],
    lines: Line[],
}=> {
    const { lines } = state;

    const line = lines[i];

    const brokenLines: Line[] = [...Array(positions.length + 1)].map(
        (_, i, array) => {
            const isFirst = i === 0;

            const isLast = i === array.length - 1;

            return {
                ...line,
                type: !isFirst && !isLast ? type ?? line.type : line.type,
                anchor: [
                    isFirst ? line.anchor[0] : state.vertices.length + i - 1,
                    isLast ? line.anchor[1] : state.vertices.length + i,
                ],
            };
        }
    );

    const vertices = [...state.vertices, ...positions];

    const result = positions.map(
        (_, i) => vertices.length - positions.length + i
    );

    return {
        result,
        vertices,
        lines: [
            ...lines.slice(0, i),
            ...brokenLines,
            ...lines.slice(i + 1),
        ],
    };
};