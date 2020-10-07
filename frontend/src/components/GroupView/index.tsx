import React, { ReactElement, useState, useEffect } from 'react';
import type { Group, SamwiseUserProfile, Task } from 'common/types/store-types';
import type { FirestoreUserData } from 'common/types/firestore-types';
import MiddleBar from './MiddleBar';
import RightView from './RightView';
import styles from './index.module.scss';
import { database } from '../../firebase/db';

type Props = { readonly group: Group };

const useGroupMemberProfiles = (
  groupMemberEmails: readonly string[]
): readonly SamwiseUserProfile[] => {
  const [emailProfileMapping, setEmailProfileMapping] = useState<Record<string, FirestoreUserData>>(
    {}
  );

  useEffect(() => {
    // When we are reaching this line, it either means that we are running the effect for the first
    // time, or because the group member list has changed, so we have to invalidate the cache.
    setEmailProfileMapping({});
    const unsubscribers = groupMemberEmails.map((groupMemberEmail) =>
      database
        .usersCollection()
        .doc(groupMemberEmail)
        .onSnapshot((snapshot) => {
          setEmailProfileMapping((map) => ({
            ...map,
            [groupMemberEmail]: snapshot.data() as FirestoreUserData,
          }));
        })
    );
    return () => unsubscribers.forEach((unsubscriber) => unsubscriber());
  }, [groupMemberEmails]);

  const profiles = Object.entries(emailProfileMapping).map(([email, namePhoto]) => ({
    email,
    ...namePhoto,
  }));
  // Only return the profiles when the length of profiles matches length of email list.
  // There can be a temporarily mismatch when some snapshots have not been resolved yet.
  // This check ensures that all group members appear together.
  return profiles.length === groupMemberEmails.length ? profiles : [];
};

const GroupView = ({ group }: Props): ReactElement => {
  const [groupTaskArray, setGroupTaskArray] = useState<Task[]>([]);
  useEffect(() => {
    database
      .tasksCollection()
      .where('type', '==', 'GROUP')
      .where('group', '==', group.id)
      .onSnapshot((s) =>
        s.forEach((it) => {
          const task = { ...it.data(), id: it.id } as Task;
          // get rid of groupTaskArray from dependency array
          setGroupTaskArray((ary) => [...ary, task]);
        })
      );
  }, [group]);

  const groupMemberProfiles = useGroupMemberProfiles(group.members);

  return (
    <div className={styles.GroupView}>
      <MiddleBar groupMemberProfiles={groupMemberProfiles} />
      <RightView group={group} groupMemberProfiles={groupMemberProfiles} tasks={groupTaskArray} />
    </div>
  );
};

export default GroupView;
