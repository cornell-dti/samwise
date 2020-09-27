import React, { ReactElement } from 'react';
import type { Group } from 'common/types/store-types';
import MiddleBar from './MiddleBar';
import RightView from './RightView';
import styles from './index.module.scss';

type Props = { readonly group: Group };

// TODO: fetch members' name and profile picture from samwise-user collection.
const members = ['Darien Lopez', 'Sarah Johnson', 'Michelle Parker', 'Samwise Bear'];

const GroupView = ({ group }: Props): ReactElement => (
  <div className={styles.GroupView}>
    <MiddleBar groupMemberNames={members} />
    <RightView group={group} groupMemberNames={members} />
  </div>
);

export default GroupView;
