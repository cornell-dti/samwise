import React, { ReactElement } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import InlineTaskEditor from '../../Util/TaskEditors/InlineTaskEditor';
import styles from './FocusTask.css';
import { State, Task } from '../../../store/store-types';
import { error } from '../../../util/general-util';
import {
  getFilteredNotCompletedInFocusTask,
  getFilteredCompletedInFocusTask,
} from '../../../util/task-util';
import { TaskWithSubTasks } from '../../Util/TaskEditors/editors-types';

type OwnProps = {
  readonly id: string;
  readonly order: number;
  readonly filterCompleted: boolean;
};
type Props = OwnProps & {
  readonly original: Task;
  readonly filtered: TaskWithSubTasks | null;
};

function FocusTask({ id, order, filterCompleted, original, filtered }: Props): ReactElement {
  if (filtered === null) {
    throw new Error(`The filtered task should not be null! id: ${id}, order: ${order}`);
  }
  return (
    <Draggable draggableId={`${id}-${filterCompleted}`} index={order}>
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

const Connected = connect(
  ({ tasks, subTasks }: State, { id, filterCompleted }: OwnProps) => {
    const original = tasks.get(id) || error();
    const filtered = filterCompleted
      ? getFilteredCompletedInFocusTask(original, subTasks)
      : getFilteredNotCompletedInFocusTask(original, subTasks);
    return { original, filtered };
  },
)(FocusTask);
export default Connected;
