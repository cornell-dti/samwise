import React, { ReactElement } from 'react';
import type { Group, SamwiseUserProfile } from 'common/types/store-types';
import SamwiseIcon from '../../UI/SamwiseIcon';
import GroupTaskRow from './GroupTaskRow';
import styles from './index.module.scss';
import TaskCreator from '../../TaskCreator';

type State = {
  readonly taskCreatorOpened: boolean;
  readonly assignedMember?: SamwiseUserProfile;
}

type Props = {
  readonly group: Group;
  readonly groupMemberProfiles: SamwiseUserProfile[],
};

const initialState = (): State => ({
  taskCreatorOpened: false
});

const EditGroupNameIcon = (): ReactElement => {
  const handler = (): void => {
    console.log('edit group');
  };
  return <SamwiseIcon iconName="pencil" className={styles.EditGroupNameIcon} onClick={handler} />;
};

export default class RightView extends React.PureComponent<Props, State> {
  public readonly state: State = initialState();

  private openTaskCreator = (member: SamwiseUserProfile): void =>
    this.setState(({ taskCreatorOpened }: State) => ({
      taskCreatorOpened: !taskCreatorOpened,
      assignedMember: member,
    }));

  private clearAssignedMember = (): void => this.setState({ assignedMember: undefined });

  public render(): ReactElement {
    const { taskCreatorOpened, assignedMember } = this.state;
    const { group, groupMemberProfiles } = this.props;
    return (
      <div className={styles.RightView}>
        <div className={styles.GroupTaskCreator}>
          <TaskCreator
            view="group"
            group={group.name}
            groupMemberProfiles={groupMemberProfiles}
            taskCreatorOpened={taskCreatorOpened}
            assignedMember={assignedMember}
            clearAssignedMember={this.clearAssignedMember}
          />
        </div>

        <div className={styles.RightView}>
          <div>
            <h2>{group.name}</h2>
            <EditGroupNameIcon />
          </div>
          <div className={styles.GroupTaskRowContainer}>
            {groupMemberProfiles.map((samwiseUserProfile) => (
              <GroupTaskRow onClick={this.openTaskCreator} memberName={samwiseUserProfile.name} userProfile={samwiseUserProfile} key={samwiseUserProfile.email} />
            ))}
          </div>
        </div>
      </div>
    );
  }
}
