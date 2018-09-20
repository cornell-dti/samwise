import React, { Component } from 'react'
import { connect } from 'react-redux'

class unconnectedTaskBox extends Component {
    render() {
        return (
            <div>

            </div>
        );
    }
};

const TaskBox = connect(null, null)(unconnectedTaskBox);
export default TaskBox;
