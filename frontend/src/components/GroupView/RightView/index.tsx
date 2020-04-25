import React, { ReactElement } from 'react';
import SamwiseIcon from 'components/UI/SamwiseIcon';
import GroupTaskRow from './GroupTaskRow';
import styles from './index.module.scss';
import GroupTaskCreator from '../../TaskCreator/GroupTaskCreator';

type Props = {
  groupName: string;
  groupMemberNames: string[];
}

export default ({ groupName, groupMemberNames }: Props): ReactElement => (
  <div className={styles.RightViewContainer}>
    <div className={styles.GroupTaskCreator}>
      <GroupTaskCreator />
    </div>
    <div className={styles.RightView}>
      <div>
        <h2>{groupName}</h2>
        <SamwiseIcon iconName="pencil" />
      </div>
      {
        groupMemberNames.map((m) => <GroupTaskRow memberName={m} key={m} />)
      }
    </div>
  </div>
);
