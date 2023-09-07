import { MutableRefObject } from "react";
import { BehaviorSubject } from "rxjs";

export const currentValue = <T>(
    ref: MutableRefObject<BehaviorSubject<T>>
): T => {
    return ref.current.getValue();
};
