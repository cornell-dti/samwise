// @flow strict

import React from 'react';
import type { Map } from 'immutable';
import type { ComponentType, Node } from 'react';
import { connect } from 'react-redux';
import type { SubTask, Task } from '../../../store/store-types';
import SquareTextButton from '../../UI/SquareTextButton';
import { clearFocus } from '../../../firebase/actions';
import styles from './FocusView.css';

type Props = {|
  +tasks: Map<string, Task>;
  +subTasks: Map<string, SubTask>;
|};

function ClearFocus({ tasks, subTasks }: Props): Node {
  const taskIds: string[] = [];
  const subTaskIds: string[] = [];
  tasks.forEach((t) => {
    if (t.inFocus && t.complete) {
      taskIds.push(t.id);
    } else {
      t.children.forEach((id) => {
        const s = subTasks.get(id);
        if (s == null) {
          return;
        }
        if (s.inFocus && s.complete) {
          subTaskIds.push(s.id);
        }
      });
    }
  });
  if (taskIds.length === 0) {
    return null;
  }
  const handleClick = () => clearFocus(taskIds, subTaskIds);
  return <SquareTextButton text="Clear Focus" onClick={handleClick} />;
}

const Connected: ComponentType<{||}> = connect(
  ({ tasks, subTasks }) => ({ tasks, subTasks }),
)(ClearFocus);
export default Connected;
