import React, { Component } from 'react';
import { List } from 'semantic-ui-react'
import styles from './App.css';
import TagColorConfigItem from "./TagColorConfigItem";

class App extends Component {
  render() {
    return (
      <div className= { styles.App }>
          Project Samwise(?)
          <List divided relaxed>
              <TagColorConfigItem tag={'CS 2112'} color={'red'}/>
              <TagColorConfigItem tag={'CS 2800'} color={'blue'}/>
              <TagColorConfigItem tag={'CS 3110'} color={'yellow'}/>
          </List>
      </div>
    );
  }
}

export default App;
