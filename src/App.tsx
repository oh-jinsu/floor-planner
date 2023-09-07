import Editor from "./Components/Editor";
import styles from "./App.module.css";
import "./Extensions/";

const App = () => {
    return (
        <>
            <header className={styles.header}>
                <h1 className={styles.title}>Floor Planner</h1>
                <address className={styles.address}>
                    By <a href="mailto:ohjinsu98@icloud.com">Jinsu Oh</a>
                </address>
            </header>
            <main className={styles.main}>
                <Editor />
            </main>
        </>
    );
};

export default App;
