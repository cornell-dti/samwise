// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import SubtaskBox from './SubtaskBox';
import { markTask as markTaskAction, addSubtask as addSubtaskAction } from '../../store/actions';
import styles from './FocusView.css';
import type {
  State as StoreState, ColorConfig, Task, SubTask,
} from '../../store/store-types';
import type { AddNewSubTaskAction, MarkTaskAction } from '../../store/action-types';
import { fullConnect } from '../../store/react-redux-util';

type OwnProps = Task;
type SubscribedProps = {| colorConfig: ColorConfig |};
type ActionProps = {|
  markTask: (id: number) => MarkTaskAction;
  addSubtask: (id: number, subTask: SubTask) => AddNewSubTaskAction;
|};
type Props = {| ...OwnProps; ...SubscribedProps; ...ActionProps; |};

type State = {| value: string |};

const actionCreators = {
  markTask: markTaskAction,
  addSubtask: addSubtaskAction,
};

const mapStateToProps = ({ classColorConfig, tagColorConfig }: StoreState): SubscribedProps => ({
  colorConfig: { ...classColorConfig, ...tagColorConfig },
});

class TaskBox extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = { value: '' };
  }

  markTaskAsComplete = (event) => {
    event.stopPropagation();
    const { id, markTask } = this.props;
    markTask(id);
  };

  addNewSubtask = (event) => {
    event.preventDefault();
    const { id, addSubtask } = this.props;
    const { value } = this.state;
    const subtask = {
      id: (10 * new Date()) + Math.floor(10 * Math.random()),
      name: value,
      complete: false,
      inFocus: false,
    };
    addSubtask(id, subtask);
  };

  handleSubtaskInputChange = (event) => {
    this.setState({ value: event.target.value });
  };

  render(): Node {
    const {
      id, name, tag, complete, subtaskArray, colorConfig,
    } = this.props;
    const { value } = this.state;

    const boxColor = colorConfig[tag];
    const jsxSubtaskArray = subtaskArray.map(item => (
      <li className={styles.subtaskItem} key={item.id}>
        <SubtaskBox {...item} mainTaskID={id} />
      </li>
    ));
    return (
      <div className={styles.boxClass} style={{ backgroundColor: boxColor }}>
        <p className={styles.tagLabel}>{tag}</p>
        <div className={styles.mainLabel}>
          <input
            type="checkbox"
            className={styles.taskCheckbox}
            onClick={this.markTaskAsComplete}
          />
          <p
            className={styles.taskNameLabel}
            style={complete ? { textDecoration: 'line-through' } : {}}
          >
            {name}
          </p>
        </div>
        <ul>
          {jsxSubtaskArray}
        </ul>
        <div className={styles.newSubtaskDiv}>
          <form onSubmit={this.addNewSubtask}>
            <input
              type="text"
              className={styles.newSubtask}
              placeholder="New subtask"
              value={value}
              onChange={this.handleSubtaskInputChange}
            />
          </form>
        </div>
      </div>
    );
  }
}

const ConnectedTaskBox = fullConnect<Props, OwnProps, SubscribedProps, ActionProps>(
  mapStateToProps, actionCreators,
)(TaskBox);
export default ConnectedTaskBox;
