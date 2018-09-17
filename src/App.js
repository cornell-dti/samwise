import React, { Component } from 'react';
import styles from './App.css';
import TagColorConfigItem from "./TagColorConfigItem";

class App extends Component {
  render() {
    return (
      <div className= { styles.App }>
          Project Samwise(?)
          <TagColorConfigItem tag={'CS 2112'} color={'red'}/>
      </div>
    );
  }
}

export default App;
