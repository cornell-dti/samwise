import React, { ReactElement } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Member from './Member';

type Props = {
  groupMemberNames: string[];
}

export default ({ groupMemberNames }: Props): ReactElement => (
  <div>
    <h2>People</h2>
    {
      groupMemberNames.map((m, i) => <Member memberName={m} key={i} />)
    }
    <span>
      <FontAwesomeIcon icon={faPlus} />
    </span>
  </div>
);
