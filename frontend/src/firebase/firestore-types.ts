import { firestore } from 'firebase';
import { RepeatingPattern } from '../store/store-types';

export type FirestoreCommon = {
  readonly owner: string;
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
  readonly date: Date | { readonly toDate: () => Date };
  readonly complete: boolean;
  readonly inFocus: boolean;
  readonly children: string[];
};

export type FirestoreSubTask = FirestoreCommon & {
  readonly name: string;
  readonly complete: boolean;
  readonly inFocus: boolean;
};

export type ForkedTaskMetaData = {
  readonly forkId: string | null; // null means one of the repetition is deleted
  readonly replaceDate: firestore.Timestamp;
};

export type FirestoreMasterTask = FirestoreCommonTask & {
  readonly type: 'MASTER_TEMPLATE';
  // in master task, we only use the time component of the date
  readonly repeats: {
    readonly startDate: firestore.Timestamp | null;
    readonly endDate: firestore.Timestamp | null;
    readonly pattern: RepeatingPattern;
  };
  // fork id can only points to a one time task
  readonly forks: ForkedTaskMetaData[];
};

export type FirestoreOneTimeTask = FirestoreCommonTask & { readonly type: 'ONE_TIME' }

export type FirestoreLegacyTask = FirestoreCommonTask & {};

// all these tasks stay in 'samwise-tasks'
// FirestoreLegacyTask should eventually be converted to FirestoreOneTimeTask.
export type FirestoreTask = FirestoreMasterTask | FirestoreOneTimeTask | FirestoreLegacyTask;
