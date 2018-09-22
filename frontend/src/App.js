import React, {Component} from 'react';
import styles from './App.css';
import TagColorConfigEditor from './components/TagColorConfigEditor/TagColorConfigEditor';

class App extends Component {
    render() {
        return (
            <div className={styles.App}>
                Project Samwise(?)
                <TagColorConfigEditor/>
            </div>
        );
    }
}

export default App;
