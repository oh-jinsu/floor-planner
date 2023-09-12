import { FunctionComponent, MouseEventHandler, ReactNode } from "react";
import { join } from "../Functions/Common/Element";
import styles from "./ToolBarButton.module.css";

export type Props = {
    className?: string;
    children?: ReactNode;
    onClick?: MouseEventHandler<HTMLButtonElement>;
};
const ToolBarButton: FunctionComponent<Props> = ({
    className,
    children,
    onClick,
}) => {
    return (
        <button className={join(styles.button, className)} onClick={onClick}>
            {children}
        </button>
    );
};

export default ToolBarButton;
