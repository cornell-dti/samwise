import React, { Component } from 'react'
import { connect } from 'react-redux'
import { List } from 'semantic-ui-react';

class unconnectedTaskBox extends Component {

	render() {
		const subtaskArray = this.props.subtaskArray.map(
			item => <List.Item>{item.name}</List.Item>
		);
		return (
			<div>
				<h3>{this.props.name}</h3>
				<h5>{this.props.tag}</h5>
				<List>
				{ subtaskArray }
				</List>
			</div>
		);
	}
};

const TaskBox = connect(null, null)(unconnectedTaskBox);
export default TaskBox;
