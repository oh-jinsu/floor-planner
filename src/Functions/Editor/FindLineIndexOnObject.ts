import { BASE_SCALE_UNIT } from "../../Constants/Editor";
import { EditorState } from "../../Types/EditorState";
import { GrabbingObject } from "../../Types/GrabbingObject";
import { isNearFromLine, nearestOnLine } from "../Common/Math";

export const findLineIndexOnObject = ({ vertices, lines, option }: EditorState, { position, length }: GrabbingObject) => {
    if (!position) {
        return;
    }

    for (let i = 0; i < lines.length; i++) {
        const [i1, i2] = lines[i].anchor;

        const v1 = vertices[i1];

        const v2 = vertices[i2];

        const r = (5 * option.spareScale) / BASE_SCALE_UNIT;

        if (!isNearFromLine(position, v1, v2, r)) {
            continue;
        }

        const p = nearestOnLine(position, v1, v2);

        const theta = Math.atan2(v2.y - v1.y, v2.x - v1.x);

        const dx = Math.cos(theta) * length;

        const dy = Math.sin(theta) * length;

        const a1 = { x: p.x, y: p.y };

        const a2 = { x: p.x + dx, y: p.y + dy };

        if (
            !isNearFromLine(a1, v1, v2, 1) ||
            !isNearFromLine(a2, v1, v2, 1)
        ) {
            continue;
        }

        return i;
    }
}