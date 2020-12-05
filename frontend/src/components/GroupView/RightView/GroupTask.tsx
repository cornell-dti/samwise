import { Task } from 'common/types/store-types';
import React, { ReactElement } from 'react';
import InlineTaskEditor from '../../Util/TaskEditors/InlineTaskEditor';
import styles from './GroupTask.module.scss';

type Props = {
  readonly original: Task;
  readonly memberName: string;
  readonly memberEmail: string;
  readonly groupID: string;
};

function GroupTask({ original, memberName, memberEmail, groupID }: Props): ReactElement {
  return (
    <InlineTaskEditor
      className={styles.GroupTask}
      calendarPosition="bottom"
      original={original}
      filtered={original}
      memberName={memberName}
      memberEmail={memberEmail}
      groupID={groupID}
    />
  );
}

export default GroupTask;
