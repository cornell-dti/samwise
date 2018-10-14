import React, { Component } from 'react';
import { connect } from 'react-redux';
import { List } from 'semantic-ui-react';

import SubtaskBox from './subtaskBox';
import { markTask, addSubtask } from '../../store/actions';
import styles from './focusView.css';

const mapDispatchToProps = dispatch => ({
  markTask: (taskID) => { dispatch(markTask(taskID)); },
  addSubtask: (taskID, subtask) => { dispatch(addSubtask(taskID, subtask)); },
});

const mapStateToProps = state => ({
  tagColorPicker: state.tagColorPicker,
});

class unconnectedTaskBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
  }

  markTaskAsComplete = (event) => {
    const destructuredProps = this.props;
    event.stopPropagation();
    destructuredProps.markTask(destructuredProps.id);
  }

  addNewSubtask = (event) => {
    event.preventDefault();
    const destructuredProps = this.props;
    const destructuredState = this.state;
    const subtaskObj = {
      name: destructuredState.value,
      id: (10 * new Date()) + Math.floor(10 * Math.random()),
      complete: false,
    };
    destructuredProps.addSubtask(destructuredProps.id, subtaskObj);
  }

  handleSubtaskInputChange = (event) => {
    this.setState({ value: event.target.value });
  }

  render() {
    const destructuredState = this.state;
    const destructuredProps = this.props;
    const boxTag = destructuredProps.tag;

    let boxColor;
    if (destructuredProps.tagColorPicker[boxTag]) {
      boxColor = destructuredProps.tagColorPicker[boxTag];
    } else {
      boxColor = 'white';
    }
    const jsxSubtaskArray = destructuredProps.subtaskArray.map(
      item => (
        <li className={styles.subtaskItem} key={item.id}>
          { item.name }
        </li>),
    );
    // console.log(jsxSubtaskArray);
    return (
      <div className={styles.boxClass} style={{ backgroundColor: boxColor }}>
        <p className={styles.tagLabel}>{destructuredProps.tag}</p>
        <div className={styles.mainLabel}>
          <input className={styles.taskCheckbox} type="checkbox" onClick={this.markTaskAsComplete} />
          <p
            className={styles.taskNameLabel}
            style={destructuredProps.complete === false ? {} : { textDecoration: 'line-through' }}
          >
            {destructuredProps.name}
          </p>
        </div>
        <ul>
          { jsxSubtaskArray }
        </ul>
        <div className={styles.newSubtaskDiv}>
          <form onSubmit={this.addNewSubtask}>
            <input className={styles.newSubtask} type="text" placeholder="New subtask" value={destructuredState.value} onChange={this.handleSubtaskInputChange} />
          </form>
        </div>
      </div>
    );
  }
}

const TaskBox = connect(mapStateToProps, mapDispatchToProps)(unconnectedTaskBox);
export default TaskBox;
