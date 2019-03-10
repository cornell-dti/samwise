import React, { ReactElement } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { SubTask, Task, State } from '../../../store/store-types';
import SquareTextButton from '../../UI/SquareTextButton';
import { clearFocus } from '../../../firebase/actions';
import styles from './FocusView.css';

type Props = {
  readonly tasks: Map<string, Task>;
  readonly subTasks: Map<string, SubTask>;
};

function ClearFocus({ tasks, subTasks }: Props): ReactElement | null {
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
  const handleClick = (): void => clearFocus(taskIds, subTaskIds);
  return <SquareTextButton text="Clear Focus" onClick={handleClick} />;
}

const Connected = connect(({ tasks, subTasks }: State) => ({ tasks, subTasks }))(ClearFocus);
export default Connected;
