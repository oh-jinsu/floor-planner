import styles from "./App.module.css";
import Editor from "./Components/Editor";

const App = () => {
    return (
        <>
            <header className={styles.header}>
                <h1>Floor Planner</h1>
                <address>
                    By <a href="mailto:ohjinsu98@icloud.com">Jinsu Oh</a>
                </address>
            </header>
            <hr />
            <main className={styles.main}>
                <Editor />
            </main>
        </>
    );
};

export default App;
