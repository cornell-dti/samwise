// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
// $FlowFixMe not flow strict
import { Draggable } from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import InlineTaskEditor from '../../Util/TaskEditors/InlineTaskEditor';
import styles from './FocusTask.module.css';
import type { State, Task } from '../../../store/store-types';
import { error } from '../../../util/general-util';
import { getFilteredInFocusTask } from '../../../util/task-util';
import type { TaskWithSubTasks } from '../../Util/TaskEditors/editors-types';

type OwnProps = {| +id: string; order: number; |};
type Props = {|
  ...OwnProps;
  +original: Task;
  +filtered: TaskWithSubTasks | null;
|};

function FocusTask({ id, order, original, filtered }: Props): Node {
  if (filtered === null) {
    return null;
  }
  return (
    <Draggable draggableId={id} index={order}>
      {provided => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <InlineTaskEditor
            className={styles.FocusTask}
            original={original}
            filtered={filtered}
          />
        </div>
      )}
    </Draggable>
  );
}

const Connected: ComponentType<OwnProps> = connect(
  ({ tasks, subTasks }: State, { id }: OwnProps) => {
    const original = tasks.get(id) ?? error();
    const filtered = getFilteredInFocusTask(original, subTasks);
    return { original, filtered };
  },
)(FocusTask);
export default Connected;
