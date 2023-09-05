import { FunctionComponent, useContext, useEffect, useRef } from "react";
import Canvas from "./Canvas";
import { Subject, map } from "rxjs";
import { DrawCall } from "../Core/DrawCall";
import { EditorContext } from "./Editor";
import { toDrawCall } from "./Painter.function";

const Painter: FunctionComponent = () => {
    const queue = useRef(new Subject<DrawCall>());

    const { stateQueue } = useContext(EditorContext);

    useEffect(() => {
        stateQueue.pipe(map(toDrawCall)).subscribe(queue.current);
    }, [stateQueue, queue]);

    return <Canvas queue={queue.current} />;
};

export default Painter;
