import {
    FunctionComponent,
    ReactNode,
    RefObject,
    createContext,
    useEffect,
    useRef,
} from "react";
import styles from "./Viewport.module.css";

export type Props = {
    children: ReactNode;
};

export type ViewportContextProps = {
    refViewport: RefObject<HTMLDivElement>;
    setCursor: (cursor: string) => void;
};

export const ViewportContext = createContext<ViewportContextProps>({} as any);

const Viewport: FunctionComponent<Props> = ({ children }) => {
    const refViewport = useRef<HTMLDivElement>(null);

    const setCursor = (cursor: string) => {
        const { current } = refViewport;

        if (!current) {
            return;
        }

        current.style.cursor = cursor;
    };

    const center = () => {
        const { current } = refViewport;

        if (!current) {
            return;
        }

        current.scrollTop =
            current.scrollHeight * 0.5 - current.clientHeight * 0.5;

        current.scrollLeft =
            current.scrollWidth * 0.5 - current.clientWidth * 0.5;
    };

    useEffect(() => {
        center();
    }, []);

    const value: ViewportContextProps = {
        refViewport,
        setCursor,
    };

    return (
        <ViewportContext.Provider value={value}>
            <div ref={refViewport} className={styles.container}>
                {children}
            </div>
        </ViewportContext.Provider>
    );
};

export default Viewport;
