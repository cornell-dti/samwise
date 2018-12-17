// @flow strict

import type { AppUser } from '../util/firebase-util';

export type TagType = 'class' | 'other';

export type Tag = {|
  +id: number;
  +type: TagType;
  +name: string;
  +color: string;
|};

export type SubTask = {|
  +name: string; // Example: "SubTask 1 Name"
  +id: number; // Example: 32432
  +complete: boolean;
  +inFocus: boolean; // Whether the subtask is in focus
|};

/**
 * The task in the store.
 */
export type Task = {|
  +name: string; // Example: "Task 1 name"
  +id: number; // Example: 3213
  +tag: number; // ID of the tag
  +date: Date; // Example: new Date()
  +complete: boolean;
  +inFocus: boolean; // Whether the task is in focus
  +subtaskArray: SubTask[];
|};

/**
 * The cache that is designed to store the stuff that can be undo.
 */
export type UndoCache = {|
  +lastDeletedTask: Task | null;
|};

/**
 * The type of the entire redux state.
 */
export type State = {|
  +appUser: AppUser;
  +mainTaskArray: Task[];
  +tags: Tag[];
  +bearStatus: string;
  +undoCache: UndoCache;
|};
