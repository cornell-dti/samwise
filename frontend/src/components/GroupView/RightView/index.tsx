import React, { ReactElement } from 'react';
import SamwiseIcon from 'components/UI/SamwiseIcon';
import GroupTaskRow from './GroupTaskRow';
import styles from './index.module.scss';

type Props = {
  groupName: string;
  groupMemberNames: string[];
}

const EditGroupNameIcon = (): ReactElement => {
  const handler = (): void => {
    console.log('edit group');
  };
  return <SamwiseIcon iconName="pencil" className={styles.EditGroupNameIcon} onClick={handler} />;
};

export default ({ groupName, groupMemberNames }: Props): ReactElement => (
  <div className={styles.RightView}>
    <div>
      <h2>{groupName}</h2>
      <EditGroupNameIcon />
    </div>
    <div className={styles.GroupTaskRowContainer}>
      {
        groupMemberNames.map((m) => <GroupTaskRow memberName={m} key={m} />)
      }
    </div>
  </div>
);