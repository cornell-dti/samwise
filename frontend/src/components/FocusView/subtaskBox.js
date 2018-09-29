import React, { Component } from 'react'
import { connect } from 'react-redux'
import { List, Checkbox } from 'semantic-ui-react';
import { markSubtask } from '../../store/actions';

//mapdispatch to props
const mapDispatchToProps = dispatch => {
    return {
			markSubtask: (mainTaskID, subtaskID) => dispatch(markSubtask(mainTaskID, subtaskID))
		};
};

class unconnectedSubtaskBox extends Component {

	//gets called twice for some reason when clicking the actual checkbox
	markSubtaskAsComplete = event => {
		event.stopPropagation();
		this.props.markSubtask(this.props.mainTaskID, this.props.id);
	}
	render() {
		return (
			<List.Item>
				<input type="checkbox" onClick={this.markSubtaskAsComplete} />{this.props.name}
			</List.Item>
		);
	}
};

const SubtaskBox = connect(null, mapDispatchToProps)(unconnectedSubtaskBox);
export default SubtaskBox;
