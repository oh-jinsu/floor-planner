import { Line } from "../Types/Line";
import { Vector2 } from "../Types/Vector";

export const BASE_SCALE_UNIT = 0.04;

export const BASE_VIEWPORT_WIDTH = BASE_SCALE_UNIT * 40000;

export const BASE_VIEWPORT_HEIGHT = BASE_SCALE_UNIT * 40000;

export const BASE_LINE_WIDTH = 2;

export const BASE_BORDER_WIDTH = 2;

export const DEFAULT_GRID_SPACE = 1000;

export const DEFAULT_LINE_COLOR = "#444";

export const DEFAULT_MEASURE_COLOR = "#bbb";

export const DEFAULT_MEASURE_CALIBRATION = 0.1;

export const DEFAULT_MEASURE_DISTANCE_RATIO = 1;

export const DEFAULT_HANDLE_RADIUS = 5.5;

export const DEFAULT_SPARE_SCALE = 4;

export const DEFAULT_WALL_LINE_WIDTH = 9.5;

export const DEFAULT_SHORT_CLICK_THRESHOLD = 200;

export const INITIAL_VERTICES: Vector2[] = [
    {
        x: -5000,
        y: -3000,
    },
    {
        x: -3000,
        y: -3000,
    },
    {
        x: -1000,
        y: -3000,
    },
    {
        x: 5000,
        y: -3000,
    },
    {
        x: 5000,
        y: 3000,
    },
    {
        x: 4000,
        y: 3000,
    },
    {
        x: 3000,
        y: 3000,
    },
    {
        x: -5000,
        y: 3000,
    },
];

export const INITIAL_LINES: Line[] = [
    {
        type: "wall",
        anchor: [0, 1],
    },
    {
        type: "window",
        anchor: [1, 2],
    },
    {
        type: "wall",
        anchor: [2, 3],
    },
    {
        type: "wall",
        anchor: [3, 4],
    },
    {
        type: "wall",
        anchor: [4, 5],
    },
    {
        type: "door",
        anchor: [5, 6],
    },
    {
        type: "wall",
        anchor: [6, 7],
    },
    {
        type: "wall",
        anchor: [7, 0],
    },
];
