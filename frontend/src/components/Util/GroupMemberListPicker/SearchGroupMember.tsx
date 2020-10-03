import React, { ReactElement } from 'react';
import Fuse from 'fuse.js';
import { GroupMember } from 'common/types/store-types';
import GroupMemberSearchBox from '../GroupMemberSearchBox/GroupMemberSearchBox';
import styles from './SearchGroupMember.module.scss';

type SimpleMember = {
  readonly key: number;
  readonly value: string; // name of student
  readonly id: string; // netId of student
};

type Props = { readonly members: GroupMember[] };

/**
 * Returns computed group member options.
 *
 * @param {GroupMember[]} group members.
 * @return {SimpleMember[]} group member options.
 */
function getMemberOptions(members: GroupMember[]): SimpleMember[] {
  const memberOptions: SimpleMember[] = [];
  let i = 0;
  members.forEach((member: GroupMember) => {
    const { netId, name } = member;
    const id = netId;
    memberOptions.push({
      key: i,
      value: name,
      id,
    });
    i += 1;
  });
  return memberOptions;
}

/**
 * The configs for fuse searcher. Essential for fuzzy search.
 * You may need to tune this further, but it's usable right now.
 */
const fuseConfigs = {
  keys: ['key', 'value', 'name', 'id'],
  location: 0, // since we have customized the stuff to search, we can just start at beginning.
  threshold: 0.2, // higher the threshold, more stuff will be matched.
  distance: 100, // how close the match must be to the fuzzy location
};

export default function SearchGroupMember({ members }: Props): ReactElement | null {
  if (members === null) {
    return null;
  }
  const fuse = new Fuse(getMemberOptions(members), fuseConfigs);

  return (
    <div>
      <GroupMemberSearchBox
        placeholder="assign to"
        inputClassname={styles.SearchInput} // {tagStyles.SearchInput}
        fuse={fuse}
      />
    </div>
  );
}
