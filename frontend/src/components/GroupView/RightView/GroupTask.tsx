import { Task } from 'common/types/store-types';
import React, { ReactElement } from 'react';
import InlineTaskEditor from '../../Util/TaskEditors/InlineTaskEditor';
import styles from './GroupTask.module.scss';

type Props = {
  readonly original: Task;
  readonly memberName: string;
  readonly memberEmail: string;
  readonly groupID: string;
  readonly isInTaskQueue?: boolean;
};

function GroupTask({
  original,
  memberName,
  memberEmail,
  groupID,
  isInTaskQueue,
}: Props): ReactElement {
  const { children } = original;
  const containerDivStyles = children.length > 1 && !isInTaskQueue ? styles.GroupTaskContainer : '';
  return (
    <div className={containerDivStyles}>
      <InlineTaskEditor
        className={isInTaskQueue ? styles.TaskQueueGroupTask : styles.GroupTask}
        calendarPosition="bottom"
        original={original}
        filtered={original}
        memberName={memberName}
        memberEmail={memberEmail}
        groupID={groupID}
      />
    </div>
  );
}

export default GroupTask;
