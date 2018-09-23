import React, {Component} from 'react';
import styles from './App.css';
import TagColorConfigEditor from './components/TagColorConfigEditor/TagColorConfigEditor';
import NewTaskComponent from './components/NewTask/NewTaskComponent';


class App extends Component {
    render() {
        return (
            <div className={styles.App}>
                Project Samwise(?)
                <TagColorConfigEditor/>
				<NewTaskComponent/>
            </div>
        );
    }
}

export default App;
