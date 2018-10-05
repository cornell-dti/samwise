import React, { Component } from 'react';
import { connect } from 'react-redux';
import { List } from 'semantic-ui-react';
import { markSubtask } from '../../store/actions';

//  mapdispatch to props
const mapDispatchToProps = dispatch => ({
  markSubtask: (mainTaskID, subtaskID) => dispatch(markSubtask(mainTaskID, subtaskID)),
});

class unconnectedSubtaskBox extends Component {
  markSubtaskAsComplete = (event) => {
    event.stopPropagation();
    const destructuredProps = this.props;
    const { markSubtaskAsDone } = destructuredProps.markSubtask;
    markSubtaskAsDone(destructuredProps.mainTaskID, destructuredProps.id);
  }

  render() {
    const destructuredProps = this.props;
    return (
      <List.Item>
        <input type="checkbox" onClick={this.markSubtaskAsComplete} />
        {destructuredProps.name}
      </List.Item>
    );
  }
}

const SubtaskBox = connect(null, mapDispatchToProps)(unconnectedSubtaskBox);
export default SubtaskBox;
