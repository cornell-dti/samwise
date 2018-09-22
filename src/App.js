import React, {
  Component
} from 'react';
import NewTaskComponent from './NewTaskComponent';
import styles from './App.css';

class App extends Component {
  render() {
    return ( < div className = {
        styles.App
      } >
      Samwise < NewTaskComponent > < /NewTaskComponent > < /div >
    );
  }
}

export default App;