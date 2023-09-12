import { BASE_SCALE_UNIT } from "../../Constants/Editor";
import { EditorState } from "../../Types/EditorState";

export const drawGrid = (context: CanvasRenderingContext2D, { option }: EditorState) => {
    const { gridSpace } = option;

    context.beginPath();

    const { width } = context.canvas;

    for (let x = 0; x < width * 0.5; x += gridSpace * BASE_SCALE_UNIT) {
        context.moveTo(x, width * -0.5);

        context.lineTo(x, width * 0.5);

        if (x === 0) {
            continue;
        }

        context.moveTo(-x, width * -0.5);

        context.lineTo(-x, width * 0.5);
    }

    const { height } = context.canvas;

    for (
        let y = 0;
        y < height * 0.5;
        y += gridSpace * BASE_SCALE_UNIT
    ) {
        context.moveTo(height * -0.5, y);

        context.lineTo(height * 0.5, y);

        if (y === 0) {
            continue;
        }

        context.moveTo(height * -0.5, -y);

        context.lineTo(height * 0.5, -y);
    }

    context.strokeBy("#eee", 1);
};