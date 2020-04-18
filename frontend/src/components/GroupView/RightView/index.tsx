import React, { ReactElement } from 'react';
import SamwiseIcon from 'components/UI/SamwiseIcon';
import GroupTaskRow from './GroupTaskRow';
import styles from './index.module.scss';

type Props = {
  groupName: string;
  groupMemberNames: string[];
}

export default ({ groupName, groupMemberNames }: Props): ReactElement => (
  <div className={styles.RightView}>
    <div>
      <h2>{groupName}</h2>
      <SamwiseIcon iconName="pencil" />
    </div>
    {
      groupMemberNames.map((m) => <GroupTaskRow memberName={m} key={m} />)
    }
  </div>
);
