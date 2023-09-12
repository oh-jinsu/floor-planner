import Editor from "./Core/Components/Editor";
import styles from "./App.module.css";
import "./Core/Extensions";
import SubmitButton from "./Core/Components/SubmitButton";

const App = () => {
    return (
        <>
            <header className={styles.header}>
                <div className={styles.title}>
                    <h1>Good Planner</h1>
                    <address className={styles.address}>
                        By <a href="mailto:ohjinsu98@icloud.com">Jinsu Oh</a>
                    </address>
                </div>
                <SubmitButton />
            </header>
            <Editor />
        </>
    );
};

export default App;
