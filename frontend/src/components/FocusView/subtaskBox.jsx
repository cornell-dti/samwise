import React, { Component } from 'react';
import { connect } from 'react-redux';
import { markSubtask } from '../../store/actions';

//  mapdispatch to props
const mapDispatchToProps = dispatch => ({
  markSubtask: (mainTaskID, subtaskID) => dispatch(markSubtask(mainTaskID, subtaskID)),
});

class unconnectedSubtaskBox extends Component {
  markSubtaskAsComplete = (event) => {
    event.stopPropagation();
    const destructuredProps = this.props;
    destructuredProps.markSubtask(destructuredProps.mainTaskID, destructuredProps.id);
  }

  render() {
    const destructuredProps = this.props;
    return (
      <div>
        <input checked={destructuredProps.complete} type="checkbox" onClick={this.markSubtaskAsComplete} />
        <p style={destructuredProps.complete === false ? {} : { textDecoration: 'line-through' }}>
          { destructuredProps.name }
        </p>
      </div>
    );
  }
}

const SubtaskBox = connect(null, mapDispatchToProps)(unconnectedSubtaskBox);
export default SubtaskBox;
