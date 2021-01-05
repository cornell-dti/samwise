import React, { ReactElement, useState } from 'react';
import type { Group, SamwiseUserProfile, Task } from 'common/types/store-types';
import Calendar from 'react-calendar';
import SamwiseIcon from '../../UI/SamwiseIcon';
import GroupTaskRow from './GroupTaskRow';
import styles from './index.module.scss';
import { TaskCreator, useTaskCreatorContextSetter } from '../../TaskCreator';
import GroupTaskProgress from './GroupTaskProgress';
import { promptTextInput } from '../../Util/Modals';
import { updateGroup } from '../../../firebase/actions';

type Props = {
  readonly group: Group;
  readonly groupMemberProfiles: readonly SamwiseUserProfile[];
  readonly tasks: readonly Task[];
};

const RightView = ({ group, groupMemberProfiles, tasks }: Props): ReactElement => {
  const setTaskCreatorContext = useTaskCreatorContextSetter();
  const [showDateEditor, setShowDateEditor] = useState(false);

  const onEditGroupNameClicked = (): void => {
    promptTextInput('Edit your group name', '', 'New Group Name', 'Submit', 'text').then((name) =>
      updateGroup({ ...group, name })
    );
  };

  const openTaskCreator = (member: readonly SamwiseUserProfile[]): void =>
    setTaskCreatorContext({
      taskCreatorOpened: true,
      assignedMembers: member,
    });

  return (
    <div className={styles.RightView}>
      <div className={styles.GroupTaskCreator}>
        <TaskCreator view="group" />
      </div>

      <div className={styles.RightViewMain}>
        <div className={styles.TitleRow}>
          <h2 className={styles.Title}>{group.name}</h2>
          <SamwiseIcon
            iconName="pencil"
            className={styles.EditGroupNameIcon}
            onClick={onEditGroupNameClicked}
          />
          <span className={styles.DeadlineText}>
            {`Deadline: ${group.deadline.getMonth() + 1}/${group.deadline.getDate()}`}
          </span>
          <SamwiseIcon
            iconName="calendar-dark"
            className={styles.EditGroupDeadlineIcon}
            onClick={() => setShowDateEditor((shown) => !shown)}
          />
          {showDateEditor && (
            <Calendar
              value={group.deadline}
              className={styles.DeadlineCalendarPicker}
              minDate={new Date()}
              onChange={(date) => {
                if (!(date instanceof Date)) throw new Error();
                updateGroup({ ...group, deadline: date });
                setShowDateEditor(false);
              }}
              calendarType="US"
            />
          )}
        </div>
        <div className={styles.GroupTaskRowContainer}>
          {groupMemberProfiles.map((user) => {
            const filteredTasks = tasks.filter(({ owner }) => owner.includes(user.email));
            return (
              <GroupTaskRow
                key={user.email}
                memberName={user.name}
                userProfile={user}
                onClick={openTaskCreator}
                tasks={filteredTasks}
                profilePicURL={user.photoURL}
                groupID={group.id}
              />
            );
          })}
        </div>
      </div>
      <div className={styles.GroupTaskProgress}>
        <GroupTaskProgress tasks={tasks} deadline={group.deadline} />
      </div>
    </div>
  );
};

export default RightView;
