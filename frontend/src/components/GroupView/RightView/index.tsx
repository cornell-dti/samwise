import React, { ReactElement } from 'react';
import GroupTaskRow from './GroupTaskRow';
import styles from './index.module.scss';

type Props = {
  groupName: string;
  groupMemberNames: string[];
}

export default ({ groupName, groupMemberNames }: Props): ReactElement => (
  <div className={styles.RightView}>
    <h2>{groupName}</h2>
    {
      groupMemberNames.map((m) => <GroupTaskRow memberName={m} key={m} />)
    }
  </div>
);
