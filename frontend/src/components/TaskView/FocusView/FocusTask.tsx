/* eslint-disable react/jsx-props-no-spreading */
import React, { ReactElement } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import { error } from 'common/lib/util/general-util';
import { State, Task } from 'common/lib/types/store-types';
import {
  getFilteredNotCompletedInFocusTask,
  getFilteredCompletedInFocusTask,
} from 'common/lib/util/task-util';
import InlineTaskEditor from '../../Util/TaskEditors/InlineTaskEditor';
import styles from './FocusTask.module.css';

type OwnProps = {
  readonly id: string;
  readonly order: number;
  readonly filterCompleted: boolean;
};
type Props = OwnProps & {
  readonly original: Task;
  readonly filtered: Task | null;
};

function FocusTask({ id, order, filterCompleted, original, filtered }: Props): ReactElement {
  if (filtered === null) {
    throw new Error(`The filtered task should not be null! id: ${id}, order: ${order}`);
  }
  return (
    <Draggable draggableId={`${id}-${filterCompleted}`} index={order}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <InlineTaskEditor
            className={styles.FocusTask}
            calendarPosition="bottom"
            original={original}
            filtered={filtered}
          />
        </div>
      )}
    </Draggable>
  );
}

const Connected = connect(({ tasks }: State, { id, filterCompleted }: OwnProps) => {
  const original = tasks.get(id) ?? error();
  const filtered = filterCompleted
    ? getFilteredCompletedInFocusTask(original)
    : getFilteredNotCompletedInFocusTask(original);
  return { original, filtered };
})(FocusTask);
export default Connected;
