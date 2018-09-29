import React, { Component } from 'react';
import { connect } from 'react-redux';
import { List } from 'semantic-ui-react';
import TaskBox from './taskBox.js';

const mapStateToProps = state => {
    return { mainTaskArray: state.mainTaskArray };
};

class unconnectedFocusView extends Component {
    render() {
			const listItems = this.props.mainTaskArray.map(
				item => <TaskBox {...item}></TaskBox>
			);
      return (
          <List>
						{ listItems }
					</List>
      );
    }
};

const FocusView = connect(mapStateToProps, null)(unconnectedFocusView);
export default FocusView;
