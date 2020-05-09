import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { State, PendingGroupInvite } from 'common/lib/types/store-types';
import styles from './index.module.css';
import { rejectInvite } from '../../../firebase/actions';

type Props = {
  readonly pendingInvites: Map<string, PendingGroupInvite>;
};

function SingleInvitation(
  invite: PendingGroupInvite,
): ReactElement {
  return (
    <li key={invite.group}>
      <span className={styles.Text}>
        {`${invite.inviterName} has invited you to join their group project.`}
      </span>
      <div className={styles.ButtonWrap}>
        <button
          type="button"
          onClick={() => {
            console.log(`Tried to join group ${invite.group}, a currently unsupported operation`);
          }}
        >
          Join
        </button>
        <button type="button" onClick={() => { rejectInvite(invite.id); }}>
            Reject
        </button>
      </div>
    </li>
  );
}

const GroupInvites = ({ pendingInvites }: Props): ReactElement | null => {
  if (pendingInvites.isEmpty()) { return null; }
  return (
    <ul className={styles.Banner}>
      {pendingInvites.valueSeq().map((invite) => SingleInvitation(invite))}
    </ul>
  );
};

const Connected = connect(({ pendingInvites }: State) => ({ pendingInvites }))(GroupInvites);
export default Connected;
