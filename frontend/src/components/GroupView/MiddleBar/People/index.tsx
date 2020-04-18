import React, { ReactElement } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SamwiseIcon from 'components/UI/SamwiseIcon';
import Member from './Member';
import styles from './index.module.scss';

type Props = {
  groupMemberNames: string[];
}

export default ({ groupMemberNames }: Props): ReactElement => (
  <div className={styles.People}>
    <h2>People</h2>
    {
      groupMemberNames.map((m) => <Member memberName={m} key={m} />)
    }
    <div className={styles.AddMember}>
      <div>
        <FontAwesomeIcon icon={faPlus} />
      </div>
      Add member
    </div>
    <span className={styles.LeaveGroup}>
      <SamwiseIcon iconName="exit" />
      <p>Leave Group</p>
    </span>
  </div>
);
