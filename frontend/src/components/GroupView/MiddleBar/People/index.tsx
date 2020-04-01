import React, { ReactElement } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Member from './Member';
import styles from './index.module.scss';

type Props = {
  groupMemberNames: string[];
}

export default ({ groupMemberNames }: Props): ReactElement => (
  <div className={styles.People}>
    <h2>People</h2>
    {
      groupMemberNames.map((m, i) => <Member memberName={m} key={i} />)
    }
    <div className={styles.AddMember}>
      <div>
        <FontAwesomeIcon icon={faPlus} />
      </div>
      Add member
    </div>
  </div>
);
