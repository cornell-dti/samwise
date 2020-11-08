import { firestore } from 'firebase/app';
import { RepeatingPattern, SubTask } from './store-types';

export type FirestoreCommon = {
  readonly owner: string | readonly string[];
  readonly order: number;
};

export type FirestoreTag = FirestoreCommon & {
  readonly name: string;
  readonly color: string;
  readonly classId: string | null;
};

export type FirestoreCommonTask = FirestoreCommon & {
  readonly name: string;
  readonly tag: string;
  readonly complete: boolean;
  readonly inFocus: boolean;
  readonly children: readonly SubTask[];
};

export type ForkedTaskMetaData = {
  readonly forkId: string | null; // null means one of the repetition is deleted
  readonly replaceDate: Date | firestore.Timestamp;
};

export type FirestoreMasterTask = FirestoreCommonTask & {
  readonly type: 'MASTER_TEMPLATE';
  // in master task, we only use the time component of the date
  readonly date: {
    readonly startDate: Date | firestore.Timestamp;
    readonly endDate: number | Date | firestore.Timestamp;
    readonly pattern: RepeatingPattern;
  };
  // fork id can only points to a one time task
  readonly forks: readonly ForkedTaskMetaData[];
};

export type FirestoreOneTimeTask = FirestoreCommonTask & {
  readonly type: 'ONE_TIME';
  readonly date: Date | firestore.Timestamp;
  readonly icalUID?: string;
};

export type FirestoreGroupTask = FirestoreCommonTask & {
  readonly type: 'GROUP';
  readonly date: Date | firestore.Timestamp;
  readonly group: string;
};

export type FirestoreGroup = {
  readonly name: string;
  readonly members: readonly string[];
  readonly deadline: firestore.Timestamp;
  readonly classCode: string;
  readonly invitees: readonly string[]; // emails of invitees
  readonly inviterNames: readonly string[]; // names of people who sent the invites
};

export type FirestoreUserData = {
  readonly name: string;
  readonly photoURL: string;
};

// all these tasks stay in 'samwise-tasks'
// FirestoreLegacyTask should eventually be converted to FirestoreOneTimeTask.
export type FirestoreTask = FirestoreMasterTask | FirestoreOneTimeTask | FirestoreGroupTask;
