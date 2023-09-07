import { FunctionComponent, ReactNode } from "react";
import styles from "./Tooltip.module.css";

export type Props = {
    className?: string;
    text: string;
    children: ReactNode;
};

const Tooltip: FunctionComponent<Props> = ({ className, children, text }) => {
    return (
        <div className={`${styles.container} ${className}`}>
            {children}
            <div className={styles.tooltip}>{text}</div>
        </div>
    );
};

export default Tooltip;
