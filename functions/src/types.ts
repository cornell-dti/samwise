import { firestore } from 'firebase-admin';

/*
 * --------------------------------------------------------------------------------
 * Part 1: Relevant Application Data
 * --------------------------------------------------------------------------------
 */

interface FirestoreCommon {
  readonly owner: string;
  readonly order: number;
}

export interface FirestoreTag extends FirestoreCommon {
  readonly name: string;
  readonly color: string;
  readonly classId: number | null;
}

export interface FirestoreTask extends FirestoreCommon {
  readonly type: 'TASK';
  readonly name: string;
  readonly tag: string;
  readonly date: firestore.Timestamp;
  readonly complete: boolean;
  readonly inFocus: boolean;
}

export interface FirestoreSubTask extends FirestoreCommon {
  readonly type: 'SUBTASK';
  readonly parent: string;
  readonly name: string;
  readonly complete: boolean;
  readonly inFocus: boolean;
}

/*
 * --------------------------------------------------------------------------------
 * Part 2: Analytics Data
 * --------------------------------------------------------------------------------
 */

export interface UserActionStat {
  readonly createTag: number;
  readonly editTag: number;
  readonly deleteTag: number;
  readonly createTask: number;
  readonly createSubTask: number;
  readonly deleteTask: number;
  readonly deleteSubTask: number;
  readonly editTask: number
  readonly completeTask: number;
  readonly focusTask: number;
  readonly completeFocusedTask: number;
}

export interface UserActionRecord {
  readonly user: string;
  readonly time: firestore.Timestamp;
  readonly actions: UserActionStat;
}
