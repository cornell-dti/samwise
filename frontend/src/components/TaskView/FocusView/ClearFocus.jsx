// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import { connect } from 'react-redux';
import type { Task } from '../../../store/store-types';
import SquareTextButton from '../../UI/SquareTextButton';
import { clearFocus } from '../../../firebase/actions';

function ClearFocus({ tasks }: {| +tasks: Task[] |}): Node {
  const taskIds: string[] = [];
  tasks.forEach((t) => {
    if (t.inFocus && t.complete) {
      taskIds.push(t.id);
    } else {
      t.subtasks.forEach((s) => {
        if (s.inFocus && s.complete) {
          taskIds.push(s.id);
        }
      });
    }
  });
  if (taskIds.length === 0) {
    return null;
  }
  return <SquareTextButton text="Clear Focus" onClick={() => clearFocus(taskIds)} />;
}

const Connected: ComponentType<{||}> = connect(({ tasks }) => ({ tasks }), null)(ClearFocus);
export default Connected;
