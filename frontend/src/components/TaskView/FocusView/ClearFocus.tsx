import React, { ReactElement } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { Task, State } from 'common/lib/types/store-types';
import SquareTextButton from '../../UI/SquareTextButton';
import { clearFocus } from '../../../firebase/actions';

type Props = {
  readonly tasks: Map<string, Task>;
};

function ClearFocus({ tasks }: Props): ReactElement | null {
  const taskIds: string[] = [];
  const subTaskIds: string[] = [];
  tasks.forEach((t) => {
    if (t.inFocus && t.complete) {
      taskIds.push(t.id);
    } else {
      t.children.forEach((s) => {
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

const Connected = connect(({ tasks }: State) => ({ tasks }))(ClearFocus);
export default Connected;
