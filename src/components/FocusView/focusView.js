import React, { Component } from 'react';
import { connect } from 'react-redux';
import { List } from 'semantic-ui-react';
import TaskBox from './taskBox.js';

const mapStateToProps = state => {
    return { mainTaskArray: state.mainTaskArray };
};

class unconnectedFocusView extends Component {
    render() {
			const listItems = props.mainTaskArray.map(item => <div></div>);
      return (
          <List>
						{ listItems }
					</List>
      );
    }
};

const FocusView = connect(null, null)(unconnectedFocusView);
export default FocusView;
