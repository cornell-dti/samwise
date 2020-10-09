import { Task } from 'common/types/store-types';
import React, { ReactElement } from 'react';
import InlineTaskEditor from '../../Util/TaskEditors/InlineTaskEditor';
import styles from './GroupTask.module.scss';

type Props = {
  readonly original: Task;
};

function GroupTask({ original }: Props): ReactElement {
  return (
    <InlineTaskEditor
      className={styles.GroupTask}
      calendarPosition="bottom"
      original={original}
      filtered={original}
    />
  );
}

export default GroupTask;
