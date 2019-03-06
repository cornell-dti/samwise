import React, { ReactElement } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import InlineTaskEditor from '../../Util/TaskEditors/InlineTaskEditor';
import styles from './FocusTask.css';
import { State, Task } from '../../../store/store-types';
import { error } from '../../../util/general-util';
import { getFilteredInFocusTask } from '../../../util/task-util';
import { TaskWithSubTasks } from '../../Util/TaskEditors/editors-types';

type OwnProps = { readonly id: string; readonly order: number };
type Props = OwnProps & {
  readonly original: Task;
  readonly filtered: TaskWithSubTasks | null;
};

function FocusTask({ id, order, original, filtered }: Props): ReactElement {
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

const Connected = connect(
  ({ tasks, subTasks }: State, { id }: OwnProps) => {
    const original = tasks.get(id);
    if (original == null) {
      error();
    }
    const filtered = getFilteredInFocusTask(original, subTasks);
    return { original, filtered };
  },
)(FocusTask);
export default Connected;
