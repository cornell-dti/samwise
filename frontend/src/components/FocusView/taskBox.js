import React, { Component } from 'react'
import { connect } from 'react-redux'
import { List } from 'semantic-ui-react';
import SubtaskBox from './subtaskBox';
import { markTask } from '../../store/actions';
import styles from './focusView.css';

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
			<div className = {styles.boxClass}>
				<h5 className = {styles.tagLabel}>{this.props.tag}</h5>
					<label className = {styles.taskNameLabel}>
						<input className = {styles.taskCheckbox} type="checkbox" onClick={this.markTaskAsComplete} />
						{this.props.name}
					</label>
				<List>
				{ subtaskArray }
				</List>
			</div>
		);
	}
};

const TaskBox = connect(null, mapDispatchToProps)(unconnectedTaskBox);
export default TaskBox;
