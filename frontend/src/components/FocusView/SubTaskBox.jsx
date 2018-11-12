// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import { connect } from 'react-redux';
import { markSubtask as markSubtaskAction } from '../../store/actions';
import type { SubTask } from '../../store/store-types';
import type { MarkSubTaskAction } from '../../store/action-types';
import CheckBox from '../UI/CheckBox';
import styles from './TaskBox.css';

type Props = {|
  ...SubTask;
  mainTaskID: number;
  markSubtask: (id: number, subTaskId: number) => MarkSubTaskAction;
|};

/**
 * The component to render a subtask in focus view.
 *
 * @param props the props passed in.
 * @return {Node} the rendered subtask component.
 * @constructor
 */
function SubTaskBox(props: Props): Node {
  const {
    id, mainTaskID, name, complete, markSubtask,
  } = props;
  const markSubtaskAsComplete = () => markSubtask(mainTaskID, id);
  return (
    <div className={styles.SubTaskBox}>
      <CheckBox
        className={styles.TaskBoxCheckBox}
        checked={complete}
        onChange={markSubtaskAsComplete}
      />
      <span style={complete ? { textDecoration: 'line-through' } : {}}>{name}</span>
    </div>
  );
}

const ConnectedSubTaskBox = connect(null, { markSubtask: markSubtaskAction })(SubTaskBox);
export default ConnectedSubTaskBox;
