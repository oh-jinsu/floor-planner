import { MdArrowForward } from "react-icons/md";
import styles from "./SubmitButton.module.css";

const SubmitButton = () => {
    return (
        <button className={styles.button}>
            <span>디자인 제안받기</span>
            <MdArrowForward size={18} />
        </button>
    );
};

export default SubmitButton;
