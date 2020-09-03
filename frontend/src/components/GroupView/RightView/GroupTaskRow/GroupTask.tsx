import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import { error } from 'common/lib/util/general-util';
import { State, Task } from 'common/lib/types/store-types';
import {
  getFilteredNotCompletedInFocusTask,
  getFilteredCompletedInFocusTask,
} from 'common/lib/util/task-util';
import InlineTaskEditor from '../../../Util/TaskEditors/InlineTaskEditor';
import styles from './GroupTask.module.css';

type OwnProps = {
  readonly id: string;
  readonly order: number;
  // Needed for react-redux. See the connect function at the bottom.
  // eslint-disable-next-line react/no-unused-prop-types
  readonly filterCompleted: boolean;
};
type Props = OwnProps & {
  readonly original: Task;
  readonly filtered: Task | null;
};

function GroupTask({ id, order, original, filtered }: Props): ReactElement {
  if (filtered === null) {
    throw new Error(`The filtered task should not be null! id: ${id}, order: ${order}`);
  }
  return (
    <InlineTaskEditor
      className={styles.GroupTask}
      calendarPosition="bottom"
      original={original}
      filtered={filtered}
    />
  );
}

const Connected = connect(({ tasks }: State, { id, filterCompleted }: OwnProps) => {
  const original = tasks.get(id) ?? error();
  const filtered = filterCompleted
    ? getFilteredCompletedInFocusTask(original)
    : getFilteredNotCompletedInFocusTask(original);
  return { original, filtered };
})(GroupTask);
export default Connected;
