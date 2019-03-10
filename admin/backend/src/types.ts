import { firestore } from 'firebase-admin';

export interface UserActionStat {
  readonly createTag: number;
  readonly editTag: number;
  readonly deleteTag: number;
  readonly createTask: number;
  readonly createSubTask: number;
  readonly deleteTask: number;
  readonly deleteSubTask: number;
  readonly editTask: number;
  readonly completeTask: number;
  readonly focusTask: number;
  readonly completeFocusedTask: number;
}

export interface UserActionRecord {
  readonly user: string;
  readonly time: firestore.Timestamp;
  readonly actions: UserActionStat;
}
