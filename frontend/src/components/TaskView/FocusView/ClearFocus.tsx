import React, { ReactElement } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { Task, State, SubTask } from 'common/types/store-types';
import SquareTextButton from '../../UI/SquareTextButton';
import { clearFocus } from '../../../firebase/actions';

type Props = {
  readonly tasks: Map<string, Task>;
};

function ClearFocus({ tasks }: Props): ReactElement | null {
  const taskIds: string[] = [];
  const subTasksWithParentTaskId: Map<string, SubTask[]> = Map();
  tasks.forEach((t) => {
    if (t.inFocus && t.complete) {
      taskIds.push(t.id);
    } else {
      t.children.forEach((s) => {
        if (s.inFocus && s.complete) {
          const completedSubtasks = subTasksWithParentTaskId.get(t.id);
          if (completedSubtasks === undefined) {
            subTasksWithParentTaskId.set(t.id, [s]);
          } else {
            subTasksWithParentTaskId.setIn(t.id, [s, ...completedSubtasks]);
          }
        }
      });
    }
  });
  if (taskIds.length === 0) {
    return null;
  }
  const handleClick = (): void => clearFocus(taskIds, subTasksWithParentTaskId);
  return <SquareTextButton text="Clear Focus" onClick={handleClick} />;
}

const Connected = connect(({ tasks }: State) => ({ tasks }))(ClearFocus);
export default Connected;
