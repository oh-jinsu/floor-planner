import { EditorState } from "../../Types/EditorState";
import { Line } from "../../Types/Line";

export const removeVertexFromState = (state: EditorState, i: number) => {
    const vertices = [
        ...state.vertices.slice(0, i),
        ...state.vertices.slice(i + 1),
    ];

    const indexedLines = state.lines.map((value, index) => ({
        value,
        index,
    }));

    const l1 = indexedLines.find(({ value }) => value.anchor[1] === i);

    const l2 = indexedLines.find(({ value }) => value.anchor[0] === i);

    if (!l1 || !l2) {
        throw Error("no anchor vertex to remove");
    }

    const mergedLine: Line = {
        ...l1.value,
        anchor: [l1.value.anchor[0], l2.value.anchor[1]],
    };

    const filteredLines = state.lines.filter(({ anchor }) =>
        anchor.every((a) => a !== i)
    );

    const shift = (line: Line): Line => ({
        ...line,
        anchor: [
            line.anchor[0] - (line.anchor[0] > i ? 1 : 0),
            line.anchor[1] - (line.anchor[1] > i ? 1 : 0),
        ],
    });

    const lines: Line[] = [
        ...filteredLines.slice(0, l2.index),
        mergedLine,
        ...filteredLines.slice(l2.index),
    ].map(shift);

    return {
        vertices,
        lines,
    }
}