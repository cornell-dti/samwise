import React, { Component } from 'react';
import { connect } from 'react-redux';
import { List } from 'semantic-ui-react';
import SubtaskBox from './subtaskBox';
import { markTask } from '../../store/actions';
import styles from './focusView.css';

const mapDispatchToProps = dispatch => ({
  markTask: (taskID) => { dispatch(markTask(taskID)); },
});

const mapStateToProps = state => ({
  tagColorPicker: state.tagColorPicker,
});

class unconnectedTaskBox extends Component {
  markTaskAsComplete = (event) => {
    const destructuredProps = this.props;
    event.stopPropagation();
    destructuredProps.markTask(destructuredProps.id);
  }

  render() {
    const destructuredProps = this.props;
    let { subtaskArray } = destructuredProps.subtaskArray;
    const boxTag = destructuredProps.tag;

    let boxColor;
    if (destructuredProps.tagColorPicker[boxTag]) {
      boxColor = destructuredProps.tagColorPicker[boxTag];
    } else {
      boxColor = 'white';
    }
    if (!subtaskArray) { subtaskArray = []; }
    subtaskArray = subtaskArray.map(
      item => <List.Item><SubtaskBox mainTaskId={destructuredProps.id} {...item} /></List.Item>,
    );
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
        <List>
          { subtaskArray }
        </List>
      </div>
    );
  }
}

const TaskBox = connect(mapStateToProps, mapDispatchToProps)(unconnectedTaskBox);
export default TaskBox;
