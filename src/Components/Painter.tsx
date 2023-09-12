import { FunctionComponent, useContext, useEffect, useRef } from "react";
import Canvas, { DrawCall } from "./Canvas";
import { BehaviorSubject, map } from "rxjs";
import { EditorContext } from "./Editor";
import { toDrawCall } from "../Functions/Painter/ToDrawCall";

const Painter: FunctionComponent = () => {
    const queue = useRef(new BehaviorSubject<DrawCall>(() => {}));

    const { stateSubject } = useContext(EditorContext);

    useEffect(() => {
        const subscription = stateSubject
            .pipe(map(toDrawCall))
            .subscribe(queue.current);

        return () => {
            subscription.unsubscribe();
        };
    }, [stateSubject, queue]);

    return <Canvas queue={queue.current} />;
};

export default Painter;
