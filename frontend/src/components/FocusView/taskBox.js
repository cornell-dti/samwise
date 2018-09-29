import React, { Component } from 'react'
import { connect } from 'react-redux'
import { List } from 'semantic-ui-react';
import SubtaskBox from './subtaskBox';

const mapDispatchToProps = dispatch => {
	return {
		markTask: (taskID) => dispatch(markTask(taskID))
	};
}
class unconnectedTaskBox extends Component {

	markTaskAsComplete = event => {
		event.stopPropagation();
		this.props.markTask(this.props.id);
	}

	render() {
		const subtaskArray = this.props.subtaskArray.map(
			item => <List.Item><SubtaskBox mainTaskId = {this.props.id} {...item}/></List.Item>
		);
		return (
			<div>
				<input type="checkbox" onClick={this.markTaskAsComplete} />
				<h3>{this.props.name}</h3>
				<h5>{this.props.tag}</h5>
				<List>
				{ subtaskArray }
				</List>
			</div>
		);
	}
};

const TaskBox = connect(null, mapDispatchToProps)(unconnectedTaskBox);
export default TaskBox;
