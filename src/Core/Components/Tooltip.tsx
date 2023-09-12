import { FunctionComponent, ReactNode } from "react";
import styles from "./Tooltip.module.css";
import { join } from "../Functions/Element";

export type Props = {
    className?: string;
    text: string;
    children: ReactNode;
};

const Tooltip: FunctionComponent<Props> = ({ className, children, text }) => {
    return (
        <div className={join(styles.container, className)}>
            {children}
            <span className={styles.tooltip}>{text}</span>
        </div>
    );
};

export default Tooltip;
