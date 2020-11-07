import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { State, Group } from 'common/types/store-types';
import styles from './index.module.scss';
import { joinGroup, rejectInvite, getInviterName } from '../../../firebase/actions';

type Props = {
  readonly groupInvites: Map<string, Group>;
};

function SingleInvitation(groupID: string, groupName: string, inviterName: string): ReactElement {
  return (
    <li key={groupID}>
      <span className={styles.Text}>
        {`${inviterName} has invited you to a group called ${groupName}.`}
      </span>
      <div className={styles.ButtonWrap}>
        <button
          type="button"
          onClick={() => {
            joinGroup(groupID);
          }}
        >
          Join
        </button>
        <button
          type="button"
          onClick={() => {
            rejectInvite(groupID);
          }}
        >
          Reject
        </button>
      </div>
    </li>
  );
}

const GroupInvites = ({ groupInvites }: Props): ReactElement | null => {
  if (groupInvites.isEmpty()) {
    return null;
  }
  return (
    <ul className={styles.Banner}>
      {groupInvites
        .valueSeq()
        .map((group) => SingleInvitation(group.id, group.name, getInviterName(group.id)))}
    </ul>
  );
};

const Connected = connect(({ groupInvites }: State) => ({ groupInvites }))(GroupInvites);
export default Connected;
