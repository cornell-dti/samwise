import React, { ReactElement } from 'react';
import Fuse from 'fuse.js';
import { SamwiseUserProfile } from 'common/types/store-types';
import GroupMemberSearchBox from '../GroupMemberSearchBox/GroupMemberSearchBox';
import styles from './SearchGroupMember.module.scss';

type SimpleMember = {
  readonly key: number;
  readonly value: string; // name of student
  readonly id: string; // netId of student
};

type Props = {
  readonly members: SamwiseUserProfile[];
  readonly onMemberChange: (member: string) => void;
};

/**
 * Returns computed group member options.
 *
 * @param {GroupMember[]} group members.
 * @return {SimpleMember[]} group member options.
 */
function getMemberOptions(members: SamwiseUserProfile[]): SimpleMember[] {
  const memberOptions: SimpleMember[] = [];
  members.forEach((member: SamwiseUserProfile, index: number) => {
    const { email, name } = member;
    const id = email.split('@')[0]; // extract netId from user's email
    memberOptions.push({
      key: index,
      value: name,
      id,
    });
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

export default function SearchGroupMember({ members, onMemberChange }: Props): ReactElement | null {
  if (members === null) {
    return null;
  }
  const fuse = new Fuse(getMemberOptions(members), fuseConfigs);

  return (
    <div>
      <GroupMemberSearchBox
        placeholder="assign to"
        inputClassname={styles.SearchInput}
        fuse={fuse}
        onMemberChange={onMemberChange}
      />
    </div>
  );
}
