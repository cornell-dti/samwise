// @flow strict

import React from 'react';
import type { Node } from 'react';
import { markTask as markTaskAction, addSubtask as addSubtaskAction } from '../../store/actions';
import type {
  State as StoreState, ColorConfig, Task, SubTask,
} from '../../store/store-types';
import type { AddNewSubTaskAction, MarkTaskAction } from '../../store/action-types';
import { fullConnect } from '../../store/react-redux-util';
import styles from './FocusViewTaskBox.css';
import InlineTaskEditor from '../TaskEditors/InlineTaskEditor';

type OwnProps = Task;
type SubscribedProps = {| +colorConfig: ColorConfig |};
type DispatchedProps = {|
  +markTask: (id: number) => MarkTaskAction;
  +addSubTask: (id: number, subTask: SubTask) => AddNewSubTaskAction;
|};
type Props = {| ...OwnProps; ...SubscribedProps; ...DispatchedProps; |};

const actionCreators = {
  markTask: markTaskAction,
  addSubTask: addSubtaskAction,
};

const mapStateToProps = ({ classColorConfig, tagColorConfig }: StoreState): SubscribedProps => ({
  colorConfig: { ...classColorConfig, ...tagColorConfig },
});

/**
 * A task box inside focus view.
 *
 * @param props the passed props.
 * @return {Node} the rendered box.
 * @constructor
 */
function FocusViewTaskBox(props: Props): Node {
  const {
    id, name, date, tag, complete, inFocus, subtaskArray, colorConfig,
  } = props;
  const backgroundColor = colorConfig[tag];
  const headerComponent = (
    <div className={styles.TaskBoxTagHeader}>
      <span className={styles.TaskBoxTag}>{tag}</span>
      <span className={styles.TaskBoxFlexiblePadding} />
      <span>{`${date.getMonth() + 1}/${date.getDate()}`}</span>
    </div>
  );
  const task = {
    id, name, date, tag, complete, inFocus, subtaskArray,
  };
  return (
    <div className={styles.TaskBox} style={{ backgroundColor }}>
      {headerComponent}
      <InlineTaskEditor initialTask={task} />
    </div>
  );
}

const ConnectedFocusViewTaskBox = fullConnect<OwnProps, SubscribedProps, DispatchedProps>(
  mapStateToProps, actionCreators,
)(FocusViewTaskBox);
export default ConnectedFocusViewTaskBox;
